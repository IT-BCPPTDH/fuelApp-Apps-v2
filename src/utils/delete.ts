import { db, DataFormTrx } from '../models/db';

// Delete all data from the dataTransaksi store in IndexedDB
export const deleteAllDataTransaksi = async (): Promise<void> => {
  try {
    const count = await db.dataTransaksi.count(); // Get the count of entries
    if (count > 0) {
      await db.dataTransaksi.clear(); // Clear all entries in the store
      console.log(`${count} entries removed from dataTransaksi.`);
    } else {
      console.log("No entries found in dataTransaksi to delete.");
    }
  } catch (error) {
    console.error("Failed to delete data from dataTransaksi in IndexedDB:", error);
  }
};
