import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonText,
  IonButton,
  IonSearchbar,
  IonIcon
} from "@ionic/react";
import { saveOutline } from 'ionicons/icons';
import { getLatestLkfId } from '../utils/getData';

// Define the type for table data items
interface TableDataItem {
  id: number;
  unit_no: string;
  model_unit: string;
  fbr_historis: string;
  jenis_trx: string;
  qty_issued: number;
  fm_awal: number;
  fm_akhir: number;
  name: string;
  status: string;
}

// Sample data for the table
const tableData: TableDataItem[] = [
  { id: 1, unit_no: 'EX7463', model_unit: 'Hitachi', fbr_historis: '1000', jenis_trx: 'Issued', qty_issued: 100, fm_awal: 5000, fm_akhir: 5100, name: 'John Doe', status: 'sent' },
  { id: 2, unit_no: 'EX4060', model_unit: 'Komatsu', fbr_historis: '2038', jenis_trx: 'Issued', qty_issued: 200, fm_awal: 5200, fm_akhir: 5000, name: 'Jane Smith', status: 'sent' },
  { id: 3, unit_no: 'DT4580', model_unit: 'Komatsu', fbr_historis: '3088', jenis_trx: 'Issued', qty_issued: 150, fm_awal: 5300, fm_akhir: 5150, name: 'Alice Johnson', status: 'sent' },
  { id: 4, unit_no: 'DT3049', model_unit: 'Komatsu', fbr_historis: '309', jenis_trx: 'Issued', qty_issued: 180, fm_awal: 5400, fm_akhir: 5220, name: 'Bob Brown', status: 'sent' },
  { id: 5, unit_no: 'EX9001', model_unit: 'Sanny', fbr_historis: '487', jenis_trx: 'Issued', qty_issued: 120, fm_awal: 5500, fm_akhir: 5380, name: 'Charlie Davis', status: 'sent' },
  { id: 6, unit_no: 'EX3001', model_unit: 'Sanny', fbr_historis: '567', jenis_trx: 'Issued', qty_issued: 170, fm_awal: 5600, fm_akhir: 5430, name: 'David Wilson', status: 'sent' },
  { id: 7, unit_no: 'EX2021', model_unit: 'Sanny', fbr_historis: '800', jenis_trx: 'Issued', qty_issued: 140, fm_awal: 5700, fm_akhir: 5560, name: 'Eve Lewis', status: 'sent' },
  { id: 8, unit_no: 'EX9092', model_unit: 'Sanny', fbr_historis: '100', jenis_trx: 'Issued', qty_issued: 160, fm_awal: 5800, fm_akhir: 5640, name: 'Frank Clark', status: 'sent' },
];

const TableData: React.FC = () => {
  const itemsPerPage = 3; // Number of items per page
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [nomorLKF, setNomorLKF] = useState<string | undefined>(undefined);

  // Fetch data and set LKF ID
  useEffect(() => {
    const fetchData = async () => {
      try {
        const latestLkfId = await getLatestLkfId();
        setNomorLKF(latestLkfId);
      } catch (error) {
        console.error("Failed to fetch data from IndexedDB:", error);
      }
    };

    fetchData();
  }, []);

  // Filter data based on search query
  const filteredData = tableData.filter(item =>
    item.unit_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.model_unit.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.fbr_historis.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.jenis_trx.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const handlePrevious = () => {
    setCurrentPage(prevPage => Math.max(prevPage - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage(prevPage => Math.min(prevPage + 1, totalPages));
  };

  const handleSearchChange = (e: CustomEvent) => {
    setSearchQuery(e.detail.value);
    setCurrentPage(1); 
  };

  return (
  <div style={{padding:"20px", marginTop:"-30px"}}>
  
        <IonRow className='padding-content'>
          <IonCol><div style={{fontSize:"20px", fontWeight:"600px", color:"#222428"}}>LKF:</div ><span style={{fontSize:"16px", color:"#222428"}}>{nomorLKF || 'Loading...'}</span></IonCol>
          <IonCol>
            <IonSearchbar 
              placeholder="Search..." 
              value={searchQuery} 
              onIonInput={handleSearchChange} 
            />
          </IonCol>
        </IonRow>
        <IonCard>
          <IonGrid style={{ overflow: "auto" }}>
            <IonRow style={{ background: "#737373", color: "white", width: "900px" }}>
              <IonCol><IonText>No Unit</IonText></IonCol>
              <IonCol><IonText>Model Unit</IonText></IonCol>
              <IonCol><IonText>FBR Histori</IonText></IonCol>
              <IonCol><IonText>Jenis Trx</IonText></IonCol>
              <IonCol><IonText>QTY Issued</IonText></IonCol>
              <IonCol><IonText>FM Awal</IonText></IonCol>
              <IonCol><IonText>FM Akhir</IonText></IonCol>
              <IonCol><IonText>Nama</IonText></IonCol>
              <IonCol><IonText>Status</IonText></IonCol>
            </IonRow>

            {/* Table Data */}
            {paginatedData.map((item: TableDataItem) => (
              <IonRow style={{ width: "900px" }} key={item.id}>
                <IonCol><IonText>{item.unit_no}</IonText></IonCol>
                <IonCol><IonText>{item.model_unit}</IonText></IonCol>
                <IonCol><IonText>{item.fbr_historis}</IonText></IonCol>
                <IonCol><IonText>{item.jenis_trx}</IonText></IonCol>
                <IonCol><IonText>{item.qty_issued}</IonText></IonCol>
                <IonCol><IonText>{item.fm_awal}</IonText></IonCol>
                <IonCol><IonText>{item.fm_akhir}</IonText></IonCol>
                <IonCol><IonText>{item.name}</IonText></IonCol>
                <IonCol><IonText>{item.status}</IonText></IonCol>
              </IonRow>
            ))}
          </IonGrid>
        </IonCard>
        <div style={{ textAlign: 'start', margin: '20px' }}>
          <IonButton onClick={handlePrevious} disabled={currentPage === 1}>Prev</IonButton>
          <span style={{ margin: '0 20px' }}>Page {currentPage} of {totalPages}</span>
          <IonButton onClick={handleNext} disabled={currentPage === totalPages}>Next</IonButton>
        </div>
        <div style={{ textAlign: 'end', margin: '20px' }}>
          <IonButton className="check-button">
            <IonIcon slot="start" icon={saveOutline} /> Simpan Data Ke Server
          </IonButton>
        </div>
     
  </div>
  );
};

export default TableData;
