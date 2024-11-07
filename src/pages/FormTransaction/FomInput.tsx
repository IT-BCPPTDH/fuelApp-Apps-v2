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
import { addDataDashboard, addDataTrxType } from "../../utils/insertData";
import { getUser } from "../../hooks/getAllUser";
import { convertToBase64 } from "../../utils/base64";
import {
  getFbrByUnit,
  getLatestLkfId,
  fetchLatestHmLast
} from "../../utils/getData";
import DynamicAlert from "../../components/Alert";
import { fetchOperatorData, fetchQuotaData, fetchUnitData, fetchUnitLastTrx, getDataFromStorage, removeDataFromStorage } from "../../services/dataService";
import Select, { ActionMeta, SingleValue } from "react-select";
import { getLatestTrx } from "../../utils/getData";
import { getPrevUnitTrx } from "../../hooks/getDataPrev";
import { getAllQuota, getUnitQuotaActive } from "../../hooks/getQoutaUnit";
import { getHomeByIdLkf, getHomeTable} from "../../hooks/getHome";
import { deleteAllDataTransaksi } from "../../utils/delete";
import { getCalculationIssued } from "../../utils/getData";
import CameraInput from "../../components/takeFoto";
import { saveDataToStorage } from "../../services/dataService";

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
  unitNo: string;
  quota: number;
  used?: number;
  issued?: number;
  isActive?: boolean;
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
  const [owner, setOwner] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [unitOptions, setUnitOptions] = useState<
    {
      hm_km: SetStateAction<number | null>;
      qty: SetStateAction<number | null>;
      hm_last: SetStateAction<number | null>;
       id: string;
       unit_no: string;
        brand: string;
         owner: string 
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
  const [qtyLast, setQtyLast] = useState<number | undefined>(undefined); // Qty Last
  // Ensure flowEnd is a number
  const [operatorOptions, setOperatorOptions] = useState<
    { JDE: string; fullname: string }[]
  >([]);


  const [selecTUnit, setSelectUnit] = useState<
  { JDE: string; fullname: string }[]
>([]);



  const [filteredUnits, setFilteredUnits] = useState(unitOptions);

  const [selectedUnit, setSelectedUnit] = useState<string>("");

  const [hmkmValue, setHmkmValue] = useState<number | null>(null);
  const [hmkmLast, setHmKmLast] = useState<number | null>(null);
  const [fbrResult, setFbrResult] = useState<number>(0);
  const [lkfId, setLkfId] = useState<string>('');
  const [qtyValue, setQtyValue] = useState<number | null>(null);
 
  const [hmKm, setHmKm] = useState<string>("");
 // State untuk menyimpan data unit
  // const [noUnit, setNoUnit] = useState<string>(''); // Nilai no_unit yang ingin dipanggil
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isActive, setIsActive] = useState(false);
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
        // const stations = await fetchQuotaData(date);
        // const formattedStations = stations.map((station) => ({
        //   value: station.fuel_station_name,
        //   label: station.fuel_station_name,
        //   site: station.site,
        //   fuel_station_type: station.fuel_station_type,
        // }));
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


  const getTable = async() => {
    try {
      await getHomeTable(lkfId);
    } catch (error) {
      
    }
  };

  useEffect(()=>{
    getTable()
  })

 
  const handlePost = async (e: React.FormEvent) => {
   
    const validQuantity = quantity ?? 0; 
    // Validate the quantity
    if (isNaN(validQuantity) || validQuantity <= 0) {
      setQuantityError("Qty Issued harus lebih besar dari 0");
      setIsError(true);
      return; // Stop the save action if quantity is invalid
    }
    // Validate all form fields
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
      setemployeeError(true);
      return;
    }
  
    const typeTrxValue = typeTrx[0];
    const flow_end: number = Number(calculateFlowEnd(typeTrxValue.name)) || 0;
  
    // Prepare form data
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
      qty_last: quantity ?? 0, // Default to 0 if quantity is undefined
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
      status: status ?? 0, // Default to 0 (pending) if status is undefined
      date: "",
      start: startTime,
      end: endTime,
    };
  
    try {
      if (isOnline) {
        // If online, try to post the transaction to the server
        const response = await postTransaksi(dataPost);
        await insertNewData(dataPost);
        updateCard();
        getTable();
        // updatedKuota()
  
        const responseStatus = response.status;
  
        if (responseStatus === 200) {
          // If the response is successful (200), set status to "sent" (1)
          dataPost.status = 1;
          await insertNewData(dataPost); // Save the transaction locally
          alert("Transaksi Succes dikirim ke server");
          if (quantity > 0) {
            updateLocalStorageQuota(selectedUnit, quantity); // Update quota if necessary
          }
        }
      } else {
        // If offline, save data locally
        dataPost.status = 0;
        await insertNewData(dataPost);
        alert("Trasaksi tersimpan pada local");
      }
  
      // After successful operation, navigate to the dashboard
      route.push("/dashboard");
    } catch (error) {
      console.error("Error occurred while posting data:", error);
      setModalMessage("Error occurred while posting data: " + error);
      setErrorModalOpen(true);
    }
  };
  
  const updateLocalStorageQuota = async (unitNo: string, issuedQuantity: number) => {
    const unitQuota = await getDataFromStorage("unitQouta");
    if (unitQuota) {
      const parsedData = JSON.parse(unitQuota);
      const updatedData = parsedData.map((unit: { unitNo: string; quota: number; used: number; }) => {
        if (unit.unitNo === unitNo) {
          return {
            ...unit,
            used: unit.used + issuedQuantity, // Update the used quantity
            remaining: unit.quota - (unit.used + issuedQuantity) // Update remaining quota
          };
        }
        return unit;
      });
      localStorage.setItem("unitQouta", JSON.stringify(updatedData));
    }
  };

  
  useEffect(() => {
    const fetchData = async () => {
      const unitQuota = await getDataFromStorage("unitQouta");
      console.log("!!!!!!!!!", unitQouta)
      if (unitQuota) {
        const parsedData = JSON.parse(unitQuota);
        const currentUnitQuota = parsedData.find((unit: { unitNo: string | undefined; }) => unit.unitNo === selectedUnit);
  
        if (currentUnitQuota) {
          setUnitQuota(currentUnitQuota.quota);
          setUsedQuota(currentUnitQuota.used);
          setRemainingQuota(currentUnitQuota.quota - currentUnitQuota.used); 
        } else {
          setUnitQuota(0);
          setUsedQuota(0);
          setRemainingQuota(0);
        }
      }
    };
  
    fetchData();
  }, [selectedUnit]);


  const insertNewData = async (data: DataFormTrx) => {
    try {
      await addDataTrxType(data);
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
    if (hmkmLast !== null && value < hmkmLast) {
      setShowError(true);
    } else {
      setShowError(false);
    }
    setHmkmValue(value);
  };

  const handleHmLastChange = (e: CustomEvent) => {
    const newValue = Number(e.detail.value);
    if (hmkmLast !== null && newValue < hmkmLast) {
      setShowError(true);
    } else {
      setShowError(false);
    }
    setHmLast(newValue);
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
            // setModel(latestUnitData.model_unit);
            // setOwner(latestUnitData.owner);
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

  
  const loadUnitDataQuota = async () => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];

    try {
        // Coba untuk mendapatkan data quota yang disimpan di local storage
        const cachedData = await getDataFromStorage('unitQuota');
        let quotaData = cachedData;

        if (!quotaData) {
            // Jika tidak ada data cached, ambil dari server
            quotaData = await fetchQuotaData(formattedDate);
            if (quotaData && Array.isArray(quotaData)) {
                // Simpan data yang diambil ke local storage untuk digunakan offline
                await saveDataToStorage('unitQuota', quotaData);
            }
        }

        if (quotaData && Array.isArray(quotaData)) {
            let foundUnitQuota = quotaData.find((unit) => unit.unitNo === selectedUnit);

            if (!foundUnitQuota) {
                const yesterday = new Date(today);
                yesterday.setDate(today.getDate() - 1);
                const formattedYesterday = yesterday.toISOString().split('T')[0];

                const previousQuotaData = await fetchQuotaData(formattedYesterday);
                foundUnitQuota = previousQuotaData.find((unit) => unit.unitNo === selectedUnit);
            }

            if (foundUnitQuota) {
                setCurrentUnitQuota(foundUnitQuota);
                const totalQuota = foundUnitQuota.quota;
                const usedQuota = foundUnitQuota.used || 0;
                const additionalQuota = foundUnitQuota.additional || 0;
                const remainingQuota = totalQuota + additionalQuota - usedQuota;

                if (foundUnitQuota.isActive) {
                    setUnitQuota(totalQuota);
                    setRemainingQuota(remainingQuota);

                    if (remainingQuota > 0) {
                        setQuotaMessage(`Sisa Kuota ${selectedUnit}: ${remainingQuota} Liter`);
                    } else {
                        setQuotaMessage(`Sisa Kuota ${selectedUnit}: 0 Liter`);
                    }

                    const issuedAmount = foundUnitQuota.issued || 0;
                    if (issuedAmount > remainingQuota) {
                        setQuotaMessage(`Error: Issue Melebihi Kouta ${selectedUnit}`);
                    }
                } else {
                    setUnitQuota(0);
                    setRemainingQuota(0);
                    setQuotaMessage("Pembatasan Kuota Dinonaktifkan.");
                }
            } else {
                setUnitQuota(0);
                setRemainingQuota(0);
                setQuotaMessage(`Pembatasan kuota dinonaktifkan : ${selectedUnit}`);
            }
        } else {
            console.error('No quota data found for the specified date');
        }
    } catch (error) {
        console.error('Error fetching quota data:', error);
    }
};

