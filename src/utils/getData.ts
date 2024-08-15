import { dataLkf, db } from "../models/db";

// get Data By Fuelman Id
export const getDataByFuelmanID = async (fuelman_id: string): Promise<dataLkf[]> => {
  try {
    const allData = await db.openingTrx.where("fuelman_id").equals(fuelman_id).toArray();
    // Ensure latest record by ID
    return allData.sort((a, b) => (b.id as number) - (a.id as number)); 
  } catch (error) {
    console.error("Failed to get data from IndexedDB:", error);
    return [];
  }
};

// Function to get data by Station
export const getDataByStation = async (station: string): Promise<dataLkf[]> => {
  try {
    const allData = await db.openingTrx.where("station").equals(station).toArray();
    // sort data lastest 
    return allData.sort((a, b) => (b.id as number) - (a.id as number)); 
  } catch (error) {
    console.error("Failed to get data from IndexedDB:", error);
    return [];
  }
};

// Function to get data by ID
export const getDataByID = async (id: number): Promise<dataLkf[]> => {
  try {
    const allData = await db.openingTrx.where("id").equals(id).toArray();
    return allData;
  } catch (error) {
    console.error("Failed to get data from IndexedDB:", error);
    return [];
  }
};


export const getLatestLkfId = async (): Promise<string | undefined> => {
  try {
    const latestEntry = await db.openingTrx.orderBy('id').last();
    return latestEntry ? latestEntry.lkf_id : undefined;
  } catch (error) {
    console.error("Failed to fetch the latest LKF ID from IndexedDB:", error);
    return undefined;
  }
};