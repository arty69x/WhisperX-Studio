export interface FileEmbeddingRecord {
  path: string;
  embedding: number[];
  metadata: {
    language?: string;
    size: number;
    updatedAt: number;
    tags: string[];
  };
}

export interface RepoEmbeddingIndex {
  version: string;
  createdAt: number;
  records: FileEmbeddingRecord[];
}

const tokenize = (content: string): string[] =>
  content
    .toLowerCase()
    .replace(/[^a-z0-9_\-\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

const tokenHash = (token: string, dimension: number): number => {
  let hash = 0;
  for (let i = 0; i < token.length; i += 1) {
    hash = (hash * 31 + token.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % dimension;
};

const l2Normalize = (vector: number[]): number[] => {
  const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
  if (!norm) return vector;
  return vector.map(value => value / norm);
};

export const embedText = (content: string, dimension = 64): number[] => {
  const vector = new Array<number>(dimension).fill(0);
  for (const token of tokenize(content)) {
    vector[tokenHash(token, dimension)] += 1;
  }
  return l2Normalize(vector);
};

export const buildRepoEmbeddingIndex = (
  files: Array<{ path: string; content: string; language?: string; tags?: string[] }>,
  dimension = 64,
): RepoEmbeddingIndex => ({
  version: 'v1',
  createdAt: Date.now(),
  records: files.map(file => ({
    path: file.path,
    embedding: embedText(file.content, dimension),
    metadata: {
      language: file.language,
      size: file.content.length,
      updatedAt: Date.now(),
      tags: file.tags ?? [],
    },
  })),
});

const cosineSimilarity = (a: number[], b: number[]): number =>
  a.reduce((sum, value, index) => sum + value * (b[index] ?? 0), 0);

export const retrieveRelevantFiles = (
  query: string,
  index: RepoEmbeddingIndex,
  limit = 5,
): FileEmbeddingRecord[] => {
  const queryVector = embedText(query, index.records[0]?.embedding.length ?? 64);

  return [...index.records]
    .sort((a, b) => cosineSimilarity(queryVector, b.embedding) - cosineSimilarity(queryVector, a.embedding))
    .slice(0, limit);
};

export const serializeIndex = (index: RepoEmbeddingIndex): string => JSON.stringify(index);
export const deserializeIndex = (raw: string): RepoEmbeddingIndex => JSON.parse(raw) as RepoEmbeddingIndex;
