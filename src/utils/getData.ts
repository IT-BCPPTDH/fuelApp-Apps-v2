import { DataFormTrx, DataLkf,SondingData,db } from "../models/db";
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

    // Filter transactions by lkfId if necessary
    const filteredTransactions = issuedTransactions.filter(transaction => transaction.lkf_id === lkfId);

    // Sort transactions by date in descending order (latest first)
    filteredTransactions.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA; // Latest first
    });

    // Calculate the total quantity issued from the most recent transactions
    const totalIssued = filteredTransactions.reduce((sum, transaction) => sum + (transaction.qty || 0), 0);

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

export const getAllDataSonding = async (): Promise<SondingData[]> => {
  try {
    const allData = await db.sondingMaster.toArray();
    return allData;
  } catch (error) {
    console.error("Failed to fetch data from IndexedDB:", error);
    return [];
  }
};

export const getLatestLkfData = async (): Promise<{ lkf_id?: string; opening_sonding?: number } | undefined> => {
  try {
    const latestEntry = await db.openingTrx.orderBy('id').last();
    if (latestEntry) {
      return {
        lkf_id: latestEntry.lkf_id,
        opening_sonding: latestEntry.opening_sonding,  // Assuming 'opening_sonding' is a property of the entry
      };
    } else {
      return undefined;
    }
  } catch (error) {
    console.error("Failed to fetch the latest LKF data from IndexedDB:", error);
    return undefined;
  }
};

export const getFbrByUnit = async (noUnit: string): Promise<DataFormTrx[]> => {
  try {
    // Query the IndexedDB to get the data associated with the noUnit
    const filteredData = await db.dataTransaksi.where('no_unit').equals(noUnit).toArray();
    // Map through the results to ensure you include the hm_last property
    const resultWithHmLast = filteredData.map((data) => ({
      ...data,
      fbr: data.fbr,
      hm_last: data.hm_last,
      qty_last_last: data.qty_last, // Make sure to include hm_last in the return
    }));

    return resultWithHmLast;
  } catch (error) {
    console.error("Failed to fetch data from IndexedDB:", error);
    return [];
  }
};


export const getLatestTrx = async (selectedUnit: string): Promise<number | undefined> => {
  try {
    const latestEntry = await db.dataTransaksi.orderBy('id').last();
    if (latestEntry && latestEntry.id) {
      return latestEntry.id;
    } else {
      console.warn("No entries found in the dataTransaksi collection.");
      return undefined;
    }
  } catch (error) {
    console.error("Failed to fetch the latest LKF ID from IndexedDB:", error);
    return undefined;
  }
};

export const getLatestHmLast = async (selectedUnit: string): Promise<number | undefined> => {
  try {
    // Fetch the latest entry from the database
    const latestEntry = await db.dataTransaksi.orderBy('id').last();

    // Check if the entry is found and return the 'hm_last' field
    if (latestEntry && latestEntry.hm_last !== undefined) {
      return latestEntry.hm_last;
    } else {
      console.warn("No 'hm_last' data found in the dataTransaksi collection.");
      return undefined;
    }
  } catch (error) {
    // Log any errors that occur during data retrieval
    console.error("Failed to fetch the latest 'hm_last' value from IndexedDB:", error);
    return undefined;
  }
};



