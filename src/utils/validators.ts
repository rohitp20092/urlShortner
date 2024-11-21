import { CONSTANTS } from "../config/constants";

export const urlValidators = {
    isValidUrl: (url: string): boolean => {
        if (!url) return false;
        try {
            const urlObj = new URL(url);
            return CONSTANTS.ALLOWED_PROTOCOLS.includes(urlObj.protocol.slice(0, -1));
        } catch {
            return false;
        }
    },
};
