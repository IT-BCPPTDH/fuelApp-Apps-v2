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
import { saveOutline, chevronForwardOutline, chevronBackOutline } from 'ionicons/icons';
import { getAllDataTrx, getLatestLkfId } from '../utils/getData';

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

const TableData: React.FC = () => {
  const itemsPerPage = 3;
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [nomorLKF, setNomorLKF] = useState<string | undefined>(undefined);
  const [data, setData] = useState<TableDataItem[] | undefined>(undefined);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const latestLkfId = await getLatestLkfId();
        setNomorLKF(latestLkfId);
      } catch (error) {
        console.error("Failed to fetch LKF ID:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Assume `getAllDataTrx` returns data in a format that needs mapping
        const rawData = await getAllDataTrx();
        
        // Transform data to match TableDataItem type
        const mappedData: TableDataItem[] = rawData.map((item: any) => ({
          id: item.id ?? 0, // Default to 0 if undefined
          unit_no: item.no_unit || '',
          model_unit: item.model_unit || '',
          fbr_historis: item.fbr || '',
          jenis_trx: item.type || '',
          qty_issued: item.qty ?? 0, // Default to 0 if undefined
          fm_awal: item.flow_start ?? 0, // Default to 0 if undefined
          fm_akhir: item.flow_end ?? 0, // Default to 0 if undefined
          name: item.fuelman_id || '',
          status: item.status || 'Draft'
        }));
        
        setData(mappedData);
      } catch (error) {
        console.error("Failed to fetch data from IndexedDB:", error);
      }
    };

    fetchData();
  }, []);

  const filteredData = (data || []).filter(item =>
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
        <IonCol>
          <div style={{display:"inline-flex",gap:"10px" }}>
            <div style={{fontSize:"20px", fontWeight:"600px", color:"#222428"}}>LKF:</div>
            <span style={{fontSize:"20px", color:"#222428"}}>{nomorLKF || 'Loading...'}</span>
          </div>
        </IonCol>
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
  <IonButton color="ligth"
    style={{ background: 'white', color: 'black', border: '1px solid #ccc' }} 
    onClick={handlePrevious} 
    disabled={currentPage === 1}
  >
    <IonIcon icon={chevronBackOutline} />
  </IonButton>
  <span style={{ margin: '0 20px' }}>Page {currentPage} of {totalPages}</span>
  <IonButton  color="ligth"
    style={{ background: 'white', color: 'black', border: '1px solid #ccc' }} 
    onClick={handleNext} 
    disabled={currentPage === totalPages}
  >
    <IonIcon icon={chevronForwardOutline} />
  </IonButton>
</div>

    </div>
  );
};

export default TableData;
