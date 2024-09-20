import { DataFormTrx, DataLkf, db } from "../models/db";

// export const updateDataInDB = async (data: DataLkf) => {
//     try {
      
//       await db.openingTrx.put(data); 
//       console.log("Data successfully updated in IndexedDB.");
//     } catch (error) {
//       console.error("Failed to update data in IndexedDB:", error);
//     }
//   };

export const updateDataInDB = async (id: number, newData: Partial<DataLkf>) => {
  try {
    const record = await db.openingTrx.get(id);
    
    if (!record) {
      console.error("Record not found:", id);
      return;
    }

    const updatedData = { ...record, ...newData };
    await db.openingTrx.put(updatedData);
    console.log("Data updated successfully:", updatedData);
  } catch (error) {
    console.error("Failed to update data in IndexedDB:", error);
  }
};

  
  export const updateDataInTrx = async (id: number, p0: string, data: DataFormTrx) => {
    try {
      
      await db.dataTransaksi.put(data); 
      console.log("Data successfully updated in IndexedDB.");
    } catch (error) {
      console.error("Failed to update data in IndexedDB:", error);
    }
  };