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
  IonLoading,
  IonRefresher,
  IonRefresherContent,
  IonToast,
  IonSpinner,
  IonImg
} from "@ionic/react";

import "./style.css";
import { postOpening } from "../../hooks/serviceApi";
import { addDataToDB, getOfflineData, removeDataFromDB } from "../../utils/insertData";
import { DataLkf } from "../../models/db";
// import { getUser } from "../../hooks/getAllUser";
// import { getAllUnit } from "../../hooks/getAllUnit";
// import { getStation } from "../../hooks/useStation";
// import { getAllSonding } from "../../hooks/getAllSonding";
// import { bulkInsertDataMasterTransaksi, getLatestLkfDataDate, getShiftDataByLkfId, getShiftDataByStation } from "../../utils/getData";
// import { getStationData} from "../../hooks/getDataTrxStation";
import { saveDataToStorage, getDataFromStorage, fetchShiftData, getOperator } from "../../services/dataService";
import { debounce } from "../../utils/debounce";
import { chevronDownCircleOutline } from 'ionicons/icons';

interface Shift {
  id: number;
  name: string;
  type: string;
}

interface DataStationSonding {
  cm: number;
  column1: any; // Replace `any` with the appropriate type if known
  created_at: string | null;
  creation_by: string | null;
  creation_date: string;
  id: number;
  isDelete: boolean;
  liters: number;
  site: string;
  station: string;
  station_cm_liters: any; // Replace `any` with the appropriate type if known
  station_cm_liters_alternate: any; // Replace `any` with the appropriate type if known
  updated_at: string | null;
  updated_by: string | null;
}

interface DataLastLkf {
  closing_sonding: number;
  closing_dip: number;
  flow_meter_end: number;
  hm_end: number;
}

interface Lkf{
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
  const [progress, setProgress] = useState(0);
  const [stationOptions, setStationOptions] = useState<string[]>([]);

  const [closeShift, setCloseShift] = useState<DataLastLkf|null>(null); // Initialize as an array
  const [loading, setLoading] = useState<boolean>(true); // State to manage loading status
  const [error, setError] = useState<string | null>(null); 
  const router = useIonRouter();
  const [presentToast] = useIonToast();

 const [closingSonding, setClosingSonding] = useState<number | undefined>(undefined);

const [prevHmAwal, setPrevHmAwal] = useState<number | undefined>(undefined);
const input1Ref = useRef<HTMLIonInputElement>(null);
const input2Ref = useRef<HTMLIonInputElement>(null);
const [showToast, setShowToast] = useState(false);
const [isOnline, setIsOnline] = useState(navigator.onLine);

const [buffer, setBuffer] = useState(0.06);


const [jdeOptions, setJdeOptions] = useState<
{ JDE: string; fullname: string }[]
>([]);

useEffect(() => {
  const interval = setInterval(() => {
    setBuffer((prevBuffer) => prevBuffer + 0.06);
    setProgress((prevProgress) => prevProgress + 0.06);
  }, 1000);

  return () => clearInterval(interval);
}, []);

if (progress > 1) {
  setTimeout(() => {
    setBuffer(0.06);
    setProgress(0);
  }, 1000);
}

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
    }, 300), 
    [sondingMasterData] 
  );


  
  useEffect(() => {
    // debouncedUpdate(openingSonding, station);
  }, [openingSonding, station, debouncedUpdate]);

  const handleDateChange = (e: CustomEvent) => {
    const selectedDate = e.detail.value as string;
    if (selectedDate) {
      setDate(selectedDate);
      setShowDateModal(false);
    }
  };

  
  
  // const fetchShiftDataByStation = async (station: string) => {
  //   try {
  //     const shiftDataList = await getShiftDataByStation(station);
  //     console.log(`Shift Last Station ${station}:`, shiftDataList);
      
   
  //     localStorage.setItem("shiftData1", JSON.stringify(shiftDataList));
      
  //   } catch (error) {
  //     console.error('Error fetching shift data:', error);
  //   }
  // };
  

