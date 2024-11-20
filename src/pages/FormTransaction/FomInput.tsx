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
  IonAlert
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


import { fetchOperatorData, fetchQuotaData, fetchUnitData, fetchUnitLastTrx, getDataFromStorage, removeDataFromStorage } from "../../services/dataService";
import Select, { ActionMeta, SingleValue } from "react-select";
import { getLatestTrx } from "../../utils/getData";
import { getPrevUnitTrx } from "../../hooks/getDataPrev";
import { getAllQuota } from "../../hooks/getQoutaUnit";
import { getHomeByIdLkf, getHomeTable } from "../../hooks/getHome";
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

  // const [signature, setSignature] = useState<File | null>(null);
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
      model: string;
      model_unit: string
    }[]
  >([]);

  const [fbr, setFbr] = useState<number | undefined>(undefined);
  const [flowStart, setFlowStart] = useState<number | undefined>(undefined);
  const [flowMeterAwal, setFlowMeterAwal] = useState<number>(0);
  const [flowMeterAkhir, setFlowMeterAkhir] = useState<number | undefined>(
    undefined
  );

  const [stockData, setStockData] = useState<number | undefined>(undefined);
  const [signatureBase64, setSignatureBase64] = useState<string | undefined>(
    undefined
  );

  const [fotoBase64, setFotoBase64] = useState<string | undefined>(
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
  const [dipStart, setDipStart] = useState<number | undefined>(undefined);
  const [dipEnd, setDipEnd] = useState<number | undefined>(undefined);
  const [sondingStart, setSondingStart] = useState<number | undefined>(
    undefined
  );
  const [presentToast] = useIonToast(); // Destructure the toast function
  const [photoPreview, setPhotoPreview] = useState<string | undefined>(undefined);

  const [sondingEnd, setSondingEnd] = useState<number | undefined>(undefined);
  const [Refrence, setRefrence] = useState<number | undefined>(undefined);
  const [stationData, setStationData] = useState<any>(null);
  const [showError, setShowError] = useState<boolean>(false);
  const [showErrorHmlast, setShowErrorHmlast] = useState<boolean>(false);
  const [showErrorType, setShowErrorType] = useState<boolean>(false);
  const [showJamError, setShowJamError] = useState<boolean>(false);
  const [showJamErrorInput, setShowJamErrorInput] = useState<boolean>(false);
  // Ensure flowEnd is a number

  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const [status, setStatus] = useState<number>(1); // Default to 0
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  const [quotaMessage, setQuotaMessage] = useState("");

  const [unitQuota, setUnitQuota] = useState(0);
  const [usedQuota, setUsedQuota] = useState(0);
  const [remainingQuota, setRemainingQuota] = useState(0);
  const [quantity, setQuantity] = useState<number | null>(0);
  const [quantityLast, setQuantityLast] = useState<number | null>(0);
  const [quantityError, setQuantityError] = useState("");
  const [employeeError, setemployeeError] = useState<boolean>(false);
  const [unitQouta, setUnitQouta] = useState(0);
  const [isError, setIsError] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectID] = useState<string | undefined>();
  // const [operatorOptions, setOperatorOptions] = useState<{ id: number; JDE: string; fullname: string; }[]>([]);
  const [hmkmTRX, sethmkmTrx] = useState<number | undefined>(undefined); // HM/KM Transaksi
  const [hmLast, setHmLast] = useState<number>(0); // HM/KM Unit

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
 
  const [station, setOpStation] = useState<string | null>(null)
  const [receipt, setOpReceipt] = useState<number | null>(null)
  const [transfer, setOpTransfer] = useState<string | null>(null)
  const [receiveKpc, setOpReceiveKpc] = useState<number | null>(null)
  const [totalIssued, setTotalIssued] = useState<number | null>(null);
  const [shift, setShift] = useState<string | null>(null);

  const [showErrorIsi, setShowErrorIsi] = useState<boolean>(false);

  const [isiTime, setIsiTime] = useState<string | undefined>(undefined);
  const [selesaiTime, setSelesaiTime] = useState<string | undefined>(undefined);

  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');


  const [qoutaData, setquotaData] = useState<number | null>(null);
  const [modelUnit, setModelUnit] = useState<string>('');
  const [owner, setOwner] = useState<string>('');
  const [qtyLast, setQtyLast] = useState<number>(0);

  const [photoFile, setPhotoFile] = useState<string | null>(null); // For the file

  const [signature, setSignature] = useState<string | null>(null);

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



  const loadDataQouta = useCallback(async (date: string) => {

    try {
      setLoading(true);
      const cachedData = await getDataFromStorage('unitQuota');
      console.log("data Ofline ==", cachedData)
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
    setPhoto: React.Dispatch<React.SetStateAction<string | null>>,
    setBase64: React.Dispatch<React.SetStateAction<string | undefined>>,
    setSignature: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    const file = event.target.files?.[0]; // Get the selected file
  
    if (file) {
      try {
       
        console.log('Selected file:', file);
        
        const uploadFoto = generateFoto(file); 
        console.log('Generated signature:', uploadFoto ); 
        setPhoto(uploadFoto); 

        const fotoSignature = generateSignature(file); 
        console.log('Generated signature:', fotoSignature); 
        setSignature(fotoSignature); 
  
        const base64 = await convertToBase64(file);
        console.log('Base64 representation:', base64); 
  
        
        setBase64(base64);
  
      } catch (error) {
        console.error('Error handling file:', error);
      }
    }
  };
  

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string); 
      };
      reader.onerror = (error) => {
        reject(error); // Reject on error
      };
      reader.readAsDataURL(file); 
    });
  };

  const generateSignature = (file: File): string => {
    // Example: you could generate a hash, timestamp, or use any other method to create a signature
    return `${file.name}_${Date.now()}`;
  };

  const generateFoto = (file: File): string => {
    // Example: you could generate a hash, timestamp, or use any other method to create a signature
    return `${file.name}_${Date.now()}`;
  };


  const handleClose = () => {
    route.push("/dashboard");
  };

  const updateCardDashFlowMeter = (
    flowMeterAkhir: number,
    cardData: any[] = [],
    setDataHome?: Function,
    transactionType?: string // Optional parameter to check the transaction type
  ) => {
    // Check if transactionType is "Receipt" or "Receipt Kpc", skip if so
    if (transactionType === "Receipt" || transactionType === "Receipt Kpc") {
      console.log("Transaction type is Receipt or Receipt Kpc; update skipped.");
      return; // Exit the function without making any updates
    }

    const updatedCardData = cardData.map((item: any) =>
      item.title === "Flow Meter Akhir" ? { ...item, value: flowMeterAkhir } : item
    );

    if (setDataHome) {
      setDataHome(updatedCardData); // Update state if the function is available
    } else {
      console.warn("setDataHome function is not defined.");
    }

    localStorage.setItem("cardDash", JSON.stringify(updatedCardData)); // Persist changes
  };


  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior

    const validQuantity = quantity ?? 0;
    if (isNaN(validQuantity) || validQuantity <= 0) {
      setQuantityError("Qty Issued harus lebih besar dari 0");
      setIsError(true);
      return;
    }

    if (
      !selectedType ||
      !selectedUnit ||
      !operatorOptions ||
      quantity === null ||
      fuelman_id === null ||
      fbr === null ||
      flowMeterAwal === null ||
      flowMeterAkhir === null ||
      !startTime ||
      !endTime
    ) {
      setShowError(true);
      setShowErrorType(true);
      setemployeeError(true);
      setShowJamError(true);
      setShowErrorHmlast(true);
      setShowJamErrorInput(true);
      return;
    }

    const typeTrxValue = typeTrx[0];
    const flow_end: number = Number(calculateFlowEnd(typeTrxValue.name)) || 0;
    const fromDataId = Date.now().toString();

    const lkf_id = await getLatestLkfId();

    const dataPost: DataFormTrx = {
      from_data_id: fromDataId,
      no_unit: selectedUnit!,
      model_unit: model!,
      owner: owner!,
      date_trx: new Date().toISOString(),
      hm_last: Number(hmLast),
      hm_km: Number(hmkmValue),
      qty_last: qtyLast ?? 0,
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
          setIsAlertOpen(true);

          if (quantity > 0) {
            updateLocalStorageQuota(selectedUnit, quantity);
          }

          // Update Flow Meter Akhir in cardDash (online mode)
          const cardDashOnline = JSON.parse(localStorage.getItem("cardDash") || "[]");
          updateCardDashFlowMeter(flow_end, cardDashOnline);

          alert("Transaksi sukses dikirim ke server");
        }
      } else {
        const unitQuota = await getDataFromStorage("unitQuota");
        const newQty = dataPost.qty;

        for (let index = 0; index < unitQuota.length; index++) {
          const element = unitQuota[index];

          if (element.unit_no === dataPost.no_unit) {
            element.used = element.used + newQty;
          }
        }

        const cardDashOffline = JSON.parse(localStorage.getItem("cardDash") || "[]");
        if (Array.isArray(cardDashOffline)) {
          // Update Flow Meter Akhir in cardDash (offline mode)
          updateCardDashFlowMeter(flow_end, cardDashOffline);
        } else {
          console.error("Invalid cardDash data in localStorage");
        }

        dataPost.status = 0;
        await insertNewData(dataPost);
        await insertNewDataHistori(dataPost);
        await saveDataToStorage("unitQuota", unitQuota);
        
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

    } catch (error) {
      console.error("Failed to insert new data:", error);
    }
  };

  const insertNewDataHistori = async (data: DataFormTrx) => {
    try {
      await addDataHistory(data);

    } catch (error) {
      console.error("Failed to insert new data:", error);
    }
  };


  const handleSignatureConfirm = (newSignature: string) => {
    setSignatureBase64(newSignature);

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

  }, [qoutaData]);

  const updateCard = async () => {
    localStorage.removeItem('cardDash')
    const cards = await getHomeByIdLkf(lkfId);
  }


  const updatedKuota = async (date: String) => {
    removeDataFromStorage('unitQuota')
    const cards = await getAllQuota(date);

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
    const value = e.detail.value ? Number(e.detail.value) : null;
  
    if (value !== null && value < hmLast) {
      // Jika nilai lebih kecil dari hmlst, set error
      setShowError(true);
    } else {
      // Jika valid, update hmkmValue
      setShowError(false);
      setHmkmValue(value);
    }
  };
  


  function setBase64(value: SetStateAction<string | undefined>): void {
    throw new Error("Function not implemented.");
  }


  useEffect(() => {
    const fetchJdeOptions = async () => {
      const storedJdeOptions = await getDataFromStorage("allOperator");


      if (storedJdeOptions) {
        try {
          if (typeof storedJdeOptions === 'string') {
            const parsedJdeOptions = JSON.parse(storedJdeOptions);

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

  const validateShiftTime = (startTime: string, endTime: string): boolean => {
    // Convert startTime and endTime to Date objects
    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);
  
    // Shift 1: 06:00 - 18:00
    const shift1Start = new Date("1970-01-01T06:00:00");
    const shift1End = new Date("1970-01-01T18:00:00");
  
    // Shift 2: 18:00 - 06:00 (next day for end time)
    const shift2Start = new Date("1970-01-01T18:00:00");
    const shift2End = new Date("1970-01-02T06:00:00"); // Next day
  
    // Ensure endTime is not smaller than startTime
    if (end < start) {
      return false; // Invalid case: endTime is earlier than startTime
    }
  
    // Check if startTime and endTime fit within either shift
    const isShift1 =
      start >= shift1Start && start <= shift1End && end >= shift1Start && end <= shift1End;
    const isShift2 =
      (start >= shift2Start || start < shift1Start) && // Handles overlap past midnight
      (end >= shift2Start || end < shift1Start);
  
    return isShift1 || isShift2;
  };
  

  


  useEffect(() => {
    const determineShift = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const isDayShift = currentHour >= 6 && currentHour < 18;
      const isNightShift = currentHour >= 18 || currentHour < 6;

      // Set the shift based on the current time
      if (isDayShift) {
        
        setShift('Day');
      } else if (isNightShift) {
        setShift('Night Shift');
      }
    };

    determineShift();
  }, []);


  const handleStartTimeChange = (e: CustomEvent) => {
    const newStartTime = e.detail.value as string;
    setStartTime(newStartTime);
  
    // Get the current hour to determine the current shift
    const now = new Date();
    const currentHour = now.getHours();
    const isDayShift = currentHour >= 6 && currentHour < 18;
    const isNightShift = currentHour >= 18 || currentHour < 6;
  
    // Define the shift start times based on current shift
    const shiftStart = isDayShift ? 6 : 18;  // 06:00 for Day shift, 18:00 for Night shift
    const shiftEnd = isDayShift ? 18 : 6;    // 18:00 for Day shift, 06:00 for Night shift
  
    // Validate start time based on the determined shift
    const newStartHour = new Date(`1970-01-01T${newStartTime}:00`).getHours();
  
    // Check if the new start time falls within the valid shift range
    if (
      (isDayShift && (newStartHour < shiftStart || newStartHour >= shiftEnd)) ||
      (isNightShift && (newStartHour < shiftStart && newStartHour >= shiftEnd))
    ) {
      setShowJamError(true);
      setShowJamErrorInput(true);
    } else {
      setShowJamError(false);
      setShowJamErrorInput(false);
    }
  
    // Proceed with endTime validation
    if (endTime) {
      if (!validateShiftTime(newStartTime, endTime)) {
        setShowJamError(true);
        setShowJamErrorInput(true); // Show error if validation fails
      } else {
        setShowJamError(false);
        setShowJamErrorInput(false); // Hide error if validation is successful
      }
    }
  };
  
  const handleEndTimeChange = (e: CustomEvent) => {
    const newEndTime = e.detail.value as string;
    setEndTime(newEndTime);
  
    // Get the current hour to determine the current shift
    const now = new Date();
    const currentHour = now.getHours();
    const isDayShift = currentHour >= 6 && currentHour < 18;
    const isNightShift = currentHour >= 18 || currentHour < 6;
  
    // Define the shift start and end times based on current shift
    const shiftStart = isDayShift ? 6 : 18;  // 06:00 for Day shift, 18:00 for Night shift
    const shiftEnd = isDayShift ? 18 : 6;    // 18:00 for Day shift, 06:00 for Night shift
  
    // Convert the newEndTime to a Date object to extract the hours
    const newEndDate = new Date(`1970-01-01T${newEndTime}:00`);
    const newEndHour = newEndDate.getHours();
  
    // Validate that the endTime is within the allowed shift time range
    const isEndTimeInShiftRange =
      (isDayShift && newEndHour >= shiftStart && newEndHour < shiftEnd) ||
      (isNightShift && (newEndHour >= shiftStart || newEndHour < shiftEnd));
  
    // Check if endTime is earlier than startTime
    const newStartDate = new Date(`1970-01-01T${startTime}:00`);
    const isEndTimeAfterStartTime = newEndDate >= newStartDate;
  
    // If endTime is not within shift range or endTime is earlier than startTime, show an error
    if (!isEndTimeInShiftRange || !isEndTimeAfterStartTime) {
      setShowJamError(true);
      setShowJamErrorInput(true);
    } else {
      setShowJamError(false);
      setShowJamErrorInput(false);
    }
  };
  

  useEffect(() => {
    const dataFlowDash = localStorage.getItem("cardDash");
    if (dataFlowDash) {
      try {
        const parsedData = JSON.parse(dataFlowDash);
        if (Array.isArray(parsedData)) {
          // Mencari item dengan title "Flow Meter Awal"
          const flowMeterItem = parsedData.find(
            (item: { title: string }) => item.title === "Flow Meter Akhir"
          );
          const flowStockItem = parsedData.find(
            (item: { title: string }) => item.title === "Stock On Hand"
          );
          if (flowMeterItem) {
            setFlowMeterAwal(flowMeterItem.value);
          }
          if (flowStockItem) {
            setStock(flowStockItem.value);
          }
        } else {
          console.error("Parsed data is not an array:", parsedData);
        }
      } catch (error) {
        console.error("Error parsing JSON from localStorage:", error);
      }
    }
  }, []);


  const handleQuantityChange = (e: any) => {
    const inputQuantity = Number(e.detail.value);
    const isIssuedOrTransfer = selectedType?.name === "Issued" || selectedType?.name === "Transfer";
  
    // Reset error states initially
    setQuantityError("");
    setIsError(false);
  
    if (isIssuedOrTransfer) {
      if (isNaN(inputQuantity) || inputQuantity <= 0) {
        setQuantityError("Qty harus lebih besar dari 0.");
        setIsError(true);
        return;
      }
  
      const quota = remainingQuota || 0;
  
      if (typeof selectedUnit === "string" && (selectedUnit.startsWith("LV") || selectedUnit.startsWith("HLV"))) {
        // Validate against remaining quota for specific unit types
        if (inputQuantity > quota) {
          setQuantityError("Qty tidak boleh lebih besar dari sisa kuota.");
          setIsError(true);
          return;
        }
      } else {
        // Validate against stock on hand
        if (inputQuantity > stock) {
          setQuantityError("Qty tidak boleh lebih besar dari Stock On Hand.");
          setIsError(true);
          return;
        }
      }
    } else {
      // Skip stock validation for other transaction types
      console.log("Jenis transaksi tidak memerlukan validasi stok.");
    }
  
    // If all validations pass
    setQuantity(inputQuantity);
  };
  

  useEffect(() => {
    const loadUnitDataQuota = async () => {
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0];
      try {
        let quotaData;

        if (navigator.onLine) {
          quotaData = await fetchQuotaData(formattedDate);
        }
        if (!quotaData || !Array.isArray(quotaData)) {
          console.warn('Online quota data unavailable or failed. Attempting offline data.');
          quotaData = await getDataFromStorage('unitQuota');
        }

        if (quotaData && Array.isArray(quotaData)) {
          let foundUnitQuota = quotaData.find((unit) => unit.unit_no === selectedUnit);

          if (!foundUnitQuota && navigator.onLine) {
            // Check previous day's data if today’s quota is missing and online
            const yesterday = new Date(today);
            // yesterday.setDate(today.getDate() - 1);
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
                setQuotaMessage(`Sisa Kuota ${selectedUnit}: ${remainingQuota} Liter`);

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
      if (typeTrx === "Receipt" || typeTrx === "Receipt KPC") {
        // For "Receipt" or "Receipt KPC", simply return flowMeterAwal
        return flowMeterAwal !== 0 ? flowMeterAwal : "N/A";
      }

      if (typeTrx === "Issued" || typeTrx === "Transfer") {
        // For "Issued" or "Transfer", calculate totalFlowEnd
        const totalFlowEnd = flowMeterAwal + (quantity ?? 0);
        return totalFlowEnd !== 0 ? totalFlowEnd : "N/A";
      }
    }
    // Return empty string if no conditions are met or inputs are invalid
    return "";
  };

  useEffect(() => {
    const calculateFBR = (): number => {
      if (typeof hmkmValue === 'number' && typeof hmLast === 'number' && typeof qtyLast === 'number') {
        const difference = hmkmValue - hmLast;
        console.log('Difference offline/online (hmkmValue - hmLast):', difference);

        if (qtyLast === 0) {
          console.log('qtyLast cannot be zero');
          return 0;
        }

        if (difference > 0) {
          const result = difference / qtyLast;
          console.log('Calculated FBR offline/online:', result);
          return parseFloat(result.toFixed(2));
        } else {
          console.log('Difference is not positive');
        }
      } else {
      
      }
      return 0;
    };

    setFbrResultOf(calculateFBR());

  }, [hmkmValue, hmLast, qtyLast]);


  const filteredUnitOptions = (selectedType &&
    (selectedType.name === 'Receipt' || selectedType.name === 'Receipt KPC' || selectedType.name === 'Transfer'))
    ? unitOptions.filter(unit => unit.unit_no.startsWith("FT") || unit.unit_no.startsWith("TK"))
    : unitOptions;
  useEffect(() => {

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
          console.log("hm", offlineData)


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
  
      setHmLast(0);  

      const offlineData = await fetchLatestHmLast(selectedUnit);

    
      console.log("Fetched offline data:", offlineData);

      
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




  const calculateFBR = (): number => {
    if (typeof hmkmValue === 'number' && typeof hmLast === 'number' && typeof qtyLast === 'number') {
      const difference = hmkmValue - hmLast;
      console.log('Difference (hmLast - hmkm):', difference);

      if (qtyValue === 0) {
        console.log('qtyValue cannot be zero');
        return 0;
      }

      if (difference > 0) {
        const result = difference / qtyLast;
        console.log('Calculated FBR:', result);
        return parseFloat(result.toFixed(2));
      } else {
        console.log('Difference is not positive');
      }
    } else {
     
    }
    return 0;
  };

  // Update FBR result
  useEffect(() => {
    setFbrResult(calculateFBR());
  }, [hmkmValue, hmLast, qtyLast]);

  const showAlert = () => {
    setIsAlertOpen(true);

    // Menambahkan delay 3 detik sebelum menutup alert
    setTimeout(() => {
      setIsAlertOpen(false);
    }, 5000); // 3000ms = 3 detik
  };

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
            <h1>Shift: {shift}</h1>
              <IonRow>
                <IonCol size="8"
                >
                  <div>
                    <IonLabel style={{ fontWeigt: "Bold", fontSize: "16px" }}>
                      Pilih Transaksi
                      <span style={{ color: "red" }}> *</span>
                    </IonLabel>
                    <IonRadioGroup
                      style={{
                        backgroundColor: showErrorType && selectedType === undefined ? "rgba(255, 0, 0, 0.1)" : "transparent", // Apply red background if error
                        padding: "10px", // Ensure the block has padding for visibility
                        borderRadius: "5px",

                      }}
                      className="radio-display"
                      value={selectedType}
                      onIonChange={handleRadioChange}
                      compareWith={compareWith}
                    >
                      {typeTrx.map((type) => (
                        <IonItem style={{ fontWeigt: "500px", fontSize: "20px" }} key={type.id} className="item-no-border" >
                          <IonRadio labelPlacement="end" value={type}>{type.name}</IonRadio>
                        </IonItem>
                      ))}
                    </IonRadioGroup>
                    {showErrorType && selectedType === undefined && (
                      <p style={{ color: "red" }}>* Pilih Jenis Transaksi</p>
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
                  <IonInput
                    style={{ background: "#E8E8E8" }}
                    className="custom-input"
                    type="number"
                    placeholder="Input HM/KM Unit"
                    // value={hmkmLast} // Fallback to hmkmLast
                    value={hmLast || ""}
                    
                    // onIonChange={(e) => setHmLast(Number(e.detail.value))}
                    disabled
                  />

                  {showErrorHmlast && hmkmLast === undefined && (
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
                    value={fbrResult}
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
                    value={flowMeterAwal}
                    placeholder="Input Flow meter awal"
                    disabled
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
                    disabled
                    placeholder=""
                  />

                </IonCol>
              </IonRow>
              <IonRow>

                <IonCol
                  style={{
                    backgroundColor: employeeError ? "rgba(255, 0, 0, 0.1)" : "transparent", 
                    padding: "10px", 
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
                        height: "57px", 
                      }),
                      control: (provided) => ({
                        ...provided,
                        height: "57px", 
                        minHeight: "57px", 
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
                    onIonChange={handleStartTimeChange} 
                    disabled={isFormDisabled}
                    value={startTime}
                  />
                  <IonRow> {showJamError && (
                    <IonLabel style={{ color: 'red', fontSize: '14px', marginTop: '8px' }}>
                      Pengiputan pada jam harus sesuai dengan shift saat ini  !!!
                    </IonLabel>
                  )}</IonRow>
                  
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
                  {showJamErrorInput
                  && startTime && endTime && endTime < startTime && (
                    <p style={{ color: "red" }}>* Jam selesai tidak boleh lebih kecil dari jam mulai</p>
                  )}
                  <IonRow> {showJamError && (
                    <IonLabel style={{ color: 'red', fontSize: '14px', marginTop: '8px' }}>
                      Pengiputan pada jam harus sesuai dengan shift saat ini  !!!
                    </IonLabel>
                  )}</IonRow>
                </IonCol>

              </IonRow>
              <IonRow>
                <IonCol>
                <CameraInput setPhotoPreview={setPhotoPreview} />

                </IonCol>
                <IonCol>
                  <IonCard style={{ height: "160px" }}>
                    <input
                      type="file"
                      accept="image/*"
                      id="signatureInput"
                      style={{ display: "none" }}
                      onChange={(e) => handleFileChange(e, setPhotoFile, setBase64, setSignature)}
                    />
                    <IonButton 
                      color="warning"
                      size="small"
                      onClick={() => setIsSignatureModalOpen(true)}
                      disabled={isFormDisabled}
                    >
                      <IonIcon slot="start" icon={pencilOutline} />
                      Tanda Tangan
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
                  disabled={
                    isError ||
                    quantity === null ||
                    !validateShiftTime(startTime, endTime) ||
                    showJamError
                     // Disable if time validation fails
                  }
                  onClick={(e) => {
                    handlePost(e);
                    showAlert();
                  }}
                  
                  className={`check-button ${isOnline ? "button-save-data" : "button-save-draft"}`}
                >
                  <IonIcon slot="start" icon={saveOutline} />
                  {isOnline ? "Simpan Data" : "Simpan Data Ke Draft"}
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
       <div>
          <IonAlert
            
            isOpen={isAlertOpen}
            header="Pastikan Data Terisi Semua"
            message="Simpan Data "
            buttons={['OK']}
            style={{ width: '400' }} 
          />
     </div>
  
      </IonContent>
    </IonPage>
  );
};
export default FormTRX;


