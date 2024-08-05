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
    IonSelect,
    IonInput,
    IonRadioGroup,
    IonRadio,
    IonItem,
    IonButton,
    IonIcon,
    IonCard,
    IonLabel,
    IonItemDivider,
    IonImg,
    useIonRouter,
    IonSelectOption,
} from '@ionic/react';
import { cameraOutline, pencilOutline, closeCircleOutline, saveOutline } from 'ionicons/icons';
import SignatureModal from '../../components/SignatureModal';

interface Typetrx {
    id: number;
    name: string;
}

const typeTrx: Typetrx[] = [
    { id: 1, name: 'Issued' },
    { id: 2, name: 'Transfer' },
    { id: 3, name: 'Receive' },
    { id: 4, name: 'Receive KPC ' },
];

const compareWith = (o1: Typetrx, o2: Typetrx) => o1.id === o2.id;

const FormTRX: React.FC = () => {
    const [selectedType, setSelectedType] = useState<Typetrx | undefined>(undefined);
    const [selectedUnit, setSelectedUnit] = useState<string | undefined>(undefined);
    const [photo, setPhoto] = useState<File | null>(null);
    const [signature, setSignature] = useState<File | null>(null);
    const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
    const [koutaLimit, setKoutaLimit] = useState<number | undefined>(undefined);
    const [showError, setShowError] = useState<boolean>(false);

    const route = useIonRouter();

    const handleRadioChange = (event: CustomEvent) => {
        const selectedValue = event.detail.value as Typetrx;
        setSelectedType(selectedValue);
        console.log('Selected type:', JSON.stringify(selectedValue));
    };

    const handleUnitChange = (event: CustomEvent) => {
        const unitValue = event.detail.value;
        setSelectedUnit(unitValue);

        // Set koutaLimit based on selected unit
        if (unitValue === 'lv9944') {
            setKoutaLimit(0); // Example limit for 'lv9944'
        } else {
            setKoutaLimit(20); // Example limit for other units
        }

        // Show error if koutaLimit is less than 100
        setShowError(unitValue === 'lv9944' && koutaLimit !== undefined && koutaLimit < 100);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, setFile: (file: File | null) => void) => {
        const file = event.target.files ? event.target.files[0] : null;
        if (file) {
            setFile(file);
        }
    };

    const handleClose = () => {
        route.push('/dashboard');
    };

    const handleSignatureConfirm = (signature: string) => {
        console.log('Signature:', signature);
        // Handle the signature data here
    };

    const quotaMessage = selectedUnit === 'lv9944' ? 'SISA KOUTA 0 L : LV-2335' : 'SISA KOUTA 20 L : LV-5898';
    const quotaStyle = selectedUnit === 'lv9944' ? { color: 'red' } : {};

    return (
        <IonPage>
            <IonHeader translucent={true} className="ion-no-border">
                <IonToolbar className="custom-header">
                    <IonTitle>Form Tambah Issued / Transfer / Receipt & Receipt KPC</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent>
                <div style={{ marginTop: "20px" }}>
                    <IonRow>
                        <IonCol>
                            {/* Main Item Divider */}
                            <IonItemDivider style={{ border: "solid", color: "#8AAD43", width: "400px" }}>
                                <IonLabel style={{ display: "flex" }}>
                                    <IonImg style={{ width: "40px" }} src="Glyph.png" alt="Logo DH" />
                                    <IonTitle style={quotaStyle}>
                                        {quotaMessage}
                                    </IonTitle>
                                </IonLabel>
                            </IonItemDivider>
                        </IonCol>
                    </IonRow>
                    <div style={{ marginTop: "30px" }}>
                        <IonGrid>
                            <IonRow>
                                <IonCol>
                                    <IonLabel>Select Unit *</IonLabel>
                                    <IonSelect fill="solid" labelPlacement="floating" onIonChange={handleUnitChange}>
                                        <IonSelectOption value="dt">DT1234</IonSelectOption>
                                        <IonSelectOption value="ft">FT3560</IonSelectOption>
                                        <IonSelectOption value="lv9944">LV2235</IonSelectOption>
                                    </IonSelect>
                                </IonCol>
                                <IonCol>
                                    <IonLabel>Model *</IonLabel>
                                    <IonInput className="custom-input" type="text" placeholder="Input Model" disabled={true}></IonInput>
                                </IonCol>
                            </IonRow>
                            <IonRow>
                                <IonLabel>Owner *</IonLabel>
                                <IonInput className="custom-input" type="text" placeholder="Input Owner" disabled={true}></IonInput>
                                <IonCol></IonCol>
                            </IonRow>
                            <IonRadioGroup
                                className="radio-display"
                                value={selectedType}
                                onIonChange={handleRadioChange}
                                compareWith={compareWith}
                            >
                                {typeTrx.map((type) => (
                                    <IonItem key={type.id} className="item-no-border">
                                        <IonRadio value={type}>{type.name}</IonRadio>
                                    </IonItem>
                                ))}
                            </IonRadioGroup>
                            <IonRow>
                                <IonCol>
                                    <IonLabel>HM/KM Transaksi *</IonLabel>
                                    <IonInput className="custom-input" type="number" placeholder="Input HM awal"></IonInput>
                                </IonCol>
                                <IonCol>
                                    <IonLabel>HM/KM Unit *</IonLabel>
                                    <IonInput className="custom-input" type="number" placeholder="Input HM awal"></IonInput>
                                </IonCol>
                            </IonRow>
                            <div style={{marginLeft:"15px"}}>
                            {showError && koutaLimit !== undefined && koutaLimit < 100 && (
                                <div style={{ color: "red" }}>
                                    <div>* Kouta pengisian budget sudah melebihi 20 L / Hari</div> 
                                    <div>* Hm/Km tidak boleh kurang dari Hm/Km sebelumnya : 10290</div>
                                    <div>* Unit tersebut sudah melakukan pengisian sebanyak 20 L dari batas maksimal 20 L. Silahkan hubungi admin jika ingin melakukan pengisian </div>
                                    </div>
                            )}
                            </div>
                           
                            
                            <IonRow>
                                <IonCol>
                                    <IonLabel>Qty Issued / Receive / Transfer *</IonLabel>
                                    <IonInput className="custom-input" type="number" placeholder="Qty Issued / Receive / Transfer"></IonInput>
                                </IonCol>
                            </IonRow>
                            <IonRow>
                                <IonCol>
                                    <IonLabel>Flow Meter Awal *</IonLabel>
                                    <IonInput className="custom-input" type="number" placeholder="Input Flow meter awal"></IonInput>
                                </IonCol>
                                <IonCol>
                                    <IonLabel>Flow Meter Awal *</IonLabel>
                                    <IonInput
                                        style={{
                                            '--border-color': 'transparent',
                                            '--highlight-color': 'transparent',
                                        }}
                                        labelPlacement="stacked"
                                        value="90"
                                        placeholder=""
                                        disabled={true}
                                    ></IonInput>
                                </IonCol>
                            </IonRow>
                            <IonRow>
                                <IonCol>
                                    <IonLabel>Employee ID *</IonLabel>
                                    <IonSelect fill="solid" labelPlacement="floating">
                                        <IonSelectOption value="jde">120022</IonSelectOption>
                                    </IonSelect>
                                </IonCol>
                                <IonCol>
                                    <IonLabel>Nama Driver *</IonLabel>
                                    <IonInput className="custom-input" type="number" placeholder="Input Flow meter awal" disabled={true}></IonInput>
                                </IonCol>
                            </IonRow>
                            <IonRow>
                                <IonCol>
                                    <IonLabel>Mulai Isi *</IonLabel>
                                    <IonInput className="custom-input" type="time"></IonInput>
                                </IonCol>
                                <IonCol>
                                    <IonLabel>Selesai Isi *</IonLabel>
                                    <IonInput className="custom-input" type="time"></IonInput>
                                </IonCol>
                            </IonRow>
                            <IonRow>
                                <IonCol>
                                    <IonCard style={{ height: "60px" }}>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            id="photoInput"
                                            style={{ display: 'none' }}
                                            onChange={(e) => handleFileChange(e, setPhoto)}
                                        />
                                        <IonButton size='small' onClick={() => document.getElementById('photoInput')?.click()}>
                                            <IonIcon slot="start" icon={cameraOutline} />
                                            Ambil Foto *
                                        </IonButton>
                                    </IonCard>
                                </IonCol>
                                <IonCol>
                                    <IonCard style={{ height: "60px" }}>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            id="signatureInput"
                                            style={{ display: 'none' }}
                                            onChange={(e) => handleFileChange(e, setSignature)}
                                        />
                                        <IonButton color="warning" size='small' onClick={() => setIsSignatureModalOpen(true)}>
                                            <IonIcon slot="start" icon={pencilOutline} />
                                            Tanda Tangan *
                                        </IonButton>
                                    </IonCard>
                                </IonCol>
                            </IonRow>
                            <div style={{ marginTop: "60px", float: "inline-end" }}>
                                <IonButton onClick={handleClose} color="light">
                                    <IonIcon slot="start" icon={closeCircleOutline} />Tutup Form
                                </IonButton>
                                <IonButton className="check-button">
                                    <IonIcon slot="start" icon={saveOutline} />Simpan Data Ke Draft
                                </IonButton>
                            </div>
                        </IonGrid>
                    </div>
                </div>
                {/* Signature Modal */}
                <SignatureModal
                    isOpen={isSignatureModalOpen}
                    onClose={() => setIsSignatureModalOpen(false)}
                    onConfirm={handleSignatureConfirm}
                />
            </IonContent>
        </IonPage>
    );
};

export default FormTRX;
