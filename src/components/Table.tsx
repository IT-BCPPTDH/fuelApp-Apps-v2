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
  IonToast
 
  
} from "@ionic/react";
import { useIonToast } from '@ionic/react';

import { chevronForwardOutline, chevronBackOutline } from 'ionicons/icons';
import { getAllDataTrx, getLatestLkfId } from '../utils/getData';
import { postBulkData } from '../hooks/bulkInsert';
import { checkmarkCircleOutline } from 'ionicons/icons';
import { updateDataInTrx } from '../utils/update';
import { getHomeByIdLkf, getHomeTable } from '../hooks/getHome';
import { getDataFromStorage } from '../services/dataService';

interface TableDataItem {
  hm_km: any;
  from_data_id: number;
  unit_no: string;
  model_unit: string;
  owner: string;
  fbr_historis: string;
  jenis_trx: string;
  qty_issued: number;
  qty_last: number;
  fm_awal: number;
  fm_akhir: number;
  hm_last: number;
  jde_operator: string;
  name_operator: string;
  status: number;
 
}


interface TableDataProps {
  setPendingStatus: React.Dispatch<React.SetStateAction<boolean>>;
}

const TableData: React.FC<TableDataProps> = ({ setPendingStatus }) =>  {

  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [nomorLKF, setNomorLKF] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<TableDataItem[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [lkfId, setLkfId] = useState<string>('');
  const [presentToast] = useIonToast();
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine); 



  useEffect(() => {
    // Check if there are any pending items
    const hasPendingData = data.some(item => item.status === 0); // Assuming status 0 means pending
    setPendingStatus(hasPendingData);
  }, [data, setPendingStatus]);
  

  useEffect(() => {
    const fetchLkfId = async () => {
      try {
        const latestLkfId = await getLatestLkfId();
        if (latestLkfId) {
          setNomorLKF(latestLkfId);
          await fetchData(latestLkfId);
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
    setLoading(true);
    try {
      const rawData = await getAllDataTrx(lkfId);
      console.log("Raw data fetched:", rawData); // Log the response
  
      // Ensure we are working with an array
      const dataArray = rawData || []; // Default to an empty array if no data is found
  
      // Check if dataArray is an array
      if (!Array.isArray(dataArray)) {
        console.error("Received data is not an array:", dataArray);
        throw new TypeError("Expected dataArray to be an array");
      }
  
      // Map the fetched data to table data structure
      const mappedData: TableDataItem[] = dataArray.map((item: any) => ({
        from_data_id: item.from_data_id ?? 0,
        unit_no: item.no_unit || '',
        model_unit: item.model_unit || '',
        owner: item.owner || '',
        fbr_historis: item.fbr ?? '',
        jenis_trx: item.type || '',
        qty_issued: item.qty ?? 0,
        qty_last: item.qty_last ?? 0,
        fm_awal: item.flow_start ?? 0,
        fm_akhir: item.flow_end ?? 0,
        hm_last: item.hm_last,
        hm_km: item.hm_km,
        jde_operator: item.fuelman_id || '',
        name_operator: item.name_operator || item.name__operator || '',
        // Adjusting the status mapping to handle different status codes
        status: item.status === 1 || item.status === '1' ? 1 : 0, // Ensure it maps 1 as 'sent'
      }));
  
      setData(mappedData); // Update table data with the mapped status
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setShowToast(true); // Show a toast message in case of an error
    } finally {
      setLoading(false);
    }
  };
  


  const handleBulkInsert = async () => {
    if (!navigator.onLine) {
      await presentToast({
        message: "Perangkat offline! Mohon pastikan terkoneksi dengan jaringan.",
        duration: 2000,
        position: 'bottom',
        color: 'danger',
      });
      return;
    }
  
    if (!data || data.length === 0) {
      setError("No data available for insertion");
      return;
    }
  
    const loginData = localStorage.getItem('loginData');
    let createdBy = '';
  
    if (loginData) {
      const parsedData = JSON.parse(loginData);
      createdBy = parsedData.jde || '';
    }
  
    const bulkData = data.map(item => ({
      from_data_id: item.from_data_id,
      no_unit: item.unit_no,
      model_unit: item.model_unit,
      owner: item.owner,
      date_trx: new Date().toISOString(),
      hm_last: item.hm_last,
      hm_km: item.hm_km,
      qty_last: item.qty_issued,
      qty: item.qty_issued,
      flow_start: item.fm_awal,
      flow_end: item.fm_akhir,
      name_operator: item.name_operator,
      fbr: parseFloat(item.fbr_historis),
      signature: '',
      photo: '',
      type: item.jenis_trx,
      lkf_id: nomorLKF || undefined,
      jde_operator: item.jde_operator,
      created_by: createdBy,
      start: new Date().toISOString(),
      end: new Date().toISOString(),
     
    }));
  
    try {
      if (navigator.onLine) {
        const responses = await postBulkData(bulkData);
        console.log("Bulk insert responses:", responses);
        
        const updatedData = data.map((item) => ({
          ...item,
          status: 1,
        }));
  
        await Promise.all(updatedData.map(async (item) => {
          await updateDataInTrx(item.from_data_id, { status: item.status });
        }));
        setData(updatedData);
        
      }
      const totalInserted = bulkData.length;
      const successMessage = `Successfully saved ${totalInserted} items to the server.`;
      await presentToast({
        message: successMessage,
        duration: 2000,
        position: 'top',
      });
      setError(null);
  
    } catch (error) {
      console.error("Error during bulk insert:", error);
      setError("Failed to save data to server");
      await presentToast({
        message: "Failed to save data to server.",
        duration: 2000,
        position: 'bottom',
      });
    }
  };
  



 
  

useEffect(() => {
  const handleOnline = () => {
    console.log("Network is back online, syncing data...");
    handleBulkInsert();
  };

  window.addEventListener('online', handleOnline);

  return () => {
    window.removeEventListener('online', handleOnline);
  };
}, [data, nomorLKF]);

  const filteredData = (data || []).filter(item =>
    item.unit_no.toLowerCase().includes(searchQuery.toLowerCase())
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

  if (paginatedData.length < 0) {
    return <div>No data found.</div>;
  }

  const displayStatus = (status: number): string => {
    return status === 1 ? 'Sent' : 'Pending';
  };

  const totalQtyIssued = filteredData.reduce((total, item) => total + item.qty_issued, 0);


  return (
    <div>
      <IonRow style={{ marginTop: "-20px" }} className='padding-content'>
        <IonCol style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
          <div style={{ fontSize: "20px", fontWeight: "600", color: "#222428" }}>LKF:</div>
          <span style={{ fontSize: "20px", color: "#222428" }}>{nomorLKF || 'Loading...'}</span>
        </IonCol>
        
        <IonCol>
          <IonSearchbar 
            placeholder="Search Unit" 
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
            <IonCol><IonText>Fullname</IonText></IonCol>
            <IonCol><IonText>Status</IonText></IonCol>
          </IonRow>
          {/* {paginatedData.map((item: TableDataItem) => (
            <IonRow style={{ width: "900px" }} key={item.from_data_id}>
              <IonCol><IonText>{item.unit_no}</IonText></IonCol>
              <IonCol><IonText>{item.model_unit}</IonText></IonCol>
              <IonCol><IonText>{item.fbr_historis}</IonText></IonCol>
              <IonCol><IonText>{item.jenis_trx}</IonText></IonCol>
              <IonCol><IonText>{item.qty_issued}</IonText></IonCol>
              <IonCol><IonText>{item.fm_awal}</IonText></IonCol>
              <IonCol><IonText>{item.fm_akhir}</IonText></IonCol>
              <IonCol><IonText>{item.name_operator}</IonText></IonCol>
              <IonCol><IonText>{displayStatus(item.status)}</IonText></IonCol>
            </IonRow>
          ))} */}
          {paginatedData.map((item: TableDataItem) => {
  // If the transaction type is "Receipt" or "Receipt KPC", use fm_awal as fm_akhir
  const displayFmAkhir = (item.jenis_trx === 'Receipt' || item.jenis_trx === 'Receipt KPC') ? item.fm_awal : item.fm_akhir;

  return (
    <IonRow style={{ width: "900px" }} key={item.from_data_id}>
      <IonCol><IonText>{item.unit_no}</IonText></IonCol>
      <IonCol><IonText>{item.model_unit}</IonText></IonCol>
      <IonCol><IonText>{item.fbr_historis}</IonText></IonCol>
      <IonCol><IonText>{item.jenis_trx}</IonText></IonCol>
      <IonCol><IonText>{item.qty_issued}</IonText></IonCol>
      <IonCol><IonText>{item.fm_awal}</IonText></IonCol>
      <IonCol><IonText>{item.fm_akhir}</IonText></IonCol>
      <IonCol><IonText>{item.name_operator}</IonText></IonCol>
      <IonCol><IonText>{displayStatus(item.status)}</IonText></IonCol>
    </IonRow>
  );
})}

        </IonGrid>
      </IonCard>
      <div style={{ textAlign: 'start', margin: '20px' }}>
        <IonButton onClick={handlePrevious} disabled={currentPage === 1}>
          <IonIcon icon={chevronBackOutline} />
        </IonButton>
        <span style={{ margin: '0 20px' }}>Page {currentPage} of {totalPages}</span>
        <IonButton onClick={handleNext} disabled={currentPage === totalPages}>
          <IonIcon icon={chevronForwardOutline} />
        </IonButton>
      </div>
      <IonGrid style={{ float: "inline-end" }}>
        <IonButton className='check-button' onClick={handleBulkInsert}>Save Data To Server</IonButton>
      </IonGrid>

      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
      
        duration={2000}
        position="top"
      />
    </div>
  );
};

export default TableData;