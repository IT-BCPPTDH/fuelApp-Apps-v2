import Dexie from 'dexie';

// Define the TypeScript interfaces for your data
interface DataLkf {
  name: string;
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
  stockOnHand: number;
}

interface DataFormTrx {
  from_data_id: number;
  no_unit: string;
  model_unit: string;
  owner: string;
  date_trx: string;
  hm_last: number;
  hm_km: number;
  qty_last: number;
  qty: number;
  name_operator: string;
  fbr: number;
  flow_start: number;
  flow_end: number;
  signature: string | null;
  foto: string;
  type: string;
  lkf_id?: string;
  start_time: string;
  end_time: string;
  status: boolean;
  jde_operator: string;
  fuelman_id: string;
  dip_start: number;
  dip_end: number;
  sonding_start: number;
  sonding_end: number;
  reference: number;
  start: string;
  end: string;
}

interface DataDashboard {
  id?: number; // Auto-incremented ID
  title: string;
  subtitle: number;
  icon: string;
}

// Create and configure the database
const db = new Dexie('fuelAppDatabase') as Dexie & {
  openingTrx: Dexie.Table<DataLkf, number>;
  dataTransaksi: Dexie.Table<DataFormTrx, number>;
  cards: Dexie.Table<DataDashboard, number>;
};

// Define the schema
db.version(2).stores({
  openingTrx: '++id, date, shift, hm_start, opening_dip, opening_sonding, flow_meter_start, site, fuelman_id, station, lkf_id',
  dataTransaksi: '++id, from_data_id, no_unit, model_unit, owner, date_trx, hm_last, hm_km, qty_last, qty, name_operator, fbr, flow_start, flow_end, signature, foto, type, lkf_id, start_time, end_time, status, jde_operator, fuelman_id, dip_start, dip_end, sonding_start, sonding_end, reference, start, end',
  cards: '++id, title, subtitle, icon'
});

export type { DataLkf, DataFormTrx, DataDashboard };
export { db };
