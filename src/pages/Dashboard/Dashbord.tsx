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
import { getLatestLkfId, getShiftDataByLkfId, getCalculationIssued, getCalculationReceive } from '../../utils/getData';
import { getHomeByIdLkf } from '../../hooks/getHome';


// Define the data structure for the card
interface CardData {
  title: string;
  value: string | number; 
  icon: string;
}

const DashboardFuelMan: React.FC = () => {
  const [cardData, setCardData] = useState<CardData[]>([
    { title: 'Shift', value: 'No Data', icon: 'shit.svg' },
    { title: 'FS/FT No', value: 'No Data', icon: 'fs.svg' },
    { title: 'Opening Dip', value: 'No Data', icon: 'openingdeep.svg' },
    { title: 'Receipt', value: 'No Data', icon: 'receipt.svg' },
    { title: 'Stock On Hand', value: 'No Data', icon: 'stock.svg' },
    { title: 'QTY Issued', value: 'No Data', icon: 'issued.svg' },
    { title: 'Balance', value: 'No Data', icon: 'balance.svg' },
    { title: 'Closing Dip', value: 'No Data', icon: 'close.svg' },
    { title: 'Flow Meter Awal', value: 'No Data', icon: 'flwawal.svg' },
    { title: 'Flow Meter Akhir', value: 'No Data', icon: 'flwakhir.svg' },
    { title: 'Total Flow Meter', value: 'No Data', icon: 'total.svg' },
    { title: 'Variance', value: 'No Data', icon: 'variance.svg' }
  ]);

  const [stockOnHand, setStockOnHand] = useState<number>(0); // Add state for stockOnHand
  const route = useIonRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [lkfId, setLkfId] = useState<string>('defaultLkfId');
  const [dataHome, setDataHome] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchShiftData = async () => {
      try {
        // Get the latest LKF ID
        const lkfId = await getLatestLkfId();
        console.log('Latest LKF ID:', lkfId); // Log the latest LKF ID

        if (lkfId) {
          // Get shift data using the LKF ID
          const shiftData = await getShiftDataByLkfId(lkfId);
          console.log('Shift Data:', shiftData); // Log the shift data

          // Get calculation issued
          const calculationIssued = await getCalculationIssued(lkfId);
          console.log('Calculation Issued:', calculationIssued);

          // Get calculation receive and update stock on hand
          const calculationReceive = await getCalculationReceive(lkfId);
          console.log('Calculation Receive:', calculationReceive);

          // Treat calculationReceive as a number directly
          const qtyReceive = typeof calculationReceive === 'number' ? calculationReceive : 0;
          const qtyIssued = typeof calculationIssued === 'number' ? calculationIssued : 0;

          // Calculate Stock On Hand as Opening Dip + QTY Received - QTY Issued
          const openingDip = shiftData.openingDip ?? 0;
          const stockOnHand = openingDip + qtyReceive - qtyIssued;

          // Calculate Balance as Stock On Hand - QTY Issued
          const balance = stockOnHand - qtyIssued;

          // Update state
          setStockOnHand(stockOnHand);

          // Update cardData state with fetched shift data
          setCardData([
            { title: 'Shift', value: shiftData.shift || 'No Data', icon: 'shift.svg' },
            { title: 'FS/FT No', value: shiftData.station || 'No Data', icon: 'fs.svg' },
            { title: 'Opening Dip', value: openingDip || 0, icon: 'openingdeep.svg' },
            { title: 'Receipt', value: qtyReceive || 0, icon: 'receipt.svg' },
            { title: 'Stock On Hand', value: stockOnHand || 0, icon: 'stock.svg' },
            { title: 'QTY Issued', value: qtyIssued || 0, icon: 'issued.svg' },
            { title: 'Balance', value: balance || 0, icon: 'balance.svg' },
            { title: 'Closing Dip', value: shiftData.closingDip ?? 0, icon: 'close.svg' },
            { title: 'Flow Meter Awal', value: shiftData.flowMeterStart ?? 0, icon: 'flwawal.svg' },
            { title: 'Flow Meter Akhir', value: shiftData.flowMeterEnd ?? 0, icon: 'flwakhir.svg' },
            { title: 'Total Flow Meter', value: shiftData.totalFlowMeter ?? 0, icon: 'total.svg' },
            { title: 'Variance', value: shiftData.variance ?? 0, icon: 'variance.svg' }
          ]);
        } else {
          console.log('No LKF ID found');
        }
      } catch (error) {
        console.error('Error fetching shift data:', error);
      }
    };

    fetchShiftData();
  }, []);

  const handleLogout = () => {
    Cookies.remove('session_token');
    route.push('/closing-data');
  };

  useEffect(() => {
    const fetchDataHome = async () => {
      try {
        if (lkfId) {
          const data = await getHomeByIdLkf(lkfId);
          setDataHome(data);
          console.log(data);
        } else {
          throw new Error('lkfId is not defined');
        }
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
          console.error('Failed to fetch home data:', error.message);
        } else {
          setError('An unexpected error occurred.');
          console.error('Unexpected error:', error);
        }
      }
    };

    fetchDataHome();
  }, [lkfId])


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
          <div className='btn-start' style={{ padding: "15px" }}>
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
          <h4 style={{ padding: "15px" }}>Hello </h4>
        </div>

        <IonGrid>
          <IonRow style={{ padding: "15px", marginTop: "-60px" }}>
            {cardData.map((card, index) => (
              <IonCol size="4" key={index}>
                <IonCard>
                  <IonCardHeader>
                    <IonCardSubtitle style={{ fontSize: "20px" }}>{card.title}</IonCardSubtitle>
                    <div style={{ display: "inline-flex", gap: "10px" }}>
                      <IonImg src={card.icon} alt={card.title} style={{ width: '30px', height: '30px', marginTop: "10px" }} />
                      <IonCardContent style={{ fontSize: "18px", fontWeight: "600" }}>{card.value}</IonCardContent>
                    </div>
                  </IonCardHeader>
                </IonCard>
              </IonCol>
            ))}
          </IonRow>

          <div className='content'>
            <p style={{ color: "red", padding: "15px", marginTop: "-40px" }}>
              * Sebelum Logout Pastikan Data Sonding Dip /Stock diisi, Klik Tombol ‘Dip’ Untuk Membuka Formnya, Terima kasih
            </p>
            <IonButton 
              style={{ padding: "15px", marginTop: "-30px" }} 
              className='check-button' 
              onClick={() => route.push('/transaction')}
             
            >
              <IonImg src='plus.svg'/>
              <span style={{ marginLeft: "10px" }}>Tambah Data</span>
            </IonButton>
          </div>
          <TableData />
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default DashboardFuelMan;