useEffect(() => {
    loadUnitDataQuota();
}, [selectedUnit]);


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

  // Validate if quantity is greater than 0 for all transaction types
  if (isNaN(inputQuantity) || inputQuantity <= 0) {
    setQuantityError("Qty Issued harus lebih besar dari 0");
    setIsError(true);
    return; // Keluar jika tidak valid
  }

  const isReceiptTransaction = typeTrx.some(
    (trx) => trx.name === "Receipt" || trx.name === "Receipt KPC" || trx.name === "Transfer"
  );

  if (isReceiptTransaction) {
    // Jika jenis transaksi adalah 'receipt' atau 'receipt kpc', atur jumlah tanpa validasi sisa kouta atau stock
    setQuantity(inputQuantity);
    setQuantityError(""); // Kosongkan pesan error
    setIsError(false); // Tidak ada error
    return;
  }

  // Validasi untuk unit yang dimulai dengan LV atau HLV jika jenis transaksi adalah issued atau transfer
  if (typeof selectedUnit === "string" && (selectedUnit.startsWith("LV") || selectedUnit.startsWith("HLV"))) {
    if (inputQuantity > remainingQuota) {
      setQuantityError("Qty Issued tidak boleh lebih besar dari sisa kouta. Mohon hubungi admin agar bisa mengisi kembali !!");
      setIsError(true);
      return; // Keluar jika melebihi sisa kouta
    }
  } else {
    // Cek Qty Issued tidak boleh lebih besar dari Stock On Hand
    if (inputQuantity > stock) {
      setQuantityError("Qty Issued tidak boleh lebih besar dari Stock On Hand.");
      setIsError(true);
      return; // Keluar jika melebihi Stock On Hand
    }
  }

  // Jika semua validasi berhasil, perbarui state
  setQuantity(inputQuantity); // Set jumlah yang valid
  setQuantityError(""); // Kosongkan pesan error
  setIsError(false); // Tidak ada error
};


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




