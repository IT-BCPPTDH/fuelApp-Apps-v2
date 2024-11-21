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
// import { getUser } from "../../hooks/getAllUser";
// import { getAllUnit } from "../../hooks/getAllUnit";
// import { getStation } from "../../hooks/useStation";
import { getAllSonding } from "../../hooks/getAllSonding";
import { getLatestLkfDataDate, getShiftDataByLkfId, getShiftDataByStation } from "../../utils/getData";
import { getStationData} from "../../hooks/getDataTrxStation";
import { saveDataToStorage, getDataFromStorage, fetchShiftData, getOperator } from "../../services/dataService";
import { debounce } from "../../utils/debounce";
import { chevronDownCircleOutline } from 'ionicons/icons';
// import { getAllQuota, getUnitQuotaActive } from "../../hooks/getQoutaUnit";

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
  const [loading, setLoading] = useState<boolean>(false); // State to manage loading status
  const [error, setError] = useState<string | null>(null); 
  const router = useIonRouter();
  const [presentToast] = useIonToast();

 const [closingSonding, setClosingSonding] = useState<number | undefined>(undefined);

const [prevHmAwal, setPrevHmAwal] = useState<number | undefined>(undefined);
const input1Ref = useRef<HTMLIonInputElement>(null);
const input2Ref = useRef<HTMLIonInputElement>(null);
const [showToast, setShowToast] = useState(false);
const [isOnline, setIsOnline] = useState(navigator.onLine);


const [jdeOptions, setJdeOptions] = useState<
{ JDE: string; fullname: string }[]
>([]);

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
  useEffect(() => {
  
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

    // fetchSondingMasterData();
  }, []);


  const debouncedUpdate = useCallback(
    debounce(async (openingSonding: number | undefined, station: string | undefined) => {
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
    }, 300), // Adjust the delay as needed
    [sondingMasterData] // Dependency array
  );

  useEffect(() => {
    debouncedUpdate(openingSonding, station);
  }, [openingSonding, station, debouncedUpdate]);




  // useEffect(() => {
  //   const updateOpeningDip = async () => {
  //     if (openingSonding !== undefined && station !== undefined) {
  //       try {
  //         if (openingSonding === 0 && station === 'loginData') {
  //           setOpeningDip(0);
  //         } else {
  //           const matchingData = sondingMasterData.find(
  //             (item) => item.station === station && item.cm === openingSonding
  //           );
  //           if (matchingData) {
  //             setOpeningDip(matchingData.liters);
  //           } else {
  //             setOpeningDip(undefined);
  //           }
  //         }
  //       } catch (error) {
  //         console.error('Failed to update opening dip', error);
  //       }
  //     }
  //   };

  //   updateOpeningDip();
  // }, [openingSonding, station, sondingMasterData]);

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
    console.log(1)
    let dataPost: DataLkf = {
      date: new Date(date).toISOString(),
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
      await addDataToDB(dataPost); // Add new data to local DB
      router.push("/dashboard");
      
    }
      // Post new data
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

 




  useEffect(() => {
    const userData = async () => {
      const data = await getDataFromStorage('loginData');
      if (data) {
        const parsedData = data; // Assuming data is already an object.
        // console.log('Parsed User Data:', parsedData); // Verify data structure
        setFuelmanID(parsedData.jde);
        setFuelmanName(parsedData.fullname)
        setStation(parsedData.station);
        setSite(parsedData.site);
        // fetchShiftDataByStation(parsedData.station);
      } else {
        console.error('No user data found in storage');
      }
    };
    // fetchData(); 
    userData(); // Call the async function
  }, []);


