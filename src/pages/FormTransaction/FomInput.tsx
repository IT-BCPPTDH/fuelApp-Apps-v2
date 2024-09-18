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
  const [selectedUnit, setSelectedUnit] = useState<string | undefined>(
    undefined
  );

  const [signature, setSignature] = useState<File | null>(null);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);

  const [showError, setShowError] = useState<boolean>(false);
  const [model, setModel] = useState<string>("");
  const [owner, setOwner] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [unitOptions, setUnitOptions] = useState<
    { id: string; unit_no: string; brand: string; owner: string }[]
  >([]);
  const [quantity, setQuantity] = useState<number | undefined>(undefined);
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
  const [sondingEnd, setSondingEnd] = useState<number | undefined>(undefined);
  const [Refrence, setRefrence] = useState<number | undefined>(undefined);
  const [stationData, setStationData] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [hmkmTRX, sethmkmTrx] = useState<number | undefined>(undefined); // HM/KM Transaksi
  const [hmLast, setHmLast] = useState<number | undefined>(undefined); // HM/KM Unit
  const [qtyLast, setQtyLast] = useState<number | undefined>(undefined); // Qty Last
  // Ensure flowEnd is a number

  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const [status, setStatus] = useState<number>(0); 

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Clean up the event listeners on component unmount
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
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

  //   useEffect(() => {
  //     // Example effect to demonstrate state update
  //     if (employeeId) {
  //         // Update related fields
  //         // e.g., setFuelmanId(employeeId);
  //     }
  // }, [employeeId]);

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

  // useEffect(() => {
  //     const fetchUnitOptions = async () => {
  //         try {
  //             const response = await getAllUnit();
  //             if (response.status === '200' && Array.isArray(response.data)) {
  //                 setUnitOptions(response.data);
  //             } else {
  //                 console.error('Unexpected data format');
  //             }
  //         } catch (error) {
  //             console.error('Failed to fetch unit options', error);
  //         }
  //     };

  //     fetchUnitOptions();
  // }, []);

  useEffect(() => {
    const fetchJdeOptions = () => {
      const storedJdeOptions = localStorage.getItem("employeeData");
      if (storedJdeOptions) {
        try {
          const parsedJdeOptions = JSON.parse(storedJdeOptions);
          setJdeOptions(parsedJdeOptions);
        } catch (error) {
          console.error(
            "Failed to parse JDE options from local storage",
            error
          );
        }
      } else {
        console.log("No JDE options found in local storage");
      }
    };

    fetchJdeOptions();
  }, []);

  const handleRadioChange = (event: CustomEvent) => {
    const selectedValue = event.detail.value as Typetrx;
    setSelectedType(selectedValue);
    console.log("Selected type:", JSON.stringify(selectedValue));
  };

  const isFormDisabled = !selectedUnit;

  const handleUnitChange = (event: CustomEvent) => {
    const unitValue = event.detail.value;
    setSelectedUnit(unitValue);

    const selectedUnitOption = unitOptions.find(
      (unit) => unit.unit_no === unitValue
    );
    if (selectedUnitOption) {
      setModel(selectedUnitOption.brand);
      setOwner(selectedUnitOption.owner);
    }

    let newKoutaLimit = 0;
    if (unitValue.startsWith("LV") || unitValue.startsWith("HLV")) {
      newKoutaLimit = 20;
    } else {
      newKoutaLimit = 0;
    }

    setKoutaLimit(newKoutaLimit);
    setShowError(
      unitValue.startsWith("LV") ||
        (unitValue.startsWith("HLV") && newKoutaLimit < 20)
    );
  };
  const handleChangeEmployeeId = (event: CustomEvent) => {
    const selectedValue = event.detail.value as string;
    console.log("Selected Employee ID:", selectedValue);

    const selectedJdeOption = jdeOptions.find(
      (jde) => jde.JDE === selectedValue
    );
    if (selectedJdeOption) {
      console.log("Selected JDE Option:", selectedJdeOption);
      setFullName(selectedJdeOption.fullname);
      setFuelmanId(selectedValue);
    } else {
      console.log("No matching JDE option found.");
      setFullName("");
      setFuelmanId("");
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

 
  // Function to insert new data into the dashboard or database


  

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Initial Status:", status);
  
    if (isSaveButtonDisabled()) {
      setModalMessage("HM/KM Unit Tidak Bole Kecil Dari HM/KM Terakhir Transaksi");
      setErrorModalOpen(true);
      return;
    }
  
    // Validate form fields
    if (
      !selectedType ||
      !selectedUnit ||
      quantity === null ||
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
    const fromDataId = Date.now();
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
      qty_last: Number(quantity) || 0,
      qty: Number(quantity) || 0,
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
      status: status ,
      jde_operator: "",
      reference: Number(Refrence) || 0,
      liters: 0,
      cm: 0,
      date: ""
    };
  
    try {
      if (status === 0) {
        // Save data as draft in IndexedDB
        console.log("Saving data as draft to IndexedDB...");
        await insertNewData(dataPost);
        setModalMessage("Data saved as draft");
        setSuccessModalOpen(true);
        route.push("/dashboard");
      } else if (status === 1) {
        // If status is 1, post data to backend
        if (isOnline) {
          console.log("Posting data to backend...");
          const response = await postTransaksi(dataPost);
  
          console.log("API Response Status:", response.status);
          console.log("API Response OK:", response.ok);
  
          if (response.ok && (response.status === 201)) {
            // Save data to IndexedDB after successful post
            console.log("Saving data to IndexedDB after successful post...");
            await insertNewData(dataPost);
            
            setModalMessage("Transaction posted successfully and saved locally");
            setSuccessModalOpen(true);
            route.push("/dashboard");
          } else {
            setModalMessage("Failed to post transaction. Please try again.");
            setErrorModalOpen(true);
          }
        } else {
          console.log("Saving data as draft (offline)...");
          await insertNewData(dataPost);
          setModalMessage("Data saved as draft (offline)");
          setSuccessModalOpen(true);
          route.push("/dashboard");
        }
      }
    } catch (error) {
      console.error("Error occurred while posting data:", error);
      setModalMessage("Error occurred while posting data: " + error);
      setErrorModalOpen(true);
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


  const handleSignatureConfirm = (newSignature: string) => {
    setSignatureBase64(newSignature);
    // Directly set the signature state
    console.log("Updated Signature:", newSignature);
  };

  const quotaMessage =
    selectedUnit?.startsWith("LV") || selectedUnit?.startsWith("HLV")
      ? `SISA KOUTA ${koutaLimit} LITER`
      : "";
  const quotaStyle =
    selectedUnit?.startsWith("LV") || selectedUnit?.startsWith("HLV")
      ? { color: "#73a33f" }
      : {};

  function setBase64(value: SetStateAction<string | undefined>): void {
    throw new Error("Function not implemented.");
  }

  const calculateFBR = (): string | number => {
    if (
      hmkmTRX !== undefined &&
      hmLast !== undefined &&
      qtyLast !== undefined
    ) {
      const difference = hmkmTRX - hmLast;
      if (difference !== 0) {
        return qtyLast / difference;
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
  useEffect(() => {
    const fetchUnitOptions = () => {
      console.log("Fetching unit options from localStorage...");

      const storedUnitOptions = localStorage.getItem("allUnit");
      console.log("Stored unit options:", storedUnitOptions);

      if (storedUnitOptions) {
        try {
          const parsedUnitOptions = JSON.parse(storedUnitOptions);
          console.log("Parsed unit options:", parsedUnitOptions);
          setUnitOptions(parsedUnitOptions);
        } catch (error) {
          console.error(
            "Failed to parse unit options from localStorage:",
            error
          );
        }
      } else {
        console.log("No unit options found in localStorage.");
      }
    };

    fetchUnitOptions();
  }, []);

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
            console.log("FBR Data:", fbrData);
            console.log("HM Data:", hmkmTRX);

            if (fbrData.length > 0) {
              // Assuming fbrData is sorted and the first entry is the latest
              const latestEntry = fbrData[0];
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
    if ( hmLast!== undefined && newValue > hmLast) {
      setShowError(true);
    } else {
      setShowError(false);
    }
    setHmLast(newValue);
  };

  const isSaveButtonDisabled = () => {
    return hmLast !== undefined && hmkmTRX !== undefined && hmkmTRX < hmLast;
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

  return (
    <IonPage>
      <IonHeader translucent={true} className="ion-no-border">
        <IonToolbar className="custom-header">
          <IonTitle>
            Form Tambah Issued / Transfer / Receipt & Receipt KPC
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div style={{ marginTop: "20px", padding: "15px" }}>
          {(selectedUnit?.startsWith("LV") ||
            selectedUnit?.startsWith("HLV")) && (
            <IonRow>
              <IonCol>
                <IonItemDivider
                  style={{ border: "solid", color: "#8AAD43", width: "400px" }}
                >
                  <IonLabel style={{ display: "flex" }}>
                    <IonImg
                      style={{ width: "40px" }}
                      src="Glyph.png"
                      alt="Logo DH"
                    />
                    <IonTitle style={quotaStyle}>{quotaMessage}</IonTitle>
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
                  <IonSelect
                    className="select-custom"
                    style={{ marginTop: "10px", background: "white" }}
                    fill="solid"
                    interface="popover"
                    labelPlacement="floating"
                    onIonChange={handleUnitChange}
                    value={selectedUnit}
                  >
                    {unitOptions.length > 0 ? (
                      unitOptions.map((unit) => (
                        <IonSelectOption
                          key={unit.unit_no}
                          value={unit.unit_no}
                        >
                          {unit.unit_no}
                        </IonSelectOption>
                      ))
                    ) : (
                      <IonSelectOption value="">
                        No Units Available
                      </IonSelectOption>
                    )}
                  </IonSelect>
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
              <IonRow>
                <IonCol>
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
                </IonCol>
              </IonRow>
              <IonRow style={{ marginTop: "15px" }}>
                <IonLabel>
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
                </IonRadioGroup>
              </IonRow>
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
                    onIonChange={handleHmLastChange}
                    value={hmLast !== null ? hmLast : ""}
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
                    // value={hmkmTRX !== null ? hmkmTRX : ""}
                    onIonChange={handleHmkmUnitChange}
                    onKeyDown={handleKeyDown}
                  />

                  {showError && (
                    <div style={{ color: "red" }}>
                      HM/KM Unit Tidak Bole Kecil Dari HM/KM Terakhir Transaksi
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
                    onIonChange={(e) => setQuantity(Number(e.detail.value))}
                    disabled={isFormDisabled}
                  />
                </IonCol>
                <IonCol>
                  <IonLabel>
                    FBR Historis <span style={{ color: "red" }}>*</span>
                  </IonLabel>
                  <IonInput
                    className="custom-input"
                    type="number"
                    placeholder="Input FBR"
                    onIonChange={(e) => setFbr(Number(e.detail.value))}
                    value={
                      typeof calculateFBR() === "number" ? calculateFBR() : ""
                    }
                    disabled={isFormDisabled}
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
                  <IonLabel>
                    Employee ID <span style={{ color: "red" }}>*</span>
                  </IonLabel>
                  <IonSelect
                    className="select-custom"
                    style={{ marginTop: "10px", background: "white" }}
                    fill="solid"
                    labelPlacement="floating"
                    onIonChange={handleChangeEmployeeId}
                    disabled={isFormDisabled}
                    value={fuelman_id}
                  >
                    {jdeOptions.map((jde) => (
                      <IonSelectOption key={jde.JDE} value={jde.JDE}>
                        {jde.JDE}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonCol>
                <IonCol>
                  <IonLabel>
                    Nama Driver <span style={{ color: "red" }}>*</span>
                  </IonLabel>
                  <IonInput
                    style={{ background: "#E8E8E8" }}
                    className="custom-input"
                    type="text"
                    name="jde"
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
                  className={`check-button ${
                    isOnline ? "button-save-data" : "button-save-draft"
                  }`}
                  disabled={isSaveButtonDisabled()}
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

        <IonModal
          isOpen={successModalOpen}
          onDidDismiss={() => setSuccessModalOpen(false)}
        >
          <IonHeader>
            <IonToolbar>
              <IonTitle>Success</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonLabel>{modalMessage}</IonLabel>
            <IonButton expand="full" onClick={() => setSuccessModalOpen(false)}>
              Close
            </IonButton>
          </IonContent>
        </IonModal>

        {/* Error Modal */}
        <IonModal
          isOpen={errorModalOpen}
          onDidDismiss={() => setErrorModalOpen(false)}
        >
          <IonHeader>
            <IonToolbar>
              <IonTitle>Error</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonLabel>{modalMessage}</IonLabel>
            <IonButton expand="full" onClick={() => setErrorModalOpen(false)}>
              Close
            </IonButton>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default FormTRX;
