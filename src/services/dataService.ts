// dataService.ts

import { Preferences } from '@capacitor/preferences';
import { getStation } from '../hooks/useStation';
import { getAllUnit } from '../hooks/getAllUnit';
import { getAllQuota } from '../hooks/getQoutaUnit';
import { Station } from '../models/interfaces';
import { getAllSonding } from '../hooks/getAllSonding';
import { getOperator } from '../hooks/getAllOperator';
import { getStationData } from '../hooks/getDataTrxStation';
import { getDataLastLKF, getDataLastTrx, getPrevUnitTrx } from '../hooks/getDataPrev';
import { postAuthLogin } from '../hooks/useAuth';
import { getHomeByIdLkf } from '../hooks/getHome';

import { addHours } from 'date-fns'; 

// Utility function to save data to Capacitor Preferences
export const saveDataToStorage = async (key: string, data: any): Promise<void> => {
  try {
    await Preferences.set({
      key,
      value: JSON.stringify(data),
    });
  } catch (error) {
    console.error(`Failed to save ${key} to storage`, error);
  }
};





// Utility function to retrieve data from Capacitor Preferences
export const getDataFromStorage = async (key: string): Promise<any | null> => {
  try {
    const result = await Preferences.get({ key });
   
    const res=  result.value ? JSON.parse(result.value) : null;

    return res 
  } catch (error) {
   
    return null;
  }
};


// Utility function to remove data from Capacitor Preferences
export const removeDataFromStorage = async (key: string): Promise<void> => {
  try {
    await Preferences.remove({ key });
  } catch (error) {
    console.error(`Failed to remove ${key} from storage`, error);
  }
};


export const fetchStationData = async (): Promise<any[]> => {
  try {
    const response = await getStation(); 
    if (response.status === '200' && Array.isArray(response.data)) {
      await saveDataToStorage('allStation', response.data);
      return response.data;
    } else {
      console.error('Unexpected data format');
      return [];
    }
  } catch (error) {
    console.error('Failed to fetch unit data', error);
    return [];
  }
};




// Fetch unit data from API and store it in Capacitor Preferences
export const fetchUnitData = async (): Promise<any[]> => {
  try {
    const response = await getAllUnit(); 
    if (response.status === '200' && Array.isArray(response.data)) {
      await saveDataToStorage('allUnit', response.data);
      return response.data;
    } else {
      console.error('Unexpected data format');
      return [];
    }
  } catch (error) {
    console.error('Failed to fetch unit data', error);
    return [];
  }
};








// Fetch quota data from API and store it in Capacitor Preferences
// export const fetchQuotaData = async (date: string): Promise<any[]> => {
//   try {
//     const response = await getAllQuota(date); 
  
//     if (response.status === '200' && Array.isArray(response.data)) {
//       await saveDataToStorage('unitQuota', response.data);
//       return response.data;
//     } else {
//       console.error('Unexpected data format');
//       return [];
//     }
//   } catch (error) {
//     console.error('Failed to fetch quota data', error);
//     return [];
//   }
// };


export const fetchQuotaData = async (date: string): Promise<any[]> => {
  try {
    const response = await getAllQuota(date);
  
    if (response.status === '200' && Array.isArray(response.data)) {
      // Menambahkan 12 jam ke setiap tanggal dalam data yang diterima
      const updatedData = response.data.map((item: { date: string | number | Date; }) => {
        if (item.date) {
          const updatedDate = addHours(new Date(item.date), 12); // Menambahkan 12 jam
          item.date = updatedDate.toISOString(); // Memperbarui tanggal dengan format ISO
        }
        return item;
      });

      // Menyimpan data yang telah diperbarui ke storage
      await saveDataToStorage('unitQuota', updatedData);

      return updatedData;
    } else {
      console.error('Unexpected data format');
      return [];
    }
  } catch (error) {
    console.error('Failed to fetch quota data', error);
    return [];
  }
};


