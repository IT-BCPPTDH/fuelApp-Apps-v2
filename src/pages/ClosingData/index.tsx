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
// import Cookies from 'js-cookie';
import { ResponseError, updateData } from '../../hooks/serviceApi'; 
import { DataLkf } from '../../models/db';
import { getLatestLkfId, getLatestLkfIdHm } from '../../utils/getData';
import { updateDataInDB } from '../../utils/update';
import SignatureModal from '../../components/SignatureModal';
import { getAllSonding } from '../../hooks/getAllSonding';
import { getStation } from "../../hooks/useStation";


const FormClosing: React.FC = () => {
    const route = useIonRouter();
    const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
    const [signatureBase64, setSignatureBase64] = useState<string | undefined>(undefined);
    const [latestLkfId, setLatestLkfId] = useState<string | undefined>(undefined);
    const [sondingMasterData, setSondingMasterData] = useState<any[]>([]);
    const [closingSonding, setClosingSonding] = useState<number | undefined>(undefined);
    const [station, setStation] = useState<string | undefined>(undefined);
    const [closingDip, setClosingDip] = useState<number | undefined>(undefined);
    const [variance, setVariance] = useState<number | undefined>(undefined);
    const [showError, setShowError] = useState<boolean>(false);
    const [stationOptions, setStationOptions] = useState<string[]>([]);
    const [dataUserLog, setDataUserLog] = useState<any | undefined>(undefined);
    const [flowMeterEnd, setFlowMeterEnd] = useState<number>(0);
    const [hmEnd, setHmEnd] = useState<number>(0);
    const [stockOnHand, setStockOnHand] = useState<number>(0);
    const [openingDip, setOpeningDip] = useState<number>(0);

    
    const [note, setNote] = useState<string>('');
    const [receiptKPC, setReceiptKPC] = useState<number>(0); // Assuming you have this value
    const [receipt, setReceipt] = useState<number>(0); // Assuming you have this value
    const [issued, setIssued] = useState<number>(0); // Assuming you have this value
    const [transfer, setTransfer] = useState<number>(0); // Assuming you have this value
   
    const [latestLkfIdhm, setLatestLkfIdHm] = useState<number | undefined>(undefined);
    const [prevHmAkhir, setPrevHmAkhir] = useState<number | undefined>(undefined);

    const [jde, setjde] = useState<string>('');

    // const [variant, setVariant] = useState<number>(0);
    // const [closeData, setClo] = useState<number>(0);

    useEffect(() => {
        const fetchLatestLkfId = async () => {
            const id = await getLatestLkfId();
            const id2= await getLatestLkfIdHm()
            setLatestLkfId(id);
            setLatestLkfIdHm(id2);

            // console.log('data',id2)
            // Retrieve shift data from localStorage
            const shiftData = localStorage.getItem("shiftData");
            if (shiftData) {
                const parsedData = JSON.parse(shiftData);
                setFlowMeterEnd(parsedData.flowMeterEnd || 0);
                setStockOnHand(parsedData.stockOnHand || 0);
                setReceiptKPC(parsedData.receiptKPC || 0); // Update as needed
                setReceipt(parsedData.receipt || 0); // Update as needed
                setIssued(parsedData.issued || 0); // Update as needed
                setTransfer(parsedData.transfer || 0);
                setOpeningDip(parsedData.openingDip| 0);
                setHmEnd(parsedData.hmEnd || 0);
               
                 // Update as needed
            }

            const userData = localStorage.getItem("loginData");
            if (userData) {
                const parsedData = JSON.parse(userData);
                setDataUserLog(parsedData);
                setStation(parsedData.station);
                setjde(parsedData.jde);
            }
        };
        fetchLatestLkfId();
    }, []);

    useEffect(() => {
        const fetchStationOptions = async () => {
            if (dataUserLog) {
                try {
                    const response = await getStation(dataUserLog.station);
                    if (response.status === '200' && Array.isArray(response.data)) {
                        setStationOptions(response.data.map((station: { name: any; }) => station.name));
                    } else {
                        console.error('Unexpected data format');
                    }
                } catch (error) {
                    console.error('Failed to fetch station options', error);
                }
            }
        };
        fetchStationOptions();
    }, [dataUserLog]);

    useEffect(() => {
        const updateClosingDip = async () => {
            if (closingSonding !== undefined && station !== undefined) {
                try {
                    const matchingData = sondingMasterData.find(
                        (item) => item.station === station && item.cm === closingSonding
                    );

                    if (matchingData) {
                        console.log('Matching data found:', matchingData);
                        setClosingDip(matchingData.liters);
                    } else {
                        setClosingDip(undefined); // Reset if no match is found
                    }
                } catch (error) {
                    console.error('Failed to update closing dip', error);
                }
            }
        };

        updateClosingDip();
    }, [closingSonding, station, sondingMasterData]);

    useEffect(() => {
        const fetchSondingMasterData = async () => {
            try {
                const response = await getAllSonding();
                if (response.status === '200' && Array.isArray(response.data)) {
                    console.log('Sonding Master Data:', response.data);
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
        // Calculate variance whenever closingDip or stockOnHand changes
        if (closingDip !== undefined && openingDip !== undefined) {
            setVariance(closingDip - openingDip);
        }
    }, [closingDip, openingDip]);

    // Calculate Close Data
    const calculateCloseData = () => {
        return (openingDip + receiptKPC + receipt - issued - transfer);
        
    };

    const handleSignatureConfirm = (newSignature: string) => {
        setSignatureBase64(newSignature);
        console.log('Updated Signature:', newSignature);
    };



    const handleSubmit = async () => {
        const closeData = calculateCloseData();
        const UpdateData: DataLkf = {
            date: new Date().toISOString().split('T')[0],
            shift: '', // Adjust as needed
            hm_start: 0, // Adjust as needed
            site: '', // Adjust as needed
            jde: '', // Adjust as needed
            fuelman_id:jde,
            station: '', // Adjust as needed
            flow_meter_start: 0, // Adjust as needed
            hm_end: hmEnd,
            note: note,
            signature: signatureBase64 || '', // Use base64 string
            name: '', // Adjust as needed
            issued: issued,
            receipt: receipt,
            stockOnHand: stockOnHand,
            lkf_id: latestLkfId || '',
            opening_dip: 0,
            opening_sonding: 0,
            flow_meter_end: flowMeterEnd,
            closing_sonding: closingSonding || 0,
            closing_dip: closingDip || 0,
            close_data: closeData,
            variance: variance || 0, 
           
        };

        try {
            const response = await updateData(UpdateData);
            if (response.oke && (response.status === 200 || response.status === 201)) {
                console.log('Updated successfully via API.');
                await updateDataInDB(UpdateData);
                console.log("Data successfully updated in IndexedDB.");
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
                console.error('An unexpected error occurred:', {
                    error
                });
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
        setLatestLkfIdHm(Number(e.detail.value));
    };

    const handleStockOnHandChange = (e: CustomEvent) => {
        setStockOnHand(Number(e.detail.value));
    };

    const handleBack = () =>{
        route.push('/dashboard')
    }
    // Determine text color based on variance value
    const varianceColor = variance !== undefined && variance < 0 ? 'red' : 'black';

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
                                    <IonInput
                                        className="custom-input"
                                        type="number"
                                        name="closingSonding"
                                        value={closingSonding}
                                        onIonChange={handleClosingSondingChange}
                                        placeholder="Input Close Sonding (Cm)"
                                    />
                                </IonCol>
                                <IonCol>
                                    <IonLabel>Close Dip (Liters) *</IonLabel>
                                    <IonInput
                                        style={{background:"#cfcfcf"}}
                                        className="custom-input"
                                        type="number"
                                        name="closingDip"
                                        value={closingDip || 0} // Default to 0 if undefined
                                        disabled
                                        placeholder="Input Close Dip (Liters)"
                                    />
                                </IonCol>
                            </IonRow>
                            <IonRow>
                                <IonCol>
                                    <IonLabel >HM KM Akhir *</IonLabel>
                                    <IonInput
                                        className="custom-input"
                                        type="number"
                                        // value={latestLkfIdhm}
                                        onIonChange={handleHmEndChange}
                                        placeholder="HM KM Akhir"
                                        onIonInput={(e) => {
                                            const value = Number(e.detail.value);
                                            setHmEnd(value);
                                            if (prevHmAkhir !== undefined && value < prevHmAkhir) {
                                              setShowError(true);
                                            } else {
                                              setShowError(false);
                                            }
                                          }}
                                    />
                                       {showError && (
                                    <p style={{ color: "red" }}>
                                        {latestLkfIdhm=== undefined
                                        ? '* Field harus diisi'
                                        : (prevHmAkhir !== undefined && latestLkfIdhm < prevHmAkhir)
                                        ? '* Flow Meter Awal tidak boleh kurang dari nilai sebelumnya'
                                        : ''
                                        }
                                    </p>
                                    )}
          
                                </IonCol>
                                <IonCol>
                                    <IonLabel>Close Data *</IonLabel>
                                    <IonInput
                                        style={{background:"#cfcfcf"}}
                                        className="custom-input"
                                        type="number"
                                        value={calculateCloseData()} // Automatically calculate Close Data
                                        disabled
                                        placeholder="Input Close Data"
                                    />
                                </IonCol>
                                <IonCol>
                                    <IonInput
                                        style={{
                                            '--border-color': 'transparent',
                                            '--highlight-color': 'transparent',
                                            color: varianceColor // Apply conditional color
                                        }}
                                        fill="outline"
                                        label="Variance (Closing Dip - Closing Balance)"
                                        labelPlacement="stacked"
                                        value={variance !== undefined ? variance : ''} // Display variance
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
                                <IonButton onClick={handleBack}  color="light">
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
