import { db, DataLkf, DataDashboard, DataFormTrx, SondingData} from '../models/db';

export const addDataToDB = async (data: DataLkf) => {
  try {
    await db.openingTrx.add(data);
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

export const removeDataFromDB = async (id: number) => {
  try {
    await db.openingTrx.delete(id);
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
  
  }
}




