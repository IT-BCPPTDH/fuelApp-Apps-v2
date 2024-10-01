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
    const allData = await db.closeTrx.where("fuelman_id").equals(fuelman_id).toArray();
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
    const allData = await db.closeTrx.where("station").equals(station).toArray();
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
    const allData = await db.closeTrx.where("id").equals(id).toArray();
    return allData;
  } catch (error) {
    console.error("Failed to get data from IndexedDB:", error);
    return [];
  }
};

export const getLatestLkfId = async (): Promise<string | undefined> => {
  try {
    const latestEntry = await db.closeTrx.orderBy('id').last();
    return latestEntry ? latestEntry.lkf_id : undefined;
  } catch (error) {
    console.error("Failed to fetch the latest LKF ID from IndexedDB:", error);
    return undefined;
  }
};

export const getShiftDataByLkfId = async (lkfId: string): Promise<ShiftData> => {
  try {
    const shiftData = await db.closeTrx.where('lkf_id').equals(lkfId).first();
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
    // Retrieve all transactions where type is either 'Issued' or 'Transfer'
    const issuedTransactions = await db.dataTransaksi
      .where('type')
      .anyOf(['Issued', 'Transfer'])
      .toArray();

    // Filter transactions by lkfId if necessary
    const filteredTransactions = issuedTransactions.filter(transaction => transaction.lkf_id === lkfId);

    // Sort transactions by date in descending order (latest first)
    filteredTransactions.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA; // Latest first
    });

    // Calculate the total quantity issued from the filtered transactions
    const totalIssued = filteredTransactions.reduce((sum, transaction) => sum + (transaction.qty ?? 0), 0);

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
      .equals('Receipt')
      .toArray();
    
    // Calculate the total quantity Receive
    const totalReceive = receiptTransactions.reduce((sum, transaction) => sum + (transaction.qty || 0), 0);

    return totalReceive;
  } catch (error) {
    console.error("Failed to fetch issued transactions from IndexedDB:", error);
    return undefined;
  }
};

export const getAllDataTrx = async (lkfId: string): Promise<DataFormTrx[]> => {
  try {
    const allData = await db.dataTransaksi.toArray();
    
    // Assuming `date_trx` is a Date object or can be compared as such
    const sortedData = allData.sort((a, b) => {
      return new Date(b.date_trx).getTime() - new Date(a.date_trx).getTime();
    });

    return sortedData;
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
    const latestEntry = await db.closeTrx.orderBy('id').last();
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

// export const getLatestHmLast = async (selectedUnit: string): Promise<number | undefined> => {
//   try {
//     const selectedUnitId = Number(selectedUnit); // Convert to number

//     // Get entries for the selected unit
//     const entries = await (await db.dataTransaksi
//       .filter(entry => entry.id === selectedUnitId) // Filter by selected unit ID
//       .sortBy('timestamp') // Assuming there is a timestamp to sort by; adjust as needed
//     ) // Assuming there is a timestamp to sort by; adjust as needed
//       .reverse() // Reverse to get the latest first
     

//     // Get the latest entry
//     const latestEntry = entries.length > 0 ? entries[0] : null;

//     // Check if there's a valid 'hm_last' value
//     if (latestEntry && latestEntry.hm_last != null) {
//       return latestEntry.hm_last; // Return the correct property
//     } else {
//       console.warn("No valid 'hm_last' data found for the selected unit.");
//       return undefined;
//     }
//   } catch (error) {
//     console.error("Failed to fetch the latest 'hm_last' value:", error);
//     return undefined;
//   }
// };





export const getLatestHmLast = async (selectedUnit: string): Promise<number | undefined> => {
  try {
    // Fetch the latest entry from the database
    const latestEntry = await db.dataTransaksi
          .orderBy('id')
          // .equals(selectedUnit)
          .last();

    // Check if the entry is found and return the 'hm_last' field
    if (latestEntry && latestEntry.hm_km != null) {
      return latestEntry.hm_km;
    } else {
      console.warn("No valid 'hm_last' data found in the dataTransaksi collection.");
      return undefined;
    }
  } catch (error) {
    // Log any errors that occur during data retrieval
    console.error("Failed to fetch the latest 'hm_last' value from IndexedDB:", error);
    return undefined;
  }
};




export const getLatestLkfDataDate = async (): Promise<{ lkf_id?: string; date?: string } | undefined> => {
  try {
    const latestEntry = await db.closeTrx.orderBy('id').reverse().limit(1).toArray();

    if (latestEntry.length > 0) {
      const entry = latestEntry[0];
      return {
        lkf_id: entry.lkf_id,
        date: typeof entry.date === 'string' ? String(entry.date) : entry.date,
      };
    } else {
      return undefined;
    }
  } catch (error) {
    console.error("Failed to fetch the latest LKF data from IndexedDB:", error);
    return undefined;
  }
};



export const getLatestLkfIdHm = async (): Promise<number | undefined> => {
  try {
    const latestEntry = await db.closeTrx.orderBy('id').last();
    return latestEntry ? latestEntry.hm_start : undefined;
  } catch (error) {
    console.error("Failed to fetch the latest LKF ID from IndexedDB:", error);
    return undefined;
  }
};


export const getShiftDataByStation = async (station: string): Promise<ShiftData[]> => {
  try {
      const shiftDataList = await db.closeTrx.where('station').equals(station).toArray();
      return shiftDataList.map(shiftData => ({
          shift: shiftData.shift || 'No Data',
          station: shiftData.station || 'No Data',
          openingDip: shiftData.opening_dip ?? 0,
          closing_dip: shiftData.closing_dip ?? 0,
          flow_meter_end: shiftData.flow_meter_end ?? 0
      }));
  } catch (error) {
      console.error('Failed to fetch shift data:', error);
      return [{
          shift: 'Error',
          station: 'Error',
          openingDip: 0,
          receipt: 0,
          flowMeterStart: 0
      }];
  }
};
