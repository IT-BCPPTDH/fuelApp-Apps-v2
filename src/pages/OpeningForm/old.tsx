import React, { useEffect, useState,useCallback, useRef } from "react";
import {
  IonButton,
  IonCol,
  IonContent,
  IonHeader,
  IonToolbar,
  IonInput,
  IonItem,
  IonRadio,
  IonRadioGroup,
  IonRow,
  IonTitle,
  IonLabel,
  IonDatetime,
  IonModal,
  useIonToast,
  useIonRouter,
  IonPage,
  IonCard,
  IonRefresher,
  IonRefresherContent,
  IonToast,
} from "@ionic/react";

import "./style.css";
import { postOpening } from "../../hooks/serviceApi";
import { addDataToDB, getOfflineData, removeDataFromDB } from "../../utils/insertData";
import { DataLkf } from "../../models/db";
import { getAllSonding } from "../../hooks/getAllSonding";
import { getLatestLkfDataDate, getLatestLkfId, getShiftDataByLkfId, getShiftDataByStation } from "../../utils/getData";
import { getStationData} from "../../hooks/getDataTrxStation";
import { saveDataToStorage, getDataFromStorage, fetchShiftData, getOperator } from "../../services/dataService";
import { debounce } from "../../utils/debounce";

interface Shift {
  id: number;
  name: string;
  type: string;
}

interface lkf{
  close_data: number;
  closing_dip: number;
  closing_sonding: number;
  flow_meter_end: number;
  hm_end: number;
  station: string;
}

const shifts: Shift[] = [
  { id: 1, name: "Day", type: "" },
  { id: 2, name: "Night", type: "" },
];

interface CloseShift {
  closing_sonding: number;
  closing_dip: number;
  flow_meter_end: number; 
  hm_end: number;
}

const compareWith = (o1: Shift, o2: Shift) => o1.id === o2.id;

