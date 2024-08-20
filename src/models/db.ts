import Dexie from 'dexie';

// Define the TypeScript interfaces for your data
interface DataLkf {
  issued: any;
  receipt: any;
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
  jde: string;
  lkf_id: any;
  stockOnHand:number
}

interface DataFormTrx {
  from_data_id: number;
  unit_no: string;
  model: string;
  owner: string;
  date_trx: string;
  hm_last: number;
  hm_km: number;
  qty_last: number;
  qty: number;
  name_operator: string;
  fbr: number;
  flow_start: string;
  flow_end: string;
  signature: string | null;
  type: string;
  lkf_id?: number;
  start_time: string;
  end_time: string;
  status: boolean;
  jde_operator: string;
  fuelman_id: string;
 
}



interface DataDashboard {
  id?: number; // Auto-incremented ID
  title: string;
  subtitle: number;
  icon: string;
}

// Create and configure the database
const db = new Dexie('fuelAppDatabase') as Dexie & {
  openingTrx: Dexie.Table<DataLkf, number>; // Define the table with the type
  dataTransaksi: Dexie.Table<DataFormTrx, number>;
  cards: Dexie.Table<DataDashboard, number>;
};

// Define the schema
db.version(1).stores({
  openingTrx: '++id, date, shift, hm_start, opening_dip, opening_sonding, flow_meter_start, site, fuelman_id, station, lkf_id',
  dataTransaksi: '++id, from_data_id, unit_no, model_unit, owner, date_trx, type, hm_last, hm_km, qty_last, qty, jde_operator, name_operator, fbr, lkf_id, signature, fuelman_id',
  cards: '++id, title, subtitle, icon'
});

export type { DataLkf, DataFormTrx, DataDashboard };
export { db };
