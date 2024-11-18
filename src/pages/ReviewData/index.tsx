import React, { useState, useEffect } from 'react';
import { useIonRouter } from '@ionic/react';
import { IonButton, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { closeCircleOutline, saveOutline } from 'ionicons/icons';
import Cookies from 'js-cookie';
import { getLatestLkfId, getLatestLkfData } from '../../utils/getData';
import { logoutUser } from '../../hooks/useAuth';

import './style.css';
import { deleteAllClosingData, deleteAllDataTransaksi } from '../../utils/delete';
import { removeDataFromStorage } from '../../services/dataService';

const ReviewData: React.FC = () => {
    const route = useIonRouter();
    const [latestLkfId, setLatestLkfId] = useState<string | undefined>(undefined);
    const [openingSonding, setOpeningSonding] = useState<number | undefined>(undefined);
    const [openingDip, setOpeningDip] = useState<number | undefined>(undefined);
    const [closeSonding, setCloseSonding] = useState<number | undefined>(undefined);

    const [closingDip, setCloseDip] = useState<number | undefined>(undefined);
    const [hmEnd, setHmEnd] = useState<number | undefined>(undefined);
    const [closeData, setCloseData] = useState<number | undefined>(undefined);
    const [totalReceipt, setReceipt] = useState<number | undefined>(undefined);
    const [stock, setStockOnHand] = useState<number | undefined>(undefined);
    const [qtyIssued, setIssued] = useState<number | undefined>(undefined);
    const [flowMeterStart, setFlowMeterStart] = useState<number | undefined>(undefined);

    const [dataUserLog, setDataUserLog] = useState<any | undefined>(undefined);
    const [station, setStation] = useState<string | undefined>(undefined);

    const [flowMeteAkhir, setFlowMeterAkhir] = useState<number>();
    
    const [totalIssued, setTotalIssued] = useState<number>();
    const [stockOnHand, setDataStock] = useState<number >();
    const [flowMeterAwal, setFlowMeterAwal] = useState<number>();
    const [totalVariance, setTotalVariance] = useState(0);
    const [totalDataFlowMeter, setTotalFlowMeter] = useState<number>(); 
   



    // useEffect(() => {
    //     const fetchLatestLkfId = async () => {
    //         const id = await getLatestLkfId();
    //         setLatestLkfId(id);

    //         const data = await getLatestLkfData();
    //         if (data) {
    //             setLatestLkfId(data.lkf_id);
    //             setOpeningSonding(data.opening_sonding);
    //         }

    //         const shiftData = localStorage.getItem("shiftData");
    //         if (shiftData) {
    //             const parsedData = JSON.parse(shiftData);
    //             setCloseSonding(parsedData.open_sonding || 0);
               
    //             setStockOnHand(parsedData.stockOnHand || 0);
    //             setIssued(parsedData.qtyIssued || 0);
    //             setFlowMeterStart(parsedData.flowMeterStart || 0);
    //             setTotalFlowMeter(parsedData.totalFlowMeter || 0);
    //         }

    //         const lkfData = localStorage.getItem("latestLkfData");
    //         if (lkfData) {
    //             const parsedData = JSON.parse(lkfData);
    //             setCloseSonding(parsedData.closing_sonding || 0);
    //         }
    //         if (lkfData) {
    //             const parsedData = JSON.parse(lkfData);
    //             setCloseDip(parsedData.closing_dip || 0);
    //         }
    //         if (lkfData) {
    //             const parsedData = JSON.parse(lkfData);
    //             setHmEnd(parsedData.hm_end || 0);
    //         }

    //         if (lkfData) {
    //             const parsedData = JSON.parse(lkfData);
    //             setCloseData(parsedData.close_data || 0);
    //         }

    //         const userData = localStorage.getItem("loginData");
    //         if (userData) {
    //             const parsedData = JSON.parse(userData);
    //             setDataUserLog(parsedData);
    //             setStation(parsedData.station);
    //         }
    //     };
    //     fetchLatestLkfId();
    // }, []);

    

    useEffect(() => {
        const fetchLatestLkfId = async () => {
            const id = await getLatestLkfId();
            setLatestLkfId(id);
    
            const data = await getLatestLkfData();
            if (data) {
                setLatestLkfId(data.lkf_id);
                setOpeningSonding(data.opening_sonding);
            }
    
            const shiftData = localStorage.getItem("shiftData");
            if (shiftData) {
                const parsedData = JSON.parse(shiftData);
                setCloseSonding(parsedData.open_sonding || 0);
                setStockOnHand(parsedData.stockOnHand || 0);
                setIssued(parsedData.qtyIssued || 0);
                setFlowMeterStart(parsedData.flowMeterStart || 0);
                setTotalFlowMeter(parsedData.totalFlowMeter || 0);
            }
    
            const lkfData = localStorage.getItem("latestLkfData");
            let closeDataValue = 0;
            let closingDipValue = 0;
    
            if (lkfData) {
                const parsedData = JSON.parse(lkfData);
    
                setCloseSonding(parsedData.closing_sonding || 0);
                setCloseDip(parsedData.closing_dip || 0);
                setHmEnd(parsedData.hm_end || 0);
                setCloseData(parsedData.close_data || 0);
                setTotalVariance(parsedData.variant || 0);
                setFlowMeterAkhir(parsedData.flow_meter_end || 0);
    
                // Save values for variance calculation
                closeDataValue = parsedData.close_data || 0;
                closingDipValue = parsedData.closing_dip || 0;
            }
    
            // Calculate Total Variance
         
            const userData = localStorage.getItem("loginData");
            if (userData) {
                const parsedData = JSON.parse(userData);
                setDataUserLog(parsedData);
                setStation(parsedData.station);
            }
        };
    
        fetchLatestLkfId();
    }, []);
    
    useEffect(() => {
        const getcardDash = () => {
            try {
                const cachedData = localStorage.getItem('cardDash');
                if (cachedData) {
                    const cardDash = JSON.parse(cachedData);
                    const totalIsssued = cardDash.find((item: { title: string; }) => item.title === "QTY Issued");
                    const closeData = cardDash.find((item: { title: string; }) => item.title === "Stock On Hand");
                    const flowMeterAwal = cardDash.find((item: { title: string; }) => item.title === "Flow Meter Awal");
                    const totalMeter = cardDash.find((item: { title: string; }) => item.title === "Flow Meter Akhir");
                    const totalReceipt = cardDash.find((item: { title: string; }) => item.title === "Receipt");
                    const openingDip = cardDash.find((item: { title: string; }) => item.title === "Opening Dip");

                    if (totalIsssued) {
                        setTotalIssued(Number(totalIsssued.value || 0));
                    }

                    if (closeData) {
                        setDataStock(Number(closeData.value || 0));
                    }

                    if (flowMeterAwal) {
                        setFlowMeterAwal(Number(flowMeterAwal.value || 0));
                    }
                    if (totalMeter) {
                        setTotalFlowMeter(Number(totalMeter.value || 0));
                    }
                    if (totalReceipt) {
                        setReceipt(Number(totalReceipt.value || 0));
                    }
                    if (openingDip) {
                        setOpeningDip(Number(openingDip.value || 0));
                    }
                    
                }
            } catch (error) {
                console.error('Error retrieving cardDash from localStorage:', error);
            }
        };

        getcardDash();
    }, []);


    const handleLogout = async () => {
        try {
            const now = new Date();
            const logout_time = now.toISOString().split('T')[0]; // Format date as YYYY-MM-DD
            const time = now.toTimeString().split(' ')[0]; // Format time as HH:MM:SS
    
            // Prepare parameters with date and time
            const params = {
                logout_time: logout_time,
                time: time,
                station: '', 
                JDE: '',
                userId: '',
                isLoggin: '',
                logId: '',
                isLogging: ''
            };
    
            // Call the API to log out
            await logoutUser(params);
    
            // Remove cookies after successful logout
            Cookies.remove('isLoggedIn');
            Cookies.remove('session_token');
            // Clear specific shift data from local storage
            const shiftData = localStorage.getItem('shiftData');
            if (shiftData) {
                const parsedShiftData = JSON.parse(shiftData);
                // Example to remove 'flowMeterEnd' from shiftData if it exists
                if (parsedShiftData.flowMeterEnd !== undefined) {
                    delete parsedShiftData.flowMeterEnd;
                    localStorage.setItem('shiftData', JSON.stringify(parsedShiftData));
                } else {
                    // Completely remove shiftData if no specific field to retain
                    removeDataFromStorage('shiftData');

                }

                
            }
    
            // Remove unitQouta from localStorage
            removeDataFromStorage('unitQouta');
       
            removeDataFromStorage('lastLkfDataStation');
            removeDataFromStorage('lastClosingSonding');
            removeDataFromStorage('lastDipLiter');
            removeDataFromStorage('lastFlowMeter');
            removeDataFromStorage('shiftCloseData');
            removeDataFromStorage('loginData');
            removeDataFromStorage('allOperator');
            removeDataFromStorage('allUnit');
            removeDataFromStorage('stationData');

            localStorage.removeItem('cardDash');
            localStorage.removeItem('latestLkfData');

           
            // Delete dataTransaksi from IndexedDB
            // await deleteData();
            await deleteAllDataTransaksi();
            await deleteAllClosingData()
            // Redirect to the home page or login page
            // route.push('/')
            window.location.href='/'
        
        } catch (error) {
            console.error('Logout failed:', error);
            // Handle logout failure, e.g., show an error message
        }
    };
    
    return (
        <IonPage>
            <IonHeader translucent={true} className="ion-no-border">
                <IonToolbar className="custom-header">
                    <IonTitle>Review Data Sebelum Logout</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <div style={{ marginTop: "18px", padding: "18px" }}>
                    <IonList>
                        <IonListHeader>
                            <IonLabel style={{fontSize:"24px"}} className='font-review'>Review Data</IonLabel>
                        </IonListHeader>
                        <IonItem>
                            <IonLabel style={{fontSize:"18px"}}  className='font-review'>Open Sonding / Dip: {openingSonding !== undefined ? openingSonding : "Loading..."} Cm / {openingDip} Liters</IonLabel>
                        </IonItem>
                        <IonItem>
                            <IonLabel  style={{fontSize:"18px"}} className='font-review'>Receive : {totalReceipt}</IonLabel>
                        </IonItem>
                        <IonItem>
                            <IonLabel style={{fontSize:"18px"}} className='font-review'>Stock On Hand : {stockOnHand}</IonLabel>
                        </IonItem>
                        <IonItem>
                            <IonLabel style={{fontSize:"18px"}} className='font-review'>Issued : {totalIssued}</IonLabel>
                        </IonItem>
                        <IonItem>
                            <IonLabel style={{fontSize:"18px"}} className='font-review'>HM KM End: {hmEnd}</IonLabel>
                        </IonItem>
                        <IonItem>
                            <IonLabel style={{fontSize:"18px"}} className='font-review'>Closing Sonding / Dip : {closeSonding} Cm / {closingDip}  Liter </IonLabel>
                        </IonItem>
                        <IonItem>
                            <IonLabel style={{fontSize:"18px"}} className='font-review'>Flow Meter Akhir: {flowMeteAkhir}</IonLabel>
                        </IonItem>
                        <IonItem>
                            <IonLabel style={{fontSize:"18px"}} className='font-review'>Total Meter : {totalIssued}</IonLabel>
                        </IonItem>
                        <IonItem>
                            <IonLabel style={{fontSize:"18px"}} className='font-review'>Daily Variance : {totalVariance}</IonLabel>
                        </IonItem>
                    </IonList>
                    <div style={{ marginTop: "18px", float: "inline-end" }}>
                        <IonButton color="light" onClick={() => route.push('/closing-data') }>
                            <IonIcon slot="start" icon={closeCircleOutline} />Batal
                        </IonButton>
                        <IonButton onClick={handleLogout} className="check-close">
                            <IonIcon slot="start" icon={saveOutline} />Close Shift & Logout
                        </IonButton>
                    </div>
                </div>
            </IonContent>
          
        </IonPage>
    );
};

export default ReviewData;

