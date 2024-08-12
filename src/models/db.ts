import Dexie, { type EntityTable } from 'dexie';

interface dataLkf {
  id?: number;
  date: any,
  shift: string,
  hm_start: number,
  opening_dip: number,
  opening_sonding: number,
  flow_meter_start: number,
  site: string,
  fuelman_id: string,
  station: string,
}

const db = new Dexie('fuelAppDatabase') as Dexie & {
  openingTrx: EntityTable<
    dataLkf,
    'id' // primary key "id" (for the typings only)
  >;
};

// Schema declaration:
db.version(1).stores({
  openingTrx: '++id, date, shift, hm_start, opening_dip, opening_sonding, flow_meter_start, site, fuelman_id, station' // primary key "id" (for the runtime!)
});

export type { dataLkf };
export { db };