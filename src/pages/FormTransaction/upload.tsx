import React, { useState, useEffect, Key } from 'react';
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
import { getAllUnit } from '../../hooks/getAllUnit';
import { postTransaksi } from '../../hooks/postTrx';
import { DataFormTrx } from '../../models/db';
import { db } from '../../models/db';
import { DataDashboard } from '../../models/db';
import { addDataDashboard } from '../../utils/insertData';
import { getUser } from '../../hooks/getAllUser';

interface Typetrx {
    id: number;
    name: string;
}

interface JdeOption {
    JDE: Key | null | undefined;
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
    const [unitOptions, setUnitOptions] = useState<{ id: string; unit_no: string; brand: string; owner: string }[]>([]);
    const [quantity, setQuantity] = useState<number | undefined>(undefined);
    const [fbr, setFbr] = useState<number | undefined>(undefined);
    const [flowMeterAwal, setFlowMeterAwal] = useState<number | undefined>(undefined);
    const [flowMeterAkhir, setFlowMeterAkhir] = useState<number | undefined>(undefined);
    const [startTime, setStartTime] = useState<string | undefined>(undefined);
    const [endTime, setEndTime] = useState<string | undefined>(undefined);
    const [lkf_id, setLkfId] = useState<number | undefined>(undefined);
    const [stockData, setStockData] = useState<number | undefined>(undefined);
    const [signatureBase64, setSignatureBase64] = useState<string | undefined>(undefined);
    const [fuelman_id, setFuelmanId] = useState<string>('');
    const [allUsers , setAllUser] = useState<string>('')
    const route = useIonRouter();
    const [employeeId, setEmployeeId] = useState<string>('');
    const [jdeOptions, setJdeOptions] = useState<{ JDE: string; id: string; label: string; fullname: string }[]>([]);

    useEffect(() => {
        
        const storedData = localStorage.getItem('cardDataDashborad');
        if (storedData) {
          try {
            const parsedData = JSON.parse(storedData);
            console.log('Parsed data:', parsedData);

            parsedData.forEach(async (item: DataDashboard) => {
              await addDataDashboard(item);
            });
    
          } catch (error) {
            console.error('Failed to parse stock data from local storage', error);
          }
        } else {
          console.log('No stock data found in local storage');
        }
      }, []);;

      useEffect(() => {
        // Example effect to demonstrate state update
        if (employeeId) {
            // Update related fields
            // e.g., setFuelmanId(employeeId);
        }
    }, [employeeId]);
    
      
    useEffect(() => {
        const fetchUnitOptions = async () => {
            try {
                const response = await getAllUnit();
                if (response.status === '200' && Array.isArray(response.data)) {
                    setUnitOptions(response.data);
                } else {
                    console.error('Unexpected data format');
                }
            } catch (error) {
                console.error('Failed to fetch unit options', error);
            }
        };

        fetchUnitOptions();
    }, []);

    useEffect(() => {
        const fetchJdeOptions = () => {
            const storedJdeOptions = localStorage.getItem('employeeData');
            if (storedJdeOptions) {
                try {
                    const parsedJdeOptions = JSON.parse(storedJdeOptions);
                    setJdeOptions(parsedJdeOptions);
                } catch (error) {
                    console.error('Failed to parse JDE options from local storage', error);
                }
            } else {
                console.log('No JDE options found in local storage');
            }
        };
    
        fetchJdeOptions();
    }, []);
    

    const handleRadioChange = (event: CustomEvent) => {
        const selectedValue = event.detail.value as Typetrx;
        setSelectedType(selectedValue);
        console.log('Selected type:', JSON.stringify(selectedValue));
    };

    const isFormDisabled = !selectedUnit;