// useEffect(() => {
//     // Retrieve station from local storage
//     const loginData = localStorage.getItem('loginData');
//     if (loginData) {
//         const parsedData = JSON.parse(loginData);
//         const stationFromLogin = parsedData.station; // Adjust according to the actual structure
//         setStation(stationFromLogin);
//         fetchShiftDataByStation(stationFromLogin); // Fetch shift data after setting the station
//     }
// }, []);

  // const handlePost = async () => {
  //   if (!isOnline) {
  //     setShowToast(true);
  //     return;
  //   }
  //   if (
  //     !date ||
  //     !shiftSelected ||
  //     hmAkhir === undefined ||
  //     openingDip === undefined ||
  //     openingSonding === undefined ||
  //     flowMeterAwal === undefined ||
  //     site === undefined ||
  //     fuelmanId === undefined ||
  //     station === undefined ||
  //     id === undefined
  //   ) {
  //     setShowError(true);
  //     return;
  //   }

  //   const dataPost: DataLkf = {
  //     // date: new Date(date).toISOString(),
  //     date: new Date(date).toLocaleDateString('en-CA'),
  //     shift: shiftSelected.name,
  //     hm_start: hmAkhir,
  //     opening_dip: openingDip,
  //     opening_sonding: openingSonding,
  //     flow_meter_start: flowMeterAwal,
  //     site: site,
  //     fuelman_id: fuelmanId,
  //     station: station,
  //     jde: fuelmanId,
  //     lkf_id: id,
  //     issued: undefined,
  //     receipt: undefined,
  //     stockOnHand: 0,
  //     name: "",
  //     hm_end: 0,
  //     closing_dip: 0,
  //     closing_sonding: 0,
  //     flow_meter_end: 0,
  //     note: "",
  //     signature: "",
  //     close_data: 0,
  //     variant: 0
  //   };

  //   try {
  //     const offlineData = await getOfflineData();
  //     const existingDataIndex = offlineData.findIndex((data: DataLkf) => data.lkf_id === id);

  //     if (existingDataIndex !== -1) {
  //       // Data already exists, update it
  //       await removeDataFromDB(id); // Ensure lkfId is of type string
  //     }

  //     // Post new data
  //     const result = await postOpening(dataPost);

  //     if (result.status === '201' && result.message === 'Data Created') {
  //       presentToast({
  //         message: 'Data posted successfully!',
  //         duration: 2000,
  //         position: 'top',
  //         color: 'success',
  //       });
  //       await addDataToDB(dataPost); // Add new data to local DB
       
  //       router.push("/dashboard");
  //     } else {
  //       setShowError(true);
  //       presentToast({
  //         message: 'Failed to post data.',
  //         duration: 2000,
  //         position: 'top',
  //         color: 'danger',
  //       });
  //     }
  //   } catch (error) {
  //     setShowError(true);
  //     presentToast({
  //       message: 'Selamat Bekerja',
  //       duration: 2000,
  //       position: 'top',
  //       color: 'success',
  //     });
  //     await addDataToDB(dataPost); // Add new data to local DB
  //     router.push("/dashboard");
      
  //   }
  // };

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
      if(isOnline){
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
          saveDataToStorage("openingSonding", dataPost);
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
    let cekDip = sondingMasterData.find((v:DataStationSonding) => v.cm === value)
    setOpeningSonding(value); 
    setTimeout(() => {
                if(cekDip){
                  setOpeningDip(cekDip.liters); 
                }else{
                  let cmSonding = 0
                  if(value < 1){
                    cmSonding = Math.ceil(value)
                  }else{
                    cmSonding = Math.floor(value)
                  }
                  let cekDip2 = sondingMasterData.find((v:DataStationSonding) => v.cm === cmSonding)
                  setOpeningDip(cekDip2?.liters); 
                }
    }, 1000);
    // setOpeningSonding(value);
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
    // getMasterSonding()
  }, []);

 
  // const getMasterSonding = async () =>{
  //   const data = await getDataFromStorage('masterSonding');
  //   // console.log(1,data)
  //     setSondingMasterData(dataSonding)
  // }



