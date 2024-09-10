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
import { chevronForwardOutline, chevronBackOutline } from 'ionicons/icons';
import { getLatestLkfId } from '../utils/getData';
import { getHomeTable } from '../hooks/getHome';

// Define the type for table data items
interface TableDataItem {
  no_unit: string;
  model_unit: string;
  fbr: number;
  type: string;
  qty: number;
  flow_start: number;
  flow_end: number;
  name_operator: string;
  jde_operator: string;
  status_code: number; // Ensure this field is included
}

const TableData: React.FC = () => {
  const itemsPerPage = 3;
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [nomorLKF, setNomorLKF] = useState<string | undefined>(undefined);
  const [data, setData] = useState<TableDataItem[] | undefined>(undefined);
  const [lkfId, setLkfId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchLkfId = async () => {
      try {
        const latestLkfId = await getLatestLkfId();
        if (latestLkfId) {
          setLkfId(latestLkfId);
          setNomorLKF(latestLkfId);
        } else {
          console.error("No LKF ID returned");
        }
      } catch (error) {
        console.error("Failed to fetch LKF ID:", error);
      }
    };
  
    fetchLkfId();
  }, []);

  useEffect(() => {
    const fetchTableSummary = async () => {
      if (lkfId) {
        console.log("Fetching data for LKF ID:", lkfId);
        try {
          const response = await getHomeTable(lkfId);
          console.log("Data Table:", response);
  
          if (response && response.data && Array.isArray(response.data)) {
            setData(response.data);
          } else {
            console.error("Expected an array in response.data but got:", response);
            setData([]);
          }
        } catch (error) {
          console.error("Failed to fetch table summary data:", error);
          setError("Failed to fetch data");
          setData([]); // Ensure data is cleared in case of error
        } finally {
          setLoading(false); // Stop loading indicator
        }
      } else {
        console.log("No LKF ID to fetch data for");
        setData([]); // Clear data if no LKF ID
        setLoading(false); // Stop loading indicator
      }
    };
  
    fetchTableSummary();
  }, [lkfId]);
  
  const filteredData = (data || []).filter(item =>
    (item.no_unit?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (item.model_unit?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (item.fbr?.toString().toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (item.type?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (item.name_operator?.toLowerCase() || '').includes(searchQuery.toLowerCase())
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
            <IonRow style={{ width: "900px" }} key={item.no_unit}>
              <IonCol><IonText>{item.no_unit}</IonText></IonCol>
              <IonCol><IonText>{item.model_unit}</IonText></IonCol>
              <IonCol><IonText>{item.fbr}</IonText></IonCol>
              <IonCol><IonText>{item.type}</IonText></IonCol>
              <IonCol><IonText>{item.qty}</IonText></IonCol>
              <IonCol><IonText>{item.flow_start}</IonText></IonCol>
              <IonCol><IonText>{item.flow_end}</IonText></IonCol>
              <IonCol><IonText>{item.name_operator}</IonText></IonCol>
              <IonCol>
                <IonText>
                  {item.status_code === 201 ? 'Sent' : 'Pending'}
                </IonText>
              </IonCol>
            </IonRow>
          ))}
        </IonGrid>
      </IonCard>
      <div style={{ textAlign: 'start', margin: '20px' }}>
        <IonButton 
          color="light" // Fixed typo from "ligth" to "light"
          style={{ background: 'white', color: 'black', border: '1px solid #ccc' }} 
          onClick={handlePrevious} 
          disabled={currentPage === 1}
        >
          <IonIcon icon={chevronBackOutline} />
        </IonButton>
        <span style={{ margin: '0 20px' }}>Page {currentPage} of {totalPages}</span>
        <IonButton  
          color="light" // Fixed typo from "ligth" to "light"
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