// const handleUnitChange = async (
//   newValue: SingleValue<{ value: string; label: string }>, 
//   actionMeta: ActionMeta<{ value: string; label: string }>
// ) => {
//   if (newValue) {
//     const unitValue = newValue.value; 
//     setSelectedUnit(unitValue); 

//     if (navigator.onLine) {
//       const selectedUnitOption = unitOptions.find(
//         (unit) => unit.unit_no === unitValue
//       );

//       if (selectedUnitOption) {
//         setModel(selectedUnitOption.brand); 
//         setOwner(selectedUnitOption.owner); 
//         setHmkmValue(selectedUnitOption.hm_km);
//         setHmKmLast(selectedUnitOption.hm_last);
//         setQtyValue(selectedUnitOption.qty); 

//         const newKoutaLimit = unitValue.startsWith("LV") || unitValue.startsWith("HLV") ? unitQouta : 0;
//         setKoutaLimit(newKoutaLimit); 

//         setShowError(
//           unitValue.startsWith("LV") || 
//           (unitValue.startsWith("HLV") && newKoutaLimit < unitQouta)
//         );
//       } else {
//         console.warn(`Unit with value ${unitValue} not found in unitOptions.`);
//       }
//     } else {
//       // Offline: Retrieve data from IndexedDB
//       const { hm_last, model_unit, owner, qty_last} = await fetchLatestHmLast(unitValue);

//       if (hm_last !== undefined) {
//         setHmKmLast(hm_last);
//         console.log("Offline: Using latest 'hm_last' value from IndexedDB:", hm_last);
//       } else {
//         console.log("No valid 'hm_last' data found in IndexedDB or an error occurred.");
//       }

