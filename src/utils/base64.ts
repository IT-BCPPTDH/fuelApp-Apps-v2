/**
 * Converts a file or blob to a base64 encoded string.
 * @param file - The file or blob to be converted.
 * @returns A promise that resolves to a base64 encoded string or null if the conversion fails.
 */
export const convertToBase64 = (file: File | Blob): Promise<string | null> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (reader.result) {
                resolve(reader.result as string);
            } else {
                resolve(null); // Return null if no result
            }
        };
        reader.onerror = () => {
            console.error("File conversion error:", reader.error);
            resolve(null); // Return null on error
        };
        reader.readAsDataURL(file);
    });
};