// const fetchData = async () => {
//   // setLoading(true);
//   try {
//     const cachedShiftData = await getDataFromStorage('shiftCloseData');
//     if (cachedShiftData && cachedShiftData.length > 0) {
//       setCloseShift(cachedShiftData);
//       const latestShiftData = cachedShiftData[cachedShiftData.length - 1]; 
//       if (latestShiftData.closing_sonding !== undefined) {
//         setOpeningSonding(latestShiftData.closing_sonding); 
//       }
//       if (latestShiftData.flow_meter_end !== undefined) {
//         setFlowMeterAwal(latestShiftData.flow_meter_end); 
//       }
//       if (latestShiftData.closing_dip !== undefined) {
//         setOpeningDip(latestShiftData.closing_dip); 
//       }
//       if (latestShiftData.hm_end !== undefined) {
//         setHmAkhir(latestShiftData.hm_end);
//         setPrevHmAwal(latestShiftData.hm_end);  // Set HM Awal
//       }
      

//     } else {
//       console.error("No cached shift data found");
//     }
//   } catch (error) {
//     console.error("Error fetching shift data:", error);
//   } finally {
//     setLoading(false);
//   }
// };

const doRefresh = async (event: CustomEvent) => {
  event.detail.complete(); 
};

// untuk Menampilkan Data
useEffect(() => {
  const loadShiftClose = async () => {
    // const cachedShiftData = await getDataFromStorage('shiftCloseData');
    

      // Get login data from Capacitor Storage
      const userData = await getDataFromStorage('loginData');
      if (userData) {
        const stationData = userData.station; 

        if (stationData) {
          // const shiftClose = await fetchShiftData(stationData); // Pass the selected date to fetch data
          const lastLKF = localStorage.getItem('CapacitorStorage.lastLKF') ?? '[]'; 
          let lkf = JSON.parse(lastLKF);
          // console.log('123',lkf)
          // console.log(234,stationData)
          const shiftClose = lkf?.find((v:lkf) => v.station === stationData)
          // console.log("Fetched Shift Close Data:", shiftClose);

          // Filter to only include specific fields
          // const filteredShiftClose = shiftClose.map((data: lkf) => ({
          //   closing_sonding: data.closing_sonding,
          //   closing_dip: data.closing_dip,
          //   flow_meter_en: data.flow_meter_end,
          //   hm_end: data.hm_end
          // })).filter((data:lkf) => data.closing_sonding !== undefined && data.closing_dip !== undefined && data.flow_meter_en !== undefined);

          // Log the filtered data for debugging
          // console.log("Filtered Shift Close Data:", filteredShiftClose);
          if (shiftClose) {
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
              setPrevHmAwal(latestShiftData.hm_end);  // Set HM Awal
            }
          }

          const lastLkf = {
            closing_sonding: shiftClose.closing_sonding,
            closing_dip: shiftClose.closing_dip,
            flow_meter_end: shiftClose.flow_meter_end,
            hm_end: shiftClose.hm_end
          };
          

          setCloseShift(lastLkf);
        } else {
          console.error("Station data not found in loginData");
        }
      } else {
        console.error("No loginData found in storage");
      }
    }

  loadShiftClose(); 
}, [date,openingDip]); 

const handleFlowMeterAwalChange = (e: CustomEvent) => {
  const value = Number(e.detail.value);
  if (prevFlowMeterAwal !== undefined && value < prevFlowMeterAwal) {
    setShowError(true);
  } else {
    setShowError(false);
  }
  setFlowMeterAwal(value);
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
              value={openingSonding}
              onIonChange={handleOpeningSondingChange}

             
              // onIonInput={(e) => setOpeningSonding(Number(e.detail.value))}
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
        // disabled={!isOnline}
      >
        Mulai Kerja
      </IonButton>
     
     
      {/* <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message="Anda sedang offline. Silakan cek koneksi internet Anda."
        duration={2000}
      /> */}
          </IonRow>
          {/* <IonRow>
      {!isOnline && (
        <IonLabel color="danger" style={{ marginTop: '10px'}}>
          <span style={{marginLeft:"15px", fontWeight:"600"}}> Device offline , periksa koneksi tablet </span>
        </IonLabel>
      )}
      </IonRow> */}
        </div>
     
      </IonContent>
    </IonPage>
  );
};

export default OpeningForm;