import { DataFormTrx, DataLkf, db } from "../models/db";
interface ShiftData {
  shift?: string;
  station?: string;
  openingDip?: number;
  receipt?:number;
  flowMeterStart?: number;
  stokOnhand?:number,
  qtyIssued?:number,
  qtyReceive?:number,
  balance?:number,
  closingDip?:number,
  flowMeterEnd?: number;
  totalFlowMeter?:number;
  variance?:number
}
// get Data By Fuelman Id
export const getDataByFuelmanID = async (fuelman_id: string): Promise<DataLkf[]> => {
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
export const getDataByStation = async (station: string): Promise<DataLkf[]> => {
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
export const getDataByID = async (id: number): Promise<DataLkf[]> => {
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

export const getShiftDataByLkfId = async (lkfId: string): Promise<ShiftData> => {
  try {
    const shiftData = await db.openingTrx.where('lkf_id').equals(lkfId).first();
    return {
      shift: shiftData?.shift || 'No Data',
      station: shiftData?.station || 'No Data',
      openingDip: shiftData?.opening_dip ?? 0,
      receipt: shiftData?.receipt ?? 0,  // Ensure a number is returned
      flowMeterStart: shiftData?.flow_meter_start ?? 0  // Ensure a number is returned
    };
  } catch (error) {
    console.error('Failed to fetch shift data:', error);
    return {
      shift: 'Error',
      station: 'Error',
      openingDip: 0,
      receipt:0,  // Indicate error with a default number
      flowMeterStart:0  // Indicate error with a default number
    };
  }
};



export const getCalculationIssued = async (lkfId: string): Promise<number | undefined> => {
  try {
    // Retrieve all transactions where type is 'Issued'
    const issuedTransactions = await db.dataTransaksi
      .where('type')
      .equals('Issued')
      .toArray();
    
    // Calculate the total quantity issued
    const totalIssued = issuedTransactions.reduce((sum, transaction) => sum + (transaction.qty || 0), 0);

    return totalIssued;
  } catch (error) {
    console.error("Failed to fetch issued transactions from IndexedDB:", error);
    return undefined;
  }
};

export const getCalculationReceive = async (lkfId: string): Promise<number | undefined> => {
  try {
    // Retrieve all transactions where type is 'Receive'
    const receiptTransactions = await db.dataTransaksi
      .where('type')
      .equals('Receive')
      .toArray();
    
    // Calculate the total quantity Receive
    const totalReceive = receiptTransactions.reduce((sum, transaction) => sum + (transaction.qty || 0), 0);

    return totalReceive;
  } catch (error) {
    console.error("Failed to fetch issued transactions from IndexedDB:", error);
    return undefined;
  }
};





export const getAllDataTrx = async (): Promise<DataFormTrx[]> => {
  try {
    const allData = await db.dataTransaksi.toArray();
    return allData;
  } catch (error) {
    console.error("Failed to fetch data from IndexedDB:", error);
    return [];
  }
};
