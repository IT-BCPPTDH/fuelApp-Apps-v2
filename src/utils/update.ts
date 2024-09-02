import { DataLkf, db } from "../models/db";
export const updateDataInDB = async (data: DataLkf) => {
    try {
      
      await db.openingTrx.put(data); 
      console.log("Data successfully updated in IndexedDB.");
    } catch (error) {
      console.error("Failed to update data in IndexedDB:", error);
    }
  };