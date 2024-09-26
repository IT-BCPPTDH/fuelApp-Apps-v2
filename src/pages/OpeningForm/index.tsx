import React, { useEffect, useState } from "react";
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
  IonCard
} from "@ionic/react";
import "./style.css";
import { postOpening } from "../../hooks/serviceApi";
import { addDataToDB, getOfflineData, removeDataFromDB } from "../../utils/insertData";
import { DataLkf } from "../../models/db";
// import { getUser } from "../../hooks/getAllUser";
// import { getAllUnit } from "../../hooks/getAllUnit";
// import { getStation } from "../../hooks/useStation";
import { getAllSonding } from "../../hooks/getAllSonding";
import { getLatestLkfDataDate, getShiftDataByLkfId, getShiftDataByStation } from "../../utils/getData";
import { getStationData } from "../../hooks/getDataTrxStation";
import { saveDataToStorage, getDataFromStorage } from "../../services/dataService";

interface Shift {
  id: number;
  name: string;
  type: string;
}

const shifts: Shift[] = [
  { id: 1, name: "Day", type: "" },
  { id: 2, name: "Night", type: "" },
];

const compareWith = (o1: Shift, o2: Shift) => o1.id === o2.id;

const OpeningForm: React.FC = () => {
  const [openingDip, setOpeningDip] = useState<number | undefined>(undefined);
  const [flowMeterAwal, setFlowMeterAwal] = useState<number | undefined>(undefined);
  const [hmAwal, setHmAwal] = useState<number | undefined>(undefined);
  const [site, setSite] = useState<string | undefined>(undefined);
  const [station, setStation] = useState<string | undefined>(undefined);
  const [fuelmanId, setFuelmanID] = useState<string | undefined>(undefined);
  const [shiftSelected, setShiftSelected] = useState<Shift | undefined>(undefined);
  const [showError, setShowError] = useState<boolean>(false);
  const [id, setLkfId] = useState<string | undefined>(undefined);
  const [showDateModal, setShowDateModal] = useState<boolean>(false);
  const [sondingMasterData, setSondingMasterData] = useState<any[]>([]);
  const [openingSonding, setOpeningSonding] = useState<number | undefined>(undefined);
  const [prevFlowMeterAwal, setPrevFlowMeterAwal] = useState<number | undefined>(undefined);
  const [date, setDate] = useState<string>(new Date().toISOString());

  const [stationOptions, setStationOptions] = useState<string[]>([]);
  //const [capacity, setCapacity] = useState<string | undefined>(undefined);
  //const [dataUserLog, setDataUserLog] = useState<any | undefined>(undefined);
  // const [allUsers, setAllUser] = useState<any[]>([]);
  // const [unitOptions, setUnitOptions] = useState<{ id: string; unit_no: string; brand: string; owner: string }[]>([]);
  const [latestLkfData, setLatestLkfData] = useState<any | undefined>(undefined);
  const [closingSonding, setCloseSonding] = useState<number | undefined>(undefined);

  const router = useIonRouter();
  const [presentToast] = useIonToast();


  useEffect(() => {
    const determineShift = () => {
      const now = new Date();
      const currentHour = now.getHours();

      // Define shift time ranges
      const isDayShift = currentHour >= 6 && currentHour < 18;
      const isNightShift = currentHour >= 18 || currentHour < 6;

      if (isDayShift) {
        setShiftSelected(shifts.find((shift) => shift.name === "Day"));
      } else if (isNightShift) {
        setShiftSelected(shifts.find((shift) => shift.name === "Night"));
      }
    };

    determineShift();
  }, [])



  const handleShiftChange = (selectedShift: Shift) => {
    setShiftSelected(selectedShift);
  };


  useEffect(() => {
    const generateLkfId = () => {
      const timestamp = Date.now();
      return (timestamp % 100000000).toString().padStart(8, '0');
    };

    setLkfId(generateLkfId());

    const userData: any = getDataFromStorage('loginData')
    // localStorage.getItem("loginData");
    if (userData) {
      const parsedData =(userData);
      // setDataUserLog(parsedData);
      setFuelmanID(parsedData.jde);
      setStation(parsedData.station);
      // setCapacity(parsedData.capacity);
      setSite(parsedData.site);
    }
  }, [])
  useEffect(() => {
  
  }, []);


  useEffect(() => {
    const fetchLatestLkfData = async () => {
      const storedData = localStorage.getItem("latestLkfData");
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setLatestLkfData(parsedData);
        if (parsedData) {
          setFlowMeterAwal(parsedData.flow_meter_end);
          setPrevFlowMeterAwal(parsedData.flow_meter_end); // Initialize previous value
          setOpeningSonding(parsedData.closing_sonding);
        }
      }


    };

    fetchLatestLkfData();
  }, []);




  useEffect(() => {
    const fetchSondingMasterData = async () => {
      try {
        const response = await getAllSonding();
        if (response.status === '200' && Array.isArray(response.data)) {
          setSondingMasterData(response.data);
        } else {
          console.error('Unexpected data format');
        }
      } catch (error) {
        console.error('Failed to fetch sonding master data', error);
      }
    };

    fetchSondingMasterData();
  }, []);

  useEffect(() => {
    const updateOpeningDip = async () => {
      if (openingSonding !== undefined && station !== undefined) {
        try {
          if (openingSonding === 0 && station === 'loginData') {
            setOpeningDip(0);
          } else {
            const matchingData = sondingMasterData.find(
              (item) => item.station === station && item.cm === openingSonding
            );
            if (matchingData) {
              setOpeningDip(matchingData.liters);
            } else {
              setOpeningDip(undefined);
            }
          }
        } catch (error) {
          console.error('Failed to update opening dip', error);
        }
      }
    };

    updateOpeningDip();
  }, [openingSonding, station, sondingMasterData]);

  const handleDateChange = (e: CustomEvent) => {
    const selectedDate = e.detail.value as string;
    if (selectedDate) {
      setDate(selectedDate);
      setShowDateModal(false);
    }
  };
  
  const fetchShiftDataByStation = async (station: string) => {
    try {
      const shiftDataList = await getShiftDataByStation(station);
      console.log(`Shift Last Station ${station}:`, shiftDataList);
      
   
      localStorage.setItem("shiftData1", JSON.stringify(shiftDataList));
      
    } catch (error) {
      console.error('Error fetching shift data:', error);
    }
  };
  