const OpeningForm: React.FC = () => {
  const [openingDip, setOpeningDip] = useState<number | undefined>(undefined);
  const [flowMeterAwal, setFlowMeterAwal] = useState<number | undefined>(undefined);
  const [hmAwal, setHmAwal] = useState<number | undefined>(undefined);
  const [site, setSite] = useState<string | undefined>(undefined);
  const [station, setStation] = useState<string | undefined>(undefined);
  const [fuelmanId, setFuelmanID] = useState<string | undefined>(undefined);
  const [fuelmanName, setFuelmanName] = useState<string | undefined>(undefined);
  const [shiftSelected, setShiftSelected] = useState<Shift | undefined>(undefined);
  const [showError, setShowError] = useState<boolean>(false);
  const [id, setLkfId] = useState<string | undefined>(undefined);
  const [showDateModal, setShowDateModal] = useState<boolean>(false);
  const [sondingMasterData, setSondingMasterData] = useState<any[]>([]);
  const [openingSonding, setOpeningSonding] = useState<number | undefined>(undefined);
  const [prevFlowMeterAwal, setPrevFlowMeterAwal] = useState<number | undefined>(undefined);
  const [date, setDate] = useState<string>(new Date().toISOString());
  const [hmAkhir, setHmAkhir] = useState<number | undefined>(undefined);
  const [stationOptions, setStationOptions] = useState<string[]>([]);
  const [closeShift, setCloseShift] = useState<CloseShift | null>(null);
  const [loading, setLoading] = useState<boolean>(false); 
  const [error, setError] = useState<string | null>(null); 
  const router = useIonRouter();
  const [presentToast] = useIonToast();
  const [closingSonding, setClosingSonding] = useState<number | undefined>(undefined);
  const [prevHmAwal, setPrevHmAwal] = useState<number | undefined>(undefined);
  const input1Ref = useRef<HTMLIonInputElement>(null);
  const input2Ref = useRef<HTMLIonInputElement>(null);
  const [showToast, setShowToast] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [tanggalTrx , setTanggalTrx] = useState (new Date().toLocaleDateString())
  const [jdeOptions, setJdeOptions] = useState<
  { JDE: string; fullname: string }[]
  >([]);
  
  useEffect(() => {
    const determineShift = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const isDayShift = currentHour >= 6 && currentHour < 18;
      const isNightShift = currentHour >= 18 || currentHour < 6;
      if (isDayShift) {
        setShiftSelected(shifts.find((shift) => shift.name === "Day"));
      } else if (isNightShift) {
        setShiftSelected(shifts.find((shift) => shift.name === "Night"));
      }
    }
    determineShift();
  }, [])

  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  const handleShiftChange = (selectedShift: Shift) => {
    setShiftSelected(selectedShift);
  };

  useEffect(() => {
    const generateLkfId = () => {
      const timestamp = Date.now();
      return (timestamp % 100000000).toString().padStart(8, '0');
    };

    setLkfId(generateLkfId());
  }, [])
 
  const handleDateChange = (e: CustomEvent) => {
    const selectedDate = e.detail.value as string;
    if (selectedDate) {
      setDate(selectedDate);
      setShowDateModal(false);
      const formattedDate = new Date(selectedDate).toLocaleDateString();
      setTanggalTrx(formattedDate);
      saveDataToStorage("tanggalTransaksi", formattedDate)
    }
  };

  const handlePost = async () => {
    console.log(0)
    // if (!isOnline) {
    //   setShowToast(true);
    //   return;
    // }
    if (
      !date ||
      !shiftSelected ||
      hmAkhir === undefined ||
      openingDip === undefined ||
      openingSonding === undefined ||
      flowMeterAwal === undefined ||
      site === undefined ||
      fuelmanId === undefined ||
      station === undefined ||
      id === undefined
    ) {
      setShowError(true);
      return;
    }

  const lkf_id = await getLatestLkfId();
  let latestDataDateFormatted = "";
  const savedDate =  await getDataFromStorage("tanggalTransaksi");
  if (savedDate) {
    const transactionDate = new Date(savedDate);
    if (!isNaN(transactionDate.getTime())) {
      // Jika valid, tambahkan 12 jam ke tanggal
      transactionDate.setHours(transactionDate.getHours() + 12);
      latestDataDateFormatted = transactionDate.toISOString(); 
    } else {
      latestDataDateFormatted = "Invalid Date";  
    }
  } else {
    latestDataDateFormatted = "No Date Available";
  }
    let dataPost: DataLkf = {
      date: latestDataDateFormatted,
      shift: shiftSelected.name,
      hm_start: hmAkhir,
      opening_dip: openingDip,
      opening_sonding: openingSonding,
      flow_meter_start: flowMeterAwal,
      site: site,
      fuelman_id: fuelmanId,
      station: station,
      jde: fuelmanId,
      lkf_id: id,
      issued: undefined,
      receipt: undefined,
      stockOnHand: 0,
      name: "",
      hm_end: 0,
      closing_dip: 0,
      closing_sonding: 0,
      flow_meter_end: 0,
      note: "",
      signature: "",
      close_data: 0,
      variant: 0,
      status:'pending'
    };

    try {
      console.log(2)
      if(isOnline){
        console.log(3)
        const result = await postOpening(dataPost);
  
        if (result.status === '201' && result.message === 'Data Created') {
          dataPost = {
            ...dataPost,
            status:'sent'
          }
          presentToast({
            message: 'Data posted successfully!',
            duration: 2000,
            position: 'top',
            color: 'success',
          });
          await addDataToDB(dataPost); 
         
          router.push("/dashboard");
        } else {
          setShowError(true);
          presentToast({
            message: 'Failed to post data.',
            duration: 2000,
            position: 'top',
            color: 'danger',
          });
        }
      }else{
        console.log(4)
        saveDataToStorage("openingSonding", dataPost);
        await addDataToDB(dataPost);
        router.push("/dashboard");
      }

    } catch (error) {
      setShowError(true);
      presentToast({
        message: 'You are offline. Data saved locally and will be sent when online.',
        duration: 2000,
        position: 'top',
        color: 'warning',
      });
      await addDataToDB(dataPost); 
      router.push("/dashboard");
    }
  };

  useEffect(() => {
    const checkAndSendOfflineData = async () => {
      if (navigator.onLine) {
        const offlineData = await getOfflineData();
        if (offlineData.length > 0) {
          try {
            for (const data of offlineData) {
              const result = await postOpening(data);
              if (result.status === '201' && result.message === 'Data Created') {
                await removeDataFromDB(data.lkf_id);
              }
            }
            presentToast({
              message: 'Offline data sent successfully!',
              duration: 2000,
              position: 'top',
              color: 'success',
            });
          } catch (error) {
            console.error('Failed to send offline data:', error);
          }
        }
      }
    };

    window.addEventListener('online', checkAndSendOfflineData);
    return () => window.removeEventListener('online', checkAndSendOfflineData);
  }, []);

  useEffect(() => {
    const userData = async () => {
      const data = await getDataFromStorage('loginData');
      if (data) {
        const parsedData = data; 
        setFuelmanID(parsedData.jde);
        setFuelmanName(parsedData.fullname)
        setStation(parsedData.station);
        setSite(parsedData.site);
      } else {
        console.error('No user data found in storage');
      }
    };
  
    userData(); 
  }, []);

