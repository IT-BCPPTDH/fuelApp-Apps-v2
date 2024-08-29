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
    useIonRouter,
    IonTextarea,
    IonLabel,
} from '@ionic/react';
import { pencilOutline, closeCircleOutline, saveOutline } from 'ionicons/icons';
import "./style.css";
import Cookies from 'js-cookie';
import { ResponseError, updateData } from '../../hooks/serviceApi'; 
import { DataLkf } from '../../models/db';
import { getLatestLkfId } from '../../utils/getData'; // Make sure this path is correct

interface FormValues {
    flowMeterEnd: number;
    closingSonding: number;
    closingDip: number;
    hmEnd: number;
    closingData: number;
    note: string;
    signature: File | null;
}

const FormClosing: React.FC = () => {
    const route = useIonRouter();

    const [formValues, setFormValues] = useState<FormValues>({
        flowMeterEnd: 0,
        closingSonding: 0,
        closingDip: 0,
        hmEnd: 0,
        closingData: 0,
        note: '',
        signature: null
    });
    
    const [latestLkfId, setLatestLkfId] = useState<string | undefined>(undefined);

    useEffect(() => {
        const fetchLatestLkfId = async () => {
            const id = await getLatestLkfId();
            setLatestLkfId(id);
        };
        
        fetchLatestLkfId();
    }, []);

    const handleInputChange = (e: CustomEvent) => {
        const target = e.target as HTMLIonInputElement;
        const name = target.name;
        const value = target.value;
        
        if (name) {
            setFormValues(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleTextareaChange = (e: CustomEvent) => {
        const target = e.target as HTMLIonTextareaElement;
        const name = target.name;
        const value = target.value;
        
        if (name) {
            setFormValues(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async () => {
        const UpdateData: DataLkf = {
            date: new Date().toISOString().split('T')[0],
            shift: '', // Sesuaikan jika ada
            hm_start: 0, // Sesuaikan jika ada
            site: '', // Sesuaikan jika ada
            jde: '', // Sesuaikan jika ada
            fuelman_id: Cookies.get('fuelman_id') || '',
            station: '', // Sesuaikan jika ada
            opening_dip: 0, // Sesuaikan jika ada
            opening_sonding: 0, // Sesuaikan jika ada
            flow_meter_start: 0, // Sesuaikan jika ada
            hm_end: formValues.hmEnd,
            closing_dip: formValues.closingDip,
            closing_sonding: formValues.closingSonding,
            flow_meter_end: formValues.flowMeterEnd,
            note: formValues.note,
            signature: formValues.signature?.name || '',
            name: '',
            issued: undefined,
            receipt: undefined,
            stockOnHand: 0,
            lkf_id: latestLkfId
        };
    
        try {
            const response = await updateData(UpdateData);
            if (response.status === 'success') {
                route.push('/review-data');
            } else {
                console.error('Update data failed:', response);
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
                    
                });
            }
        }
    };

    return (
        <IonPage>
            <IonHeader translucent={true} className="ion-no-border">
                <IonToolbar className="custom-header">
                    <IonTitle>Form Data Closing Stock ( Dip ) & Sonding</IonTitle>
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
                                        value={formValues.flowMeterEnd}
                                        onIonChange={handleInputChange}
                                        placeholder="Input Flow Meter"
                                    ></IonInput>
                                </IonCol>
                                <IonCol>
                                    <IonLabel>Close Sonding ( Cm ) *</IonLabel>
                                    <IonInput 
                                        className="custom-input"
                                        type="number"
                                        name="closingSonding"
                                        value={formValues.closingSonding}
                                        onIonChange={handleInputChange}
                                        placeholder="Input Close Sonding ( Cm )"
                                    ></IonInput>
                                </IonCol>
                                <IonCol>
                                    <IonLabel>Close Dip ( Liters ) *</IonLabel>
                                    <IonInput 
                                        className="custom-input"
                                        type="number"
                                        name="closingDip"
                                        value={formValues.closingDip}
                                        onIonChange={handleInputChange}
                                        placeholder="Input Close Dip ( Liters )"
                                    ></IonInput>
                                </IonCol>
                            </IonRow>
                            <IonRow>
                                <IonCol>
                                    <IonLabel>HM KM Akhir *</IonLabel>
                                    <IonInput 
                                        className="custom-input"
                                        type="number"
                                        name="hmEnd"
                                        value={formValues.hmEnd}
                                        onIonChange={handleInputChange}
                                        placeholder="HM KM Akhir"
                                    ></IonInput>
                                </IonCol>
                                <IonCol>
                                    <IonLabel>Close Data *</IonLabel>
                                    <IonInput 
                                        className="custom-input"
                                        type="number"
                                        name="closingData"
                                        value={formValues.closingData}
                                        onIonChange={handleInputChange}
                                        placeholder="Input Close Data"
                                    ></IonInput>
                                </IonCol>
                                <IonCol>
                                    <IonInput
                                        style={{
                                            '--border-color': 'transparent',
                                            '--highlight-color': 'transparent',
                                        }}
                                        fill="outline"
                                        label="Variance ( Closing Dip - Closing Balance )"
                                        labelPlacement="stacked"
                                        value="100"
                                        placeholder=""
                                        disabled={true}
                                    ></IonInput>
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
                                    value={formValues.note}
                                    onIonChange={handleTextareaChange}
                                ></IonTextarea>
                            </IonItem>
                            <IonItem>
                                <input
                                    type="file"
                                    accept="image/*"
                                    id="signatureInput"
                                    style={{ display: 'none' }}
                                    // onChange={handleFileChange}
                                />
                                <IonButton
                                    expand="full"
                                    color="primary"
                                    onClick={() => document.getElementById('signatureInput')?.click()}
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
            </IonContent>
        </IonPage>
    );
};

export default FormClosing;
