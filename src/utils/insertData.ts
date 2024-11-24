import { db, DataLkf, DataDashboard, DataFormTrx, SondingData, DataLkfUpdate , DataMasterTransaksi} from '../models/db';

// Add data to IndexedDB for drafts
export const saveDraft = async (data: DataFormTrx) => {
  try {
    await db.dataTransaksi.put(data); // Use 'put' to handle both add and update scenarios
  } catch (error) {
    console.error("Failed to save draft to IndexedDB:", error);
  }
};


// Get all drafts from IndexedDB
export const getDrafts = async (): Promise<DataFormTrx[]> => {
  try {
    return await db.dataTransaksi.toArray(); // Assuming 'draftStore' is your object store for drafts
  } catch (error) {
    console.error("Failed to get drafts from IndexedDB:", error);
    return [];
  }
};


export const addDataToDB = async (data: DataLkfUpdate) => {
  try {
    await db.closeTrx.add(data);
  } catch (error) {
    console.error("Failed to add data to IndexedDB:", error);
  }
};



export const updateDataToDB = async (data: Partial<DataLkfUpdate> & { id?: number; station?: string }) => {
  try {
    if (data.id) {
      // Update based on id
      await db.closeTrx.put(data as DataLkfUpdate); // Cast to DataLkfUpdate to satisfy TypeScript
      console.log("Data updated successfully based on ID in IndexedDB");
    } else if (data.station) {
      // Update based on station
      const existingRecord = await db.closeTrx.where('station').equals(data.station).first();
      if (existingRecord) {
        // Merge existing record with the new data, ensuring all required fields are included
        const updatedData: DataLkfUpdate = { ...existingRecord, ...data } as DataLkfUpdate;
        await db.closeTrx.put(updatedData);
        console.log("Data updated successfully based on station in IndexedDB");
      } else {
        console.log(`No record found with station: ${data.station}`);
      }
    } else {
      console.error("Neither ID nor Station provided for updating data.");
    }
  } catch (error) {
    console.error("Failed to update data in IndexedDB:", error);
  }
};



export const addDataClosing = async (data: DataLkfUpdate) => {
  try {
    await db.closeTrx.put(data);
  } catch (error) {
    console.error("Failed to add data to IndexedDB:", error);
  }
};

export const getOfflineData = async (): Promise<DataLkf[]> => {
  try {
    const data: DataLkfUpdate[] = await db.closeTrx.toArray();
    return data as DataLkf[]; // Type assertion
  } catch (error) {
    console.error("Failed to get offline data from IndexedDB:", error);
    return [];
  }
};


export const removeDataFromDB = async (id: string) => {
  try {
    const numericId = Number(id);
    if (isNaN(numericId)) {
      throw new Error("Invalid ID format");
    }
    await db.closeTrx.delete(numericId);
  } catch (error) {
    console.error("Failed to remove data from IndexedDB:", error);
  }
};





export async function addDataTrxType(data: DataFormTrx) {
  try {
    await db.dataTransaksi.add(data);
  } catch (error) {
    console.error("Failed to add data to IndexedDB:", error);
  }
}


// export async function addDataHistory(data: DataFormTrx) {
//   try {
//     await db.dataMasterTrasaksi.add(data);
//   } catch (error) {
//     console.error("Failed to add data to IndexedDB:", error);
//   }
// }

// 

export async function addDataHistory(data: DataFormTrx) {
  try {
    // Menyaring hanya data yang diperlukan dan menambahkan nilai untuk 'hm_km'
    const filteredData = {
      hm_km: data.hm_km,
      no_unit: data.no_unit,
      qty: data.qty,
    
    };

    // Menambahkan data yang sudah difilter ke dalam IndexedDB
    await db.dataMasterTrasaksi.add(filteredData);
    console.log('Data berhasil disisipkan!');
  } catch (error) {
    console.error('Failed to add data to IndexedDB:', error);
  }
}



