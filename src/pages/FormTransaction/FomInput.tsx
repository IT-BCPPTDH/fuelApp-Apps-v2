import React, { useState, useEffect, Key, SetStateAction, useRef, useCallback } from "react";
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
  IonModal,
  InputCustomEvent,
  InputChangeEventDetail,
  IonPopover,
  useIonToast,
} from "@ionic/react";
import {
  cameraOutline,
  pencilOutline,
  closeCircleOutline,
  saveOutline,
} from "ionicons/icons";
import SignatureModal from "../../components/SignatureModal";
import { getAllUnit } from "../../hooks/getAllUnit";

import { postTransaksi } from "../../hooks/postTrx";
import { DataFormTrx } from "../../models/db";
import { db } from "../../models/db";
import { DataDashboard } from "../../models/db";
import { addDataDashboard, addDataHistory, addDataTrxType } from "../../utils/insertData";
import { getUser } from "../../hooks/getAllUser";
import { convertToBase64 } from "../../utils/base64";
import {
  fetchLatestHmLast,
  getFbrByUnit,
  getLatestLkfId,
} from "../../utils/getData";
import DynamicAlert from "../../components/Alert";
import { fetchOperatorData, fetchQuotaData, fetchUnitData, fetchUnitLastTrx, getDataFromStorage, removeDataFromStorage } from "../../services/dataService";
import Select, { ActionMeta, SingleValue } from "react-select";
import { getLatestTrx } from "../../utils/getData";
import { getPrevUnitTrx } from "../../hooks/getDataPrev";
import { getAllQuota } from "../../hooks/getQoutaUnit";
import { getHomeByIdLkf, getHomeTable} from "../../hooks/getHome";
import { deleteAllDataTransaksi } from "../../utils/delete";
import { getCalculationIssued } from "../../utils/getData";
import CameraInput from "../../components/takeFoto";
import { saveDataToStorage } from "../../services/dataService";
import { getTrasaksiSemua } from "../../hooks/getAllTransaksi";


interface Typetrx {
  id: number;
  name: string;
}

interface JdeOption {
  JDE: string; // Ensure this matches the actual key used
  fullname: string;
}
interface UnitData {
  unit_no: string;
  model: string;
  owner: string;
  hm_km: number; // Adjust the type as necessary
}

interface UnitQuota {
  unit_no: string;
  quota: number;
  used?: number;
  issued?: number;
  is_active?: boolean;
}


interface TableDataItem {
  hm_km: any;
  from_data_id: number;
  unit_no: string;
  model_unit: string;
  owner: string;
  fbr_historis: string;
  jenis_trx: string;
  qty_issued: number;
  fm_awal: number;
  fm_akhir: number;
  hm_last: number;
  jde_operator: string;
  name_operator: string;

  status: number;
}


const typeTrx: Typetrx[] = [
  { id: 1, name: "Issued" },
  { id: 2, name: "Transfer" },
  { id: 3, name: "Receipt" },
  { id: 4, name: "Receipt KPC" },
];

const compareWith = (o1: Typetrx, o2: Typetrx) => o1.id === o2.id;

const FormTRX: React.FC = () => {
  const input1Ref = useRef<HTMLIonInputElement>(null);
  const input2Ref = useRef<HTMLIonInputElement>(null);

  const [selectedType, setSelectedType] = useState<Typetrx | undefined>(
    undefined
  );
  // const [selectedUnit, setSelectedUnit] = useState<string | undefined>();

  const [signature, setSignature] = useState<File | null>(null);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [data, setData] = useState<TableDataItem[] | undefined>(undefined);
  const [model, setModel] = useState<string>("");

  const [fullName, setFullName] = useState<string>("");
  const [unitOptions, setUnitOptions] = useState<
    {
      hm_km: SetStateAction<number | null>;
      qty: SetStateAction<number | null>;
      hm_last: SetStateAction<number | null>;
       id: string;
       unit_no: string;
        brand: string;
         owner: string;
         model:string;
         model_unit:string
}[]
  >([]);

  const [fbr, setFbr] = useState<number | undefined>(undefined);
  const [flowStart, setFlowStart] = useState<number | undefined>(undefined);
  const [flowMeterAwal, setFlowMeterAwal] = useState<number | undefined>(
    undefined
  );
  const [flowMeterAkhir, setFlowMeterAkhir] = useState<number | undefined>(
    undefined
  );
  
  const [stockData, setStockData] = useState<number | undefined>(undefined);
  const [signatureBase64, setSignatureBase64] = useState<string | undefined>(
    undefined
  );
  const [fuelman_id, setFuelmanId] = useState<string>("");
  const [allUsers, setAllUser] = useState<string>("");
  const route = useIonRouter();
  const [employeeId, setEmployeeId] = useState<string>("");
  const [jdeOptions, setJdeOptions] = useState<
    { JDE: string; fullname: string }[]
  >([]);
  const [koutaLimit, setKoutaLimit] = useState<number | undefined>(undefined);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [dipStart, setDipStart] = useState<number | undefined>(undefined);
  const [dipEnd, setDipEnd] = useState<number | undefined>(undefined);
  const [sondingStart, setSondingStart] = useState<number | undefined>(
    undefined
  );
  const [presentToast] = useIonToast(); // Destructure the toast function

  const [sondingEnd, setSondingEnd] = useState<number | undefined>(undefined);
  const [Refrence, setRefrence] = useState<number | undefined>(undefined);
  const [stationData, setStationData] = useState<any>(null);
  const [showError, setShowError] = useState<boolean>(false);
  // Ensure flowEnd is a number

  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");


  const [status, setStatus] = useState<number>(1); // Default to 0
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  const [quotaMessage, setQuotaMessage] = useState("");

  const [unitQuota, setUnitQuota] = useState(0);
  const [usedQuota, setUsedQuota] = useState(0);
  const [remainingQuota, setRemainingQuota] = useState(0);
  const [quantity, setQuantity] =useState<number | null>(0); 
  const [quantityError, setQuantityError] = useState("");
  const [employeeError, setemployeeError] = useState<boolean>(false);
  const [unitQouta, setUnitQouta] = useState(0);
  const [isError, setIsError] = useState(false);
 
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectID] = useState<string | undefined>();
  // const [operatorOptions, setOperatorOptions] = useState<{ id: number; JDE: string; fullname: string; }[]>([]);
  const [hmkmTRX, sethmkmTrx] = useState<number | undefined>(undefined); // HM/KM Transaksi
  const [hmLast, setHmLast] = useState<number | undefined>(undefined); // HM/KM Unit

  // Ensure flowEnd is a number
  const [operatorOptions, setOperatorOptions] = useState<
    { JDE: string; fullname: string }[]
  >([]);


  const [selecTUnit, setSelectUnit] = useState<
  { JDE: string; fullname: string }[]
>([]);


const [transaksiData, setTransaksiData] = useState<any>(null); 
  const [filteredUnits, setFilteredUnits] = useState(unitOptions);

  const [selectedUnit, setSelectedUnit] = useState<string>("");

  const [hmkmValue, setHmkmValue] = useState<number | null>(null);
  const [hmkmLast, setHmKmLast] = useState<number | null>(null);
  const [fbrResult, setFbrResult] = useState<number>(0);
  const [fbrResultOf, setFbrResultOf] = useState<number>(0);
  const [lkfId, setLkfId] = useState<string>('');
  const [qtyValue, setQtyValue] = useState<number | null>(null);
 

 // State untuk menyimpan data unit
  // const [noUnit, setNoUnit] = useState<string>(''); // Nilai no_unit yang ingin dipanggil
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [is_active, setis_active] = useState(false);
  const [quotaData, setQuotaData] = useState(null);
  const [currentUnitQuota, setCurrentUnitQuota] = useState<UnitQuota | null>(null);
  const [totalQuantityIssued, setTotalQuantityIssued] = useState<number>(0);
  const [opDip, setOpDip] = useState<number | null>(null)
  const [shift, setOpShift] = useState<string | null>(null)
  const [station, setOpStation] = useState<string | null>(null)
  const [receipt, setOpReceipt] = useState<number | null>(null)
  const [transfer, setOpTransfer] = useState<string | null>(null)
  const [receiveKpc, setOpReceiveKpc] = useState<number | null>(null)
  const [totalIssued, setTotalIssued] = useState<number | null>(null);

  const [showErrorIsi, setShowErrorIsi] = useState<boolean>(false);

  const [isiTime, setIsiTime] = useState<string | undefined>(undefined);
