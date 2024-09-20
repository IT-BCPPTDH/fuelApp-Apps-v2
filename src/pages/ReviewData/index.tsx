import React, { useState, useEffect } from 'react';
import { useIonRouter } from '@ionic/react';
import { IonButton, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { closeCircleOutline, saveOutline } from 'ionicons/icons';
import Cookies from 'js-cookie';
import { getLatestLkfId, getLatestLkfData } from '../../utils/getData';
import { logoutUser } from '../../hooks/useAuth';

import './style.css';
import { removeDataFromDB } from '../../utils/insertData';

const ReviewData: React.FC = () => {
    const route = useIonRouter();
    const [latestLkfId, setLatestLkfId] = useState<string | undefined>(undefined);
    const [openingSonding, setOpeningSonding] = useState<number | undefined>(undefined);
    const [closeSonding, setCloseSonding] = useState<number | undefined>(undefined);
    const [receive, setReceive] = useState<number | undefined>(undefined);
    const [stock, setStockOnHand] = useState<number | undefined>(undefined);
    const [qtyIssued, setIssued] = useState<number | undefined>(undefined);
    const [flowMeterStart, setFlowMeterStart] = useState<number | undefined>(undefined);
    const [totalFlowMeter, setTotalFlowMeter] = useState<number | undefined>(undefined);
    const [dataUserLog, setDataUserLog] = useState<any | undefined>(undefined);
    const [station, setStation] = useState<string | undefined>(undefined);


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
                setReceive(parsedData.calculationReceive || 0);
                setStockOnHand(parsedData.stockOnHand || 0);
                setIssued(parsedData.qtyIssued || 0);
                setFlowMeterStart(parsedData.flowMeterStart || 0);
                setTotalFlowMeter(parsedData.totalFlowMeter || 0);
            }

            const lkfData = localStorage.getItem("latestLkfData");
            if (lkfData) {
                const parsedData = JSON.parse(lkfData);
                setCloseSonding(parsedData.closing_sonding || 0);
            }

            const userData = localStorage.getItem("loginData");
            if (userData) {
                const parsedData = JSON.parse(userData);
                setDataUserLog(parsedData);
                setStation(parsedData.station);
            }
        };
        fetchLatestLkfId();
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
            Cookies.remove('authToken'); // Remove other cookies if necessary
    
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
                    localStorage.removeItem('shiftData');
                }
            }
    
           
            // Delete dataTransaksi from IndexedDB
        //    await deleteData()
    
            // Redirect to the home page or login page
            window.location.href = '/';
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
                <div style={{ marginTop: "20px", padding: "20px" }}>
                    <IonList>
                        <IonListHeader>
                            <IonLabel className='font-review'>Review Data</IonLabel>
                        </IonListHeader>
                        <IonItem>
                            <IonLabel className='font-review'>Open Sonding / Dip: {openingSonding !== undefined ? openingSonding : "Loading..."} Cm</IonLabel>
                        </IonItem>
                        <IonItem>
                            <IonLabel className='font-review'>Receive : {receive}</IonLabel>
                        </IonItem>
                        <IonItem>
                            <IonLabel className='font-review'>Stock On Hand : {stock}</IonLabel>
                        </IonItem>
                        <IonItem>
                            <IonLabel className='font-review'>Issued : {qtyIssued}</IonLabel>
                        </IonItem>
                        <IonItem>
                            <IonLabel className='font-review'>Balance : {stock}</IonLabel>
                        </IonItem>
                        <IonItem>
                            <IonLabel className='font-review'>Closing Sonding / Dip : {closeSonding}</IonLabel>
                        </IonItem>
                        <IonItem>
                            <IonLabel className='font-review'>Start Meter : {flowMeterStart}</IonLabel>
                        </IonItem>
                        <IonItem>
                            <IonLabel className='font-review'>Total Meter : {totalFlowMeter}</IonLabel>
                        </IonItem>
                        <IonItem>
                            <IonLabel className='font-review'>Daily Variance :</IonLabel>
                        </IonItem>
                    </IonList>
                    <div style={{ marginTop: "20px", float: "inline-end" }}>
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