useEffect(() => {
    // Retrieve station from local storage
    const loginData = localStorage.getItem('loginData');
    if (loginData) {
        const parsedData = JSON.parse(loginData);
        const stationFromLogin = parsedData.station; // Adjust according to the actual structure
        setStation(stationFromLogin);
        fetchShiftDataByStation(stationFromLogin); // Fetch shift data after setting the station
    }
}, []);

  const handlePost = async () => {
    if (
      !date ||
      !shiftSelected ||
      hmAwal === undefined ||
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

    const dataPost: DataLkf = {
      date: new Date(date).toISOString(),
      shift: shiftSelected.name,
      hm_start: hmAwal,
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
      variance: 0
    };

    try {
      const offlineData = await getOfflineData();
      const existingDataIndex = offlineData.findIndex((data: DataLkf) => data.lkf_id === id);

      if (existingDataIndex !== -1) {
        // Data already exists, update it
        await removeDataFromDB(id); // Ensure lkfId is of type string
      }

      // Post new data
      const result = await postOpening(dataPost);

      if (result.status === '201' && result.message === 'Data Created') {
        presentToast({
          message: 'Data posted successfully!',
          duration: 2000,
          position: 'top',
          color: 'success',
        });
        await addDataToDB(dataPost); // Add new data to local DB
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
    } catch (error) {
      setShowError(true);
      presentToast({
        message: 'You are offline. Data saved locally and will be sent when online.',
        duration: 2000,
        position: 'top',
        color: 'warning',
      });
      await addDataToDB(dataPost); // Add new data to local DB
      router.push("/dashboard");
      
    }
  };

  const handleOpeningSondingChange = (e: CustomEvent) => {
    const value = Number(e.detail.value); // Convert to number
    setOpeningSonding(value);
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


  // const fetchLatestLkfData = async () => {
  //   const latestData = await getLatestLkfDataDate();
    
  //   if (latestData) {
  //     console.log("Latest LKF Data:", latestData);
  //   } else {
  //     console.log("No LKF data found.");
  //   }
  // };
  
  // // Panggil fungsi untuk mengambil data
  // fetchLatestLkfData();
  



  const fetchLastLkfData = async (station: string) => {
    try {
        const response = await getStationData(station);
        console.log("Response Data:", response);

        // Check if the response has data
        if (response.status === "200" && response.data.length > 0) {
            const data = response.data[0]; // Get the first item from the data array
            
            // Store only the closing_sonding in local storage
            const closingSonding = data.closing_sonding; 
            const flowMeterAkhir = data.flow_meter_end; 
            const closingDipLiter = data.closing_dip; 
            localStorage.setItem('lastClosingSonding', JSON.stringify(closingSonding));
            localStorage.setItem('lastFlowMeter', JSON.stringify(flowMeterAkhir));
            localStorage.setItem('lastDipLiter', JSON.stringify(closingDipLiter));
            console.log("Closing Sonding stored in local storage:", closingSonding);
        } else {
            console.log("No data available or status not 200");
        }
    } catch (error) {
        console.error('Error fetching last LKF data:', error);
    }
};

  useEffect(() => {
    // Fetch the closing_sonding value from local storage
    const storedClosingSonding = localStorage.getItem('lastClosingSonding');
    if (storedClosingSonding) {
      const parsedClosingSonding = JSON.parse(storedClosingSonding);
     
      setCloseSonding(parsedClosingSonding);
    
    } else {
      console.log("No closing_sonding data found in local storage");
    }
  }, []);
  
  

  const getLastLkfData = () => {
    const lastLkfData = localStorage.getItem('lastLkfDataStation');
  
    if (lastLkfData) {
      try {
        const parsedData = JSON.parse(lastLkfData);
        console.log("Retrieved Last LKF Data:", parsedData);
  
        // Access specific properties such as closing_sonding
        if (parsedData.closing_sonding) {
          console.log("Closing Sonding:", parsedData.closing_sonding);
        } else {
          console.log("Closing Sonding data is not available");
        }
  
        return parsedData;
      } catch (error) {
        console.error("Error parsing last LKF data:", error);
      }
    } else {
      console.log("No last LKF data found in local storage");
    }
  
    return null;
  };
  useEffect(() => {
    getLastLkfData();
  }, []);
    

useEffect(() => {
  const storedClosingSonding = localStorage.getItem('lastClosingSonding');
  if (storedClosingSonding) {
      try {
          const parsedClosingSonding = JSON.parse(storedClosingSonding);
          parsedClosingSonding(parsedClosingSonding);
      } catch (error) {
          console.error("Error parsing closing_sonding from local storage:", error);
      }
  } else {
      console.log("No closing_sonding data found in local storage");
  }
}, []);


  
useEffect(() => {
    // Retrieve station from local storage
    const loginData = localStorage.getItem('loginData');
    if (loginData) {
        const parsedData = JSON.parse(loginData);
        const stationFromLogin = parsedData.station; // Adjust according to the actual structure
        setStation(stationFromLogin);
    }
}, []); // Runs only once on component mount

useEffect(() => {
    if (station) {
        fetchLastLkfData(station);
    }
}, [station]);



  return (
    <IonPage>
      <IonHeader translucent={true} className="ion-no-border">
        <IonToolbar className="custom-header">
          <IonTitle>Form Opening Data Stock (Dip) & Sonding</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
   
        <div className="wrapper-content">
          <div className="padding-content">
            <h2 style={{ textAlign: "center", fontSize: "30px" }}>LKF ID : {id}</h2>
            <h4>Employee ID : {fuelmanId}</h4>
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
                  value={new Date(date).toLocaleDateString()}
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
              value={closingSonding}
              onIonInput={(e) => setOpeningSonding(Number(e.detail.value))}
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
              disabled
              readonly={stationOptions.includes(station || '')}
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
                setFlowMeterAwal(value);
                if (prevFlowMeterAwal !== undefined && value < prevFlowMeterAwal) {
                  setShowError(true);
                } else {
                  setShowError(false);
                }
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
              className={`custom-input ${showError && (hmAwal === undefined || (station !== "FT" && hmAwal === 0)) ? "input-error" : ""}`}
              type="number"
              placeholder={station === "FT" ? "Input HM Awal (0 jika di Fuel Truck)" : "Input HM Awal"}
              value={hmAwal}
              onIonInput={(e) => {
                const value = Number(e.detail.value);
                if (station !== "FT" && value === 0) {
                  setHmAwal(undefined);
                  setShowError(true);
                } else {
                  setHmAwal(value);
                  setShowError(false);
                }
              }}
            />
            {showError && hmAwal === undefined && (
              <p style={{ color: "red" }}>* Field harus diisi</p>
            )}
          </div>
          <IonRow className="padding-content btn-start">
            <IonButton className="check-button" onClick={handlePost}>
              Mulai Kerja
            </IonButton>
          </IonRow>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default OpeningForm;
function setClosingDip(dataFromClosing: any) {
  throw new Error("Function not implemented.");
}