const doRefresh = async (event: CustomEvent) => {
  event.detail.complete(); 
};
const fetchSondingOffline = async () => {
  try {
    const sondingDataMaster = await getDataFromStorage('masterSonding');
    const parsedSondingData =
      typeof sondingDataMaster === 'string'
        ? JSON.parse(sondingDataMaster)
        : sondingDataMaster;
    if (Array.isArray(parsedSondingData)) {
      setSondingMasterData(parsedSondingData);
    }
  } catch (error) {
    console.error('Error fetching sonding data:', error);
  }
};

const updateOpeningDip = useCallback(() => {
  if (openingSonding !== undefined) {
    const matchingData = sondingMasterData.find(
      (item) => item.station === station && item.cm === openingSonding
    );

    if (matchingData) {
      setOpeningDip(matchingData.liters);
    } else {
      setOpeningDip(undefined);
    }
  }
}, [openingSonding, sondingMasterData, station]);

useEffect(() => {
  fetchSondingOffline();
}, []); // Initial data fetch

useEffect(() => {
  updateOpeningDip();
}, [openingSonding, sondingMasterData, station]); // Update openingDip based on changes

useEffect(() => {
  const loadShiftClose = async () => {
    console.log('Loading shift close data...');
    const userData = await getDataFromStorage('loginData');
    if (userData) {
      const stationData = userData.station;
      if (stationData) {
        const lastLKF = await getDataFromStorage('lastLKF');
        let lkf;
        if (typeof lastLKF === 'string') {
          try {
            lkf = JSON.parse(lastLKF);
            console.log('Parsed lastLKF:', lkf);
          } catch (error) {
            console.error('Error parsing lastLKF:', error);
            return; 
          }
        } else {
          lkf = lastLKF;
          console.log('Using lastLKF as object:', lkf);
        }

        const shiftClose = lkf?.find((v: any) => v.station === stationData);

        if (shiftClose) {
          console.log('Shift close data found:', shiftClose);
          setCloseShift(shiftClose);
          const latestShiftData = shiftClose;

          if (latestShiftData.closing_sonding !== undefined) {
            setOpeningSonding(latestShiftData.closing_sonding);
          }
          if (latestShiftData.flow_meter_end !== undefined) {
            setFlowMeterAwal(latestShiftData.flow_meter_end);
          }
          if (latestShiftData.closing_dip !== undefined) {
            setOpeningDip(latestShiftData.closing_dip); 
          }
          if (latestShiftData.hm_end !== undefined) {
            setHmAkhir(latestShiftData.hm_end);
            setPrevHmAwal(latestShiftData.hm_end);
          }
        } else {
          console.error('Shift close data not found for the station');
        }
      } else {
        console.error('Station data not found in loginData');
      }
    } else {
      console.error('No loginData found in storage');
    }
  };

  loadShiftClose();
}, [date]);



