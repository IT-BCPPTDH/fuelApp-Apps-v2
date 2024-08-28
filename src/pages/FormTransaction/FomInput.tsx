import React, { useState, useEffect, Key, SetStateAction } from 'react';
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
import { addDataDashboard, addDataTrxType} from '../../utils/insertData';
import { getUser } from '../../hooks/getAllUser';
import { convertToBase64} from '../../utils/base64';
import { getLatestLkfId } from '../../utils/getData';
interface Typetrx {
    id: number;
    name: string;
}

interface JdeOption {
    JDE: string;  // Ensure this matches the actual key used
    fullname: string;
}



const typeTrx: Typetrx[] = [
    { id: 1, name: 'Issued' },
    { id: 2, name: 'Transfer' },
    { id: 3, name: 'Receive' },
    { id: 4, name: 'Receive KPC'},
];



const compareWith = (o1: Typetrx, o2: Typetrx) => o1.id === o2.id;

const FormTRX: React.FC = () => {
    const [selectedType, setSelectedType] = useState<Typetrx | undefined>(undefined);
    const [selectedUnit, setSelectedUnit] = useState<string | undefined>(undefined);

    const [signature, setSignature] = useState<File | null>(null);
    const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
 
    const [showError, setShowError] = useState<boolean>(false);
    const [model, setModel] = useState<string>('');
    const [owner, setOwner] = useState<string>('');
    const [fullName, setFullName] = useState<string>('');
    const [unitOptions, setUnitOptions] = useState<{ id: string; unit_no: string; brand: string; owner: string }[]>([]);
    const [quantity, setQuantity] = useState<number | undefined>(undefined);
    const [fbr, setFbr] = useState<number | undefined>(undefined);
    const [flowStart, setFlowStart] = useState<number | undefined>(undefined);
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
    const [jdeOptions, setJdeOptions] = useState<{ JDE: string;  fullname: string }[]>([]);
    const [koutaLimit, setKoutaLimit] = useState<number | undefined>(undefined);
    const [photo, setPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [dipStart, setDipStart] = useState<number | undefined>(undefined);
    const [dipEnd, setDipEnd] = useState<number | undefined>(undefined);
    const [sondingStart, setSondingStart] = useState<number | undefined>(undefined);
    const [sondingEnd, setSondingEnd] = useState<number | undefined>(undefined);
    const [Refrence, setRefrence] = useState<number | undefined>(undefined);
    const [stationData, setStationData] = useState<any>(null);
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
    
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
    
        // Clean up the event listeners on component unmount
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);
    

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
        const fetchStationData = () => {
            const storedData = localStorage.getItem('stationData');
            if (storedData) {
                try {
                    const parsedData = JSON.parse(storedData);
                    console.log('data:', parsedData);
                    setStationData(parsedData);
                } catch (error) {
                    console.error('Failed to parse station data from localStorage', error);
                }
            }
        };

        fetchStationData();
    }, []);
      
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
            setFuelmanId(selectedValue);
        } else {
            console.log('No matching JDE option found.');
            setFullName('');
            setFuelmanId('');
        }
    };
    
    
    
    const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files ? event.target.files[0] : null;
        if (file) {
            setPhoto(file);

            // Create a preview of the selected photo
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, setPhoto: React.Dispatch<React.SetStateAction<File | null>>, setBase64: React.Dispatch<React.SetStateAction<string | undefined>>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                const base64 = await convertToBase64(file);
                setBase64(base64); // Directly set base64 in state
            } catch (error) {
                console.error('Error converting file to base64', error);
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
    
        const fromDataId = Date.now();
        const signatureBase64 = signature ? await convertToBase64(signature) : undefined;
        const lkf_id = await getLatestLkfId();
    
        const dataPost: DataFormTrx = {
            from_data_id: fromDataId,
            no_unit: selectedUnit!,
            model_unit: model!,
            owner: owner!,
            date_trx: new Date().toISOString(),
            hm_last: flowMeterAwal ?? 0,
            hm_km: flowMeterAkhir ?? 0,
            qty_last: quantity ?? 0,
            qty: quantity ?? 0,
            flow_start: flowMeterAwal ?? 0,
            flow_end: flowMeterAkhir ?? 0,
            dip_start: dipStart ?? 0,
            dip_end: dipEnd ?? 0,
            sonding_start: sondingStart ?? 0,
            sonding_end: sondingEnd ?? 0,
            name_operator: fullName!,
            start: startTime!,
            end: endTime!,
            fbr: fbr ?? 0,
            lkf_id: lkf_id,
            signature: signatureBase64 ?? '',
            type: selectedType?.name ?? '',
            foto: photoPreview ?? '',
            fuelman_id: fuelman_id!,
            status: false,
            jde_operator: '',
            reference: Refrence ?? 0,
            start_time: startTime ?? '',
            end_time: endTime ?? '',
        };
    
        try {
            if (isOnline) {
                // If online, post the transaction data
                await insertNewData(dataPost);
    
                // Handle stock update based on transaction type
                // (Same logic as before)
    
                const response = await postTransaksi(dataPost);
    
                if (response.ok && (response.status === 200 || response.status === 201)) {
                    console.log('Transaction posted successfully');
                    route.push('/dashboard');
                } else {
                    console.error('Transaction failed with status:', response.status);
                }
            } else {
                // If offline, save data as draft
                await insertNewData(dataPost);
                console.log('Data saved as draft');
                route.push('/dashboard');
            }
        } catch (error) {
            console.error('Error occurred:', error);
        }
    };
    
    
    // Function to insert new data into the dashboard or database
    const insertNewData = async (data: DataFormTrx) => {
        try {
          await addDataTrxType(data);
          console.log('Data inserted successfully.');
        } catch (error) {
          console.error('Failed to insert new data:', error);
        }
      };
    
    const handleSignatureConfirm = (newSignature: string) => {
        setSignatureBase64(newSignature);
         // Directly set the signature state
        console.log('Updated Signature:', newSignature);
    };
    

    const quotaMessage = selectedUnit?.startsWith('LV') || selectedUnit?.startsWith('HLV')
        ? `SISA KOUTA ${koutaLimit} LITER`
        : '';
    const quotaStyle = selectedUnit?.startsWith('LV') || selectedUnit?.startsWith('HLV')
        ? { color: '#73a33f' }
        : {};

  


    function setBase64(value: SetStateAction<string | undefined>): void {
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
                <div style={{ marginTop: "20px", padding:"15px" }}>
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
                                <IonCard style={{ height: "160px" }}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        id="photoInput"
                                        style={{ display: 'none' }}
                                        onChange={handlePhotoChange}
                                    />
                                    <IonButton size='small' onClick={() => document.getElementById('photoInput')?.click()} disabled={isFormDisabled}>
                                        <IonIcon slot="start" icon={cameraOutline} />
                                        Ambil Foto *
                                    </IonButton>
                                    {photoPreview && (
                                        <IonCard style={{ marginTop: "10px", padding: "10px" }}>
                                            <IonLabel>Preview:</IonLabel>
                                            <IonImg src={photoPreview} alt="Photo Preview" style={{ maxWidth: '100%', maxHeight: '200px' }} />
                                        </IonCard>
                                    )}
                                </IonCard>
                                </IonCol>
                                <IonCol>
                                    <IonCard style={{ height: "160px" }}>
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
                            <div style={{ marginTop: "60px", float: "inline-end"}}>
                                <IonButton style={{ height:"48px"}} onClick={handleClose} color="light">
                                    <IonIcon slot="start" icon={closeCircleOutline} />Tutup Form
                                </IonButton>
                                <IonButton onClick={(e) => handlePost(e)} className="check-button">
                                    <IonIcon slot="start" icon={saveOutline} />
                                    {isOnline ? 'Simpan Data' : 'Simpan Data Ke Draft'}
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
