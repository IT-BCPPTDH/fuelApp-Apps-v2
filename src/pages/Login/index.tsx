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
} from "../../services/dataService";
import Select from "react-select";
import AsyncSelect from 'react-select/async';
import { getPrevUnitTrx } from "../../hooks/getDataPrev";
import { getOperator } from "../../hooks/getAllOperator";

// Define props interface
interface LoginProps {
  onLoginSuccess: () => void;
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
    loadStationData(); // Load data when the component mounts

    const intervalId = setInterval(() => {
      loadStationData(); // Refresh data every 5 seconds
    }, 3000);

    return () => clearInterval(intervalId); // Clear interval on component unmount
  }, [loadStationData]);
  
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

    const currentDate = new Date().toISOString();

    try {
      const response = await postAuthLogin({
        station: selectedUnit,
        date: currentDate,
        JDE: jde,
      });

      if (response.status === '200' && response.message === 'Data Created') {
        const { token } = response.data;
        Cookies.set("session_token", token, { expires: 1 });
        Cookies.set("isLoggedIn", "true", { expires: 1 });

        const loginData = {
          station: selectedUnit,
          jde: jde,
          site: selectedStation.site,
        };
        
        saveDataToStorage("loginData", loginData);
       
        // Notify the App component about the login success
        onLoginSuccess();

        // Navigate to the opening page
        setShowAlert(true);
        router.push("/opening");
      } else {
        console.error("Unexpected response:", response);
        setShowError(true);
      }
    } catch (error) {
      console.error("Error during login:", error);
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };
  

  const loadOperator = async () => {
    try {
      // First, check local storage for cached operator data
      const cachedData = await getDataFromStorage('allOperator');
      if (cachedData && Array.isArray(cachedData)) {
        console.log("Loaded operator data from local storage:", cachedData);
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
  
  
  
  

  return (
    <IonPage>
      <IonContent fullscreen className="ion-content">
        <div className="content ion-content">
          <IonCard className="mt bg-card">
            <IonGrid className="ion-padding">
              <IonRow className="ion-justify-content-left logo-login">
                <IonCol size="5">
                  <IonImg className="img" src="logodh.png" alt="Logo DH" />
                  <span className="sub-title">Fuel App V2.0</span>
                </IonCol>
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
                    </IonCol>
                  </>
                )}
              </IonRow>
              {showError && (
                <IonRow className="bg-text">
                  <IonCol>
                    <IonTitle style={{ marginTop: "10px" }}>Unit atau Employee Id salah! Periksa kembali</IonTitle>
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
