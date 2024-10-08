import React, { useState, useEffect, Key, SetStateAction, useRef } from "react";
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
  getLatestHmLast,
} from "../../utils/getData";
import DynamicAlert from "../../components/Alert";
import { fetchOperatorData, fetchQuotaData, fetchUnitData, fetchUnitLastTrx, getDataFromStorage } from "../../services/dataService";
import Select, { ActionMeta, SingleValue } from "react-select";
import { getLatestTrx } from "../../utils/getData";

interface Typetrx {
  id: number;
  name: string;
}

interface JdeOption {
  JDE: string; // Ensure this matches the actual key used
  fullname: string;
}

const typeTrx: Typetrx[] = [
  { id: 1, name: "Issued" },
  { id: 2, name: "Transfer" },
  { id: 3, name: "Receipt" },
  { id: 4, name: "Receive KPC" },
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

  const [model, setModel] = useState<string>("");
  const [owner, setOwner] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [unitOptions, setUnitOptions] = useState<
    { id: string; unit_no: string; brand: string; owner: string }[]
  >([]);

  const [fbr, setFbr] = useState<number | undefined>(undefined);
  const [flowStart, setFlowStart] = useState<number | undefined>(undefined);
  const [flowMeterAwal, setFlowMeterAwal] = useState<number | undefined>(
    undefined
  );
  const [flowMeterAkhir, setFlowMeterAkhir] = useState<number | undefined>(
    undefined
  );
  const [startTime, setStartTime] = useState<string | undefined>(undefined);
  const [endTime, setEndTime] = useState<string | undefined>(undefined);
  const [lkf_id, setLkfId] = useState<number | undefined>(undefined);
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


  const [status, setStatus] = useState<number>(0); // Default to 0
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  const [quotaMessage, setQuotaMessage] = useState("");

  const [unitQuota, setUnitQuota] = useState(0);
  const [usedQuota, setUsedQuota] = useState(0);
  const [remainingQuota, setRemainingQuota] = useState(0);
  const [quantity, setQuantity] =useState<number | undefined>(undefined); 
  const [quantityError, setQuantityError] = useState("");
  const [employeeError, setemployeeError] = useState("");
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

  const [showPopover, setShowPopover] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUnits, setFilteredUnits] = useState(unitOptions);

  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);

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

  useEffect(() => {
    const userData = localStorage.getItem("shiftData");
    if (userData) {
      const parsedData = JSON.parse(userData);
      setFlowMeterAwal(parsedData.flowMeterEnd);
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

  // Ensure quantity is initialized and handle potential undefined
  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Initial Status:", status);

    // Validate form fields
    if (
      !selectedType ||
      !selectedUnit ||
      quantity === null ||  // Ensure quantity is not null
      fbr === null ||
      flowMeterAwal === null ||
      flowMeterAkhir === null ||
      !startTime ||
      !endTime
    ) {
      setModalMessage("Form is incomplete");
      setErrorModalOpen(true);
      return;
    }

    // Convert values to numbers where necessary
    const flow_end: number = Number(calculateFlowEnd()) || 0;
    const calculatedFBR: number = Number(calculateFBR()) || 0;

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
      hm_last: Number(hmLast) || 0,
      hm_km: Number(hmkmTRX) || 0,
      qty_last: Number(quantity) || 0,  // Ensure quantity is a number
      qty: Number(quantity) || 0,       // Ensure quantity is a number
      flow_start: Number(flowMeterAwal) || 0,
      flow_end: flow_end,
      dip_start: Number(dipStart) || 0,
      dip_end: Number(dipEnd) || 0,
      sonding_start: Number(sondingStart) || 0,
      sonding_end: Number(sondingEnd) || 0,
      name_operator: fullName!,
      start: startTime!,
      end: endTime!,
      fbr: calculatedFBR,
      lkf_id: lkf_id ?? "",
      signature: signatureBase64 ?? "",
      type: selectedType?.name ?? "",
      foto: photoPreview ?? "",
      fuelman_id: fuelman_id!,
      status: status ?? 0,
      jde_operator: "",
      reference: Number(Refrence) || 0,
      liters: 0,
      cm: 0,
      date: ""
    };

    try {
      // Handle saving and posting based on status
      if (status === 0) {
        console.log("Saving data as draft (offline)...");
        await insertNewData(dataPost);
        setModalMessage("Data saved as draft");

      } else if (status === 1 && isOnline) {
        console.log("Posting data to backend...");
        const response = await postTransaksi(dataPost);
        // await insertNewData(dataPost);
        if (response.ok && (response.status === 200 || response.status === 201)) {
          // Update local storage quota
          if (quantity) {
            updateLocalStorageQuota(selectedUnit, quantity);
          }
          setModalMessage("Transaction posted successfully and saved locally");
        } else {
          setModalMessage("Failed to post transaction. Please try again.");
          setErrorModalOpen(true);
        }
      }

      // Navigate to the dashboard
      setSuccessModalOpen(true);
      route.push("/dashboard");

    } catch (error) {
      console.error("Error occurred while posting data:", error);
      setModalMessage("Error occurred while posting data: " + error);
      setErrorModalOpen(true);
    }
  };
  const updateLocalStorageQuota = (unitNo: string, issuedQuantity: number) => {
    const unitQuota = localStorage.getItem("unitQouta");
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
    const unitQuota = localStorage.getItem("unitQouta");
    if (unitQuota) {
      const parsedData = JSON.parse(unitQuota);
      const currentUnitQuota = parsedData.find((unit: { unitNo: string | undefined; }) => unit.unitNo === selectedUnit);

      if (currentUnitQuota) {
        setUnitQuota(currentUnitQuota.quota);
        setUsedQuota(currentUnitQuota.used);
        setRemainingQuota(currentUnitQuota.quota - currentUnitQuota.used); // Calculate remaining quota
      } else {
        setUnitQuota(0);
        setUsedQuota(0);
        setRemainingQuota(0);
      }
    }
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
    // Directly set the signature state
    console.log("Updated Signature:", newSignature);
  };



  const calculateFBR = (): string | number => {
    if (
      hmkmTRX !== undefined &&
      hmLast !== undefined &&
      qtyLast !== undefined
    ) {
      const difference =   hmkmTRX - hmLast;
      if (difference !== 0) {
        const result = qtyLast / difference;
        return parseFloat(result.toFixed(1)); // Return the result with one decimal place
      } else {
        return "N/A";
      }
    }
    return "";
  };

  const calculateFlowEnd = (): string | number => {
    if (flowMeterAwal !== undefined && quantity !== undefined) {
      const totaFlowEnd = flowMeterAwal + quantity;
      if (totaFlowEnd !== 0) {
        return totaFlowEnd;
      } else {
        return "N/A"; // Handle division by zero
      }
    }
    return ""; // Handle cases where any value is undefined
  };

  const fetchUnitOptions = async () => {
    const storedUnitOptions = await getDataFromStorage("allUnit");

    console.log("Stored unit options:", storedUnitOptions);

    if (storedUnitOptions) {
      // Check if stored data is already an object
      if (typeof storedUnitOptions === "string") {
        try {
          const parsedUnitOptions = JSON.parse(storedUnitOptions);
          console.log("Parsed unit options:", parsedUnitOptions);
          setUnitOptions(parsedUnitOptions);
        } catch (error) {
          console.error("Failed to parse unit options from localStorage:", error);
        }
      } else {
        // If it's already an object, just set it directly
        console.log("Unit options are already an object:", storedUnitOptions);
        setUnitOptions(storedUnitOptions);
      }
    } else {
      console.log("No unit options found in localStorage.");
    }
  };


  useEffect(() => {
    console.log("unitOptions updated:", unitOptions);
  }, [unitOptions]);


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
    // Track if the component is still mounted
    let isMounted = true;

    const fetchFbrData = async () => {
      if (selectedUnit) {
        try {
          // Fetch FBR and HM data concurrently
          const [fbrData, lastHm] = await Promise.all([
            getFbrByUnit(selectedUnit),
            getLatestHmLast(selectedUnit), // Ensure this function filters by selectedUnit
          ]);

          if (isMounted) {

            console.log("HM Data:", lastHm); // Change this to lastHm

            if (fbrData.length > 0) {
              // Assuming fbrData is sorted and the first entry is the latest
              const latestEntry = fbrData[0];
              console.log("data last", latestEntry)
              setFbr(latestEntry.fbr);

              sethmkmTrx(latestEntry.hm_km);
              setQtyLast(latestEntry.qty_last);
            } else {
              // If no data is found, clear the state
              setFbr(undefined);
              sethmkmTrx(undefined);
              setQtyLast(undefined);
            }

            // Update hmLast with the latest value from getLatestHmLast
            if (lastHm) {
              setHmLast(lastHm);
            }
          }
        } catch (error) {
          console.error("Error fetching FBR data:", error);
          if (isMounted) {
            setFbr(undefined);
            setHmLast(undefined);
            setQtyLast(undefined);
          }
        }
      }
    };

    fetchFbrData();

    return () => {
      isMounted = false;
    };
  }, [selectedUnit]);

  const handleHmkmUnitChange = (e: CustomEvent) => {
    const value = Number(e.detail.value);
    if (hmLast !== undefined && value < hmLast) {
      setShowError(true);
    } else {
      setShowError(false);
    }
    sethmkmTrx(value);
  };

  const handleHmLastChange = (e: CustomEvent) => {
    const newValue = Number(e.detail.value);
    if (hmLast !== undefined && newValue < hmLast) {
      setShowError(true);
    } else {
      setShowError(false);
    }
    setHmLast(newValue);
  };

  const isSaveButtonDisabled = () => {
    return hmkmTRX !== undefined && hmLast !== undefined && hmLast > hmkmTRX;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLIonInputElement>) => {
    if (e.nativeEvent.key === "Enter") {
      e.preventDefault();

      // Check which input is focused and move to the next one
      if (input1Ref.current) {
        input2Ref.current?.setFocus();
      }
    }
  };




  useEffect(() => {
    console.log("unitOptions updated:", unitOptions);
  }, [unitOptions]);

  useEffect(() => {
    // Track if the component is still mounted
    let isMounted = true;

    const fetchFbrData = async () => {
      if (selectedUnit) {
        try {
          // Fetch FBR and HM data concurrently
          const [fbrData, lastHm] = await Promise.all([
            getFbrByUnit(selectedUnit),
            getLatestHmLast(selectedUnit),
          ]);

          if (isMounted) {


            if (fbrData.length > 0) {
              // Assuming fbrData is sorted and the first entry is the latest
              const latestEntry = fbrData[0];
              setFbr(latestEntry.fbr);
              sethmkmTrx(latestEntry.hm_last);
              setQtyLast(latestEntry.qty_last);
            } else {
              // If no data is found, clear the state
              setFbr(undefined);
              sethmkmTrx(undefined);
              setQtyLast(undefined);
            }

            // Update hmLast with the latest value from getLatestHmLast
            if (lastHm) {
              setHmLast(lastHm);
            }
          }
        } catch (error) {
          console.error("Error fetching FBR data:", error);
          if (isMounted) {
            setFbr(undefined);
            setHmLast(undefined);
            setQtyLast(undefined);
          }
        }
      }
    };

    fetchFbrData();

    return () => {
      isMounted = false;
    };
  }, [selectedUnit]);

  useEffect(() => {
    const loadUnitDataQuota = async () => {
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0]; // Mengambil tanggal hari ini dalam format YYYY-MM-DD

      try {
        // Fetch data dari database untuk tanggal hari ini
        const quotaData = await fetchQuotaData(formattedDate);
        console.log('Fetched quota data:', quotaData);

        if (quotaData && Array.isArray(quotaData)) {
          // Mencari kuota untuk unit yang dipilih
          let currentUnitQuota = quotaData.find(unit => unit.unitNo === selectedUnit);

          // Jika tidak ada kuota untuk unit yang dipilih, coba ambil kuota dari tanggal sebelumnya
          if (!currentUnitQuota) {
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1); // Set tanggal ke hari sebelumnya
            const formattedYesterday = yesterday.toISOString().split('T')[0];

            const previousQuotaData = await fetchQuotaData(formattedYesterday);
            console.log('Fetched previous quota data:', previousQuotaData);

            currentUnitQuota = previousQuotaData.find(unit => unit.unitNo === selectedUnit);
          }

          if (currentUnitQuota) {
            const totalQuota = currentUnitQuota.quota;
            const usedQuota = currentUnitQuota.used || 0;

            setUnitQuota(totalQuota);
            const remaining = totalQuota - usedQuota;
            setRemainingQuota(remaining);
            console.log(`Remaining Quota for ${selectedUnit}: ${remaining} Liter`);
            setQuotaMessage(`Sisa Kouta ${selectedUnit}: ${totalQuota} Liter`);

            // Check if issued amount exceeds remaining quota
            const issuedAmount = currentUnitQuota.issued || 0;
            if (issuedAmount > remaining) {
              setQuotaMessage(`Error: Issued amount exceeds remaining quota for ${selectedUnit}`);
            }
          } else {
            setUnitQuota(0);
            setRemainingQuota(0);
            setQuotaMessage("");
            console.log(`No quota found for unit: ${selectedUnit}`);
          }
        } else {
          console.error('No quota data found for the specified date');
        }
      } catch (error) {
        console.error('Error fetching quota data:', error);
      }
    };

    loadUnitDataQuota();
  }, [selectedUnit]);


  function setBase64(value: SetStateAction<string | undefined>): void {
    throw new Error("Function not implemented.");
  }


  const handleQuantityChange = (e: any) => {
    const inputQuantity = Number(e.detail.value);
  
    // Ensure the input is a valid number
    if (isNaN(inputQuantity) || inputQuantity <= 0) {
      setQuantityError("Qty Issued harus lebih besar dari 0");
      setIsError(true);
      setQuantity(undefined); // Reset the quantity if invalid
      return;
    }
  
    // Validation for units starting with LV or HLV
    if (selectedUnit?.startsWith("LV") || selectedUnit?.startsWith("HLV")) {
      if (inputQuantity > remainingQuota) {
        setQuantityError("Qty Issued tidak boleh lebih besar dari sisa kouta. Mohon hubungi admin agar bisa mengisi kembali !!");
        setIsError(true);
      } else {
        setQuantityError("");
        setIsError(false);
      }
    } else {
      // Clear errors for other units
      setQuantityError("");
      setIsError(false);
    }
  
    // Update the quantity state after validation
    setQuantity(inputQuantity);
  };
  

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
  


  // hilangkkan parsenya jika ngambil dari localsorage
  useEffect(() => {
    const fetchJdeOptions = async () => {
      const storedJdeOptions = await getDataFromStorage("allOperator");
      console.log("Stored JDE Options:", storedJdeOptions);

      if (storedJdeOptions) {
        // If you are certain the data is in the correct format
        if (Array.isArray(storedJdeOptions)) {
          setJdeOptions(storedJdeOptions);
        } else {
          console.log("Stored JDE Options is not a valid array.");
        }
      } else {
        console.log("No JDE options found in storage.");
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
  
  const handleSearchChange = (e: CustomEvent) => {
    const query = e.detail.value.toLowerCase();
    setSearchQuery(query);
    const filtered = unitOptions.filter((unit) =>
      unit.unit_no.toLowerCase().includes(query)
    );
    setFilteredUnits(filtered);
  };
  const handleUnitChange = (newValue: SingleValue<{ value: string; label: string }>, actionMeta: ActionMeta<{ value: string; label: string }>) => {
    if (newValue) {
      const unitValue = newValue.value; // Get the selected unit value
      setSelectedUnit(unitValue);

      const selectedUnitOption = unitOptions.find(
        (unit) => unit.unit_no === unitValue
      );

      if (selectedUnitOption) {
        setModel(selectedUnitOption.brand);
        setOwner(selectedUnitOption.owner);
      }

      let newKoutaLimit: number;
      newKoutaLimit = unitValue.startsWith("LV") || unitValue.startsWith("HLV") ? unitQouta : 0;
      setKoutaLimit(newKoutaLimit);
      setShowError(
        unitValue.startsWith("LV") ||
        (unitValue.startsWith("HLV") && newKoutaLimit < unitQouta)
      );
    }
  };


  const fetchLatestTrx = async (selectedUnit: string) => {
    const latestId = await getLatestTrx(selectedUnit); // Jangan lupa kirim selectedUnit
    if (latestId !== undefined) {
      console.log("Latest Transaction ID:", latestId);
    } else {
      console.log("No transaction found.");
    }
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
          {remainingQuota !== undefined && (selectedUnit?.startsWith("LV") || selectedUnit?.startsWith("HLV")) && (
            <IonRow>
              <IonCol>
                <IonItemDivider style={{ border: "solid", color: "#8AAD43", width: "400px" }}>
                  <IonLabel style={{ display: "flex", color: remainingQuota === 0 ? "red" : "inherit" }}>
                    <IonImg style={{ width: "40px" }} src="Glyph.png" alt="Logo DH" />
                    <IonTitle>Sisa Kouta: {remainingQuota} Liter</IonTitle>
                  </IonLabel>
                </IonItemDivider>
              </IonCol>
            </IonRow>
          )}

          <div style={{ marginTop: "30px" }}>
            <IonGrid>
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
                    options={unitOptions.map((unit) => ({
                      value: unit.unit_no || '',
                      label: unit.unit_no || '',
                    }))}
                    placeholder="Select Unit"
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
                  <IonCol size="8">
                    <div><IonLabel>
                      {" "}
                      Type Transaksi Issued <span style={{ color: "red" }}>*</span>
                    </IonLabel>
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
                      </IonRadioGroup></div>
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
                    value={hmLast}

                    // onIonChange={(e) => sethmkmTrx(Number(e.detail.value))}
                    onKeyDown={handleKeyDown}
                  />
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


                    // onIonChange={(e) => setHmLast(Number(e.detail.value))}
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
              {/* <div style={{ marginLeft: "15px" }}>
                                {showError && koutaLimit !== undefined && koutaLimit < 20 && (
                                    <div style={{ color: "red" }}>
                                        <div>* Kouta pengisian budget sudah melebihi 20 L / Hari</div>
                                        <div>* Hm/Km tidak boleh kurang dari Hm/Km sebelumnya : 10290</div>
                                        <div>* Unit tersebut sudah melakukan pengisian sebanyak 20 L dari batas maksimal 20 L. Silahkan hubungi admin jika ingin melakukan pengisian </div>
                                    </div>
                                )}
            </div> */}

              <IonRow>
                <IonCol>
                  <IonLabel>
                    Qty Issued / Receive / Transfer{" "}
                    <span style={{ color: "red" }}>*</span>
                  </IonLabel>
                  <IonInput
                    className="custom-input"
                    ref={input2Ref}
                    type="number"
                    placeholder="Qty Issued / Receive / Transfer"
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

                  {/* Add validation for empty or undefined quantity */}
                  {showError && (!quantity || quantity === undefined) && (
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
                    
                    // onIonChange={(e) => setFbr(Number(e.detail.value))}
                    value={
                      typeof calculateFBR() === "number" ? calculateFBR() : ""
                    }
                  // disabled
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
                    value={flowMeterAwal?.toString() || ""}
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
                      typeof calculateFlowEnd() === "number"
                        ? calculateFlowEnd()
                        : ""
                    }
                    placeholder=""
                  />
                </IonCol>
              </IonRow>
              <IonRow>
                <IonCol>
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
                    onIonChange={(e) => setStartTime(e.detail.value as string)}
                    disabled={isFormDisabled}
                  />
                </IonCol>
                <IonCol>
                  <IonLabel>
                    Selesai Isi <span style={{ color: "red" }}>*</span>
                  </IonLabel>
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
                  disabled={isSaveButtonDisabled() || isError} // Disable if there's an error
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

