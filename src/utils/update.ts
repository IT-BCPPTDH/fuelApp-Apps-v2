
import { db } from "../models/db";
/**
 * 
 * 
 * 
 * Updates a record in the 'cards' object store.
 * @param id - The ID of the card record to update.
 * @param newSubtitle - The new subtitle value to set.
 */
export const updateStockRecord = async (id: number, newSubtitle: number) => {
    try {
        const updateResult = await db.cards.update(id, { subtitle: newSubtitle });
        return updateResult;
    } catch (error) {
        console.error(`Error updating stock record with ID "${id}":`, error);
        throw error;
    }
};

export const fetchStockRecordByTitle = async (title: string) => {
    try {
        const stockRecord = await db.cards.where({ title }).first();
        return stockRecord;
    } catch (error) {
        console.error(`Error fetching stock record with title "${title}":`, error);
        throw error;
    }
};


export default updateStockRecord 
