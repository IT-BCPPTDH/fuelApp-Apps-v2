import { DataFormTrx, DataLkf, db } from "../models/db";

// export const updateDataInDB = async (data: DataLkf) => {
//     try {
      
//       await db.closeTrx.put(data); 
//       console.log("Data successfully updated in IndexedDB.");
//     } catch (error) {
//       console.error("Failed to update data in IndexedDB:", error);
//     }
//   };

export const updateDataInDB = async (id: number, data: Partial<DataLkf>) => {
  try {
    const record = await db.closeTrx.get(id);
    
    if (!record) {
      console.error("Record not found:", id);
      return;
    }

    const updatedData = { ...record, ...data };
    await db.closeTrx.put(updatedData);
    console.log("Data updated successfully:", updatedData);
  } catch (error) {
    console.error("Failed to update data in IndexedDB:", error);
  }
};

  
  export const updateDataInTrx = async (id: number, updates: Partial<DataFormTrx>): Promise<void> => {
    try {
      await db.dataTransaksi
        .where('from_data_id')
        .equals(id)
        .modify(updates); // Update the entry with the given ID
    } catch (error) {
      console.error("Failed to update data in IndexedDB:", error);
      throw new Error("Update failed"); // Optionally throw an error for further handling
    }
  };