    const handleUnitChange = (event: CustomEvent) => {
        const unitValue = event.detail.value;
        setSelectedUnit(unitValue);

        const selectedUnitOption = unitOptions.find(unit => unit.unit_no === unitValue);
        if (selectedUnitOption) {
            setModel(selectedUnitOption.brand);
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
        const selectedValue = event.detail.value as string;
        console.log('Selected Employee ID:', selectedValue);
    
       
        const selectedJdeOption = jdeOptions.find(jde => jde.JDE === selectedValue);
        if (selectedJdeOption) {
            console.log('Selected JDE Option:', selectedJdeOption);
            setFullName(selectedJdeOption.fullname); 
        } else {
            console.log('No matching JDE option found.');
            setFullName(''); 
        }
    };
    
    

    const handleFileChange = (
        event: React.ChangeEvent<HTMLInputElement>,
        setFile: (file: File | null) => void,
        setBase64?: (base64: string | null) => void 
    ) => {
        const file = event.target.files ? event.target.files[0] : null;
        if (file) {
            setFile(file);
            if (setBase64) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64String = reader.result as string;
                    setBase64(base64String.split(',')[1]);
                };
                reader.readAsDataURL(file);
            }
        }
    };
    
    

    const handleClose = () => {
        route.push('/dashboard');
    };
   


    const handlePost = async (e: React.FormEvent) => {
        e.preventDefault();
    
        
        if (!selectedType || !selectedUnit || quantity === undefined || fbr === undefined || flowMeterAwal === undefined || flowMeterAkhir === undefined || !startTime || !endTime) {
            console.error('Form is incomplete');
            return;
        }
    
        
        const storedData = localStorage.getItem('openingtrx');
        let lkf_id: number | undefined = undefined;
        if (storedData) {
            try {
                const parsedData = JSON.parse(storedData);
                lkf_id = parsedData.lkf_id; 
            } catch (error) {
                console.error('Failed to parse lkf_id from local storage', error);
            }
        }
    
        // Generate from_data_id using timestamp
        const fromDataId = Date.now();
    
        // Retrieve signature from local storage if available
        const storedSignature = localStorage.getItem('signature');
        const signatureBase64 = storedSignature || (signature ? await convertToBase64(signature) : null);
    
        // Prepare data for posting
        const dataPost: DataFormTrx = {
            from_data_id: fromDataId,
            unit_no: selectedUnit,
            model_unit: model,
            owner: owner,
            date_trx: new Date().toISOString(),
            hm_last: flowMeterAwal,
            hm_km: flowMeterAkhir,
            qty_last: quantity,
            qty: quantity,
            name_operator: fullName,
            fbr: fbr || 0,
            signature: signatureBase64,
            type: selectedType.name,
            lkf_id: lkf_id,
            start_time: startTime || '',
            end_time: endTime || '',
            status: false,
            jde_operator: '',
            fuelman_id: fuelman_id
        };
    
        try {
           
            if (selectedType.name === 'Issued') {
                const stockRecord = await db.cards.where({ title: 'Stock On Hand' }).first();
                if (stockRecord && stockRecord.id !== undefined) {
                    const newStockOnHand = Math.max(0, stockRecord.subtitle - quantity); 
    
                    // Update stock in IndexedDB
                    await db.cards.update(stockRecord.id, { subtitle: newStockOnHand });
                    console.log('Stock on hand updated successfully.');
                } else {
                    console.error('No stock record found or stock record ID is undefined.');
                }
            }
    
            // Post transaction data
            const response = await postTransaksi(dataPost);
            console.log('Transaction response:', response);
    
            if (response.status === 200 || response.status === 201) {
                console.log('Transaction posted successfully');
                route.push('/dashboard');
            } else {
                console.error('Failed to post transaction, server response:', response);
            }
        } catch (error) {
            console.error('Failed to post transaction', error);
        }
    };
    
    
    const handleSignatureConfirm = (newSignature: string) => {
        setSignatureBase64(newSignature);
        localStorage.setItem('signature', newSignature);
        console.log('Updated Signature:', newSignature);
    };
    
    

    const quotaMessage = selectedUnit?.startsWith('LV') || selectedUnit?.startsWith('HLV')
        ? `SISA KOUTA ${koutaLimit} LITER`
        : '';
    const quotaStyle = selectedUnit?.startsWith('LV') || selectedUnit?.startsWith('HLV')
        ? { color: '#73a33f' }
        : {};

    function setBase64(base64: string | null): void {
        throw new Error('Function not implemented.');
    }

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
                                    <IonSelect
                                        style={{ marginTop: "10px" }}
                                        fill="solid"
                                        interface="popover"
                                        labelPlacement="floating"
                                        onIonChange={handleUnitChange}
                                    >
                                        {unitOptions.map((unit) => (
                                            <IonSelectOption key={unit.unit_no} value={unit.unit_no}>
                                                {unit.unit_no}
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
                                    <IonInput
                                        className="custom-input"
                                        type="number"
                                        placeholder="Input HM awal"
                                        onIonChange={(e) => setFlowMeterAwal(Number(e.detail.value))}
                                        disabled={isFormDisabled}
                                    />
                                </IonCol>
                                <IonCol>
                                    <IonLabel>HM/KM Unit *</IonLabel>
                                    <IonInput
                                        className="custom-input"
                                        type="number"
                                        placeholder="Input HM Akhir"
                                        onIonChange={(e) => setFlowMeterAkhir(Number(e.detail.value))}
                                        disabled={isFormDisabled}
                                    />
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
                                    <IonInput
                                        className="custom-input"
                                        type="number"
                                        placeholder="Qty Issued / Receive / Transfer"
                                        onIonChange={(e) => setQuantity(Number(e.detail.value))}
                                        disabled={isFormDisabled}
                                    />
                                </IonCol>
                                <IonCol>
                                    <IonLabel>FBR Historis*</IonLabel>
                                    <IonInput
                                        className="custom-input"
                                        type="number"
                                        placeholder="Input FBR"
                                        onIonChange={(e) => setFbr(Number(e.detail.value))}
                                        disabled={isFormDisabled}
                                    />
                                </IonCol>
                            </IonRow>
                            <IonRow>
                                <IonCol>
                                    <IonLabel>Flow Meter Awal *</IonLabel>
                                    <IonInput
                                        className="custom-input"
                                        type="number"
                                        placeholder="Input Flow meter awal"
                                        onIonChange={(e) => setFlowMeterAwal(Number(e.detail.value))}
                                        disabled={isFormDisabled}
                                    />
                                </IonCol>
                                <IonCol>
                                    <IonLabel>Flow Meter Akhir *</IonLabel>
                                    <IonInput
                                        style={{
                                            '--border-color': 'transparent',
                                            '--highlight-color': 'transparent',
                                        }}
                                        labelPlacement="stacked"
                                        value={flowMeterAkhir?.toString() || ''}
                                        placeholder=""
                                        disabled={true}
                                    />
                                </IonCol>
                            </IonRow>
                            <IonRow>
                                <IonCol>
                                    <IonLabel>Employee ID *</IonLabel>
                                    <IonSelect
                                        fill="solid"
                                        // interface="popover"
                                        labelPlacement="floating"
                                        onIonChange={handleChangeEmployeeId}
                                        disabled={isFormDisabled}
                                        value={fuelman_id}
                                    >
                                        {jdeOptions.map(jde => (
                                            <IonSelectOption key={jde.JDE} value={jde.JDE}>
                                                {jde.JDE}
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
                                    <IonInput
                                        className="custom-input"
                                        type="time"
                                        onIonChange={(e) => setStartTime(e.detail.value as string)}
                                        disabled={isFormDisabled}
                                    />
                                </IonCol>
                                <IonCol>
                                    <IonLabel>Selesai Isi *</IonLabel>
                                    <IonInput
                                        className="custom-input"
                                        type="time"
                                        onIonChange={(e) => setEndTime(e.detail.value as string)}
                                        disabled={isFormDisabled}
                                    />
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
                                            // onChange={(e) => handleFileChange(e, setPhoto)}
                                        />
                                        <IonButton size='small' onClick={() => document.getElementById('photoInput')?.click()} disabled={isFormDisabled}>
                                            <IonIcon slot="start" icon={cameraOutline} />
                                            Ambil Foto *
                                        </IonButton>
                                    </IonCard>
                                </IonCol>
                                <IonCol>
                                    <IonCard style={{ height: "100px" }}>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            id="signatureInput"
                                            style={{ display: 'none' }}
                                            onChange={(e) => handleFileChange(e, setPhoto, setBase64)} 
                                        />
                                        <IonButton color="warning" size='small' onClick={() => setIsSignatureModalOpen(true)} disabled={isFormDisabled}>
                                            <IonIcon slot="start" icon={pencilOutline} />
                                            Tanda Tangan *
                                        </IonButton>
                                        {signatureBase64 && (
                                            <IonItem>
                                                <IonLabel>Preview</IonLabel>
                                                <img src={signatureBase64} alt="Signature" style={{ maxWidth: '100px', maxHeight: '100px' }} />
                                            </IonItem>
                                        )}

                                    </IonCard>
                                </IonCol>
                            </IonRow>
                            <div style={{ marginTop: "60px", float: "inline-end" }}>
                                <IonButton onClick={handleClose} color="light">
                                    <IonIcon slot="start" icon={closeCircleOutline} />Tutup Form
                                </IonButton>
                                <IonButton onClick={(e) => handlePost(e)} className="check-button">
                                    <IonIcon slot="start" icon={saveOutline} /> Simpan Data Ke Draft
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
function convertToBase64(signature: File): string | PromiseLike<string | null> | null {
    throw new Error('Function not implemented.');
}