//       // Set model and owner from offline data
//       setModel(model_unit || "Offline Model");
//       setOwner(owner || "Offline Owner");
     
//       setKoutaLimit(0); 
//       setShowError(false);
//     }
//   }
// };


// const fetchLatestHmLast = async (selectedUnit: string) => {
//   const hmLastValue = await getLatestHmLast(selectedUnit);

//   if (hmLastValue !== undefined) {
//     console.log("Latest 'hm_last' value:", hmLastValue);
//     // Proceed with using hmLastValue as needed
//   } else {
//     console.log("No valid 'hm_last' data found or an error occurred.");
//   }
// };

// // Call the function with the desired unit
// fetchLatestHmLast("EX6008");

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
//       console.warn(`Unit dengan nilai ${unitValue} tidak ditemukan di unitOptions.`);
//     }
//   }
// };
const handleUnitChange = async (
  newValue: SingleValue<{ value: string; label: string }>, 
  actionMeta: ActionMeta<{ value: string; label: string }>
) => {
  if (newValue) {
    const unitValue = newValue.value; 
    setSelectedUnit(unitValue); // Set the selected unit

    if (navigator.onLine) {
      const selectedUnitOption = unitOptions.find(
        (unit) => unit.unit_no === unitValue
      );

      if (selectedUnitOption) {
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
        console.warn(`Unit with value ${unitValue} not found in unitOptions.`);
      }
    } else {
      // Offline: Retrieve data from IndexedDB
      const { hm_last, model_unit, owner, qty_last } = await fetchLatestHmLast(unitValue);

      if (hm_last !== undefined) {
        setHmKmLast(hm_last);
        console.log("Offline: Using latest 'hm_last' value from IndexedDB:", hm_last);
      } else {
        console.log("No valid 'hm_last' data found in IndexedDB or an error occurred.");
      }

      // Use qty_last for FBR calculation or other purposes
      if (qty_last !== undefined) {
        // Example: Set qty value or perform calculation here
        setQtyValue(qty_last); // Or any other logic related to qty_last
      }

      // Set model and owner from offline data
      setModel(model_unit || "Offline Model");
      setOwner(owner || "Offline Owner");
      setKoutaLimit(0); 
      setShowError(false);
    }
  }
};

const filteredUnitOptions = (selectedType && 
  (selectedType.name === 'Receipt' || selectedType.name === 'Receipt KPC' || selectedType.name === 'Transfer')) 
? unitOptions.filter(unit => unit.unit_no.startsWith("FT") || unit.unit_no.startsWith("TK"))
: unitOptions;

useEffect(() => {
  console.log('useEffect triggered with values:', { hmkmValue, hmkmLast, qtyValue });
  const calculateFBR = (): number => {
      if (typeof hmkmValue === 'number' && typeof  hmkmLast === 'number' && typeof qtyValue === 'number') {
          const difference =  hmkmValue  - hmkmLast ;
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
          console.log('Invalid input types:', { hmkmValue,  hmkmLast, qtyValue });
      }
      return 0;
  };

  setFbrResult(calculateFBR());
}, [hmkmValue, hmLast, qtyValue]);
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
         {currentUnitQuota?.isActive && (
            <IonRow>
                <IonCol>
                    <IonItemDivider style={{ border: "solid", color: "#8AAD43", width: "500px" }}>
                        <IonLabel style={{ display: "flex" }}>
                            <IonImg style={{ width: "40px" }} src="Glyph.png" alt="Logo DH" />
                            <IonTitle style={{ color: quotaMessage.includes("0 Liter") ? "red" : "green" }}>
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
                  <IonInput
                    style={{ background: "#E8E8E8" }}
                    className="custom-input"
                    type="number"
                    placeholder="Input HM/KM Unit"
                    value={hmkmLast|| ""
                     }
                     disabled={isFormDisabled}
                     onIonChange={(e) => setHmKmLast(Number(e.detail.value))}
                    onKeyDown={handleKeyDown}
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

                  {/* Display error if the field is empty */}
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
                      value={fbrResult} // Gunakan hasil perhitungan dari state
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
                  onClick={(e) => handlePost(e)}
                  className={`check-button ${isOnline ? "button-save-data" : "button-save-draft"}`}
                  disabled={showError}
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



function presentToast(arg0: string, arg1: number) {
  throw new Error("Function not implemented.");
}