const handleFlowMeterAwalChange = (e: CustomEvent) => {
  const value = Number(e.detail.value);
  if (prevFlowMeterAwal !== undefined && value < prevFlowMeterAwal) {
    setShowError(true);
  } else {
    setShowError(false);
  }
  setFlowMeterAwal(value);
};

const handleOpeningSondingChange = (e: CustomEvent) => {
  const value = e.detail.value;

  if (value === null || value === "") {
    setOpeningSonding(undefined); 
  } else {
    const numericValue = Number(value);
    if (!Number.isNaN(numericValue)) {
      setOpeningSonding(numericValue); 
      console.log("Manual openingSonding update:", numericValue);
    }
  }
};


const handleOpeningDipChange = (e: CustomEvent) => {
  const value = e.detail.value;

  if (value === null || value === '') {
    setOpeningDip(undefined);
  } else {
    const numericValue = Number(value);
    if (!Number.isNaN(numericValue)) {
      setOpeningDip(numericValue);
    }
  }
};


  return (
    <IonPage>
      <IonHeader translucent={false} className="ion-no-border">
        <IonToolbar className="custom-header">
          <IonTitle>Form Opening Data Stock (Dip) & Sonding</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
      <IonRefresher slot="fixed" onIonRefresh={doRefresh}>
          <IonRefresherContent refreshingSpinner="circles"
           />
          
        </IonRefresher>

        <div className="wrapper-content">
          <div className="padding-content">
            <h2 style={{ textAlign: "center", fontSize: "30px" }}>LKF ID : {id}</h2>
            <h4>Employee ID : {fuelmanId} - {fuelmanName}</h4>
            <h4>Site : {site}</h4>
            <h4>Station : {station}</h4>
          </div>
          <IonRow className="padding-content">
            <IonCol style={{ display: "grid" }}>
              <IonLabel>
                Shift  <span style={{ color: "red", marginLeft: "20px" }}>*</span>
              </IonLabel>
              <IonRadioGroup
                className="radio-display"
                compareWith={compareWith}
                value={shiftSelected}
                onIonChange={(ev) => handleShiftChange(ev.detail.value)}
              >
                {shifts.map((shift) => (
                  <IonItem key={shift.id} className="item-no-border">
                    <IonRadio slot="start" value={shift} />
                    <IonLabel>{shift.name}</IonLabel>
                  </IonItem>
                ))}
              </IonRadioGroup>
            </IonCol>
            <IonCol>
              <IonLabel style={{ marginLeft: "20px" }}>
                Date <span style={{ color: "red", marginLeft: "20px" }}>*</span>
              </IonLabel>
              <IonItem>
                <IonInput
                  value={tanggalTrx}
                  placeholder="Select Date"
                  readonly
                  onClick={() => setShowDateModal(true)}
                />

              </IonItem>
              <IonModal isOpen={showDateModal}>
                <IonDatetime
                  value={date || new Date().toISOString()} 
                  onIonChange={handleDateChange}
                  max={new Date().toISOString()}  

                />
                <IonButton color="success" onClick={() => setShowDateModal(false)}>Close</IonButton>
              </IonModal>

            </IonCol>
          </IonRow>
          <div className="padding-content">
            <IonLabel className={showError && (openingSonding === undefined || Number.isNaN(openingSonding) || openingSonding < 100) ? "error" : ""}>
              Opening Sonding (Cm) <span style={{ color: "red" }}>*</span>
            </IonLabel>
            <IonInput
              className={`custom-input ${showError && (openingSonding === undefined || Number.isNaN(openingSonding) || openingSonding < 100) ? "input-error" : ""}`}
              type="number"
              value={openingSonding}
              onIonChange={handleOpeningSondingChange}
            />
            {showError && openingSonding === undefined && (
              <p style={{ color: "red" }}>* Field harus diisi</p>
            )}
          </div>
          <div className="padding-content">
            <IonLabel className={showError && (openingDip === undefined || Number.isNaN(openingDip) || openingDip < 100) ? "error" : ""}>
              Opening Dip (Liter) <span style={{ color: "red" }}>*</span>
            </IonLabel>
            <IonInput style={{ background: "#cfcfcf" }}
              className={`custom-input ${showError && (openingDip === undefined || Number.isNaN(openingDip) || openingDip < 100) ? "input-error" : ""}`}
              type="number"
              placeholder="Input opening dip dalam liter"
              value={openingDip}
              onIonChange={handleOpeningDipChange}
              readonly={stationOptions.includes(station ||'')}
              onIonInput={(e) => setOpeningDip(Number(e.detail.value))}

            />
            {showError && openingDip === undefined && (
              <p style={{ color: "red" }}>* Field harus diisi</p>
            )}
          </div>
          <div className="padding-content">
            <IonLabel className={showError && (flowMeterAwal === undefined || Number.isNaN(flowMeterAwal)) ? "error" : ""}>
              Flow Meter Awal <span style={{ color: "red" }}>*</span>
            </IonLabel>
            <IonInput
              className={`custom-input`}
              type="number"
              value={flowMeterAwal}
              onIonInput={(e) => {
                const value = Number(e.detail.value);
                handleFlowMeterAwalChange(e); // Call the handler here
              }}
            />
           {showError && (
            <p style={{ color: "red" }}>
              {flowMeterAwal === undefined
                ? '* Field harus diisi'
                : (prevFlowMeterAwal !== undefined && flowMeterAwal < prevFlowMeterAwal)
                  ? '* Flow Meter Awal tidak boleh kurang dari nilai sebelumnya'
                  : ''
              }
            </p>
          )}
          </div>
          <div className="padding-content">
            <IonLabel>
              HM Awal (Khusus Fuel Truck wajib disi sesuai dengan HM/KM Kendaraan)
            </IonLabel>
            <IonInput
              className={`custom-input ${showError && (hmAkhir === undefined || (station !== "FT" && hmAkhir === 0)) ? "input-error" : ""}`}
              type="number"
              placeholder={station === "FT" ? "Input HM Awal (0 jika di Fuel Truck)" : "Input HM Awal"}
              value={hmAkhir}
              onIonInput={(e) => {
                const value = Number(e.detail.value);
                if (station !== "FT" && value === 0) {
                  setHmAkhir(undefined);
                  setShowError(true);
                } else {
                  setHmAkhir(value); // Make sure to set HM Awal based on user input
                  setShowError(false);
                }
              }}
/>
            {showError && hmAkhir === undefined && (
              <p style={{ color: "red" }}>* Field harus diisi</p>
            )}
          </div>
          <IonRow className="padding-content btn-start">
     <IonButton 
        className="check-button" 
        onClick={handlePost} 
        disabled={!isOnline}
      >
        Mulai Kerja
      </IonButton>
     
     
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message="Anda sedang offline. Silakan cek koneksi internet Anda."
        duration={2000}
      /> 
          </IonRow>
         <IonRow>
      {!isOnline && (
        <IonLabel color="danger" style={{ marginTop: '10px'}}>
          <span style={{marginLeft:"15px", fontWeight:"600"}}> Device offline , periksa koneksi tablet </span>
        </IonLabel>
      )}
      </IonRow>
        </div>
     
      </IonContent>
    </IonPage>
  );
};

export default OpeningForm;