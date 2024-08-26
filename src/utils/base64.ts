// src/utils/fileHelpers.ts

/**
 * Converts a file to a base64 encoded string.
 * @param file - The file to be converted.
 * @returns A promise that resolves to a base64 encoded string or null if the conversion fails.
 */


export const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            resolve(reader.result as string);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};
