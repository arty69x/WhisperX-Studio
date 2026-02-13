export interface FilePatch {
  path: string;
  content: string;
}

export interface OutputSchema {
  files: FilePatch[];
}

export interface ValidationLimits {
  maxFiles: number;
  maxBytesPerFile: number;
  maxTotalBytes: number;
  allowlist: readonly string[];
}

export const DEFAULT_LIMITS: ValidationLimits = {
  maxFiles: 20,
  maxBytesPerFile: 200_000,
  maxTotalBytes: 1_000_000,
  allowlist: ['src/'],
};

export type GuardErrorCode =
  | 'INVALID_SHAPE'
  | 'FILES_NOT_ARRAY'
  | 'TOO_MANY_FILES'
  | 'INVALID_PATH_TYPE'
  | 'INVALID_CONTENT_TYPE'
  | 'EMPTY_PATH'
  | 'ABSOLUTE_PATH'
  | 'PATH_TRAVERSAL'
  | 'FORBIDDEN_GIT_PATH'
  | 'PATH_NOT_ALLOWED'
  | 'FILE_TOO_LARGE'
  | 'TOTAL_TOO_LARGE';

export class GuardError extends Error {
  public readonly code: GuardErrorCode;
  public readonly details?: Record<string, unknown>;

  constructor(code: GuardErrorCode, message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = 'GuardError';
    this.code = code;
    this.details = details;
  }
}

const toUnixSlashes = (value: string): string => value.replace(/\\/g, '/');

export function safePath(rawPath: string, allowlist: readonly string[] = DEFAULT_LIMITS.allowlist): string {
  if (typeof rawPath !== 'string') {
    throw new GuardError('INVALID_PATH_TYPE', 'File path must be a string.');
  }

  const path = toUnixSlashes(rawPath.trim());
  if (!path) {
    throw new GuardError('EMPTY_PATH', 'File path must not be empty.');
  }

  if (/^(?:[a-zA-Z]:)?\//.test(path)) {
    throw new GuardError('ABSOLUTE_PATH', `Absolute path is not allowed: ${rawPath}`);
  }

  const segments = path.split('/');
  if (segments.some((segment) => segment === '..')) {
    throw new GuardError('PATH_TRAVERSAL', `Path traversal is not allowed: ${rawPath}`);
  }

  const normalized = segments.filter((segment) => segment && segment !== '.').join('/');

  if (!normalized || normalized === '.git' || normalized.startsWith('.git/')) {
    throw new GuardError('FORBIDDEN_GIT_PATH', `Access to .git is forbidden: ${rawPath}`);
  }

  const isAllowed = allowlist.some((prefix) => normalized.startsWith(prefix));
  if (!isAllowed) {
    throw new GuardError('PATH_NOT_ALLOWED', `Path is outside allowlist: ${rawPath}`, {
      allowlist,
    });
  }

  return normalized;
}

export function validateOutputSchema(
  value: unknown,
  limits: Partial<ValidationLimits> = {},
): OutputSchema {
  const effectiveLimits: ValidationLimits = {
    ...DEFAULT_LIMITS,
    ...limits,
  };

  if (!value || typeof value !== 'object') {
    throw new GuardError('INVALID_SHAPE', 'Output must be an object with a files array.');
  }

  const files = (value as { files?: unknown }).files;
  if (!Array.isArray(files)) {
    throw new GuardError('FILES_NOT_ARRAY', 'Output.files must be an array.');
  }

  if (files.length > effectiveLimits.maxFiles) {
    throw new GuardError('TOO_MANY_FILES', 'Too many files in one request.', {
      maxFiles: effectiveLimits.maxFiles,
      provided: files.length,
    });
  }

  const encoder = new TextEncoder();
  let totalBytes = 0;
  const normalizedFiles: FilePatch[] = files.map((file, index) => {
    if (!file || typeof file !== 'object') {
      throw new GuardError('INVALID_SHAPE', `File entry at index ${index} must be an object.`);
    }

    const path = (file as { path?: unknown }).path;
    const content = (file as { content?: unknown }).content;

    if (typeof path !== 'string') {
      throw new GuardError('INVALID_PATH_TYPE', `File path at index ${index} must be a string.`);
    }

    if (typeof content !== 'string') {
      throw new GuardError('INVALID_CONTENT_TYPE', `File content at index ${index} must be a string.`);
    }

    const safe = safePath(path, effectiveLimits.allowlist);
    const fileBytes = encoder.encode(content).byteLength;

    if (fileBytes > effectiveLimits.maxBytesPerFile) {
      throw new GuardError('FILE_TOO_LARGE', `File exceeds byte limit: ${safe}`, {
        maxBytesPerFile: effectiveLimits.maxBytesPerFile,
        provided: fileBytes,
      });
    }

    totalBytes += fileBytes;
    if (totalBytes > effectiveLimits.maxTotalBytes) {
      throw new GuardError('TOTAL_TOO_LARGE', 'Total payload exceeds byte limit.', {
        maxTotalBytes: effectiveLimits.maxTotalBytes,
        provided: totalBytes,
      });
    }

    return {
      path: safe,
      content,
    };
  });

  return { files: normalizedFiles };
}
