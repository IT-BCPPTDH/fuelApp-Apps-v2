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
  IonAlert // Import IonAlert
} from "@ionic/react";
import { chevronForwardOutline, chevronBackOutline } from 'ionicons/icons';
import { getAllDataTrx, getLatestLkfId } from '../utils/getData';
import { postBulkData } from '../hooks/bulkInsert';
import { checkmarkCircleOutline } from 'ionicons/icons';
import { updateDataInTrx } from '../utils/update';
// Define the type for table data items
interface TableDataItem {
  from_data_id: number;
  unit_no: string;
  model_unit: string;
  owner: string;
  fbr_historis: string;
  jenis_trx: string;
  qty_issued: number;
  fm_awal: number;
  fm_akhir: number;
  jde_operator: string;
  name_operator: string;
  status: number; // Ensure this is a number
}

const TableData: React.FC = () => {
  const itemsPerPage = 3;
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [nomorLKF, setNomorLKF] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<TableDataItem[]>([]);
  const [showAlert, setShowAlert] = useState(false); // State to control the alert visibility
  const [alertMessage, setAlertMessage] = useState(''); // State for alert message

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
      const mappedData: TableDataItem[] = rawData.map((item: any) => {
        // Assuming item.status is either 1 (Sent) or 0 (Pending)
        const statusValue = item.status === 1 ? 1 : 0; 
  
        return {
          from_data_id: item.from_data_id ?? 0,
          unit_no: item.no_unit || '',
          model_unit: item.model_unit || '',
          owner: item.owner || '',
          fbr_historis: item.fbr ?? '',
          jenis_trx: item.type || '',
          qty_issued: item.qty ?? 0,
          fm_awal: item.flow_start ?? 0,
          fm_akhir: item.flow_end ?? 0,
          jde_operator: item.fuelman_id || '',
          name_operator: item.fullname,
          status: statusValue, // Assign the numeric status
        };
      });
  
      setData(mappedData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };
  
  
  const handleBulkInsert = async () => {
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
      hm_last: 0,
      hm_km: 0,
      qty_last: item.qty_issued,
      qty: item.qty_issued,
      flow_start: item.fm_awal,
      flow_end: item.fm_akhir,
      name_operator: item.jde_operator,
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
      // Perform bulk insert
      const responses = await postBulkData(bulkData);
      console.log("Bulk insert responses:", responses);
  
      // Create an array of updated data based on responses
      const updatedData = data.map((item, index) => ({
        ...item,
        status: 1, // Set the status to 1 (Sent) for all successfully inserted items
      }));
  
      // Update IndexedDB entries
      await Promise.all(updatedData.map(async (item) => {
        await updateDataInTrx(item.from_data_id, { status: item.status }); // Update status in IndexedDB
      }));
  
      setData(updatedData);
  
      // Count of successfully inserted items
      const totalInserted = bulkData.length;
  
      // Create a success message
      const successMessage = `Successfully saved ${totalInserted} items to the server.`;
  
      setAlertMessage(successMessage); // Show success message
      setShowAlert(true); // Show the alert
      setError(null);
    } catch (error) {
      console.error("Error during bulk insert:", error);
      setError("Failed to save data to server");
      setAlertMessage("Failed to save data to server.");
      setShowAlert(true); // Show the alert on error
    }
  };
  
  
  
  

  const filteredData = (data || []).filter(item =>
    item.unit_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.model_unit.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.fbr_historis.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.jenis_trx.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.jde_operator.toLowerCase().includes(searchQuery.toLowerCase())
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


  const displayStatus = (status: number): string => {
    return status === 1 ? 'Sent' : 'Pending';
  };


  
  return (
    <div>
      <IonRow style={{ marginTop: "-20px" }} className='padding-content'>
        <IonCol style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
          <div style={{ fontSize: "20px", fontWeight: "600px", color: "#222428" }}>LKF:</div>
          <span style={{ fontSize: "20px", color: "#222428" }}>{nomorLKF || 'Loading...'}</span>
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
            <IonCol><IonText>Fullname</IonText></IonCol>
            <IonCol><IonText>Status</IonText></IonCol>
          </IonRow>

          {/* Table Data */}
          {paginatedData.map((item: TableDataItem) => (
            <IonRow style={{ width: "900px" }} key={item.from_data_id}>
              <IonCol><IonText>{item.unit_no}</IonText></IonCol>
              <IonCol><IonText>{item.model_unit}</IonText></IonCol>
              <IonCol><IonText>{item.fbr_historis}</IonText></IonCol>
              <IonCol><IonText>{item.jenis_trx}</IonText></IonCol>
              <IonCol><IonText>{item.qty_issued}</IonText></IonCol>
              <IonCol><IonText>{item.fm_awal}</IonText></IonCol>
              <IonCol><IonText>{item.fm_akhir}</IonText></IonCol>
              <IonCol><IonText>{item.name_operator}</IonText></IonCol>
              <IonCol><IonText>{displayStatus(item.status)}</IonText></IonCol> {/* Use display function */}
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
      <IonGrid style={{ float: "inline-end" }}>
        <IonButton className='check-button' onClick={handleBulkInsert}>Save Data To Server</IonButton>
      </IonGrid>

      {/* IonAlert for showing messages */}
      <IonAlert
        isOpen={showAlert}
        onDidDismiss={() => setShowAlert(false)}
        header={error ? "Error" : "Success"}
        message={alertMessage}
        buttons={["OK"]}
      />
    </div>
  );
};

export default TableData;