// useEffect(() => {
//     // Retrieve station from local storage
//     const loginData = localStorage.getItem('loginData');
//     if (loginData) {
//         const parsedData = JSON.parse(loginData);
//         const stationFromLogin = parsedData.station; 
//         setStation(stationFromLogin);
//     }
// }, []); // Runs only once on component mount

 


const doRefresh = async (event: CustomEvent) => {
  // await fetchData();
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
        const dataSonding = await getDataFromStorage('masterSonding');
        let dataSnd = dataSonding.filter((v: DataStationSonding) => v.station === stationData);
        setSondingMasterData(dataSnd)
        if (stationData) {
          // const shiftClose = await fetchShiftData(stationData); // Pass the selected date to fetch data
          const lastLKF = localStorage.getItem('CapacitorStorage.lastLKF')
          let lkf: any = lastLKF ? JSON.parse(lastLKF) : null;
          // console.log('123',lkf)
          // console.log(234,stationData)
          const shiftClose = lkf?.find((v:Lkf) => v.station === stationData)
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
              // console.log(123456,sondingMasterData)

              if(latestShiftData.closing_sonding){
                let cekDip = dataSnd.find((v:DataStationSonding) => v.cm === latestShiftData.closing_sonding)
                
                setOpeningSonding(latestShiftData.closing_sonding); 
                if(cekDip){
                  setOpeningDip(cekDip.liters); 
                }else{
                  let cmSonding = 0
                  if(latestShiftData.closing_sonding < 1){
                    cmSonding = Math.ceil(latestShiftData.closing_sonding)
                  }else{
                    cmSonding = Math.floor(latestShiftData.closing_sonding)
                  }
                  let cekDip2 = dataSnd.find((v:DataStationSonding) => v.cm === cmSonding)
                  if(cekDip2){
                    setOpeningDip(cekDip2?.liters); 
                  }else{
                    setOpeningDip(latestShiftData.closing_dip); 
                  }
                }
              }
            }
            if (latestShiftData.flow_meter_end !== undefined) {
              setFlowMeterAwal(latestShiftData.flow_meter_end); 
            }
            // if (latestShiftData.closing_dip !== undefined) {
            //   setOpeningDip(latestShiftData.closing_dip); 
            // }
            if (latestShiftData.hm_end !== undefined) {
              setHmAkhir(latestShiftData.hm_end);
              setPrevHmAwal(latestShiftData.hm_end);  // Set HM Awal
            }
          }

          const dataLastLkf: DataLastLkf = {
            closing_sonding: shiftClose?.closing_sonding || 0, // Use default value if `shiftClose` might be undefined
            closing_dip: shiftClose?.closing_dip || 0,
            flow_meter_end: shiftClose?.flow_meter_end || 0,
            hm_end: shiftClose?.hm_end || 0
          }

          setCloseShift(dataLastLkf);
        } else {
          console.error("Station data not found in loginData");
        }
      } else {
        console.error("No loginData found in storage");
      }
    }

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

// const fetchData = async () => {
//   setLoading(true);
//   setProgress(0);  
  
//   try {
//     const cachedShiftData = await getDataFromStorage('shiftCloseData');
//     if (cachedShiftData && cachedShiftData.length > 0) {
//       setCloseShift(cachedShiftData);
//       const latestShiftData = cachedShiftData[cachedShiftData.length - 1];

//       // Simulate progress updates
//       setProgress(0.2);  // After fetching the first batch of data
//       if (latestShiftData.closing_sonding !== undefined) {
//         setOpeningSonding(latestShiftData.closing_sonding);
//       }
//       setProgress(0.4);
      
//       if (latestShiftData.flow_meter_end !== undefined) {
//         setFlowMeterAwal(latestShiftData.flow_meter_end);
//       }
//       setProgress(0.6);
      
//       if (latestShiftData.closing_dip !== undefined) {
//         setOpeningDip(latestShiftData.closing_dip);
//       }
//       setProgress(0.8);
      
