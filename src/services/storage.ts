import { UrlMapping, StorageType } from "../types/storage.types";

// In-memory storage
const urlMappings = new Map<string, UrlMapping>();

export const storage: StorageType = {
  save: async (shortCode: string, originalUrl: string) => {
      const mapping: UrlMapping = {
          originalUrl,
          shortCode,
          created: new Date()
      };
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate async operation
      urlMappings.set(shortCode, mapping);
      return mapping;
  },

  get: async (shortCode: string) => {
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate async operation
      const mapping = urlMappings.get(shortCode);
      return mapping ? mapping.originalUrl : null;
  }
};