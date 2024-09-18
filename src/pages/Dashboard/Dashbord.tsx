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
import TableData from '../../components/Table';
import { getLatestLkfId, getShiftDataByLkfId, getCalculationIssued, getCalculationReceive, getLatestLkfDataDate } from '../../utils/getData';
import { getHomeByIdLkf } from '../../hooks/getHome';

// Define the data structure for the card
interface CardData {
  title: string;
  value: string | number;
  icon: string;
}

const DashboardFuelMan: React.FC = () => {
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

  const [fullname, setFuelman] = useState<string>(''); // New state for Fuelman
  const [currentDate, setCurrentDate] = useState<string>(''); // State for current date
  const [latestDate, setLatestDate] = useState<string>(''); // State for latest date
  const route = useIonRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [lkfId, setLkfId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const handleOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);

  useEffect(() => {
    // Function to format date as "Tanggal : 25 Januari 2025"
    const formatDate = (date: Date): string => {
      const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
      return `Tanggal : ${new Intl.DateTimeFormat('id-ID', options).format(date)}`;
    };

    const fetchDate = async () => {
      try {
        const latestDataDate = await getLatestLkfDataDate();
        if (latestDataDate && latestDataDate.date) {
          const date = new Date(latestDataDate.date);
          setLatestDate(formatDate(date));
        } else {
          setLatestDate('No Date Available');
        }
      } catch (error) {
        console.error('Error fetching latest data date:', error);
        setLatestDate('Error fetching date');
      }
    };

    const fetchLkfIdAndData = async () => {
      try {
        const id = await getLatestLkfId();
        if (id) {
          setLkfId(id);

          const shiftData = await getShiftDataByLkfId(id);
          const calculationIssued = await getCalculationIssued(id);
          const calculationReceive = await getCalculationReceive(id);

          const qtyReceive = typeof calculationReceive === 'number' ? calculationReceive : 0;
          const qtyIssued = typeof calculationIssued === 'number' ? calculationIssued : 0;

          const openingDip = shiftData.openingDip ?? 0;
          const stockOnHand = openingDip + qtyReceive - qtyIssued;
          const flowMeterStart = shiftData.flowMeterStart ?? 0;
          const flowMeterEnd = flowMeterStart + qtyIssued;
          const totalFlowMeter = qtyIssued;
          const variance = totalFlowMeter - qtyIssued;

          setCardData([
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
          ]);

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

          const homeData = await getHomeByIdLkf(id);
          const loginData = localStorage.getItem('loginData');
          if (loginData) {
            const { jde } = JSON.parse(loginData);
            if (homeData && homeData.fullname) {
              const matchedEmployee = homeData.fullname.find((employee: any) => employee.JDE === jde);
              if (matchedEmployee) {
                setFuelman(matchedEmployee.fullname);
              } else {
                setFuelman('No Employee Found');
              }
            }
          }
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

    fetchDate();
    fetchLkfIdAndData();
  }, []);

  const handleLogout = () => {
    route.push('/closing-data');
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <IonPage>
      <IonContent>
        <IonHeader style={{height:"60px"}}>
          <IonRow>
            <IonCol>
              <div className='logoDashboard'>
                <IonImg style={{ padding:"10px", marginLeft:"15px"}} src="logodh.png" alt='logo-dashboard' />
              </div>
            </IonCol>
            <IonCol style={{ textAlign: 'right' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                marginRight: '15px',
                marginTop:"10px"
              }}>
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: isOnline ? '#73A33F' : 'red',
                    marginRight: '5px'
                  }}
                />
                <span>{isOnline ? 'Online' : 'Offline'}</span>
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
            <IonButton color="warning" style={{ marginLeft: "10px" }} onClick={handleLogout}>
              Close LFK & Logout
            </IonButton>
          </div>
        </div>

        <div className='padding-content mr20' style={{ marginTop: "20px" }}>
          <IonGrid>
            <IonRow >
              <IonCol></IonCol>
            </IonRow>
          </IonGrid>
          <IonRow style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h4 >Fuelman : {fullname}</h4>
          <h4 >{latestDate}</h4>
          </IonRow>
        </div>
        
        <IonGrid >
          <IonRow >
            {cardData.map((card, index) => (
              <IonCol size="4" key={index}>
                <IonCard style={{height:"90px"}} >
                  <IonCardHeader>
                    <IonCardSubtitle style={{ fontSize: "16px" }}>{card.title}</IonCardSubtitle>
                    <div style={{ display: "inline-flex", gap: "10px" }}>
                      <IonImg src={card.icon} alt={card.title} style={{ width: '30px', height: '30px', marginTop: "10px" }} />
                      <IonCardContent style={{ fontSize: "24px", fontWeight: "500" , marginTop:"-10px"}}>{card.value}</IonCardContent>
                    </div>
                    
                  </IonCardHeader>
                  
                </IonCard>
              </IonCol>
            ))}
          <IonRow>
          <p style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexDirection: 'column',
            }}>
            <p style={{ 
              color: "#E16104", 
              textAlign: 'justify', 
              marginLeft: "15px", 
              marginRight: "15px" 
            }}>
              * Sebelum Logout Pastikan Data Sonding Dip /Stock diisi, Klik Tombol ‘Dip’ Untuk Membuka Formnya, Terima kasih
              * QTY Issued adalah Issued + Transfer
            </p>
            </p>
          </IonRow>
          </IonRow>
            <IonButton 
              style={{ padding: "15px" }} 
              className='check-button' 
              onClick={() => route.push('/transaction')}>
              <IonImg src='plus.svg'/>
              <span style={{ marginLeft: "10px" }}>Tambah Data</span>
            </IonButton>
          <TableData />
        </IonGrid>
        
      </IonContent>
    </IonPage>
  );
};

export default DashboardFuelMan;
