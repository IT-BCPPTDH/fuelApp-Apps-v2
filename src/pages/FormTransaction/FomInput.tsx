import React, {
  useState,
  useEffect,
  Key,
  SetStateAction,
  useRef,
  useCallback,
} from "react";
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
  useIonToast,
  IonAlert,
  IonLoading,
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
import { addDataHistory, addDataTrxType } from "../../utils/insertData";
import { fetchLatestHmLast, getLatestLkfId } from "../../utils/getData";
import {
  fetchOperatorData,
  fetchQuotaData,
  fetchUnitData,
  getDataFromStorage,
  removeDataFromStorage,
} from "../../services/dataService";
import Select, { ActionMeta, SingleValue } from "react-select";
import { getLatestTrx } from "../../utils/getData";
import { getPrevUnitTrx } from "../../hooks/getDataPrev";
import { getAllQuota } from "../../hooks/getQoutaUnit";
import { getHomeByIdLkf, getHomeTable } from "../../hooks/getHome";

import { deleteAllDataTransaksi } from "../../utils/delete";
import { getCalculationIssued } from "../../utils/getData";


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
      model_unit: string;
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

  const [fotoBase64, setFotoBase64] = useState<string | undefined>(undefined);
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
  const [photoPreview, setPhotoPreview] = useState<string | undefined>(
    undefined
  );
  const [sondingEnd, setSondingEnd] = useState<number | undefined>(undefined);
  const [Refrence, setRefrence] = useState<number | undefined>(undefined);
  const [stationData, setStationData] = useState<any>(null);
  const [showError, setShowError] = useState<boolean>(false);
  const [showErrorHmlast, setShowErrorHmlast] = useState<boolean>(false);
  const [showErrorType, setShowErrorType] = useState<boolean>(false);
  const [showJamError, setShowJamError] = useState<boolean>(false);
  const [showJamErrorInput, setShowJamErrorInput] = useState<boolean>(false);
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
  const [checkUnit, setCheckUnit] = useState<boolean>(false)
  const [quantity, setQuantity] = useState<number | null>(0);
  const [quantityLast, setQuantityLast] = useState<number | null>(0);
  const [quantityError, setQuantityError] = useState("");
  const [employeeError, setemployeeError] = useState<boolean>(false);
  const [unitQouta, setUnitQouta] = useState(0);
  const [isError, setIsError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedId, setSelectID] = useState<string | undefined>();
  const [hmkmTRX, sethmkmTrx] = useState<number | undefined>(undefined); // HM/KM Transaksi
  const [hmLast, setHmLast] = useState<number>(0); // HM/KM Unit
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
  const [lkfId, setLkfId] = useState<string>("");
  const [qtyValue, setQtyValue] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [is_active, setis_active] = useState(false);
  // const [quotaData, setQuotaData] = useState(null);
  const [currentUnitQuota, setCurrentUnitQuota] = useState<UnitQuota | null>(
    null
  );
  const [totalQuantityIssued, setTotalQuantityIssued] = useState<number>(0);
  const [opDip, setOpDip] = useState<number | null>(null);
  const [station, setOpStation] = useState<string | null>(null);
  const [receipt, setOpReceipt] = useState<number | null>(null);
  const [transfer, setOpTransfer] = useState<string | null>(null);
  const [receiveKpc, setOpReceiveKpc] = useState<number | null>(null);
  const [totalIssued, setTotalIssued] = useState<number | null>(null);
  const [shift, setShift] = useState<string | null>(null);
  const [showErrorIsi, setShowErrorIsi] = useState<boolean>(false);
  const [isiTime, setIsiTime] = useState<string | undefined>(undefined);
  const [selesaiTime, setSelesaiTime] = useState<string | undefined>(undefined);
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [qoutaData, setquotaData] = useState<number | null>(null);
  const [modelUnit, setModelUnit] = useState<string>("");
  const [owner, setOwner] = useState<string>("");
  const [qtyLast, setQty] = useState<number>(0);
  const [photoFile, setPhotoFile] = useState<string | null>(null); // For the file
  const [signature, setSignature] = useState<string | null>(null);
  const [latestDate, setLatestDate] = useState<string>("");
  const [tanggalTransaksi, setTanggalTransaksi] = useState<string | null>(null);
  const [stock, setStock] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setStatus(1);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setStatus(0);
    };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const loadDataQouta = useCallback(async (date: string) => {
    try {
      setLoading(true);
      const cachedData = await getDataFromStorage("unitQuota");
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
      }
    } catch (err) {
      console.error("Error loading station data:", err);
    } finally {
      setLoading(false);
      loadDataQouta(date);
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setStatus(1);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setStatus(0);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
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
        const uploadFoto = generateFoto(file);
        setPhoto(uploadFoto);
        const fotoSignature = generateSignature(file);
        setSignature(fotoSignature);
        const base64 = await convertToBase64(file);
        setBase64(base64);
      } catch (error) {
        console.error("Error handling file:", error);
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
    return `${file.name}_${Date.now()}`;
  };

  const generateFoto = (file: File): string => {
    return `${file.name}_${Date.now()}`;
  };

  const handleClose = () => {
    route.push("/dashboard");
  };

  const updateCardDashFlowMeter = (
    flowMeterAkhir: number,
    cardData: any[] = [],
  ) => {
    // if (transactionType === "Receipt" || transactionType === "Receipt Kpc") {
    //   return;
    // }
    const updatedCardData = cardData.map((item: any) =>
      item.title === "Flow Meter Akhir"
        ? { ...item, value: flowMeterAkhir }
        : item
    );

    // if (setDataHome) {
    //   setDataHome(updatedCardData);
    // } else {
    //   console.warn("setDataHome function is not defined.");
    // }

    localStorage.setItem("cardDash", JSON.stringify(updatedCardData));
  };

  // useEffect(() => {
  //   const savedDate = localStorage.getItem("tanggalTransaksi");
  //   if (savedDate) {
  //     setTanggalTransaksi(new Date(savedDate).toLocaleDateString("en-GB"));
  //   }
  // }, []);

  const calculateFlowEnd = (typeTrx: string): number | string => {
    if (typeTrx === "Receipt" || typeTrx === "Receipt KPC") {
      return flowMeterAwal ?? 0;
    }

    if (flowMeterAwal !== undefined && quantity !== undefined) {
      if (typeTrx === "Issued" || typeTrx === "Transfer") {
        const totalFlowEnd = flowMeterAwal + (quantity ?? 0);
        return totalFlowEnd !== 0 ? totalFlowEnd : "N/A";
      }
    }

    return "N/A";
  };

  const handlePost = async () => {
    if (isSubmitting) {
      return;
    }
    setIsSubmitting(true);
    setLoading(true);

    try {
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
        // setShowErrorHmlast(true);
        setShowJamErrorInput(true);
        return;
      }
      
      const typeTrxValue = selectedType?.name;
      let flow_end: number = 0;
      if (typeTrxValue === "Receipt" || typeTrxValue === "Receipt KPC") {
        flow_end = flowMeterAwal ?? 0;
      } else {
        flow_end = Number(calculateFlowEnd(typeTrxValue)) || 0;
      }
      const fromDataId = Date.now().toString();
      const lkf_id = await getLatestLkfId();

      let latestDataDateFormatted = "";
      const savedDate = await getDataFromStorage("openingSonding");
      if (savedDate.date) {
        const transactionDate = new Date(savedDate.date);
        if (!isNaN(transactionDate.getTime())) {
          transactionDate.setHours(transactionDate.getHours() + 12);
          latestDataDateFormatted = transactionDate.toISOString();
        } else {
          console.error("Saved date is invalid:", savedDate.date);
          latestDataDateFormatted = "Invalid Date";
        }
      } else {
        console.error(
          "No saved date available in localStorage for 'tanggalTransaksi'"
        );
        latestDataDateFormatted = "No Date Available";
      }
      
      const dataPost: DataFormTrx = {
        from_data_id: fromDataId,
        no_unit: selectedUnit!,
        model_unit: model!,
        owner: owner!,
        date_trx: latestDataDateFormatted,
        hm_last: Number(hmLast),
        hm_km: Number(hmkmValue),
        qty_last: qtyLast ?? 0,
        qty: quantity,
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
        status: 0, // Always offline for now
        date: Date.now().toString(),
        start: startTime,
        end: endTime,
      };

      const unitQuota = await getDataFromStorage("unitQuota");
      const newQty = dataPost.qty;

      if (unitQuota && Array.isArray(unitQuota)) {
        for (let index = 0; index < unitQuota.length; index++) {
          const element = unitQuota[index];
          if (element.unit_no === dataPost.no_unit) {
            updateQuota(element.id, newQty);
            element.used = element.used + newQty;
          }
        }
        await saveDataToStorage("unitQuota", unitQuota);
      }

      const cardDashOffline = JSON.parse(
        localStorage.getItem("cardDash") || "[]"
      );
      if (Array.isArray(cardDashOffline)) {
        updateCardDashFlowMeter(flow_end, cardDashOffline);
      }

      await insertNewData(dataPost);
      await insertNewDataHistori(dataPost);

      route.push("/dashboard");
    } catch (error) {
      console.error("Error occurred while posting data:", error);
      setModalMessage("Error occurred while posting data: " + error);
      setErrorModalOpen(true);
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const updateLocalStorageQuota = async (
    unit_no: string,
    issuedQuantity: number
  ) => {
    const unitQuota = await getDataFromStorage("unitQouta");
    if (unitQuota) {
      const parsedData = JSON.parse(unitQuota);
      const updatedData = parsedData.map(
        (unit: { unit_no: string; quota: number; used: number, additional:number }) => {
          if (unit.unit_no === unit_no) {
            const newUsed = unit.used + issuedQuantity;
            return {
              ...unit,
              used: newUsed,
              remainingQuota: unit.quota + unit.additional - newUsed,
            };
          }
          return unit;
        }
      );
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
      const cachedUnitData = await getDataFromStorage("allUnit");
      if (cachedUnitData) {
        setUnitOptions(cachedUnitData);
      } else {
        const units = await fetchUnitData();
        setUnitOptions(units);
      }
    };

    loadUnitData();
  }, [loading]);

  useEffect(() => {
    const loadOperatorData = async () => {
      const cachedData = await getDataFromStorage("allOperator");
      if (cachedData) {
        setOperatorOptions(cachedData);
      } else {
        const resultData = await fetchOperatorData();
        setOperatorOptions(resultData);
      }
    };

    loadOperatorData();
  }, []);

  useEffect(() => {}, [operatorOptions]);

  // useEffect(() => {
  //   const loadQoutaData = async () => {
  //     const cachedData = await getDataFromStorage("unitQouta");
  //     if (cachedData) {
  //       setQuotaData(cachedData);
  //     } else {
  //     }
  //   };

  //   loadQoutaData();
  // }, []);

  useEffect(() => {}, [qoutaData]);

  const updateCard = async () => {
    localStorage.removeItem("cardDash");
    const cards = await getHomeByIdLkf(lkfId);
  };

  const updatedKuota = async (date: String) => {
    removeDataFromStorage("unitQuota");
    const cards = await getAllQuota(date);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLIonInputElement>) => {
    if (e.nativeEvent.key === "Enter") {
      e.preventDefault();
      if (input1Ref.current) {
        input2Ref.current?.setFocus();
      }
    }
  };

  const handleHmkmUnitChange = (e: CustomEvent) => {
    const value = e.detail.value ? Number(e.detail.value) : null;
    console.log(value , hmLast)
    if (value !== null && value < hmLast) {
      setShowErrorHmlast(true);
    } else {
      // Jika valid, update hmkmValue
      setShowErrorHmlast(false);
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
          if (typeof storedJdeOptions === "string") {
            const parsedJdeOptions = JSON.parse(storedJdeOptions);
            setJdeOptions(parsedJdeOptions);
          } else {
            setJdeOptions([]);
          }
        } catch (error) {
          console.error(
            "Failed to parse JDE options from local storage",
            error
          );
          setJdeOptions([]);
        }
      } else {
        // console.log("No JDE options found in local storage");
        setJdeOptions([]);
      }
    };

    fetchJdeOptions();
  }, []);

  const handleChangeEmployeeId = (
    newValue: SingleValue<{ value: string; label: string }>,
    actionMeta: ActionMeta<{ value: string; label: string }>
  ) => {
    setemployeeError(false)
    const selectedValue = newValue?.value?.trim() || "";
    if (!operatorOptions || operatorOptions.length === 0) {
      console.warn("Operator options are empty. Cannot find matching option.");
      return;
    }
    const selectedJdeOption = operatorOptions.find(
      (operator) => String(operator.JDE).trim() === String(selectedValue).trim()
    );
    if (selectedJdeOption) {
      setFullName(selectedJdeOption.fullname);
      setFuelmanId(selectedValue);
    } else {
      setFullName("");
      setFuelmanId("");
    }
  };

  const validateShiftTime = async (startTime: string, endTime: string) => {
    let data:any = await getDataFromStorage('openingSonding')
    if(data){
      data = JSON.parse(data)
    }
    // Convert startTime and endTime to Date objects
    let start = new Date(`1970-01-01T${startTime}:00`);
    let end = new Date(`1970-01-01T${endTime}:00`);
    // console.log(11,startTime)
    if(+endTime.split(':')[0] >= 0 && +endTime.split(':')[0] <= 6){
      // console.log('ih')
      end = new Date(`1970-01-02T${endTime}:00`);
    }
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
      start >= shift1Start &&
      start <= shift1End &&
      end >= shift1Start &&
      end <= shift1End;
    const isShift2 =
      (start >= shift2Start || start < shift1Start) && // Handles overlap past midnight
      (end >= shift2Start || end < shift1Start);
    return isShift1 || isShift2;
  };

  useEffect(() => {
    const determineShift = async () => {
      let data = await getDataFromStorage("openingSonding");
      
      if (data.shift) {
        setShift(data.shift);
      }
    };
    determineShift();
  }, [checkUnit]);

  const handleStartTimeChange = async (e: CustomEvent) => {
    const newStartTime = e.detail.value as string;
    setStartTime(newStartTime);
    // const now = new Date();
    // const currentHour = now.getHours();
    let data = await getDataFromStorage("openingSonding");
    // const isDayShift = shift >= 6 && currentHour < 18;
    // const isNightShift = currentHour >= 18 || currentHour < 6;
    // Define the shift start times based on current shift
    const shiftStart = data.shift === 'Day' ? 6 : 18; // 06:00 for Day shift, 18:00 for Night shift
    const shiftEnd = data.shift === 'Night' ? 6 : 18; // 18:00 for Day shift, 06:00 for Night shift

    // Validate start time based on the determined shift
    const newStartHour = new Date(`1970-01-01T${newStartTime}:00`).getHours();

    // Check if the new start time falls within the valid shift range
    // console.log('start',newStartHour,newStartHour >= 18 && newStartHour < 24 && newStartHour <=  6 && newStartHour >= 0)
    if (
      (data.shift === 'Day' && (newStartHour >= shiftStart || newStartHour < shiftEnd)) ||
      (data.shift === "Night" && newStartHour >= 18 && newStartHour < 24 || newStartHour <=  6)
    ) {
      setShowJamError(false);
      setShowJamErrorInput(false);
    } else {
      
      setShowJamError(true);
      setShowJamErrorInput(true);
    }

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

  const handleEndTimeChange = async (e: CustomEvent) => {
    const newEndTime = e.detail.value as string;
    setEndTime(newEndTime);

    let data = await getDataFromStorage("openingSonding");
    // Get the current hour to determine the current shift
    // const now = new Date();
    // const currentHour = now.getHours();
    // const isDayShift = currentHour >= 6 && currentHour < 18;
    // const isNightShift = currentHour >= 18 || currentHour < 6;

    // Define the shift start and end times based on current shift
    const shiftStart = data.shift === 'Day' ? 6 : 18; // 06:00 for Day shift, 18:00 for Night shift
    const shiftEnd = data.shift === 'Night' ? 6 : 18; // 18:00 for Day shift, 06:00 for Night shift

    // Convert the newEndTime to a Date object to extract the hours
    const newEndDate = new Date(`1970-01-01T${newEndTime}:00`);
    const newEndHour = newEndDate.getHours();

    // Validate that the endTime is within the allowed shift time range
    
    const isEndTimeInShiftRange =
      (data.shift === 'Day'  && newEndHour >= shiftStart && newEndHour < shiftEnd) ||
      (data.shift === 'Night' && newEndHour >= 18 && newEndHour < 24 || newEndHour <=  6);

    // Check if endTime is earlier than startTime
    let newStartDate = new Date()
    let end = newEndDate
    // console.log('okok',+startTime.split(':')[0])
    if(data.shift === 'Night'){
      if(+startTime.split(':')[0] >= 0 && +startTime.split(':')[0] <= 6){
        console.log(1)
        newStartDate = new Date(`1970-01-01T${startTime}:00`);
        end = newEndDate
      }else if(newEndHour >=0 && newEndHour < 6){
        console.log(2)
        newStartDate = new Date(`1970-01-01T${startTime}:00`);
        end = new Date(`1970-01-02T${newEndHour < 10? "0"+newEndHour :newEndHour}:00`);
      }else{
        // console.log(4)
        newStartDate = new Date(`1970-01-01T${startTime}:00`);
        end = newEndDate
      }
    }else{
      // console.log('okok2',newEndHour)
      console.log(2)
      if(newEndHour >= shiftStart && newEndHour < shiftEnd){
        newStartDate = new Date(`1970-01-01T${startTime}:00`);
        end = newEndDate
      }
    }
    // console.log('end',end,newStartDate,end >= newStartDate)
    const isEndTimeAfterStartTime = end >= newStartDate;

    // If endTime is not within shift range or endTime is earlier than startTime, show an error
    // console.log(0,isEndTimeInShiftRange,isEndTimeAfterStartTime)
    if (!isEndTimeInShiftRange || !isEndTimeAfterStartTime) {
      // console.log(111)
      setShowJamError(true);
      setShowJamErrorInput(true);
    } else {
      // console.log(222)
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

  const updateQuota = async (id:String,used:Number) =>{
    const quotaUpdate = await getDataFromStorage("quotaUpdate");
    let data =[]
    if(quotaUpdate){
      data = [...quotaUpdate]
      data.push({
        id:id,
        used:used,
        status:'pending'
      })
    }else{
      data.push({
        id:id,
        used:used,
        status:'pending'
      })
    }
    // console.log("quota",data)
    await saveDataToStorage("quotaUpdate", data);
  }

  const handleQuantityChange = (e: any) => {
    const inputQuantity = Number(e.detail.value);
    const isIssuedOrTransfer =
      selectedType?.name === "Issued" || selectedType?.name === "Transfer";

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
      console.log(0,checkUnit)
      if (
        checkUnit
      ) {
        // console.log(1)
        if (inputQuantity > quota) {
          console.log(2)
          setQuantityError("Qty tidak boleh lebih besar dari sisa kuota.");
          setIsError(true);
          return;
        }
      } else {
        if (inputQuantity > stock) {
          // console.log(3)
          setQuantityError("Qty tidak boleh lebih besar dari Stock On Hand.");
          setIsError(true);
          return;
        }
      }
    }
    setQuantity(inputQuantity);
  };


  const filteredUnitOptions =
    selectedType &&
    (selectedType.name === "Receipt" ||
      selectedType.name === "Receipt KPC" ||
      selectedType.name === "Transfer")
      ? unitOptions.filter(
          (unit) =>
            unit.unit_no.startsWith("FT") || unit.unit_no.startsWith("TK")
        )
      : unitOptions;
  useEffect(() => {}, [hmkmLast]);

  const handleUnitChange = async (
    newValue: SingleValue<{ value: string; label: string }>,
    actionMeta: ActionMeta<{ value: string; label: string }>
  ) => {
    const cachedData = await getDataFromStorage("unitQuota");
    if (newValue) {
      const unitValue = newValue.value;
      setSelectedUnit(unitValue);
      const selectedUnitOption = unitOptions.find(
        (unit) => unit.unit_no === unitValue
      );

      let quota = cachedData?.find((v:any) => v.unit_no === unitValue)

      if(quota){
        setCheckUnit(true)
        setRemainingQuota(quota.quota + quota.additional - quota.used)
      }else{
        setCheckUnit(false)
      }


      if (selectedUnitOption) {
        setModel(selectedUnitOption.brand);
        setOwner(selectedUnitOption.owner);
        setHmkmValue(selectedUnitOption.hm_km);
        setHmKmLast(selectedUnitOption.hm_last);
        setQtyValue(selectedUnitOption.qty);
        // const newKoutaLimit =
        //   unitValue.startsWith("LV") || unitValue.startsWith("HLV")
        //     ? unitQouta
        //     : 0;
        // setKoutaLimit(newKoutaLimit);
        // setShowError(
        //   unitValue.startsWith("LV") ||
        //     (unitValue.startsWith("HLV") && newKoutaLimit < unitQouta)
        // );
      } else {
        try {
          const offlineData = await fetchLatestHmLast(unitValue);
          const offlineHM = await getDataFromStorage("lastTrx");
          const hmKmValues = offlineHM.map(
            (item: { hm_km: number }) => item.hm_km
          );
          if (offlineData.hm_km !== undefined) {
            setHmKmLast(offlineData.hm_km); // Set hm_km from offline data
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

        console.warn(
          `Unit with value ${unitValue} was not found in unitOptions.`
        );
      }
    }
  };

  // useEffect(() => {
  //   const calculateFBR = (): number => {
  //     if (typeof hmkmValue === 'number' && typeof hmLast === 'number' && typeof qtyLast === 'number') {
  //       const difference = hmkmValue - hmLast;
  //       if (qtyLast === 0) {
  //         return 0;
  //       }
  //       if (difference > 0) {
  //         const result = difference / qtyLast;
  //         return parseFloat(result.toFixed(2));
  //       }
  //     }
  //     return 0;
  //   };

  //   const fbrResult = calculateFBR();
  //   setFbrResultOf(fbrResult);

  // }, [hmkmValue, hmLast, qtyLast]);

  useEffect(() => {
    const calculateFBR = (): number => {
      let effectiveHmkmValue = hmkmValue;
      if (
        Array.isArray(typeTrx) &&
        typeTrx.some(
          (item) =>
            item.name === "Transfer Receipt" || item.name === "Receipt KPC"
        )
      ) {
        effectiveHmkmValue = 0;
      }
      if (
        isFormDisabled ||
        (Array.isArray(typeTrx) &&
          typeTrx.some(
            (item) => item.name === "Receipt" || item.name === "Receipt KPC"
          ))
      ) {
        return 0; // Skip calculation and return 0
      }

      let effectiveQtyLast = qtyLast;
      if (
        Array.isArray(typeTrx) &&
        typeTrx.some(
          (item) => item.name === "Receipt" || item.name === "Receipt KPC"
        )
      ) {
        effectiveQtyLast = 0; // Ignore qtyLast for these transaction types
      }

      if (
        typeof effectiveHmkmValue === "number" &&
        typeof hmLast === "number" &&
        typeof effectiveQtyLast === "number"
      ) {
        const difference = effectiveHmkmValue - hmLast;
        if (effectiveQtyLast === 0 || difference <= 0) {
          return 0;
        }
        const result = difference / effectiveQtyLast;
        return parseFloat(result.toFixed(2));
      }
      return 0;
    };
    const fbrResult = calculateFBR();
    setFbrResultOf(fbrResult);
  }, [hmkmValue, hmLast, qtyLast, typeTrx, isFormDisabled]);

  useEffect(() => {
    const getOfflineData = async () => {
      setHmLast(0);
      const offlineData = await fetchLatestHmLast(selectedUnit);
      if (offlineData.hm_km !== undefined) {
        setHmLast(offlineData.hm_km);
        setQty(offlineData.qty_last || 0);
      } else {
        setHmLast(0);
      }
    };
    getOfflineData();
  }, [selectedUnit]);

  const calculateFBR = (): number => {
    if (
      typeof hmkmValue === "number" &&
      typeof hmLast === "number" &&
      typeof qtyLast === "number"
    ) {
      const difference = hmkmValue - hmLast;
      if (qtyValue === 0) {
        return 0;
      }
      if (difference > 0) {
        const result = difference / qtyLast;
        return parseFloat(result.toFixed(2));
      }
    } else {
    }
    return 0;
  };

  useEffect(() => {
    setFbrResult(calculateFBR());
  }, [hmkmValue, hmLast, qtyLast]);

  const showAlert = () => {
    setIsAlertOpen(true);
    setTimeout(() => {
      setIsAlertOpen(false);
    }, 3000);
  };

  return (
    <IonPage>
      <IonLoading isOpen={loading} message={"Loading..."} />
      <IonHeader translucent={true} className="ion-no-border">
        <IonToolbar className="custom-header">
          <IonTitle>Form Tambah Transaksi</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div style={{ marginTop: "20px", padding: "15px" }}>
          {(checkUnit) && <IonRow></IonRow>}
          {/* {currentUnitQuota?.is_active && ( */}
            <IonRow>
              <IonCol>
                <IonItemDivider
                  style={{ border: "solid", color: "#8AAD43", width: "400px" }}>
                  <IonLabel style={{ display: "flex" }}>
                    <IonImg
                      style={{ width: "40px" }}
                      src="Glyph.png"
                      alt="Logo DH"
                    />
                    <IonTitle
                      style={{
                        color: checkUnit?remainingQuota === 0 ? "red" : "#8AAD43":"#8AAD43",
                      }}>
                      Sisa Kuota:{" "}
                      {checkUnit?
                      remainingQuota > 0
                        ? `${remainingQuota} Liter`
                        : "0 Liter"
                      :"unit tanpa quota"}
                    </IonTitle>
                  </IonLabel>
                </IonItemDivider>
              </IonCol>
            </IonRow>
          {/* )} */}
          <div style={{ marginTop: "30px" }}>
            <IonGrid>
              <h1>Shift: {shift}</h1>
              <IonRow>
                <IonCol size="8">
                  <div>
                    <IonLabel style={{ fontWeigt: "Bold", fontSize: "16px" }}>
                      Pilih Transaksi
                      <span style={{ color: "red" }}> *</span>
                    </IonLabel>
                    <IonRadioGroup
                      style={{
                        backgroundColor:
                          showErrorType && selectedType === undefined
                            ? "rgba(255, 0, 0, 0.1)"
                            : "transparent", // Apply red background if error
                        padding: "10px",
                        borderRadius: "5px",
                      }}
                      className="radio-display"
                      value={selectedType}
                      onIonChange={handleRadioChange}
                      compareWith={compareWith}>
                      {typeTrx.map((type) => (
                        <IonItem
                          style={{ fontWeigt: "500px", fontSize: "20px" }}
                          key={type.id}
                          className="item-no-border">
                          <IonRadio labelPlacement="end" value={type}>
                            {type.name}
                          </IonRadio>
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
                      value: unit.unit_no || "",
                      label: unit.unit_no || "",
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
                    <div>
                      <IonLabel>
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
                      />
                    </div>
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
                    value={isNaN(hmLast) ? 0 : hmLast}
                    // onIonChange={(e) => setHmLast(Number(e.detail.value))}
                    disabled
                  />

                  {/* {showErrorHmlast && hmkmLast === undefined && (
                    <p style={{ color: "red" }}>* Field harus diisi</p>
                  )} */}
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
                  {showErrorHmlast && (
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
                      typeof calculateFlowEnd(selectedType?.name || "") ===
                      "number"
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
                    backgroundColor: employeeError
                      ? "rgba(255, 0, 0, 0.1)"
                      : "transparent",
                    padding: "10px",
                  }}>
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
                        borderColor: employeeError
                          ? "red"
                          : provided.borderColor, // Highlight border red on error
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
                    value={
                      fuelman_id
                        ? { value: fuelman_id, label: fuelman_id }
                        : null
                    }
                    onChange={handleChangeEmployeeId}
                    options={operatorOptions.map((operator) => ({
                      value: operator.JDE || "",
                      label: operator.JDE || "",
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
                  <IonRow>
                    {" "}
                    {showJamError && (
                      <IonLabel
                        style={{
                          color: "red",
                          fontSize: "14px",
                          marginTop: "8px",
                        }}>
                        Pengiputan pada jam harus sesuai dengan shift saat ini
                        !!!
                      </IonLabel>
                    )}
                  </IonRow>
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
                  {showJamErrorInput &&
                    startTime &&
                    endTime &&
                    endTime < startTime && (
                      <p style={{ color: "red" }}>
                        * Jam selesai tidak boleh lebih kecil dari jam mulai
                      </p>
                    )}
                  <IonRow>
                    {" "}
                    {showJamError && (
                      <IonLabel
                        style={{
                          color: "red",
                          fontSize: "14px",
                          marginTop: "8px",
                        }}>
                        Pengiputan pada jam harus sesuai dengan shift saat ini
                        !!!
                      </IonLabel>
                    )}
                  </IonRow>
                </IonCol>
              </IonRow>
              <IonRow>
              <IonCol>
                  <IonCard style={{ height: "160px" }}>
                    <input
                      type="file"
                      accept="image/*"
                      id="photoInput"
                      style={{ display: "none" }}
                      onChange={handlePhotoChange}
                    />
                    <IonButton
                      size="small"
                      onClick={() =>
                        document.getElementById("photoInput")?.click()
                      }
                      disabled={isFormDisabled}
                    >
                      <IonIcon slot="start" icon={cameraOutline} />
                      Ambil Foto *
                    </IonButton>
                    {photoPreview && (
                      <IonCard style={{ marginTop: "10px", padding: "10px" }}>
                        <IonLabel>Preview:</IonLabel>
                        <IonImg
                          src={photoPreview}
                          alt="Photo Preview"
                          style={{ maxWidth: "100%", maxHeight: "200px" }}
                        />
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
                      style={{ display: "none" }}
                      onChange={(e) =>
                        handleFileChange(
                          e,
                          setPhotoFile,
                          setBase64,
                          setSignature
                        )
                      }
                    />
                    <IonButton
                      color="warning"
                      size="small"
                      onClick={() => setIsSignatureModalOpen(true)}
                      disabled={isFormDisabled}>
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
                  color="light">
                  <IonIcon slot="start" icon={closeCircleOutline} />
                  Tutup Form
                </IonButton>
                <IonButton
                  disabled={
                    // isSubmitting ||
                    isError ||
                    quantity === null ||
                    !validateShiftTime(startTime, endTime) ||
                    showJamError ||
                    hmkmValue === null || hmkmValue === undefined
                    // Disable if time validation fails
                  }
                  onClick={(e) => {
                    // handlePost(e);
                    // showAlert();
                    setIsAlertOpen(true);
                  }}
                  className={`check-button ${
                    isOnline ? "button-save-data" : "button-save-draft"
                  }`}>
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
            message="Simpan Data?"
            buttons={[
              {
                text: 'Cancel',
                role: 'cancel',
                handler: () => {
                  // setLoading(true)
                  setIsAlertOpen(false); // just close
                },
              },
              {
                text: 'OK',
                handler: () => {
                  // handleSave(); // your custom save function
                  handlePost();
                  setIsAlertOpen(false);
                },
              },
            ]}
            onDidDismiss={() => setIsAlertOpen(false)}
          />
        </div>
      </IonContent>
    </IonPage>
  );
};
export default FormTRX;
