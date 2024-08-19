import React, { useEffect, useState } from 'react';
import {
  IonImg, 
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonPage,
  IonRow,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonCardSubtitle,
  IonButton,
  useIonRouter
} from '@ionic/react';
import Cookies from 'js-cookie';
import TableData from '../../components/Table';
import { getDataByFuelmanID, getDataByStation } from '../../utils/getData';


// Define the data structure based on your API response
interface DataLkf {
  id?: number;
  opening_dip: number;
  station: string;
  shift: string;
  receipt:number;
}

const DashboardFuelMan: React.FC = () => {
  const [cardData, setCardData] = useState<any[]>([
    { title: 'Shift', subtitle: 'No Data', icon: 'shit.svg' },
    { title: 'FS/FT No', subtitle: 'No Data', icon: 'fs.svg' },
    { title: 'Opening Dip', subtitle: 'No Data', icon: 'openingdeep.svg' },
    { title: 'Receipt', subtitle: 'No Data', icon: 'receipt.svg' },
    { title: 'Stock On Hand', subtitle: 'No Data', icon: 'stock.svg' },
    { title: 'QTY Issued', subtitle: 'No Data', icon: 'issued.svg' },
    { title: 'Balance', subtitle: 'No Data', icon: 'balance.svg' },
    { title: 'Closing Deep', subtitle: 'No Data', icon: 'close.svg' },
    { title: 'Flow Meter Awal', subtitle: 'No Data', icon: 'flwawal.svg' },
    { title: 'Flow Meter Akhir', subtitle: '', icon: 'flwakhir.svg' },
    { title: 'Total Flow Meter', subtitle: '50000 Liter', icon: 'total.svg' },
    { title: 'Variance', subtitle: '50000 Liter', icon: 'variance.svg' },
  ]);
  const [fuelmanName, setFuelmanName] = useState<string>(''); 
  const [loginData, setLoginData] = useState<any>(null); 
  const route = useIonRouter();

  useEffect(() => {
    const storedLoginData = localStorage.getItem('loginData');
    if (storedLoginData) {
      const loginData = JSON.parse(storedLoginData);
      setLoginData(loginData);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (loginData) {
        const { jde, station } = loginData;
  
        try {
          const [fuelmanData, stationData] = await Promise.all([
            getDataByFuelmanID(jde),
            getDataByStation(station),
          ]);
  
          const mostRecentFuelmanData = fuelmanData.sort((a, b) => (b.id || 0) - (a.id || 0))[0];
          const mostRecentStationData = stationData.sort((a, b) => (b.id || 0) - (a.id || 0))[0];
          const receipt = mostRecentFuelmanData?.receipt?.toString() || '0'; // Added receipt handling

          const openingDip = mostRecentFuelmanData?.opening_dip?.toString() || '0';
          const issued = mostRecentFuelmanData?.issued?.toString() || '0';
          const stockOnHand = (parseFloat(openingDip) - parseFloat(issued)).toString();
         
  
          const shift = mostRecentFuelmanData?.shift || 'N/A';
  
          // Accessing the current card data from state
          setCardData(prevData => {
            const updatedCardData = prevData.map(card => 
              card.title === 'Opening Dip'
              ? { ...card, subtitle: `${openingDip} Liter` }
              : card.title === 'FS/FT No'
              ? { ...card, subtitle: mostRecentStationData?.station || 'N/A' }
              : card.title === 'Shift'
              ? { ...card, subtitle: shift }
              : card.title === 'Stock On Hand'
              ? { ...card, subtitle: `${stockOnHand} Liter` }
              : card
              ? { ...card, subtitle: `${receipt} Liter` }
              : card
            );
  
            // Save to localStorage
            localStorage.setItem('cardDataDashborad', JSON.stringify(updatedCardData));
            localStorage.setItem('fuelmanName', fuelmanName);
  
            return updatedCardData;
          });
  
          setFuelmanName(fuelmanName);
  
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }
    };
  
    fetchData();
  }, [loginData,]);
  
  const handleLogout = () => {
    Cookies.remove('session_token');
    route.push('/closing-data');
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <IonPage>
      <IonContent>
        <IonHeader className="header-dash">
          <IonRow>
            <IonCol>
              <div className='logoDashboard'>
                <IonImg src="logodh.png" alt='logo-dashboard' />
              </div>
            </IonCol>
          </IonRow>
        </IonHeader>

        <div className='content'>
          <div className='btn-start'>
            <IonButton color="primary" onClick={handleRefresh}>
              <IonImg src='refresh.svg' alt="Refresh" />
              Refresh
            </IonButton>
            <IonButton color="warning" onClick={handleLogout}>
              Close LFK & Logout
            </IonButton>
          </div>
        </div>

        <div className='padding-content mr20'>
          <h4>Hello {fuelmanName}</h4> 
        </div>

        <IonGrid>
          <IonRow>
            {cardData.map((card, index) => (
              <IonCol size="4" key={index}>
                <IonCard>
                  <IonCardHeader>
                    <IonCardSubtitle style={{ fontSize: "20px" }}>{card.title}</IonCardSubtitle>
                    <div style={{ display: "inline-flex", gap: "10px" }}>
                      <IonImg src={card.icon} alt={card.title} style={{ width: '30px', height: '30px', marginTop: "10px" }} />
                      <IonCardContent style={{ fontSize: "18px", fontWeight: "600" }}>{card.subtitle}</IonCardContent>
                    </div>
                  </IonCardHeader>
                </IonCard>
              </IonCol>
            ))}
          </IonRow>
          <div className='content'>
          <p style={{ color: "red" }}>
            * Sebelum Logout Pastikan Data Sonding Dip /Stock diisi, Klik Tombol ‘Dip’ Untuk Membuka Formnya, Terima kasih
          </p>
          <IonButton className='ion-button' onClick={() => route.push('/transaction')}>
            <IonImg src='plus.svg' alt="Add Data" />
            <span style={{ marginLeft: "10px" }}>Tambah Data</span>
          </IonButton>
        </div>
        </IonGrid>
        <TableData />
      </IonContent>
    </IonPage>
  );
};

export default DashboardFuelMan;