const [selesaiTime, setSelesaiTime] = useState<string | undefined>(undefined);

const [startTime, setStartTime] = useState<string | undefined>(undefined);
const [endTime, setEndTime] = useState<string | undefined>(undefined);


const [qoutaData, setquotaData] = useState<number | null>(null);
const [modelUnit, setModelUnit] = useState<string>('');
const [owner, setOwner] = useState<string>('');
const [qtyLast, setQtyLast] = useState<number | undefined>(undefined);



const [stock, setStock] = useState<number>(0);
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setStatus(1); // Set status to 1 when online
    };

    const handleOffline = () => {
      setIsOnline(false);
      setStatus(0); // Keep status as 0 when offline
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);



  const loadDataQouta= useCallback(async (date:string) => {
  
    try {
      setLoading(true);
      const cachedData = await getDataFromStorage('unitQuota');
      console.log("data Ofline ==",cachedData )
      if (cachedData) {
        setquotaData(cachedData);
      } else {
        const stations = await fetchQuotaData(date);
        const formattedStations = stations.map((station) => ({
          value: station.fuel_station_name,
          label: station.fuel_station_name,
          site: station.site,
          fuel_station_type: station.fuel_station_type,
        }));
        // setquotaData(formattedStations);
      }
    } catch (err) {
      console.error('Error loading station data:', err);
    } finally {
      setLoading(false);
      loadDataQouta(date)
    }
   
  }, []);
  




  useEffect(() => {
    const storedData = localStorage.getItem("cardDataDashborad");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);

        console.log("Parsed data:", parsedData);

        parsedData.forEach(async (item: DataDashboard) => {
          await addDataDashboard(item);
        });
      } catch (error) {
        console.error("Failed to parse stock data from local storage", error);
      }
    } else {
      console.log("No stock data found in local storage");
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setStatus(1); // Change status to 1 when online
    };

    const handleOffline = () => {
      setIsOnline(false);
      setStatus(0); // Keep status as 0 when offline
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup event listeners on unmount
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);


  useEffect(() => {
    const fetchStationData = () => {
      const storedData = localStorage.getItem("stationData");
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          console.log("data:", parsedData);
          setStationData(parsedData);
        } catch (error) {
          console.error(
            "Failed to parse station data from localStorage",
            error
          );
        }
      }
    };

    fetchStationData();
  }, []);



  const handleRadioChange = (event: CustomEvent) => {
    const selectedValue = event.detail.value as Typetrx;
    setSelectedType(selectedValue);
    console.log("Selected type:", JSON.stringify(selectedValue));
  };

  const isFormDisabled = !selectedUnit;




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

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    setPhoto: React.Dispatch<React.SetStateAction<File | null>>,
    setBase64: React.Dispatch<React.SetStateAction<string | undefined>>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const base64 = await convertToBase64(file);
        setBase64(base64); // Directly set base64 in state
      } catch (error) {
        console.error("Error converting file to base64", error);
      }
    }
  };

  const handleClose = () => {
    route.push("/dashboard");
  };


 
 
  // const handlePost = async (e: React.FormEvent) => {
   
  //   const validQuantity = quantity ?? 0; 
  //   // Validate the quantity
  //   if (isNaN(validQuantity) || validQuantity <= 0) {
  //     setQuantityError("Qty Issued harus lebih besar dari 0");
  //     setIsError(true);
  //     return; // Stop the save action if quantity is invalid
  //   }
  //   // Validate all form fields
  //   if (
  //     !selectedType ||
  //     !selectedUnit ||
  //     !operatorOptions ||
  //     quantity === null ||
  //     fuelman_id === null ||
  //     fbr === null ||
  //     flowMeterAwal === null ||
  //     flowMeterAkhir === null ||
  //     !startTime ||
  //     !endTime
  //   ) {
  //     setShowError(true);
  //     setemployeeError(true);
  //     return;
  //   }
  
  //   const typeTrxValue = typeTrx[0];
  //   const flow_end: number = Number(calculateFlowEnd(typeTrxValue.name)) || 0;
  
  //   // Prepare form data
  //   const fromDataId = Date.now().toString();
  //   const signatureBase64 = signature ? await convertToBase64(signature) : undefined;
  //   const lkf_id = await getLatestLkfId();
  
  //   const dataPost: DataFormTrx = {
  //     from_data_id: fromDataId,
  //     no_unit: selectedUnit!,
  //     model_unit: model!,
  //     owner: owner!,
  //     date_trx: new Date().toISOString(),
  //     hm_last: Number(hmkmLast),
  //     hm_km: Number(hmkmValue),
  //     qty_last: quantity ?? 0, // Default to 0 if quantity is undefined
  //     qty: quantity ?? 0,
  //     flow_start: Number(flowMeterAwal),
  //     flow_end: flow_end,
  //     name_operator: fullName!,
  //     fbr: fbrResult,
  //     lkf_id: lkf_id ?? "",
  //     signature: signatureBase64 ?? "",
  //     type: selectedType?.name ?? "",
  //     foto: photoPreview ?? "",
  //     fuelman_id: fuelman_id!,
  //     jde_operator: fuelman_id!,
  //     status: status ?? 0, // Default to 0 (pending) if status is undefined
  //     date: "",
  //     start: startTime,
  //     end: endTime,
  //   };
  
  //   try {
  //     if (isOnline) {
  //       // If online, try to post the transaction to the server
  //       const response = await postTransaksi(dataPost);
  //       await insertNewData(dataPost);
  //       await insertNewDataHistori(dataPost);
  //       updateCard();
  //       // updatedKuota()
        
  
  //       const responseStatus = response.status;
  
  //       if (responseStatus === 200) {
  //         // If the response is successful (200), set status to "sent" (1)
  //         dataPost.status = 1;
  //         await insertNewData(dataPost); 
  //         await insertNewDataHistori(dataPost);// Save the transaction locally
  //         alert("Transaksi Succes dikirim ke server");
  //         if (quantity > 0) {
  //           updateLocalStorageQuota(selectedUnit, quantity); // Update quota if necessary
  //         }
  //       }
  //     } else {
  //       const unitQouta = getDataFromStorage('unitQouta')
  //       console.log("test",unitQouta)
  //       console.log("post", dataPost)

  //       // If offline, save data locally
  //       dataPost.status = 0;
  //       await insertNewData(dataPost);
  //       await insertNewDataHistori(dataPost);
  //       alert("Trasaksi tersimpan pada local");
  //     }
  
  //     // After successful operation, navigate to the dashboard
  //     route.push("/dashboard");
  //   } catch (error) {
  //     console.error("Error occurred while posting data:", error);
  //     setModalMessage("Error occurred while posting data: " + error);
  //     setErrorModalOpen(true);
  //   }
  // };
  
  const handlePost = async (e: React.FormEvent) => {
    const validQuantity = quantity ?? 0;
    if (isNaN(validQuantity) || validQuantity <= 0) {
      setQuantityError("Qty Issued harus lebih besar dari 0");
      setIsError(true);
      return;
    }
  
    if (!selectedType || !selectedUnit || !operatorOptions || quantity === null || 
        fuelman_id === null || fbr === null || flowMeterAwal === null || 
        flowMeterAkhir === null || !startTime || !endTime) {
      setShowError(true);
      setemployeeError(true);
      return;
    }
  
    const typeTrxValue = typeTrx[0];
    const flow_end: number = Number(calculateFlowEnd(typeTrxValue.name)) || 0;
    const fromDataId = Date.now().toString();
    const signatureBase64 = signature ? await convertToBase64(signature) : undefined;
    const lkf_id = await getLatestLkfId();
  
    const dataPost: DataFormTrx = {
      from_data_id: fromDataId,
      no_unit: selectedUnit!,
      model_unit: model!,
      owner: owner!,
      date_trx: new Date().toISOString(),
      hm_last: Number(hmkmLast),
      hm_km: Number(hmkmValue),
      qty_last: quantity ?? 0,
      qty: quantity ?? 0,
      flow_start: Number(flowMeterAwal),
      flow_end: flow_end,
      name_operator: fullName!,
      fbr: fbrResult,
      lkf_id: lkf_id ?? "",
      signature: signatureBase64 ?? "",
      type: selectedType?.name ?? "",
      foto: photoPreview ?? "",
      fuelman_id: fuelman_id!,
      jde_operator: fuelman_id!,
      status: status ?? 0,
      date: "",
      start: startTime,
      end: endTime,
    };
  
    try {
      if (isOnline) {
        const response = await postTransaksi(dataPost);
        await insertNewData(dataPost);
        await insertNewDataHistori(dataPost);
        updateCard();
  
        if (response.status === 200) {
          dataPost.status = 1;
          await insertNewData(dataPost);
          await insertNewDataHistori(dataPost);
          alert("Transaksi Succes dikirim ke server");
          if (quantity > 0) {
            updateLocalStorageQuota(selectedUnit, quantity);
          }
        }
      } else {
        const unitQuota =  await getDataFromStorage('unitQuota');
       
        
        for (let index = 0; index < unitQuota.length; index++) {

          const element = unitQuota[index];
          if(element.unit_no === dataPost.no_unit ){
              element.used = dataPost.qty
          }
        }
        console.log("unit-qouta",unitQuota)
        
        dataPost.status = 0;
        await insertNewData(dataPost);
        await insertNewDataHistori(dataPost);
        await saveDataToStorage('unitQuota',unitQuota);
        alert("Trasaksi tersimpan pada local");
      }

      route.push("/dashboard");
    } catch (error) {
      console.error("Error occurred while posting data:", error);
      setModalMessage("Error occurred while posting data: " + error);
      setErrorModalOpen(true);
    }
  };
  


  const updateLocalStorageQuota = async (unit_no: string, issuedQuantity: number) => {
    const unitQuota = await getDataFromStorage("unitQouta");
    if (unitQuota) {
      const parsedData = JSON.parse(unitQuota);
      const updatedData = parsedData.map((unit: { unit_no: string; quota: number; used: number; }) => {
        if (unit.unit_no === unit_no) {
          const newUsed = unit.used + issuedQuantity;
          return {
            ...unit,
            used: newUsed, 
            remainingQuota: unit.quota - newUsed 
          };
        }
        return unit;
      });
      
    
      await saveDataToStorage("unitQouta", JSON.stringify(updatedData));
    }
  };
  
  
  



  const insertNewData = async (data: DataFormTrx) => {
    try {
      await addDataTrxType(data);
      console.log("Data inserted successfully.");
    } catch (error) {
      console.error("Failed to insert new data:", error);
    }
  };

  const insertNewDataHistori = async (data: DataFormTrx) => {
    try {
      await addDataHistory(data);
      console.log("Data inserted successfully.");
    } catch (error) {
      console.error("Failed to insert new data:", error);
    }
  };


  const handleSignatureConfirm = (newSignature: string) => {
    setSignatureBase64(newSignature);
    console.log("Updated Signature:", newSignature);
  };

  useEffect(() => {
    const loadUnitData = async () => {
      const cachedUnitData = await getDataFromStorage('allUnit');
      if (cachedUnitData) {
        setUnitOptions(cachedUnitData);
      } else {
        const units = await fetchUnitData();
        setUnitOptions(units);

      }
    };

    loadUnitData();
  }, []);


  useEffect(() => {
    const loadOperatorData = async () => {
      const cachedData = await getDataFromStorage('allOperator');
      if (cachedData) {
        setOperatorOptions(cachedData);
      } else {
        const resultData = await fetchOperatorData();
        setOperatorOptions(resultData);
      }
    };

    loadOperatorData();
  }, []);

  useEffect(() => {
    console.log("operatorOptions updated:", operatorOptions);
  }, [operatorOptions]);


  useEffect(() => {
    const loadQoutaData = async () => {
      const cachedData = await getDataFromStorage('unitQouta');
      if (cachedData) {
        setQuotaData(cachedData);
      } else {
      }
    };

    loadQoutaData();
  }, []);

  useEffect(() => {
    console.log("Qouta  updated:", );
  }, [qoutaData]);


 


  const updateCard = async () => {
    localStorage.removeItem('cardDash')
    const cards = await getHomeByIdLkf(lkfId);
  }
  

  const updatedKuota = async (date:String) => {
    removeDataFromStorage('unitQuota')
    const cards = await getAllQuota(date);
    console.log("QQQ",cards)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLIonInputElement>) => {
    if (e.nativeEvent.key === "Enter") {
      e.preventDefault();

      // Check which input is focused and move to the next one
      if (input1Ref.current) {
        input2Ref.current?.setFocus();
      }
    }
  };

  const handleHmkmUnitChange = (e: CustomEvent) => {
    const value = Number(e.detail.value);
    if (hmkmValue !== null && value < hmkmValue) {
      setShowError(true);
    } else {
      setShowError(false);
    }
    setHmkmValue(value);
  };


  
  

  function setBase64(value: SetStateAction<string | undefined>): void {
    throw new Error("Function not implemented.");
  }


  useEffect(() => {
    const fetchJdeOptions = async () => {
      const storedJdeOptions = await getDataFromStorage("allOperator");
      console.log("Data ADA?", storedJdeOptions); // Check the raw data
  
      if (storedJdeOptions) {
        try {
          if (typeof storedJdeOptions === 'string') {
            const parsedJdeOptions = JSON.parse(storedJdeOptions);
            console.log("Parsed JDE Options:", parsedJdeOptions);
            setJdeOptions(parsedJdeOptions);
          } else {
            setJdeOptions([]); 
          }
        } catch (error) {
          console.error("Failed to parse JDE options from local storage", error);
          setJdeOptions([]); 
        }
      } else {
        console.log("No JDE options found in local storage");
        setJdeOptions([]); 
      }
    };
  
    fetchJdeOptions();
  }, []);
  
  const handleChangeEmployeeId = (
    newValue: SingleValue<{ value: string; label: string }>,
    actionMeta: ActionMeta<{ value: string; label: string }>
  ) => {
    const selectedValue = newValue?.value?.trim() || ''; 
    if (!operatorOptions || operatorOptions.length === 0) {
      console.warn("Operator options are empty. Cannot find matching option.");
      return; 
    }
  
  
    const selectedJdeOption = operatorOptions.find((operator) =>
      String(operator.JDE).trim() === String(selectedValue).trim()
    );
  
    if (selectedJdeOption) {

      setFullName(selectedJdeOption.fullname);
      setFuelmanId(selectedValue);
    } else {

      console.log("No matching operator option found.");
      setFullName("");
      setFuelmanId("");
    }
  };
  

  useEffect(() => {
    const fetchUnitData = async () => {
      if (!selectedUnit) return;
  
      setLoading(true);
      setError(null);
      try {
        const response = await getPrevUnitTrx(selectedUnit);
        if (response.status === '200' && response.data.length > 0) {
          const latestUnitData = response.data
            .sort((a: { date_trx: string | number | Date; }, b: { date_trx: string | number | Date; }) => new Date(b.date_trx).getTime() - new Date(a.date_trx).getTime())[0];
          if (latestUnitData) {
            const hmKmValue = Number(latestUnitData.hm_km) || 0; 
            const hmKmLastValue = Number(latestUnitData.hm_km) || 0;
            setHmkmValue(hmKmValue);
            setHmKmLast( hmKmLastValue);
            setModel(latestUnitData.model_unit);
            setOwner(latestUnitData.owner);
            setQtyValue(Number(latestUnitData.qty) || 0); 
            // localStorage.setItem('latestUnitDataHMKM', JSON.stringify(latestUnitData));
          } else {
            setError('No data found');
          }
        } else {
          setError('No data found');
        }
      } catch (err) {
        setError('Failed to fetch unit data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchUnitData();
  }, [selectedUnit]);

  
  useEffect(() => {
    const fetchUnitData = async () => {
      if (!selectedUnit) return;
  
      setLoading(true);
      setError(null);
      try {
        const response = await getPrevUnitTrx(selectedUnit);
  
        if (response.status === '200' && response.data.length > 0) {
          const latestUnitData = response.data
            .sort((a: { date_trx: string | number | Date; }, b: { date_trx: string | number | Date; }) => new Date(b.date_trx).getTime() - new Date(a.date_trx).getTime())[0];
          if (latestUnitData) {
            const hmKmValue = Number(latestUnitData.hm_km) || 0; 
            const hmKmLastValue = Number(latestUnitData.hm_last) || 0;
            setHmkmValue(hmKmValue);
            setHmKmLast(hmKmLastValue);
            setModel(latestUnitData.model_unit);
            setOwner(latestUnitData.owner);
            setQtyValue(Number(latestUnitData.qty) || 0); 
            localStorage.setItem('latestUnitDataHMKM', JSON.stringify(latestUnitData));
          } else {
            setError('No data found');
          }
        } else {
          setError('No data found');
        }
      } catch (err) {
        setError('Failed to fetch unit data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchUnitData();
  }, [selectedUnit]);
  
const handleEndTimeChange = (e: CustomEvent) => {
  const newEndTime = e.detail.value as string;
  setEndTime(newEndTime);

  // Cek apakah endTime lebih kecil dari startTime
  if (startTime && newEndTime < startTime) {
    setShowError(true);
  } else {
    setShowError(false);
  }
};

useEffect(() => {
  const userData = localStorage.getItem("cardDash");
  console.log("dataUse", userData);

  if (userData) {
    const parsedData = JSON.parse(userData);
    // Mencari item dengan title "Flow Meter Awal"
    const flowMeterItem = parsedData.find((item: { title: string; }) => item.title === "Flow Meter Akhir");
    const flowStockItem= parsedData.find((item: { title: string; }) => item.title === "Stock On Hand");
    console.log("flow akhir",flowMeterItem)
    console.log("stock ni",flowStockItem)

    if (flowMeterItem) {
      setFlowMeterAwal(flowMeterItem.value); 
    }
    if (flowStockItem) {
      setStock(flowStockItem.value); 
    }
  }
}, [])

const handleQuantityChange = (e: any) => {
  const inputQuantity = Number(e.detail.value);
  
  // Validasi jika jenis transaksi adalah "Issued"
  const isIssuedTransaction = typeTrx.some((trx) => trx.name === "Issued");

  // Cek apakah transaksi adalah Issued
  if (isIssuedTransaction) {
    if (isNaN(inputQuantity) || inputQuantity <= 0) {
      setQuantityError("Qty Issued harus lebih besar dari 0");
      setIsError(true);
      return;
    }

    // Ambil remainingQuota, pastikan data tersedia baik saat online maupun offline
    const quota = remainingQuota || 0; // Default ke 0 jika remainingQuota tidak ada

    if (typeof selectedUnit === "string" && (selectedUnit.startsWith("LV") || selectedUnit.startsWith("HLV"))) {
      // Cek apakah input quantity lebih besar dari remainingQuota
      if (inputQuantity > quota) {
        setQuantityError("Qty Issued tidak boleh lebih besar dari sisa kouta. Mohon hubungi admin agar bisa mengisi kembali !!");
        setIsError(true);
        return;
      }
    } else if (inputQuantity > stock) {
      // Cek apakah input quantity lebih besar dari stock
      setQuantityError("Qty Issued tidak boleh lebih besar dari Stock On Hand.");
      setIsError(true);
      return;
    }
  } else {
    console.log("Transaction type is not 'Issued'. No validation needed.");
  }

  // Jika semua validasi berhasil
  setQuantity(inputQuantity); // Set jumlah yang valid
  setQuantityError(""); // Kosongkan pesan error
  setIsError(false); // Tidak ada error
};



useEffect(() => {
  if (isError) {
    console.log("Error occurred:", quantityError);
  }
}, [isError, quantityError]);

useEffect(() => {
  const loadUnitDataQuota = async () => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];

    try {
      let quotaData;

      if (navigator.onLine) {
        // Attempt to fetch online data
        quotaData = await fetchQuotaData(formattedDate);
      }

      // If quotaData is undefined or not an array, attempt to retrieve from local storage
      if (!quotaData || !Array.isArray(quotaData)) {
        console.warn('Online quota data unavailable or failed. Attempting offline data.');
        quotaData = await getDataFromStorage('unitQuota');
      }

      if (quotaData && Array.isArray(quotaData)) {
        let foundUnitQuota = quotaData.find((unit) => unit.unit_no === selectedUnit);

        if (!foundUnitQuota && navigator.onLine) {
          // Check previous day's data if today’s quota is missing and online
          const yesterday = new Date(today);
          yesterday.setDate(today.getDate() - 1);
          const formattedYesterday = yesterday.toISOString().split('T')[0];
          const previousQuotaData = await fetchQuotaData(formattedYesterday);

          foundUnitQuota = previousQuotaData?.find((unit) => unit.unit_no === selectedUnit);
        }

        if (foundUnitQuota?.is_active) {
          if (foundUnitQuota) {
            setCurrentUnitQuota(foundUnitQuota);
            const totalQuota = foundUnitQuota.quota;
            const usedQuota = foundUnitQuota.used || 0;
            const additionalQuota = foundUnitQuota.additional || 0;
            const remainingQuota = totalQuota - usedQuota; 
            // ÷ jika offline remainingQuota
            if (foundUnitQuota.is_active) {
                setUnitQuota(totalQuota);
              
                setRemainingQuota(remainingQuota);
                setQuotaMessage(`Sisa Kouta ${selectedUnit}: ${remainingQuota} Liter`);
        
                const issuedAmount = foundUnitQuota.issued || 0;
                // Check if the issued amount exceeds the remaining quota
                if (issuedAmount > remainingQuota) {
                    setQuotaMessage(`Error: Issued amount exceeds remaining quota for ${selectedUnit}`);
                }
            } else {
                setUnitQuota(0);
                setRemainingQuota(0);
                setQuotaMessage("Pembatasan kuota dinonaktifkan.");
            }
          }
        }
      } else {
        setQuotaMessage("Offline quota data unavailable.");
        console.error('No quota data available for the specified date or unit.');
      }
    } catch (error) {
      console.error('Error fetching or loading quota data:', error);
      setQuotaMessage("Error loading quota data.");
    }
  };

  loadUnitDataQuota();
}, [selectedUnit]);






const calculateFlowEnd = (typeTrx: string): string | number => {
  if (flowMeterAwal !== undefined && quantity !== undefined) {
    
    // Jika tipe transaksi adalah Receipt atau Receipt KPC
    if (typeTrx === "Receipt" || typeTrx === "Receipt KPC") {
      return flowMeterAwal !== 0 ? flowMeterAwal : "N/A";
    } else {
      // Jika tipeTrx bukan receipt atau receipt KPC, lakukan perhitungan
      const totalFlowEnd = flowMeterAwal + (quantity ?? 0); 
      return  totalFlowEnd !== 0 ?  totalFlowEnd  : "N/A"; 
    }
  }
  return ""; 
};

// hitung fbr offline
useEffect(() => {
  console.log('useEffect Oflline:', { hmkmValue, hmLast, qtyLast });

  const calculateFBR = (): number => {
    if (typeof hmkmValue === 'number' && typeof hmLast === 'number' && typeof qtyLast === 'number') {
      const difference =  hmkmValue  - hmLast ;
      console.log('Difference  offline (hmLast - hmkm):', difference);

      if (qtyValue === 0) {
        console.log('qtyValue cannot be zero');
        return 0;
      }

      if (difference > 0) {
        const result = difference / qtyLast; 
        console.log('Calculated FBR ofline:', result);
        return parseFloat(result.toFixed(2));
      } else {
        console.log('Difference is not positive');
      }
    } else {
      console.log('Invalid input types:', { hmkmValue, hmLast, qtyValue });
    }
    return 0;
  };

  setFbrResultOf(calculateFBR());

}, [hmkmValue, hmLast, qtyLast]);


// hitung fbr online
useEffect(() => {
  console.log('useEffect triggered with values:', { hmkmValue, hmkmLast, qtyValue });

  const calculateFBR = (): number => {
    // Check if the necessary values are numbers
    if (typeof hmkmValue === 'number' && typeof hmkmLast === 'number' && typeof qtyValue === 'number') {
      const difference = hmkmLast - hmkmValue;
      console.log('Difference (hmLast - hmkm):', difference);

      if (qtyValue === 0) {
        console.log('qtyValue cannot be zero');
        return 0;
      }

      if (difference > 0) {
        const result = difference / qtyValue;
        console.log('Calculated FBR:', result);
        return parseFloat(result.toFixed(2)); // Round to 2 decimal places
      } else {
        console.log('Difference is not positive');
      }
    } else {
      console.log('Invalid input types:', { hmkmValue, hmkmLast, qtyValue });
    }
    return 0; // Default return value
  };

  const getOfflineData = async () => {
    // If the app is offline, try to fetch the latest hmkm from IndexedDB
    if (!navigator.onLine) {
      console.log("App is offline. Fetching hmkmLast from offline data.");
      const hmkm = await fetchLatestHmLast("selectedUnit");  // Use actual selected unit
      if (hmkm!== undefined ) {
        setHmLast(hmLast);  // Set the offline value for hmkmLast
      } else {
        console.warn("No offline hm_km data found.");
      }
    }
  };

  // First, handle offline scenario if applicable
  getOfflineData();

  // Proceed with FBR calculation
  setFbrResult(calculateFBR());
}, [hmkmValue, hmkmLast, qtyValue]);


const filteredUnitOptions = (selectedType && 
  (selectedType.name === 'Receipt' || selectedType.name === 'Receipt KPC' || selectedType.name === 'Transfer')) 
? unitOptions.filter(unit => unit.unit_no.startsWith("FT") || unit.unit_no.startsWith("TK"))
: unitOptions;



// Helper function to set default values
const setDefaults = () => {
  setHmKmLast(null);
  setQtyValue(0);
 
};

// const handleUnitChange = async (newValue: SingleValue<{ value: string; label: string }>) => {
//   if (newValue) {
//     const unitValue = newValue.value;
//     setSelectedUnit(unitValue);
    
//     console.log("Unit Value Selected:", unitValue); // Debugging log

//     // Load offline data from local storage
//     const storedTransaksiData = JSON.parse(localStorage.getItem('transaksiData') || '{}');
//     console.log("Stored transaksiData:", storedTransaksiData);

//     // Get latest transaction for unitValue from transaksiData based on updated_at
//     let hmKmValue = null;
//     let modelValue = null;
//     let ownerValue = null;
//     if (storedTransaksiData?.data?.length > 0) {
//       const matchingTransactions = storedTransaksiData.data
//         .filter((item: { no_unit: string; updated_at: string }) => item.no_unit === unitValue)
//         .sort((a: { updated_at: string | number | Date; }, b: { updated_at: string | number | Date; }) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      
//       if (matchingTransactions.length > 0) {
//         const latestTransaction = matchingTransactions[0];
//         hmKmValue = latestTransaction.hm_km || null;
//         modelValue = latestTransaction.model_unit || null;  // Assuming model is available in the transaction
//         ownerValue = latestTransaction.owner || null;  // Assuming owner is available in the transaction

//         console.log("hm_km from offline data:", hmKmValue);
//         console.log("Model from offline data:", modelValue);
//         console.log("Owner from offline data:", ownerValue);
//       }
//     }
  

//     if (navigator.onLine) {
//       // Online mode
//       console.log("You are online"); 
//       const selectedUnitOption = unitOptions.find(unit => unit.unit_no === unitValue);
      
//       if (selectedUnitOption) {
//         console.log("Selected Unit Option (Online):", selectedUnitOption); 
//         setHmKmLast(hmKmValue);  
//         setQtyValue(selectedUnitOption.qty);
//         setModel(selectedUnitOption.model); 
//         setOwner(selectedUnitOption.owner); 
//       } else {
//         console.log("No matching unit found in unitOptions for unit:", unitValue);
//       }
//     } else {
//       // Offline mode
//       console.log("You are offline");  
//       if (hmKmValue !== null) {
//         setHmKmLast(hmkmLast); 
        
//       }
//       if (modelValue && ownerValue) {
//         setModel(modelValue); 
//         setOwner(ownerValue); 
//       } else {
//         console.log("No matching transaction found for unit:", unitValue);
//         setDefaults();  // Set default values if no matching data
//       }
//     }
//   }
// };

// const handleUnitChange = async (newValue: SingleValue<{ value: string; label: string }>) => {
//   if (newValue) {
//     const unitValue = newValue.value;
//     setSelectedUnit(unitValue);
    
//     console.log("Unit Value Selected:", unitValue); // Debugging log

//     // Load offline data from local storage
//     const storedTransaksiData = JSON.parse(localStorage.getItem('transaksiData') || '{}');
//     console.log("Stored transaksiData:", storedTransaksiData);

//     // Get latest transaction for unitValue from transaksiData based on updated_at
//     let hmKmValue = null;
//     let modelValue = null;
//     let ownerValue = null;
    
//     if (storedTransaksiData?.data?.length > 0) {
//       // Filter and sort transactions by updated_at
//       const matchingTransactions = storedTransaksiData.data
//         .filter((item: { no_unit: string; updated_at: string }) => item.no_unit === unitValue)
//         .sort((a: { updated_at: string | number | Date; }, b: { updated_at: string | number | Date; }) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      
//       if (matchingTransactions.length > 0) {
//         const latestTransaction = matchingTransactions[0];
//         hmKmValue = latestTransaction.hm_km || null;
//         modelValue = latestTransaction.model_unit || null;  // Assuming model is available in the transaction
//         ownerValue = latestTransaction.owner || null;  // Assuming owner is available in the transaction

//         console.log("hm_km from offline data:", hmKmValue);
//         console.log("Model from offline data:", modelValue);
//         console.log("Owner from offline data:", ownerValue);
//       }
//     }
  
//     if (navigator.onLine) {
//       // Online mode
//       console.log("You are online"); 
//       const selectedUnitOption = unitOptions.find(unit => unit.unit_no === unitValue);
      
//       if (selectedUnitOption) {
//         console.log("Selected Unit Option (Online):", selectedUnitOption); 
//         setHmKmLast(hmKmValue);  
//         setModel(selectedUnitOption.model_unit); 
//         setOwner(selectedUnitOption.owner); 
//       } else {
//         console.log("No matching unit found in unitOptions for unit:", unitValue);
//       }
//     } else {
//       // Offline mode
//       console.log("You are offline");  

//       // Set values if offline and data is available
//       if (hmKmValue !== null) {
//         setHmKmLast(hmKmValue);  // Set hm_km value from offline transaction
//       }
      
//       if (modelValue && ownerValue) {
//         setModel(modelValue);  // Set model value from offline transaction
//         setOwner(ownerValue);  // Set owner value from offline transaction
//       } else {
//         console.log("No matching transaction found for unit:", unitValue);
//         setDefaults();  // Set default values if no matching data
//       }
//     }
//   }
// };

// const handleUnitChange = (
//   newValue: SingleValue<{ value: string; label: string }>, 
//   actionMeta: ActionMeta<{ value: string; label: string }>
// ) => {
//   if (newValue) {
//     const unitValue = newValue.value; 
//     setSelectedUnit(unitValue); // Set unit yang dipilih

//     // Mencari opsi unit yang dipilih dari unitOptions
//     const selectedUnitOption = unitOptions.find(
//       (unit) => unit.unit_no === unitValue
//     );

//     // Jika opsi unit yang dipilih ada, perbarui model, pemilik, dan hm_km
//     if (selectedUnitOption) {
//       setModel(selectedUnitOption.brand); // Set model berdasarkan unit yang dipilih
//       setOwner(selectedUnitOption.owner); // Set pemilik berdasarkan unit yang dipilih
//       setHmkmValue(selectedUnitOption.hm_km);
//       setHmKmLast(selectedUnitOption.hm_last);
//       setQtyValue(selectedUnitOption.qty); // Perbarui nilai hm_km

//       // Tentukan batas kouta baru berdasarkan nilai unit
//       const newKoutaLimit = unitValue.startsWith("LV") || unitValue.startsWith("HLV") ? unitQouta : 0;
//       setKoutaLimit(newKoutaLimit); // Set batas kouta

//       // Set showError berdasarkan jenis unit dan batas kouta
//       setShowError(
//         unitValue.startsWith("LV") || 
//         (unitValue.startsWith("HLV") && newKoutaLimit < unitQouta)
//       );
//     } else {
//       //Offline mode
//       console.log("You are offline");  

//       // Set values if offline and data is available
//       if (hmLast !== null) {
//         setHmKmLast(hmkmValue);  // Set hm_km value from offline transaction
//       }
      
//       console.warn(`Unit dengan nilai ${unitValue} tidak ditemukan di unitOptions.`);
//     }
//   }
// };

useEffect(() => {
  console.log("Updated hmkmLast value:", hmkmLast);
}, [hmkmLast]);



useEffect(() => {
  const getOfflineData = async () => {
    // Fetch the latest data for the selected unit
    const offlineData = await fetchLatestHmLast(selectedUnit);

    // Set state variables based on the fetched data
    if (offlineData.hm_km !== undefined) {
      setHmLast(offlineData.hm_km); // Set hm_km as a number
    }
    if (offlineData.model_unit) {
      setModelUnit(offlineData.model_unit); // Set model_unit as a string
    }
    if (offlineData.owner) {
      setOwner(offlineData.owner); // Set owner as a string
    }
    if (offlineData.qty_last !== undefined) {
      setQtyLast(offlineData.qty_last); // Set qty_last as a number
    }
  };

  getOfflineData();
}, [selectedUnit]);
const handleUnitChange = async (
  newValue: SingleValue<{ value: string; label: string }>, 
  actionMeta: ActionMeta<{ value: string; label: string }>
) => {
  if (newValue) {
    const unitValue = newValue.value; 
    setSelectedUnit(unitValue); // Set the selected unit

    // Find the selected unit option from unitOptions
    const selectedUnitOption = unitOptions.find(
      (unit) => unit.unit_no === unitValue
    );

    if (selectedUnitOption) {
      // Update state based on the online data
      setModel(selectedUnitOption.brand);
      setOwner(selectedUnitOption.owner);
      setHmkmValue(selectedUnitOption.hm_km);
      setHmKmLast(selectedUnitOption.hm_last);
      setQtyValue(selectedUnitOption.qty);

      const newKoutaLimit = unitValue.startsWith("LV") || unitValue.startsWith("HLV") ? unitQouta : 0;
      setKoutaLimit(newKoutaLimit);

      setShowError(
        unitValue.startsWith("LV") || 
        (unitValue.startsWith("HLV") && newKoutaLimit < unitQouta)
      );
    } else {
      console.log("You are offline");

      try {
        // Retrieve data from IndexedDB using fetchLatestHmLast
        const offlineData = await fetchLatestHmLast(unitValue);
        console.log("hm",offlineData)


        if (offlineData.hm_km !== undefined) {
          setHmLast(Number(hmLast));  // Convert hm_km to a string before setting it
}
        if (offlineData.model_unit) {
          setModel(offlineData.model_unit); // Set model from offline data
        }
        if (offlineData.owner) {
          setOwner(offlineData.owner); // Set owner from offline data
        }
        if (offlineData.qty_last !== undefined) {
          setQtyValue(offlineData.qty_last); // Set qty from offline data
        }

      } catch (error) {
        console.error("Failed to retrieve data from IndexedDB:", error);
      }

      console.warn(`Unit with value ${unitValue} was not found in unitOptions.`);
    }
  }
};




useEffect(() => {
  const getOfflineData = async () => {
    // Clear hm_km value when a new unit is selected
    setHmLast(0);  // Reset to 0 initially when unit is changed

    const offlineData = await fetchLatestHmLast(selectedUnit);

    // Log the fetched offline data for debugging
    console.log("Fetched offline data:", offlineData);

    // If the unit has a valid hm_km, set it
    if (offlineData.hm_km !== undefined) {
      setHmLast(offlineData.hm_km);  // Set hm_km from offline data
    } else {
      setHmLast(0); // Set hm_km to 0 if the unit doesn't match
    }

    // Set other fields if available
    if (offlineData.model_unit) {
      setModelUnit(offlineData.model_unit);
    }
    if (offlineData.owner) {
      setOwner(offlineData.owner);
    }
    if (offlineData.qty_last !== undefined) {
      setQtyLast(offlineData.qty_last);
    }
  };

  // Call to fetch the latest data whenever the selected unit changes
  getOfflineData();
}, [selectedUnit]);  // Dependency on selectedUnit, so it runs whenever the unit changes

// const handleUnitChange = (
//   newValue: SingleValue<{ value: string; label: string }>, 
//   actionMeta: ActionMeta<{ value: string; label: string }>
// ) => {
//   if (newValue) {
//     const unitValue = newValue.value; 
//     setSelectedUnit(unitValue); // Set the selected unit

//     // Find the selected unit option from unitOptions
//     const selectedUnitOption = unitOptions.find(
//       (unit) => unit.unit_no === unitValue
//     );

//     // If the selected unit option exists, update model, owner, and hm_km
//     if (selectedUnitOption) {
//       setModel(selectedUnitOption.brand); // Set model based on the selected unit
//       setOwner(selectedUnitOption.owner); // Set owner based on the selected unit
//       setHmkmValue(selectedUnitOption.hm_km);
//       setHmKmLast(selectedUnitOption.hm_last);
//       setQtyValue(selectedUnitOption.qty); // Update qty value

//       // Set the quota limit based on the unit type
//       const newKoutaLimit = unitValue.startsWith("LV") || unitValue.startsWith("HLV") ? unitQouta : 0;
//       setKoutaLimit(newKoutaLimit); // Set the quota limit

//       // Set showError based on unit type and quota limit
//       setShowError(
//         unitValue.startsWith("LV") || 
//         (unitValue.startsWith("HLV") && newKoutaLimit < unitQouta)
//       );
//     } else {
//       // Offline mode
//       console.log("You are offline");  

//       // Check local storage for transaction data if the unit is not found in options
//       const transaksiData = localStorage.getItem("transaksiData");
//       if (transaksiData) {
//         const transaksiParsed = JSON.parse(transaksiData);
//         const offlineUnitData = transaksiParsed.find(
//           (data: { unit_no: string }) => data.unit_no === unitValue
//         );

//         if (offlineUnitData) {
//           setHmKmLast(offlineUnitData.hm_km); // Use hm_km from offline transaction data
//           setQtyValue(offlineUnitData.qty);   // Use qty if available from offline data
//         } else {
//           console.warn(`Unit with value ${unitValue} not found in local storage transaction data.`);
//         }
//       }

//       console.warn(`Unit with value ${unitValue} not found in unitOptions.`);
//     }
//   }
// };


// const handleUnitChange = (
//   newValue: SingleValue<{ value: string; label: string }>, 
//   actionMeta: ActionMeta<{ value: string; label: string }>
// ) => {
//   if (newValue) {
//     const unitValue = newValue.value; 
//     setSelectedUnit(unitValue); // Set unit yang dipilih

//     // Mencari opsi unit yang dipilih dari unitOptions
//     const selectedUnitOption = unitOptions.find(
//       (unit) => unit.unit_no === unitValue
//     );

//     // Jika opsi unit yang dipilih ada, perbarui model, pemilik, dan hm_km
//     if (selectedUnitOption) {
//       setModel(selectedUnitOption.brand); // Set model berdasarkan unit yang dipilih
//       setOwner(selectedUnitOption.owner); // Set pemilik berdasarkan unit yang dipilih
//       setHmkmValue(selectedUnitOption.hm_km);
//       setHmKmLast(selectedUnitOption.hm_last);
//       setQtyValue(selectedUnitOption.qty); // Perbarui nilai hm_km

//       // Tentukan batas kouta baru berdasarkan nilai unit
//       const newKoutaLimit = unitValue.startsWith("LV") || unitValue.startsWith("HLV") ? unitQouta : 0;
//       setKoutaLimit(newKoutaLimit); // Set batas kouta

//       // Set showError berdasarkan jenis unit dan batas kouta
//       setShowError(
//         unitValue.startsWith("LV") || 
//         (unitValue.startsWith("HLV") && newKoutaLimit < unitQouta)
//       );
//     } else {
//       //Offline mode
//       console.log("You are offline");  

//       // Set values if offline and data is available
//       if (hmLast !== null) {
//         setHmKmLast(hmkmValue);  // Set hm_km value from offline transaction
//       }
      
//       console.warn(`Unit dengan nilai ${unitValue} tidak ditemukan di unitOptions.`);
//     }
//   }
// };



// FBR Calculation function
const calculateFBR = (): number => {
  if (typeof hmkmValue === 'number' && typeof hmkmLast === 'number' && typeof qtyValue === 'number') {
    const difference = hmkmValue - hmkmLast;
    console.log('Difference (hmLast - hmkm):', difference);

    if (qtyValue === 0) {
      console.log('qtyValue cannot be zero');
      return 0;
    }

    if (difference > 0) {
      const result = difference / qtyValue;
      console.log('Calculated FBR:', result);
      return parseFloat(result.toFixed(2));
    } else {
      console.log('Difference is not positive');
    }
  } else {
    console.log('Invalid input types:', { hmkmValue, hmkmLast, qtyValue });
  }
  return 0;
};

// Update FBR result
useEffect(() => {
  setFbrResult(calculateFBR());
}, [hmkmValue, hmkmLast, qtyValue]);

  return (
    <IonPage>
      <IonHeader translucent={true} className="ion-no-border">
        <IonToolbar className="custom-header">
          <IonTitle>
            Form Tambah Transaksi
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div style={{ marginTop: "20px", padding: "15px" }}>
          {(selectedUnit?.startsWith("LV") || selectedUnit?.startsWith("HLV")) && (
            <IonRow> 

            </IonRow>
          )}
       {currentUnitQuota?.is_active && remainingQuota >= 0 && (
    <IonRow>
        <IonCol>
            <IonItemDivider style={{ border: "solid", color: "#8AAD43", width: "400px" }}>
                <IonLabel style={{ display: "flex" }}>
                    <IonImg style={{ width: "40px" }} src="Glyph.png" alt="Logo DH" />
                    <IonTitle 
                        style={{ color: remainingQuota === 0 ? 'red' : 'inherit' }}
                    >
                        Sisa Kuota: {remainingQuota > 0 ? `${remainingQuota} Liter` : '0 Liter'}
                    </IonTitle>
                </IonLabel>
            </IonItemDivider>
        </IonCol>
    </IonRow>
)}


          <div style={{ marginTop: "30px" }}>
            <IonGrid>
              <IonRow>
              <IonCol size="8"
                    >
                      <div>
                        <IonLabel style={{fontWeigt:"Bold" , fontSize:"24px"}}>
                          Pilih Transaksi
                          <span style={{ color: "red" }}> *</span>
                        </IonLabel>
                        <IonRadioGroup
                        style={{
                          backgroundColor: showError && selectedType === undefined ? "rgba(255, 0, 0, 0.1)" : "transparent", // Apply red background if error
                          padding: "10px", // Ensure the block has padding for visibility
                          borderRadius: "5px",
                         
                        }}
                          className="radio-display"
                          value={selectedType}
                          onIonChange={handleRadioChange}
                          compareWith={compareWith}
                        >
                          {typeTrx.map((type) => (
                            <IonItem  style={{fontWeigt:"500px", fontSize:"20px"}} key={type.id} className="item-no-border" >
                              <IonRadio labelPlacement="end"  value={type}>{type.name}</IonRadio>
                            </IonItem>
                          ))}
                        </IonRadioGroup>
                        {showError && selectedType === undefined && (
                          <p style={{ color: "red" }}>* Pilih salah satu tipe</p>
                        )}
                      </div>
                    </IonCol>
              </IonRow>
              <IonRow>
              <IonCol>
            <IonLabel className="label-input">
              Select Unit <span style={{ color: "red" }}>*</span>
            </IonLabel>
            <Select
              className="select-custom"
              styles={{
                container: (provided) => ({
                  ...provided,
                  marginTop: "10px",
                  backgroundColor: "white",
                  zIndex: 10,
                  height: "56px",
                }),
                control: (provided) => ({
                  ...provided,
                  height: "56px",
                  minHeight: "56px",
                }),
                valueContainer: (provided) => ({
                  ...provided,
                  padding: "0 6px",
                }),
                singleValue: (provided) => ({
                  ...provided,
                  lineHeight: "56px",
                }),
              }}
              value={
                selectedUnit
                  ? { value: selectedUnit, label: selectedUnit }
                  : null
              }
              onChange={handleUnitChange}
              options={filteredUnitOptions.map((unit) => ({
                value: unit.unit_no || '',
                label: unit.unit_no || '',
              }))}
              isSearchable={true}
            />
          </IonCol>
                <IonCol>
                  <IonLabel>
                    Model <span style={{ color: "red" }}>*</span>
                  </IonLabel>
                  <IonInput
                    style={{ background: "#E8E8E8" }}
                    className="custom-input"
                    type="text"
                    name="model"
                    placeholder="Input Model"
                    readonly
                    value={model}
                    disabled={isFormDisabled}
                  />
                </IonCol>
              </IonRow>
              <IonGrid>
                <IonRow>
                  <IonCol size="12">
                    <div><IonLabel>
                      Owner <span style={{ color: "red" }}>*</span>
                    </IonLabel>
                      <IonInput
                        style={{ background: "#E8E8E8" }}
                        className="custom-input"
                        type="text"
                        name="owner"
                        value={owner}
                        placeholder="Input Owner"
                        readonly
                        disabled={isFormDisabled}
                      /></div>
                  </IonCol>
                   
                </IonRow>
              </IonGrid>
              <IonRow>
                <IonCol>
                  <IonLabel>
                    HM/KM Terakhir Transaksi{" "}
                    <span style={{ color: "red" }}>*</span>
                  </IonLabel>
                  {/* <IonInput
                        style={{ background: "#E8E8E8" }}
                        className="custom-input"
                        type="number"
                        placeholder="Input HM/KM Unit"
                        value={hmkmValue !== null ? hmkmLast : hmLast} // fallback to hmkmLast when hmkmValue is null
                        disabled={isFormDisabled}
                        onIonChange={(e) => setHmKmLast(Number(e.detail.value))}
                        onKeyDown={handleKeyDown}
                      /> */}

                         <IonInput
                              style={{ background: "#E8E8E8" }}
                              className="custom-input"
                              type="number"
                              placeholder="Input HM/KM Unit"
                              // value={hmkmLast} // Fallback to hmkmLast
                              value={hmLast} 
                              onIonChange={(e) => setHmLast(Number(e.detail.value))}
                              disabled={isFormDisabled}
                            />

                   {showError && hmkmLast === undefined && (
                        <p style={{ color: "red" }}>* Field harus diisi</p>
                   )}
                </IonCol>
                <IonCol>
                  <IonLabel>
                    HM/KM Unit<span style={{ color: "red" }}>*</span>
                  </IonLabel>
                  <IonInput
                    ref={input1Ref}
                    className="custom-input"
                    type="number"
                    placeholder="Input HM Terakhir"
                    onIonChange={handleHmkmUnitChange}
                    // onIonChange={(e) => setHmkmValue(Number(e.detail.value))}
                    onKeyDown={handleKeyDown}
                  />
                  
                  {showError && (
                    <div style={{ color: "red" }}>
                      HM/KM Unit Tidak Boleh Kecil Dari HM/KM Terakhir Transaksi
                    </div>
                  )}
                </IonCol>
              </IonRow>
              <IonRow>
  <IonCol>
    <IonLabel>
      Qty Issued / Receipt/ Transfer{" "}
      <span style={{ color: "red" }}>*</span>
    </IonLabel>
    <IonInput
      className="custom-input"
      ref={input2Ref}
      type="number"
      placeholder="Qty Issued / Receipt/ Transfer"
      onIonChange={handleQuantityChange}
      value={quantity}
      disabled={isFormDisabled}
    />

    {/* Display error if the field is empty or if quantity is invalid */}
    {quantityError && (
      <div style={{ color: "red", marginTop: "5px" }}>
        {quantityError}
      </div>
    )}

    {/* Additional error check when quantity is undefined */}
    {showError && quantity === undefined && (
      <p style={{ color: "red" }}>* Field harus diisi</p>
    )}
  </IonCol>
  
  <IonCol>
    <IonLabel>
      FBR Historis <span style={{ color: "red" }}>*</span>
    </IonLabel>
    <IonInput
      style={{ background: "#E8E8E8" }}
      className="custom-input"
      type="number"
      placeholder="Input FBR"
      disabled={isFormDisabled}
      readonly
      value={isOnline ? fbrResult : fbrResultOf} 
    />
  </IonCol>
</IonRow>

              <IonRow>
                <IonCol>
                  <IonLabel>
                    Flow Meter Awal <span style={{ color: "red" }}>*</span>
                  </IonLabel>
                  <IonInput
                    className="custom-input"
                    type="number"
                    value={flowMeterAwal }
                    placeholder="Input Flow meter awal"
                    disabled={isFormDisabled}
                  />
                </IonCol>
                <IonCol>
                  <IonLabel>
                    Flow Meter Akhir <span style={{ color: "red" }}>*</span>
                  </IonLabel>
                  <IonInput
                    style={{
                      "--border-color": "transparent",
                      "--highlight-color": "transparent",
                    }}
                    labelPlacement="stacked"
                    onIonChange={(e) =>
                        setFlowMeterAkhir(Number(e.detail.value))
                    }
                    value={
                      typeof calculateFlowEnd(selectedType?.name || "") === "number" 
                          ? calculateFlowEnd(selectedType?.name || "")
                          : ""
                    }
                    placeholder=""
                  />
                  
                </IonCol>
              </IonRow>
              <IonRow>
                
              <IonCol
                style={{
                  backgroundColor: employeeError ? "rgba(255, 0, 0, 0.1)" : "transparent", // Apply red background if error
                  padding: "10px", // Ensure the block has padding for visibility
                }}
              >
            <IonLabel className="label-input">
              Select Employee ID <span style={{ color: "red" }}>*</span>
            </IonLabel>
            <Select
              className="select-custom"
              styles={{
                container: (provided) => ({
                  ...provided,
                  marginTop: "10px",
                  backgroundColor: "white",
                  zIndex: 10,
                  height: "57px", // Set the height
                }),
                control: (provided) => ({
                  ...provided,
                  height: "57px", // Set the height of the control
                  minHeight: "57px", // Ensure minimum height
                  borderColor: employeeError ? "red" : provided.borderColor, // Highlight border red on error
                }),
                valueContainer: (provided) => ({
                  ...provided,
                  padding: "0 6px", // Adjust padding
                }),
                singleValue: (provided) => ({
                  ...provided,
                  lineHeight: "57px", // Center text vertically
                }),
              }}
              value={fuelman_id ? { value: fuelman_id, label: fuelman_id } : null}
              onChange={handleChangeEmployeeId}
              options={operatorOptions.map((operator) => ({
                value: operator.JDE || '',
                label: operator.JDE || '',
              }))}
              placeholder="Select Employee ID"
              isSearchable={true}
              isDisabled={isFormDisabled}
            />

            {employeeError && (
              <div style={{ color: "red", marginTop: "5px" }}>
                {employeeError}
              </div>
            )}
          </IonCol>

          <IonCol>
            <IonLabel>
              Nama Driver <span style={{ color: "red" }}>*</span>
            </IonLabel>
            <IonInput
              style={{ background: "#E8E8E8" }}
              className="custom-input"
              type="text"
              value={fullName}
              placeholder="Input Driver Name"
              readonly
              disabled={isFormDisabled}
            />
          </IonCol>

              </IonRow>
              <IonRow>
                <IonCol>
                  <IonLabel>
                    Mulai Isi <span style={{ color: "red" }}>*</span>
                  </IonLabel>
                  <IonInput
                    className="custom-input"
                    type="time"
                    onIonChange={(e) => {
                      setStartTime(e.detail.value as string);
                      setShowError(false); // Reset error saat mulai diubah
                    }}
                    disabled={isFormDisabled}
                    value={startTime}
                  />
                  {showError && startTime === undefined && (
                    <p style={{ color: "red" }}>* Jam mulai pengisian harus input</p>
                  )}
                </IonCol>
                <IonCol>
                  <IonLabel>
                    Selesai Isi <span style={{ color: "red" }}>*</span>
                  </IonLabel>
                  <IonInput
                    className="custom-input"
                    type="time"
                    onIonChange={handleEndTimeChange} // Menggunakan fungsi yang sudah dibuat
                    disabled={isFormDisabled}
                    value={endTime}
                  />
                  {showError && endTime === undefined && (
                    <p style={{ color: "red" }}>* Jam selesai pengisian harus input</p>
                  )}
                  {showError && startTime && endTime && endTime < startTime && (
                    <p style={{ color: "red" }}>* Jam selesai tidak boleh lebih kecil dari jam mulai</p>
                  )}
                </IonCol>
              </IonRow>
              <IonRow>
                <IonCol>
                  <CameraInput/>
                </IonCol>
                <IonCol>
                  <IonCard style={{ height: "160px" }}>
                    <input
                      type="file"
                      accept="image/*"
                      id="signatureInput"
                      style={{ display: "none" }}
                      onChange={(e) => handleFileChange(e, setPhoto, setBase64)}
                    />
                    <IonButton
                      color="warning"
                      size="small"
                      onClick={() => setIsSignatureModalOpen(true)}
                      disabled={isFormDisabled}
                    >
                      <IonIcon slot="start" icon={pencilOutline} />
                      Tanda Tangan *
                    </IonButton>
                    {signatureBase64 && (
                      <IonItem>
                        <IonLabel>Preview</IonLabel>
                        <img
                          src={signatureBase64}
                          alt="Signature"
                          style={{ maxWidth: "100px", maxHeight: "100px" }}
                        />
                      </IonItem>
                    )}
                  </IonCard>
                </IonCol>
              </IonRow>
              <div style={{ marginTop: "60px", float: "inline-end" }}>
                <IonButton
                  style={{ height: "48px" }}
                  onClick={handleClose}
                  color="light"
                >
                  <IonIcon slot="start" icon={closeCircleOutline} />
                  Tutup Form
                </IonButton>
                <IonButton
                  disabled={isError || quantity === null}
                  onClick={(e) => handlePost(e)}
                  className={`check-button ${isOnline ? "button-save-data" : "button-save-draft"}`}
                  // disabled={showError}
                >
                  <IonIcon slot="start" icon={saveOutline} />
                  {isOnline ? "Simpan Data" : "Simpan Data Ke Draft"}
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
        {/* Error Modal */}

      </IonContent>
    </IonPage>
  );
};
export default FormTRX;





