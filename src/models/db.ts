import Dexie, { Table } from 'dexie';

// Define the TypeScript interfaces for your data
interface DataLkf {
  name: string;
  issued: any;
  receipt: any;
  id?: number;
  date: string; 
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
  hm_end:number,
  closing_dip:number;
  closing_sonding: number;
  flow_meter_end:number ;
  note:string;
  signature:string;
  close_data:number,
  variant:number,
  status?:string,
}


interface DataLkfUpdate {
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
  hm_end:number,
  closing_dip:number;
  closing_sonding: number;
  flow_meter_end:number;
  note:string;
  signature:string;
  close_data:number,
  variant:number,
}

interface DataMasterTransaksi {

  id?: number; // Auto-incremented ID
  hm_km: number;
  no_unit:string;
  qty:number;
  model_unit:string;
  owner:string;

  
}

interface DataFormTrx {
  date: string | number | Date;

  id?: number; // Auto-incremented ID
  // liters: number;
  // cm: number;
  from_data_id: string;
  no_unit: string;
  model_unit: string;
  owner: string;
  date_trx: any;
  hm_last: number;
  hm_km: number;
  qty_last: number;
  qty: number;
  name_operator: string;
  fbr: number;
  flow_start: number;
  flow_end: number ;
  signature: string;
  foto: string;
  type: string;
  lkf_id?: string;
  status: number;
  fuelman_id: string;
  jde_operator:string;
  start:string;
  end:string;
}


interface DataHistoryTrasaksi {
  date: string | number | Date;

  id?: number; // Auto-incremented ID
  // liters: number;
  // cm: number;
  from_data_id: string;
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
  flow_end: number ;
  signature: string | null;
  foto: string;
  type: string;
  lkf_id?: string;
  status: number;
  fuelman_id: string;
  jde_operator:string;
  start:string;
  end:string;

  
}
interface DataDashboard {
  id?: number; // Auto-incremented ID
  shift : string;
  station :string;
  total_issued:number;
  total_receive:number;
  total_transfer:number;
  closing_dip: number;
  flow_meter_start:number
  fuelman_id:number;
  op_dip:number;
 

}

interface SondingData {
  sonding: number;
  sondingValue: number;
  id?: number; // Auto-incremented ID
  station: string;
  cm: number;
  liters: number;
  site:string;
}



// Create and configure the database
const db = new Dexie('fuelAppDatabase') as Dexie & {
  openingTrx: Dexie.Table<DataLkf, number>;
  dataTransaksi: Dexie.Table<DataFormTrx, number>;
  dataMasterTrasaksi:Dexie.Table<DataMasterTransaksi, number>;
  cards: Dexie.Table<DataDashboard, number>;
  sondingMaster:Table<SondingData,number>
  closeTrx: Dexie.Table<DataLkfUpdate, number>;
};

// Define t10e schema
db.version(13).stores({
  // openingTrx: '++id, date, shift, hm_start, opening_dip, opening_sonding, flow_meter_start, site, fuelman_id, station, lkf_id,km_end, closing_dip, closing_sonding, flow_meter_end,note,signature',
  closeTrx: '++id, date, shift, hm_start, opening_dip, opening_sonding, flow_meter_start, site, fuelman_id, station, lkf_id,km_end, closing_dip, closing_sonding, flow_meter_end,note,signature',
  dataTransaksi: '++id, from_data_id, no_unit, model_unit, owner, date_trx, hm_last, hm_km, qty_last, qty, name_operator, fbr, flow_start, flow_end, signature, foto, type, lkf_id, start_time, end_time, status, jde_operator, fuelman_id, dip_start, dip_end, sonding_start, sonding_end, reference, start, end',
  dataMasterTrasaksi: '++id, id, no_unit, hm_km, qty',
  cards: '++id, title, subtitle, icon',
  sondingMaster:'++id, station, cm , liters, site'
});

export type { DataLkf, DataFormTrx, DataDashboard , SondingData, DataLkfUpdate, DataMasterTransaksi};
export { db };
