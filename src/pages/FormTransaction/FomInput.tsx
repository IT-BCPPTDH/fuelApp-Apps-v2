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



interface JdeOption {
    id: string;
    label: string;
    fuelName: string;
}

const typeTrx: Typetrx[] = [
    { id: 1, name: 'Issued' },
    { id: 2, name: 'Transfer' },
    { id: 3, name: 'Receive' },
    { id: 4, name: 'Receive KPC ' },
];

const unitOptions = [
    { id: "1", value: 'DT', label: 'DT1254', modelUnit: 'Dump Truck', owner: "PT.Darma Henwa" },
    { id: "2", value: 'FT', label: 'FT3560', modelUnit: 'Fuel Truck', owner: "PT.Darma Henwa" },
    { id: "3", value: 'LV', label: 'LV2235', modelUnit: 'LV', owner: "PT.Darma Henwa" },
    { id: "4", value: 'HLV', label: 'HLV1234', modelUnit: 'HLV', owner: "PT.Darma Henwa" },
];

const jdeOptions: JdeOption[] = [
    { id: "1", label: 'Tz12343', fuelName: 'Andi Matality' },
    { id: "2", label: '5676674', fuelName: 'Soerya Matality' },
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
    const [model, setModel] = useState<string>('');
    const [owner, setOwner] = useState<string>('');
    const [fullName, setFullName] = useState<string>('');
   
    const route = useIonRouter();

    const handleRadioChange = (event: CustomEvent) => {
        const selectedValue = event.detail.value as Typetrx;
        setSelectedType(selectedValue);
        console.log('Selected type:', JSON.stringify(selectedValue));
    };

    const isFormDisabled = !selectedUnit;

    const handleUnitChange = (event: CustomEvent) => {
        const unitValue = event.detail.value;
        setSelectedUnit(unitValue);

        const selectedUnitOption = unitOptions.find(unit => unit.value === unitValue);
        if (selectedUnitOption) {
            setModel(selectedUnitOption.modelUnit);
            setOwner(selectedUnitOption.owner);
        }

        let newKoutaLimit = 0;
        if (unitValue.startsWith('LV') || unitValue.startsWith('HLV')) {
            newKoutaLimit = 20;
        } else {
            newKoutaLimit = 0; 
        }

        setKoutaLimit(newKoutaLimit);
        setShowError(unitValue.startsWith('LV') || unitValue.startsWith('HLV') && newKoutaLimit < 20);
    };

    const handleChangeEmployeeId = (event: CustomEvent) => {
        const employeeIdValue = event.detail.value;
        const selectedJdeOption = jdeOptions.find(jde => jde.label === employeeIdValue);
        if (selectedJdeOption) {
            setFullName(selectedJdeOption.fuelName);
        } else {
            setFullName(''); 
        }
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

    const quotaMessage = selectedUnit?.startsWith('LV') || selectedUnit?.startsWith('HLV')
        ? `SISA KOUTA ${koutaLimit} L`
        : '';
    const quotaStyle = selectedUnit?.startsWith('LV') || selectedUnit?.startsWith('HLV')
        ? { color: 'green' }
        : {};

    

    return (
        <IonPage>
            <IonHeader translucent={true} className="ion-no-border">
                <IonToolbar className="custom-header">
                    <IonTitle>Form Tambah Issued / Transfer / Receipt & Receipt KPC</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent>
                <div style={{ marginTop: "20px" }}>
                    
                    {(selectedUnit?.startsWith('LV') || selectedUnit?.startsWith('HLV')) && (
                        <IonRow>
                            <IonCol>
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
                    )}
                    <div style={{ marginTop: "30px" }}>
                        <IonGrid>
                            <IonRow>
                                <IonCol>
                                    <IonLabel>Select Unit *</IonLabel>
                                    <IonSelect style={{marginTop:"10px"}}  fill="solid" interface="popover" labelPlacement="floating" onIonChange={handleUnitChange}>
                                        {unitOptions.map((unit) => (
                                            <IonSelectOption key={unit.value} value={unit.value}>
                                                {unit.label}
                                            </IonSelectOption>
                                        ))}
                                    </IonSelect>
                                </IonCol>
                                <IonCol>
                                    <IonLabel>Model *</IonLabel>
                                    <IonInput 
                                        className="custom-input" 
                                        type="text"
                                        name='model'
                                        placeholder="Input Model"
                                        readonly
                                        value={model}
                                        disabled={isFormDisabled}
                                    />
                                </IonCol>
                            </IonRow>
                            <IonRow>
                                <IonCol>
                                    <IonLabel>Owner *</IonLabel>
                                    <IonInput 
                                        className="custom-input" 
                                        type="text"
                                        name='owner'
                                        value={owner}
                                        placeholder="Input Owner" 
                                        readonly
                                        disabled={isFormDisabled}
                                    />
                                </IonCol>
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
                                    <IonInput className="custom-input" type="number" placeholder="Input HM awal" disabled={isFormDisabled}></IonInput>
                                </IonCol>
                                <IonCol>
                                    <IonLabel>HM/KM Unit *</IonLabel>
                                    <IonInput className="custom-input" type="number" placeholder="Input HM awal" disabled={isFormDisabled}></IonInput>
                                </IonCol>
                            </IonRow>
                            <div style={{ marginLeft: "15px" }}>
                                {showError && koutaLimit !== undefined && koutaLimit < 20 && (
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
                                    <IonInput className="custom-input" type="number" placeholder="Qty Issued / Receive / Transfer" disabled={isFormDisabled}></IonInput>
                                </IonCol>
                                <IonCol>
                                    <IonLabel>FBR Historis*</IonLabel>
                                    <IonInput className="custom-input" type="number" readonly placeholder="Input FBR" disabled={isFormDisabled}></IonInput>
                                </IonCol>
                            </IonRow>
                            <IonRow>
                                <IonCol>
                                    <IonLabel>Flow Meter Awal *</IonLabel>
                                    <IonInput className="custom-input" type="number" placeholder="Input Flow meter awal" disabled={isFormDisabled}></IonInput>
                                </IonCol>
                                <IonCol>
                                    <IonLabel>Flow Meter Akhir *</IonLabel>
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
                                    <IonSelect fill="solid" interface="popover" labelPlacement="floating" onIonChange={handleChangeEmployeeId} disabled={isFormDisabled}>
                                        {jdeOptions.map((jde) => (
                                            <IonSelectOption key={jde.label} value={jde.label}>
                                                {jde.label}
                                            </IonSelectOption>
                                        ))}
                                    </IonSelect>
                                </IonCol>
                                <IonCol>
                                    <IonLabel>Nama Driver *</IonLabel>
                                    <IonInput 
                                        className="custom-input"
                                        type="text"
                                        name='jde'
                                        value={fullName}
                                        placeholder="Input Driver Name" 
                                        readonly
                                        disabled={isFormDisabled}
                                    />
                                </IonCol>
                            </IonRow>
                            <IonRow>
                                <IonCol>
                                    <IonLabel>Mulai Isi *</IonLabel>
                                    <IonInput className="custom-input" type="time" disabled={isFormDisabled}></IonInput>
                                </IonCol>
                                <IonCol>
                                    <IonLabel>Selesai Isi *</IonLabel>
                                    <IonInput className="custom-input" type="time" disabled={isFormDisabled}></IonInput>
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
                                        <IonButton size='small' onClick={() => document.getElementById('photoInput')?.click()} disabled={isFormDisabled}>
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
                                        <IonButton color="warning" size='small' onClick={() => setIsSignatureModalOpen(true)} disabled={isFormDisabled}>
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
                                <IonButton className="check-button" disabled={isFormDisabled}>
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
