import React, { useState } from 'react';
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
import { documentLockOutline } from 'ionicons/icons';
import Cookies from 'js-cookie';

interface Typetrx {
    id: number;
    name: string;
}

const FormClosing: React.FC = () => {
    const [selectedType, setSelectedType] = useState<Typetrx | undefined>(undefined);
    const [startTime, setStartTime] = useState<string | undefined>(undefined);
    const [endTime, setEndTime] = useState<string | undefined>(undefined);
    const [photo, setPhoto] = useState<File | null>(null);
    const [signature, setSignature] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const route = useIonRouter();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, setFile: (file: File | null) => void) => {
        const file = event.target.files ? event.target.files[0] : null;
        if (file) {
            setFile(file);
        }
    };

    const handleClick = () => {
        route.push('/review-data');
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
                                    <IonInput className="custom-input"
                                        type="number"
                                        placeholder="Input Flow Meter"
                                    ></IonInput>
                                </IonCol>
                                <IonCol>
                                    <IonLabel>Close Sonding ( Cm ) *</IonLabel>
                                    <IonInput className="custom-input"
                                        type="number"
                                        placeholder="Input Close Sonding ( Cm )"

                                    ></IonInput>
                                </IonCol>
                                <IonCol>
                                    <IonLabel>Close Dip ( Liters ) *</IonLabel>
                                    <IonInput className="custom-input"
                                        type="number"
                                        placeholder="Input Close Dip ( Liters )"
                                    ></IonInput>
                                </IonCol>
                            </IonRow>
                            <IonRow>
                                <IonCol>
                                    <IonLabel>HM KM Akhir *</IonLabel>
                                    <IonInput className="custom-input"
                                        type="number"
                                        placeholder="HM KM Akhir"
                                    ></IonInput>
                                </IonCol>
                                <IonCol>
                                    <IonLabel>Close Data *</IonLabel>
                                    <IonInput className="custom-input"
                                        type="number"
                                        placeholder="Input Close Dip ( Liters )"
                                    ></IonInput>
                                </IonCol>
                                <IonCol>
                                    <IonInput
                                        style={{
                                            '--border-color': 'transparent',
                                            '--highlight-color': 'transparent',
                                        }}
                                        fill="outline"
                                        label="Variance ( Closing Dip - Closing Balance *"
                                        labelPlacement="stacked"
                                        value="100"
                                        placeholder=""
                                        disabled={true}
                                    ></IonInput>
                                </IonCol>
                            </IonRow>
                            <IonTitle style={{ color: "red", fontSize: "12px" }}>
                                *  Angka closing dip otomatis tampil sesuai rumus kalibrasi sonding untuk FS/FT yang belum di kalibrasi, silahkan masukan secara manual
                            </IonTitle>

                            <IonItem>
                                <IonTextarea label="Catatan *" labelPlacement="stacked" placeholder="Enter text"></IonTextarea>
                            </IonItem>
                            <IonItem>
                                <input
                                    type="file"
                                    accept="image/*"
                                    id="signatureInput"
                                    style={{ display: 'none' }}
                                    onChange={(e) => handleFileChange(e, setSignature)}
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
                                <IonButton onClick={handleClick} className="check-close">
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
