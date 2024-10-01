import React, { useState, useEffect } from 'react';
import {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonGrid,
    IonRow,
    IonCol,
    IonInput,
    IonButton,
    IonIcon,
    IonItem,
    IonTextarea,
    IonLabel,
    useIonRouter,
} from '@ionic/react';
import { pencilOutline, closeCircleOutline, saveOutline } from 'ionicons/icons';
import "./style.css";
import Cookies from 'js-cookie';
import { ResponseError, updateData } from '../../hooks/serviceApi'; 
import { DataLkf } from '../../models/db';
import { getLatestLkfId } from '../../utils/getData';
import { updateDataInDB } from '../../utils/update';
import SignatureModal from '../../components/SignatureModal';
import { getAllSonding } from '../../hooks/getAllSonding';
import { getStation } from "../../hooks/useStation";
import { updateDataToDB } from '../../utils/insertData';
import { fetchSondingData, getDataFromStorage } from '../../services/dataService';

const FormClosing: React.FC = () => {
    const route = useIonRouter();
    const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
    const [signatureBase64, setSignatureBase64] = useState<string | undefined>(undefined);
    const [latestLkfId, setLatestLkfId] = useState<string | undefined>(undefined);

    const [closingSonding, setClosingSonding] = useState<number | undefined>(undefined);
    const [station, setStation] = useState<string | undefined>(undefined);
    const [closingDip, setClosingDip] = useState<number | undefined>(undefined);
    const [variant, setVariance] = useState<number | undefined>(undefined);
    const [showError, setShowError] = useState<boolean>(false);
    const [dataUserLog, setDataUserLog] = useState<any | undefined>(undefined);
    const [flowMeterEnd, setFlowMeterEnd] = useState<number>(0);
    const [hmEnd, setHmEnd] = useState<number>(0);
    const [stockOnHand, setStockOnHand] = useState<number>(0);
    
    const [note, setNote] = useState<string>('');
    const [receiptKPC, setReceiptKPC] = useState<number>(0);
    const [receipt, setReceipt] = useState<number>(0);
    const [issued, setIssued] = useState<number>(0);
    const [transfer, setTransfer] = useState<number>(0);
    const [sondingData, setSondingData]  =  useState<{ id: string; station: string; cm: number; listers: number }[]>([]);
    const [openingDip, setOpeningDip] = useState<number | undefined>(undefined);
    const [openingSonding, setOpeningSonding] = useState<number | undefined>(undefined);
    const [sondingMasterData, setSondingMasterData] = useState<any[]>([]);
    
    useEffect(() => {
        const fetchLatestLkfId = async () => {
            const id = await getLatestLkfId();
            setLatestLkfId(id);

            const shiftData = localStorage.getItem("shiftData");
            if (shiftData) {
                const parsedData = JSON.parse(shiftData);
                setFlowMeterEnd(parsedData.flowMeterEnd || 0);
                setStockOnHand(parsedData.stockOnHand || 0);
                setReceiptKPC(parsedData.receiptKPC || 0);
                setReceipt(parsedData.receipt || 0);
                setIssued(parsedData.issued || 0);
                setTransfer(parsedData.transfer || 0);
                setOpeningDip(parsedData.openingDip || 0);
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

    useEffect(() => {
        const fetchSondingMasterData = async () => {
            try {
                const response = await getAllSonding();
                if (response.status === '200' && Array.isArray(response.data)) {
                    setSondingMasterData(response.data);
                } else {
                    console.error('Unexpected data format');
                }
            } catch (error) {
                console.error('Failed to fetch sonding master data', error);
            }
        };

        fetchSondingMasterData();
    }, []);

    useEffect(() => {
        const updateClosingDip = () => {
            if (closingSonding !== undefined && station !== undefined && sondingMasterData.length > 0) {
                const matchingData = sondingMasterData.find(
                    (item) => item.station === station && item.cm === closingSonding
                );

                if (matchingData) {
                    setOpeningDip(matchingData.liters);
                } else {
                    setOpeningSonding(undefined);
                }
            }
        };

        updateClosingDip();
    }, [closingSonding, station, sondingMasterData]);

    useEffect(() => {
        if (closingDip !== undefined && stockOnHand !== undefined) {
            setVariance(closingDip - stockOnHand);
        }
    }, [closingDip, stockOnHand]);

    const calculateCloseData = () => {
        return (stockOnHand + receiptKPC + receipt - issued - transfer);
    };

    const handleSignatureConfirm = (newSignature: string) => {
        setSignatureBase64(newSignature);
    };

    const handleSubmit = async () => {
        const UpdateData: DataLkf = {
            date: new Date().toISOString().split('T')[0],
            shift: '',
            hm_start: 0,
            site: '',
            jde: '',
            fuelman_id: Cookies.get('fuelman_id') || '',
            station: station || '',
            flow_meter_start: 0,
            hm_end: hmEnd,
            note: note,
            signature: signatureBase64 || '',
            name: '',
            issued: issued,
            receipt: receipt,
            stockOnHand: stockOnHand,
            lkf_id: latestLkfId || '',
            opening_dip: openingDip || 0,
            opening_sonding: 0,
            flow_meter_end: flowMeterEnd,
            closing_sonding: closingSonding || 0,
            closing_dip: closingDip || 0,
            close_data: calculateCloseData(),
            variant: variant|| 0,
        };

        try {
            const response = await updateData(UpdateData);
            if (response.oke && (response.status === 200 || response.status === 201)) {
                await updateDataToDB(UpdateData);
                route.push('/review-data');
            } else {
                localStorage.setItem('latestLkfData', JSON.stringify(UpdateData));
                route.push('/review-data');
                setShowError(true);
            }
        } catch (error) {
            if (error instanceof ResponseError) {
                console.error('Update Data Error:', {
                    message: error.message,
                    status: error.response.status,
                    statusText: error.response.statusText,
                    responseData: error.errorData
                });
            } else {
                console.error('An unexpected error occurred:', { error });
            }
            setShowError(true);
        }
    };

    const handleClosingSondingChange = (e: CustomEvent) => {
        const value = Number(e.detail.value);
        console.log('Handle Closing Sonding Change:', value);
        setClosingSonding(value);
    };

    const handleHmEndChange = (e: CustomEvent) => {
        setHmEnd(Number(e.detail.value));
    };

    const handleStockOnHandChange = (e: CustomEvent) => {
        setStockOnHand(Number(e.detail.value));
    };

    const varianceColor = variant !== undefined && variant < 0 ? 'red' : 'black';

     // Load Sonding Data
     useEffect(() => {
        const loadSondingData = async () => {
            const cachedSondingData = await getDataFromStorage('allSonding');
            console.log("Cached Sonding Data:", cachedSondingData);
        
            if (cachedSondingData) {
                setSondingData(cachedSondingData);
                setSondingMasterData(cachedSondingData); // Ensure this is set here
            } else {
                const Sonding = await fetchSondingData();
                console.log("Fetched Sonding Data:", Sonding);
                setSondingData(Sonding);
                setSondingMasterData(Sonding); // Also set here
            }
        };
    
        loadSondingData();
    }, []);
    

    useEffect(() => {
        const fetchLoginData = async () => {
            const storedLoginData = await getDataFromStorage('loginData'); 
            const station = storedLoginData?.station; 
    
            if (closingSonding !== undefined && sondingMasterData.length > 0) {
                console.log('Closing Sonding:', closingSonding);
                
                // Filter the sondingMasterData based on the station
                const filteredData = sondingMasterData.filter(item => item.station === station);
                
                // Find the matching data in the filtered dataset
                const matchingData = filteredData.find(item => item.cm === closingSonding);
                
                if (matchingData) {
                    console.log('Matching Data Found:', matchingData);
                    setClosingDip(matchingData.liters);
                } else {
                    console.log('No Matching Data Found');
                    setClosingDip(undefined);
                }
            }
        };
    
        fetchLoginData(); // Call the function to fetch login data
    }, [closingSonding, sondingMasterData]);
    

    return (
        <IonPage>
            <IonHeader translucent={true} className="ion-no-border">
                <IonToolbar className="custom-header">
                    <IonTitle>Form Data Closing Stock (Dip) & Sonding</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent>
                <div style={{ marginTop: "20px" }}>
                    <div style={{ marginTop: "30px" }}>
                        <IonGrid>
                            <IonRow>
                                <IonCol>
                                    <IonLabel>Flow Meter Akhir *</IonLabel>
                                    <IonInput 
                                        className="custom-input"
                                        type="number"
                                        name="flowMeterEnd"
                                        value={flowMeterEnd}
                                        onIonChange={(e) => setFlowMeterEnd(Number(e.detail.value))}
                                        placeholder="Input Flow Meter"
                                    />
                                </IonCol>
                                <IonCol>
                                    <IonLabel>Close Sonding (Cm) *</IonLabel>
                                    <IonInput type="number" onIonChange={handleClosingSondingChange} value={closingSonding}></IonInput>
                                </IonCol>
                                <IonCol>
                                    <IonLabel>Close Dip (Liters) *</IonLabel>
                                    <IonInput
                                        style={{background:"#cfcfcf"}}
                                        className="custom-input"
                                        type="number"
                                      
                                        
                                        name="closingDip"
                                        value={closingDip || 0}// Default to 0 if undefined
                                        disabled
                                        placeholder="Input Close Dip (Liters)"
                                    />

                                </IonCol>
                            </IonRow>
                            <IonRow>
                                <IonCol>
                                    <IonLabel>HM KM Akhir *</IonLabel>
                                    <IonInput
                                        className="custom-input"
                                        type="number"
                                        value={hmEnd}
                                        onIonChange={handleHmEndChange}
                                        placeholder="HM KM Akhir"
                                    />
                                </IonCol>
                                <IonCol>
                                    <IonLabel>Close Data *</IonLabel>
                                    <IonInput
                                        style={{background:"#cfcfcf"}}
                                        className="custom-input"
                                        type="number"
                                        value={calculateCloseData()}
                                        disabled
                                        placeholder="Input Close Data"
                                    />
                                </IonCol>
                                <IonCol>
                                    <IonInput
                                        style={{
                                            '--border-color': 'transparent',
                                            '--highlight-color': 'transparent',
                                            color: varianceColor
                                        }}
                                        fill="outline"
                                        label="Variance (Closing Dip - Closing Balance)"
                                        labelPlacement="stacked"
                                        value={variant !== undefined ? variant : ''}
                                        placeholder=""
                                        disabled={true}
                                    />
                                </IonCol>
                            </IonRow>
                            <IonTitle style={{ color: "red", fontSize: "12px" }}>
                                * Angka closing dip otomatis tampil sesuai rumus kalibrasi sonding untuk FS/FT yang belum di kalibrasi, silahkan masukan secara manual
                            </IonTitle>

                            <IonItem>
                                <IonTextarea
                                    name="note"
                                    label="Catatan *"
                                    labelPlacement="stacked"
                                    placeholder="Enter text"
                                    value={note}
                                    onIonChange={(e) => setNote(e.detail.value as string)}
                                />
                            </IonItem>
                            <IonItem>
                                <IonButton
                                    expand="full"
                                    color="primary"
                                    onClick={() => setIsSignatureModalOpen(true)}
                                >
                                    <IonIcon slot="start" icon={pencilOutline} />
                                    Tanda Tangan Fuelman
                                </IonButton>
                            </IonItem>
                            <div style={{ marginTop: "20px", float: "inline-end" }}>
                                <IonButton color="light">
                                    <IonIcon slot="start" icon={closeCircleOutline} />Tutup Form
                                </IonButton>
                                <IonButton onClick={handleSubmit} className="check-close">
                                    <IonIcon slot="start" icon={saveOutline} />Close Shift & Logout
                                </IonButton>
                            </div>
                        </IonGrid>
                    </div>
                </div>
                <SignatureModal
                    isOpen={isSignatureModalOpen}
                    onClose={() => setIsSignatureModalOpen(false)}
                    onConfirm={handleSignatureConfirm}
                />
            </IonContent>
        </IonPage>
    );
};

export default FormClosing;
