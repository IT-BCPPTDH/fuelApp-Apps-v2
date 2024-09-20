import { db, DataLkf, DataDashboard, DataFormTrx, SondingData, DataLkfUpdate } from '../models/db';

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


export const addDataClosing = async (data: DataLkfUpdate) => {
  try {
    await db.closeTrx.add(data);
  } catch (error) {
    console.error("Failed to add data to IndexedDB:", error);
  }
};
export const getOfflineData = async (): Promise<DataLkf[]> => {
  try {
    return await db.openingTrx.toArray();
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
    await db.openingTrx.delete(numericId);
  } catch (error) {
    console.error("Failed to remove data from IndexedDB:", error);
  }
};



export async function addDataDashboard(data: DataDashboard) {
  try {
    await db.cards.add(data);
  } catch (error) {
    console.error("Failed to add data to IndexedDB:", error);
  }
}

export async function addDataTrxType(data: DataFormTrx) {
  try {
    await db.dataTransaksi.add(data);
  } catch (error) {
    console.error("Failed to add data to IndexedDB:", error);
  }
}

export async function addDataSonding(data: SondingData) {
  try {
    await db.sondingMaster.add(data);
  } catch (error) {
    console.error("Failed to add data to IndexedDB:", error);
  }
}
