import React, { useState, useEffect, useCallback } from "react";
import {
  IonImg,
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonPage,
  IonRow,
  IonCard,
  IonInput,
  useIonRouter,
  IonLabel,
  IonTitle,
  IonLoading,
  IonAlert,
} from "@ionic/react";
import Cookies from "js-cookie";
import { postAuthLogin } from "../../hooks/useAuth";
import "./style.css";
import {
  fetchStationData,
  saveDataToStorage,
  getDataFromStorage,
  fetchOperatorData,
  fetchQuotaData,
  fetchUnitLastTrx,
  fetchUnitData,
  fetchLasTrx,
  fetchLasLKF,
} from "../../services/dataService";
import Select from "react-select";
import { getTrasaksiSemua } from "../../hooks/getAllTransaksi";
import { bulkInsertDataMasterTransaksi } from "../../utils/getData";
import { getAllSonding } from "../../hooks/getAllSonding";


// Define props interface
interface LoginProps {
  onLoginSuccess: () => void;
}

interface operator {
  JDE: string;
  fullname: string;
  admin_fuel: string
  falsedivision: string
  fuelman: boolean
  id: BigInteger 
  position: string
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [jde, setJdeOperator] = useState<string>("");
  const [stationData, setStationData] = useState<{ value: string; label: string; site: string; fuel_station_type: string }[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<string>("");
  const [showError, setShowError] = useState<boolean>(false);
  
  const [alreadyLoggedIn, setAlreadyLoggedIn] = useState<boolean>(false);
  const router = useIonRouter();
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [dtTrx, setDtTrx] = useState<
  { hm_km: string; no_unit: string }[]
>([]);

const [transaksiData, setTransaksiData] = useState<any>(null); 
  const [qouta, setQouta] = useState()
  const [jdeOptions, setJdeOptions] = useState<
  { JDE: string; fullname: string }[]
>([]);

  const loadStationData = useCallback(async () => {
  
    try {
      setLoading(true);
      const cachedData = await getDataFromStorage('stationData');

      if (cachedData) {
        setStationData(cachedData);
      } else {
        const stations = await fetchStationData();
        const formattedStations = stations.map((station) => ({
          value: station.fuel_station_name,
          label: station.fuel_station_name,
          site: station.site,
          fuel_station_type: station.fuel_station_type,
        }));
        setStationData(formattedStations);
      }
    } catch (err) {
      console.error('Error loading station data:', err);
    } finally {
      setLoading(false);
    }
  }, []);



  

  useEffect(() => {
    loadStationData(); // Load data pertama kali
  
    // Panggil fetchData kedua kali setelah 2 detik (2000ms)
    const timeoutId = setTimeout(() => {
      loadStationData(); // Load data kedua kali
    }, 2000); // 2000ms = 2 detik
  
    // Bersihkan timeout jika komponen di-unmount
    return () => clearTimeout(timeoutId);
  }, []);
  

 

  // const handleLogin = async () => {
  //   setLoading(true);
  //   if (!jde || !selectedUnit) {
  //     console.error("Employee ID dan Station harus diisi.");
  //     setShowError(true);
  //     setLoading(false);
  //     return;
  //   }


  //   const selectedStation = stationData.find((station) => station.value === selectedUnit);
  //   if (!selectedStation) {
  //     console.error("Selected station not found");
  //     setShowError(true);
  //     setLoading(false);
  //     return;
  //   }

  //   const currentDate = new Date().toISOString();

  //   try {
  //     const response = await postAuthLogin({
  //       station: selectedUnit,
  //       date: currentDate,
  //       JDE: jde,
  //     });

  //     if (response.status === '200' && response.message === 'Data Created') {
  //       const { token } = response.data;
  //       Cookies.set("session_token", token, { expires: 1 });
  //       Cookies.set("isLoggedIn", "true", { expires: 1 });

  //       const loginData = {
  //         station: selectedUnit,
  //         jde: jde,
  //         site: selectedStation.site,
  //       };
        
  //       console.log("Starting handleGet to process transaksiData...");
  //       await handleGet();
  //       saveDataToStorage("loginData", loginData);
       
  //       // Notify the App component about the login success
  //       onLoginSuccess();

  //       // Navigate to the opening page
       
       
       
  //       setShowAlert(true);
  //       router.push("/opening");
  //       setShowAlert(true);
      
  //     } else {
  //       console.error("Unexpected response:", response);
  //       setShowError(true);
  //     }
  //   } catch (error) {
  //     console.error("Error during login:", error);
  //     setShowError(true);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  
  const handleLogin = async () => {
    setLoading(true);
    if (!jde || !selectedUnit) {
      console.error("Employee ID dan Station harus diisi.");
      setShowError(true);
      setLoading(false);
      return;
    }

    const selectedStation = stationData.find((station) => station.value === selectedUnit);
    if (!selectedStation) {
      console.error("Selected station not found");
      setShowError(true);
      setLoading(false);
      return;
    }
    setLoading(false);
    // const currentDate = new Date().toISOString();

    try {
      const op = await getDataFromStorage('allOperator')
      console.log('operator',op)

      let checkID = op.find((v : operator)=> v.JDE === jde)
      console.log('id',checkID)
      if(checkID.fuelman){
        
        console.log('login')

        const loginData = {
          station: selectedUnit,
          jde: checkID.JDE,
          site: selectedStation.site,
          fullname: checkID.fullname
        };
        
        
        saveDataToStorage("loginData", loginData);
        Cookies.set("isLoggedIn", "true", { expires: 1 });

        router.push("/opening");
        onLoginSuccess();
        setShowAlert(true);
        console.log('off')
      }else{
        console.log('salah')
        setShowError(true);
      }

    } catch (error) {
      console.error("Error during login:", error);
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleGet = async () => {
    try {
      // Ambil data transaksi dari localStorage
      const transaksiDataString = localStorage.getItem('transaksiData');
      console.log("Data from localStorage:", transaksiDataString); // Debugging
  
      if (transaksiDataString) {
        // Parsing data JSON dari string
        const transaksiData = JSON.parse(transaksiDataString);
        console.log("Parsed transaksiData:", transaksiData); // Debugging
  
        // Cek apakah transaksiData adalah array dan tidak kosong
        if (Array.isArray(transaksiData) && transaksiData.length > 0) {
          // Lakukan bulk insert ke IndexedDB
          await bulkInsertDataMasterTransaksi(transaksiData);
          console.log('Data transaksi berhasil dimasukkan ke IndexedDB.');
        } else {
          console.warn('Data transaksi kosong atau tidak valid.');
        }
      } else {
        console.warn('Tidak ada data transaksi yang tersedia di localStorage.');
      }
    } catch (error) {
      console.error('Error saat melakukan bulk insert dari localStorage:', error);
    }
  };


  const loadOperator = async () => {
    try {
      // First, check local storage for cached operator data
      const cachedData = await getDataFromStorage('allOperator');
      if (cachedData && Array.isArray(cachedData)) {
        // console.log("Loaded operator data from local storage:", cachedData);
        setJdeOptions(cachedData); // Use the cached data
      } else {
        // If no cached data, fetch from the API
        const fetchedJdeOptions = await fetchOperatorData();
        if (fetchedJdeOptions.length > 0) {
          console.log("Fetched operator data and saved to local storage:", fetchedJdeOptions);
          setJdeOptions(fetchedJdeOptions); // Update state with fetched data
        } else {
          console.error("No valid operator data fetched");
        }
      }
    } catch (error) {
      console.error("Error loading operator data:", error);
    }
  };
  
  // Call loadOperator in a useEffect
  useEffect(() => {
    loadOperator(); // Fetch operator data when the component mounts
  }, []);
  
  useEffect(() => {
    const loadUnitDataQuota = async () => {
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        try {
            const quotaData = await fetchQuotaData(formattedDate);
            console.log('Fetched Qouta Login ', quotaData);

            if (quotaData && Array.isArray(quotaData)) {
                let foundUnitQuota = quotaData.find((unit) => unit.no_unit === selectedUnit);

                if (!foundUnitQuota) {
                    const yesterday = new Date(today);
                    yesterday.setDate(today.getDate() - 1);
                    const formattedYesterday = yesterday.toISOString().split('T')[0];
                    const previousQuotaData = await fetchQuotaData(formattedYesterday);
                    console.log('Fetched previous quota data:', previousQuotaData);
                    foundUnitQuota = previousQuotaData.find((unit) => unit.no_unit === selectedUnit);
                }
            } else {
                console.error('No quota data found for the specified date');
            }
        } catch (error) {
            console.error('Error fetching quota data:', error);
        }
    };

    loadUnitDataQuota();
}, []);



const dataTrasaksi = async () => {
  try {
    // Mengambil data transaksi dari API atau sumber lainnya
    const response = await getTrasaksiSemua();
    console.log("API response:", response); // Log the response to check its structure

    if (response.status === '200' && response.data && Array.isArray(response.data) && response.data.length > 0) {
      // Menyimpan data transaksi ke localStorage dengan nama 'transaksiData'
      localStorage.setItem('prevData', JSON.stringify(response.data));
      console.log('Transaksi data has been saved to localStorage.');
    } else {
      console.warn('No transaksi data to save or invalid response.');
    }
  } catch (error) {
    console.error('Error fetching and saving transaksi data:', error);
  }
};


const loadUnitData = async () => {
  const units = await fetchUnitData();
};
const loadLastTrx = async () => {
const units = await fetchLasTrx();
};

const loadLastLKF = async () => {
const units = await fetchLasLKF();
};


useEffect(() => {
  loadUnitData()
  loadLastTrx()
  loadLastLKF()
  fetchSondingMasterData();
  // Only call dataTrasaksi once when the component mounts
  dataTrasaksi();
}, []); 



 // Empty dependency array ensures it runs only once on mount
 const fetchSondingMasterData = async () => {
  try {
    const response = await getAllSonding();
    if (response.status === '200' && Array.isArray(response.data)) {
      // setSondingMasterData(response.data);
      await saveDataToStorage('masterSonding', response.data);
    } else {
      console.error('Unexpected data format');
    }
  } catch (error) {
    console.error('Failed to fetch sonding master data', error);
  }
};







const loadTrxLast = async () => {
  try {
    // First, check local storage for cached operator data
    const cachedData = await getDataFromStorage('oneMounth');
    if (cachedData && Array.isArray(cachedData)) {
      console.log("Loaded data terakhir:", cachedData);
      setDtTrx(cachedData); // Use the cached data
    } else {
      // If no cached data, fetch from the API
      const fetchedJdeOptions = await fetchUnitLastTrx(selectedUnit);
      if (fetchedJdeOptions.length > 0) {
        console.log("Fetched operator data and saved to local storage:", fetchedJdeOptions);
        setDtTrx(fetchedJdeOptions); // Update state with fetched data
      } else {
        console.error("No valid operator data fetched");
      }
    }
  } catch (error) {
    console.error("Error loading operator data:", error);
  }
};


useEffect(() => {
  loadTrxLast(); 
}, []);

  return (
    <IonPage>
      <IonContent fullscreen className="ion-content">
        <div className="content ion-content">
          <IonCard className="mt bg-card">
            <IonGrid className="ion-padding">
              <IonRow className="ion-justify-content-left logo-login">
                <IonCol size="5">
                  <IonImg className="img" src="logodhbaru1.png" alt="Logo DH"  />
                  
                </IonCol>
               
              </IonRow>
              <IonRow>
              <span className="sub-title">Fuel App V2.0</span>
              </IonRow>
              <IonRow className="mt-content">
                {alreadyLoggedIn ? (
                  <IonCol size="12">
                    <IonTitle style={{ marginTop: "10px", color: "red" }}>
                      Anda sudah login!
                    </IonTitle>
                  </IonCol>
                ) : (
                  <>
                    <IonCol size="12">
                      <IonLabel>Select Station</IonLabel>
                      <div style={{ marginTop: "10px" }}>
                      <IonLoading isOpen={loading} message={"Loading..."} />
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
                          value={stationData.find(station => station.value === selectedUnit)}
                          onChange={(selectedOption) => {
                            const selectedValue = selectedOption?.value || "";
                            setSelectedUnit(selectedValue);
                          }}
                          options={stationData}
                          placeholder="Select a station"
                          isClearable={true}
                          isDisabled={stationData.length === 0}
                          noOptionsMessage={() => "No stations available"}
                        />
                      </div>
                    </IonCol>
                    <IonCol size="12" className="mt10">
                      <IonLabel>Employee ID</IonLabel>
                      <IonInput
                        className="custom-input input-custom"
                        placeholder="Employee ID"
                        value={jde}
                        onIonInput={(e) => setJdeOperator(e.detail.value as string)}
                      ></IonInput>
                    </IonCol>
                    <IonCol className="mr-content">
                      <IonButton className="check-button" expand="block" onClick={handleLogin} disabled={loading}>
                        {loading ? "Loading..." : "Login"}
                      </IonButton>

                      <IonButton  color="warning"  expand="block" onClick={handleGet} disabled={loading}>
                        {loading ? "Loading..." : "Refresh Data"}
                      </IonButton>

                    </IonCol>
                  </>
                )}
              </IonRow>
              {showError && (
                <IonRow className="bg-text">
                  <IonCol>
                    <IonTitle style={{ fontSize:"14px" }}>
                      <span>
                    Station atau Employee ID Salah !!</span>
                    </IonTitle>
                  </IonCol>
                </IonRow>
              )}
            </IonGrid>
          </IonCard>
        </div>
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={'Login Sukses'}
          message={'Anda berhasil login!'}
          buttons={['OK']}
        />
      </IonContent>
    </IonPage>
  );
};

export default Login;