//       if (latestShiftData.hm_end !== undefined) {
//         setHmAkhir(latestShiftData.hm_end);
//         setPrevHmAwal(latestShiftData.hm_end);
//       }
//       setProgress(1);  // Finished data processing
//     } else {
//       console.error("No cached shift data found");
//     }
//   } catch (error) {
//     console.error("Error fetching shift data:", error);
//   }
// };
// useEffect(() => {
//   const fetchDataWithDelay = async () => {
//     try {
//       setLoading(true); 
//       await new Promise((resolve) => setTimeout(resolve, 200)); 
//       // await fetchData(); 
//     } catch (error) {
//       console.error("Error in delayed fetchData:", error);
//     } finally {
//       setLoading(false); 
//     }
//   };

//   // fetchDataWithDelay();
// }, []);



useEffect(() => {
  // Check if all fields are populated
  if (
    openingSonding !== undefined &&
    openingDip !== undefined &&
    flowMeterAwal !== undefined &&
    hmAkhir !== undefined
  ) {
    setLoading(false);
  }
}, [openingSonding, openingDip, flowMeterAwal, hmAkhir]);  // Dependencies to check if data has changed


  return (
    <IonPage>
      <IonHeader translucent={true} className="ion-no-border">
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
          
        {/* <IonModal isOpen={loading} className="custom-modal">
       
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '50%',
            backgroundColor: '#73a33f00',
          }}
        >
          <div style={{ textAlign: 'center', backgroundColor: '#73a33f00', padding: '20px', borderRadius: '8px' }}>
          <IonImg
           
              src="logodhbaru1.png"
              alt="Logo DH"
              style={{
                width: '220px',
                height: '80px',
                position: 'relative',
                zIndex: 1,
              }}
            />
           
            <p style={{ justifyContent:"center" , fontSize:"36px" , color:"orange"}}>Proses Load Data!!</p>
            <p style={{ justifyContent:"center" , fontSize:"24px" , color:"green"}}>Mohon Tunggu Sebentar!!</p>
            <IonSpinner name="crescent"  className="ion-spinner"/>
          </div>
        </div>
      </IonModal> */}
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
              {/* <IonItem>
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
              </IonModal> */}
        <IonItem>
        <IonInput
          value={new Date(date).toLocaleDateString('en-GB')}  // Display date in readable format (e.g., DD/MM/YYYY)
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
            <IonLabel >
              Opening Sonding (Cm) <span style={{ color: "red" }}>*</span>
            </IonLabel>
            <IonInput
              className={`custom-input `}
              type="number"
              value={openingSonding}
              onIonInput={(e) => {
                const value = Number(e.detail.value);
                handleOpeningSondingChange(e); // Call the handler here
              }}
              // onIonChange={handleOpeningSondingChange}
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
  className={`custom-input ${showError && ((station !== "FT" && hmAkhir === 0) || hmAkhir === undefined) ? "input-error" : ""}`}
  type="number"
  placeholder={station === "FT" ? "Input HM Awal (0 jika di Fuel Truck)" : "Input HM Awal"}
  value={hmAkhir}
  onIonInput={(e) => {
    const value = Number(e.detail.value);

    // Allow 0 only if station is "FT", otherwise show error when value is 0
    if (station === "FT" || value > 0) {
      setHmAkhir(value); // Set HM Awal based on user input
      setShowError(false);
    } else {
      setHmAkhir(undefined);
      setShowError(true); // Show error for non-FT stations when value is 0 or undefined
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
        disabled={openingDip === undefined || Number.isNaN(openingDip)}
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
      {/* {!isOnline && (
        <IonLabel color="danger" style={{ marginTop: '10px'}}>
          <span style={{marginLeft:"15px", fontWeight:"600"}}> Device offline , periksa koneksi tablet </span>
        </IonLabel>
      )} */}
      </IonRow>

        </div>
        {/* <IonLoading
      isOpen={loading}
      message="Please wait..."
      spinner="circles"
      duration={0}  // This keeps the spinner until you set loading to false
    /> */}
      </IonContent>
    </IonPage>
  );
};

export default OpeningForm;


