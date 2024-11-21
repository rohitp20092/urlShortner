export interface UrlMapping {
  originalUrl: string;
  shortCode: string;
  created: Date;
}

export type StorageType = {
  save: (shortCode: string, originalUrl: string) => Promise<UrlMapping>;
  get: (shortCode: string) => Promise<string | null>;
}