import Dexie from 'dexie';

// Define the TypeScript interface for your data
interface dataLkf {
  id?: number;
  date: string; // Change `any` to `string` since date will be in ISO string format
  shift: string;
  hm_start: number;
  opening_dip: number;
  opening_sonding: number;
  flow_meter_start: number;
  site: string;
  fuelman_id: string;
  station: string;
  jde:string;
  lkf_id:any;
}

// Create and configure the database
const db = new Dexie('fuelAppDatabase') as Dexie & {
  openingTrx: Dexie.Table<dataLkf, number>; // Define the table with the type
};

// Define the schema
db.version(2).stores({
  openingTrx: '++id, date, shift, hm_start, opening_dip, opening_sonding, flow_meter_start, site, fuelman_id, station,lkf_id '
});

export type { dataLkf };
export { db };
