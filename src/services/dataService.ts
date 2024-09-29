// dataService.ts

import { Preferences } from '@capacitor/preferences';
import { getStation } from '../hooks/useStation';
import { getAllUnit } from '../hooks/getAllUnit';
import { getAllQuota } from '../hooks/getQoutaUnit';
import { Station } from '../models/interfaces';
import { getAllSonding } from '../hooks/getAllSonding';
import { getOperator } from '../hooks/getAllOperator';
import { getStationData } from '../hooks/getDataTrxStation';



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
    return result.value ? JSON.parse(result.value) : null;
  } catch (error) {
    console.error(`Failed to get ${key} from storage`, error);
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


// Your existing fetchStationData function
export const fetchStationData = async (): Promise<Station[]> => {
  try {
    const response = await getStation(); 
    if (response?.data && Array.isArray(response.data)) {
      const stations = response.data.map((station: Station) => ({
        value: station.fuel_station_name,
        label: station.fuel_station_name,
        site: station.site,
        fuel_station_type: station.fuel_station_type,
        fuel_capacity: station.fuel_capacity,
      }));
      await saveDataToStorage('stationData', stations);
      return stations;
    } else {
      console.error("No station data found");
      return [];
    }
  } catch (error) {
    console.error("Failed to fetch station data:", error);
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
export const fetchQuotaData = async (date: string): Promise<any[]> => {
  try {
    const response = await getAllQuota(date); 
    if (response.status === '200' && Array.isArray(response.data)) {
      await saveDataToStorage('unitQuota', response.data);
      return response.data;
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

export const fetchShiftData = async (station:string): Promise<any[]> => {
  try {
    const response = await getStationData(station); 
    if (response.status === '200' && Array.isArray(response.data)) {
      await saveDataToStorage('shiftCloseData', response.data);
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



