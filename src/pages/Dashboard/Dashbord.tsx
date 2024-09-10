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
  const [data, setData] = useState<any>(null); // Adjust the type based on your data structure

  const [cardData, setCardData] = useState<CardData[]>([
    { title: 'Shift', value: 'No Data', icon: 'shift.svg' },
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

  const [stockOnHand, setStockOnHand] = useState<number>(0);
  const [flowMeterStart, setFlowMeterStart] = useState<number>(0);
  const [flowMeterEnd, setFlowMeterEnd] = useState<number>(0);
  const [qtyIssued, setQtyIssued] = useState<number>(0); // State for Quantity Issued
  const [variance, setVariance] = useState<number>(0); // State for Variance
  const route = useIonRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [lkfId, setLkfId] = useState<string>('');
  const [dataHome, setDataHome] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [shiftData, setShiftData] = useState<any>(null);


  useEffect(() => {
    const fetchLkfIdAndData = async () => {
      try {
        // Step 1: Fetch the latest LKF ID
        const id = await getLatestLkfId();
        if (id) {
          setLkfId(id);

          // Step 2: Fetch shift data using the LKF ID
          const shiftData = await getShiftDataByLkfId(id);
          const calculationIssued = await getCalculationIssued(id);
          const calculationReceive = await getCalculationReceive(id);

          // Calculate necessary values
          const qtyReceive = typeof calculationReceive === 'number' ? calculationReceive : 0;
          const qtyIssued = typeof calculationIssued === 'number' ? calculationIssued : 0;
          setQtyIssued(qtyIssued);

          const openingDip = shiftData.openingDip ?? 0;
          const stockOnHand = openingDip + qtyReceive - qtyIssued;

          const flowMeterStart = shiftData.flowMeterStart ?? 0;
          const flowMeterEnd = flowMeterStart + qtyIssued;

          const totalFlowMeter = qtyIssued;
          setVariance(totalFlowMeter - qtyIssued);

          // Update state
          setStockOnHand(stockOnHand);
          setFlowMeterStart(flowMeterStart);
          setFlowMeterEnd(flowMeterEnd);

          // Update cardData state
          const cardData = [
            { title: 'Shift', value: shiftData.shift || 'No Data', icon: 'shift.svg' },
            { title: 'FS/FT No', value: shiftData.station || 'No Data', icon: 'fs.svg' },
            { title: 'Opening Dip', value: openingDip, icon: 'openingdeep.svg' },
            { title: 'Receipt', value: qtyReceive, icon: 'receipt.svg' },
            { title: 'Stock On Hand', value: stockOnHand, icon: 'stock.svg' },
            { title: 'QTY Issued', value: qtyIssued, icon: 'issued.svg' },
            { title: 'Balance', value: stockOnHand, icon: 'balance.svg' },
            { title: 'Closing Dip', value: openingDip - qtyIssued, icon: 'close.svg' },
            { title: 'Flow Meter Awal', value: flowMeterStart, icon: 'flwawal.svg' },
            { title: 'Flow Meter Akhir', value: flowMeterEnd, icon: 'flwakhir.svg' },
            { title: 'Total Flow Meter', value: totalFlowMeter, icon: 'total.svg' },
            { title: 'Variance', value: variance, icon: 'variance.svg' }
          ];
          
          setCardData(cardData);

          // Save data to localStorage
          localStorage.setItem('shiftData', JSON.stringify({
            shiftData,
            calculationIssued,
            calculationReceive,
            qtyReceive,
            qtyIssued,
            openingDip,
            stockOnHand,
            flowMeterStart,
            flowMeterEnd,
            totalFlowMeter,
            variance,
            cardData
          }));

          // Fetch additional data using lkfId
          const homeData = await getHomeByIdLkf(id);
          setShiftData(homeData); // Or use a different state for this data if needed
        } else {
          setError('No LKF ID found');
        }
      } catch (error) {
        if (error instanceof Error) {
          setError(`Error fetching data: ${error.message}`);
        } else {
          setError('An unexpected error occurred.');
        }
        console.error('Error fetching shift data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLkfIdAndData();
  }, []);


  const handleLogout = () => {
    route.push('/closing-data');
  };

  useEffect(() => {
    const fetchLkfId = async () => {
      try {
        const data = await getLatestLkfId();
        if (data) {
          setLkfId(data);
          console.log('data',data)  // Set lkfId only if it is not undefined
        } else {
          // Handle the case when `id` is undefined
          setError('Failed to fetch lkfId.');
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(`Error fetching lkfId: ${err.message}`);
        } else {
          setError('An unexpected error occurred.');
        }
      }
    };

    fetchLkfId();
  }, []);
  
  useEffect(() => {
    const fetchDataSummary = async () => {
      try {
        if (lkfId) {
          // Fetch data using lkfId
          const data = await getHomeByIdLkf(lkfId);
          setData(data);
          console.log('data', data);
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

    if (lkfId) {
      fetchDataSummary();
    }
  }, [lkfId]);

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

        <div>
     
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
