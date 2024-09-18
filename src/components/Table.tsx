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
  IonIcon,
  IonBadge
} from "@ionic/react";
import { chevronForwardOutline, chevronBackOutline } from 'ionicons/icons';
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
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchLkfId = async () => {
      try {
        const latestLkfId = await getLatestLkfId();
        if (latestLkfId) {
          setNomorLKF(latestLkfId);
          await fetchData(latestLkfId); // Fetch data with the latest LKF ID
        } else {
          console.error("No LKF ID returned");
        }
      } catch (error) {
        console.error("Failed to fetch LKF ID:", error);
      }
    };

    fetchLkfId();
  }, []);

  const fetchData = async (lkfId: string) => {
    try {
      const rawData = await getAllDataTrx(lkfId);
      console.log("Raw Data:", rawData); // Log raw data to verify status values
      const mappedData: TableDataItem[] = rawData.map((item: any) => ({
        id: item.id ?? 0,
        unit_no: item.no_unit || '',
        model_unit: item.model_unit || '',
        fbr_historis: item.fbr || '',
        jenis_trx: item.type || '',
        qty_issued: item.qty ?? 0,
        fm_awal: item.flow_start ?? 0,
        fm_akhir: item.flow_end ?? 0,
        name: item.fuelman_id || '',
        status: item.status === 0 ? 'Pending' : 'Sent', // Ensure mapping is correct
      }));
  
      setData(mappedData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };
  
  

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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div >
      <IonRow className='padding-content'>
        <IonCol style={{display:"flex", gap:"10px", marginTop:"20px"}}>
          <div style={{ fontSize: "20px", fontWeight: "600px", color: "#222428" }}>LKF:</div>
          <span style={{ fontSize: "20px", color: "#222428"  }}>{nomorLKF || 'Loading...'}</span>
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
        <IonButton 
          onClick={handlePrevious} 
          disabled={currentPage === 1}
        >
          <IonIcon icon={chevronBackOutline} />
        </IonButton>
        <span style={{ margin: '0 20px' }}>Page {currentPage} of {totalPages}</span>
        <IonButton
          onClick={handleNext} 
          disabled={currentPage === totalPages}
        >
          <IonIcon icon={chevronForwardOutline} />
          
        </IonButton>   
      </div>
      <IonGrid style={{float:"inline-end"}}>
        <IonButton  className='check-button'  > Save Data To Server</IonButton>
      </IonGrid>
 
    </div>
  );
};

export default TableData;
