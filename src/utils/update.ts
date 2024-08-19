
import { db } from "../models/db";
/**
 * 
 * 
 * 
 * Updates a record in the 'cards' object store.
 * @param id - The ID of the card record to update.
 * @param newSubtitle - The new subtitle value to set.
 */
async function updateCardRecord(id: number, newSubtitle: number): Promise<void> {
    try {
        // Fetch the existing record to check if it exists
        const existingRecord = await db.cards.get(id);
        
        if (existingRecord) {
            // Update the record with new values
            await db.cards.put({
                ...existingRecord, // Spread existing record to retain other fields
                subtitle: newSubtitle // Update the 'subtitle' field
            });
            console.log('Card record updated successfully.');
        } else {
            console.error('Record not found.');
        }
    } catch (error) {
        console.error('Failed to update card record', error);
    }
}

export default updateCardRecord
