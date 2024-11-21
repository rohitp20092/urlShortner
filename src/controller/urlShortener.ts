import { storage } from '../services/storage';
import { sendMessageToClient } from '../services/websocket';
import { CONSTANTS } from '../config/constants';
import { urlValidators } from '../utils/validators';

const generateShortCode = (): string => {
  return Array.from({ length: CONSTANTS.SHORT_CODE_LENGTH }, () => 
    CONSTANTS.CHARACTERS.charAt(Math.floor(Math.random() * CONSTANTS.CHARACTERS.length))
  ).join('');
};

export const shortenUrl = async (originalUrl: string, clientId: string, baseUrl: string) => {
  // Validate URL before processing
  if (!urlValidators.isValidUrl(originalUrl)) {
    sendMessageToClient(clientId, {
      type: 'ERROR',
      data: { error: 'Invalid URL provided' }
    });
    throw new Error('Invalid URL provided');
  }

  const shortCode = generateShortCode();
  await storage.save(shortCode, originalUrl);
  const shortenedUrl = `${baseUrl}/${shortCode}`;

  sendMessageToClient(clientId, {
    type: 'SHORTENED_URL',
    data: { shortenedURL: shortenedUrl }
  });

  return shortCode;
};

export const getOriginalUrl = async (shortCode: string) => {
  // Basic validation for short code
  if (!shortCode || shortCode.length !== CONSTANTS.SHORT_CODE_LENGTH) {
    throw new Error('Invalid short code');
  }
  
  const originalUrl = await storage.get(shortCode);
  if (!originalUrl) {
    throw new Error('URL not found');
  }
  
  return originalUrl;
};