export const fetchSondingData = async (): Promise<any[]> => {
  try {
    const response = await getAllSonding(); 
    if (response.status === '200' && Array.isArray(response.data)) {
      await saveDataToStorage('allSonding', response.data);
      return response.data;
    } else {
      console.error('Unexpected data format');
      return [];
    }
  } catch (error) {
    console.error('Failed to fetch Sonding data', error);
    return [];
  }
};


export const fetchOperatorData = async (): Promise<any[]> => {
  try {
    const response = await getOperator(); 
    if (response.status === '200' && Array.isArray(response.data)) {
      await saveDataToStorage('allOperator', response.data);
      return response.data;
    } else {
      console.error('Unexpected data format');
      return [];
    }
  } catch (error) {
    console.error('Failed to fetch Operator data', error);
    return [];
  }
};

export const fetchShiftData = async (station: string): Promise<any[]> => {
  try {
    const response = await getStationData(station); 
    // Log the raw response for debugging
    console.log("Raw Response:", response);

    if (response && response.status === '200' && Array.isArray(response.data)) {
      await saveDataToStorage('shiftCloseData', response.data);
      
      // Log success with clear context
      console.log("Shift data fetched successfully:", response.data);
      
      return response.data;
    } else {
      console.error('Unexpected data format or status. Response:', response);
      return [];
    }
  } catch (error) {
    // Log the error with details
    console.error('Failed to fetch Shift Data. Error:', error);
    return [];
  }
};




export const fetchLasTrx = async (): Promise<any[]> => {
  try {
    const response = await getDataLastTrx(); 
    if (response.status === '200' && Array.isArray(response.data)) {
      await saveDataToStorage('lastTrx', response.data);
      return response.data;
    } else {
      console.error('Unexpected data format');
      return [];
    }
  } catch (error) {
    console.error('Failed to fetch unit data', error);
    return [];
  }
};

export const fetchTrasData= async (no_unit:string): Promise<any[]> => {
  try {
    const response = await getPrevUnitTrx(no_unit); 
    if (response.status === '200' && Array.isArray(response.data)) {
      await saveDataToStorage('dataTrx', response.data);
      return response.data;
    } else {
      console.error('Unexpected data format');
      return [];
    }
  } catch (error) {
    console.error('Failed to fetch unit data', error);
    return [];
  }
};

export const fetchLasLKF = async (): Promise<any[]> => {
  try {
    const response = await getDataLastLKF(); 
    if (response.status === '200' && Array.isArray(response.data)) {
      await saveDataToStorage('lastLKF', response.data);
      return response.data;
    } else {
      console.error('Unexpected data format');
      return [];
    }
  } catch (error) {
    console.error('Failed to fetch unit data', error);
    return [];
  }
};



// export const fetchOperatorLogin = async (): Promise<any[]> => {
//   try {
//     const response = await postAuthLogin(); 
//     if (response.status === '200' && Array.isArray(response.data)) {
//       await saveDataToStorage('allOperator', response.data);
//       return response.data;
//     } else {
//       console.error('Unexpected data format');
//       return [];
//     }
//   } catch (error) {
//     console.error('Failed to fetch Operator data', error);
//     return [];
//   }
// }


export const fetchStationOnTrans = async (lkf_id: string): Promise<any> => {
  try {
    const response = await getHomeByIdLkf(lkf_id);
    console.log("Raw DataHome:", response);

    // Check for a valid response structure
    if (response && response.status === '200' && response.data) {
      await saveDataToStorage('dataHomeCard', response.data);
      console.log("Shift data fetched successfully:", response.data);

      return response.data; // Return the data directly
    } else {
      console.error('Unexpected data format or status. Response:', response);
      return null; // Return null instead of an empty array
    }
  } catch (error) {
    console.error('Failed to fetch Shift Data. Error:', error);
    return null; // Return null on error
  }
};





export { getOperator };
