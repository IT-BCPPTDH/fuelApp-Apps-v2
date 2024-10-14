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
} from "@ionic/react";
import Cookies from "js-cookie";
import { postAuthLogin } from "../../hooks/useAuth";
import "./style.css";
import {
  fetchStationData,
  saveDataToStorage,
  getDataFromStorage,
  fetchShiftData,
} from "../../services/dataService";
import { Station } from "../../models/interfaces";
import Select from "react-select";
import { getPrevUnitTrx } from "../../hooks/getDataPrev";
const Login: React.FC = () => {
  const [jde, setJdeOperator] = useState<string>("");
  const [stationData, setStationData] = useState<{ value: string; label: string; site: string; fuel_station_type: string }[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<string>("");
  const [showError, setShowError] = useState<boolean>(false);
  const router = useIonRouter();

  const [unitData, setUnitData] = useState<any>(null);  // State untuk menyimpan data unit
  const [noUnit, setNoUnit] = useState<string>(""); // Nilai no_unit yang ingin dipanggil
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
    loadStationData();
  }, [loadStationData]);


  const handleLogin = async () => {
    if (!jde || !selectedUnit) {
      console.error("Employee ID dan Station harus diisi.");
      setShowError(true);
      return;
    }

    const selectedStation = stationData.find((station) => station.value === selectedUnit);
    if (!selectedStation) {
      console.error("Selected station not found");
      setShowError(true);
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
        router.push("/opening");
      } else {
        console.error("Unexpected response:", response);
        setShowError(true);
      }
    } catch (error) {
      console.error("Error during login:", error);
      setShowError(true);
    }
  };

  useEffect(() => {
    // Fungsi untuk memanggil getPrevUnitTrx
    const fetchUnitData = async () => {
      setLoading(true); // Set loading state
      setError(null); // Reset error state
      try {
        const data = await getPrevUnitTrx(noUnit);
        console.log('unitSelect', data)
        setUnitData(data); // Set data yang didapat ke state
      } catch (err) {
        setError('Failed to fetch unit data'); // Set error jika ada masalah
      } finally {
        setLoading(false); // Set loading selesai
      }
    };

    // Panggil fungsi saat komponen mount
    fetchUnitData();
  }, [noUnit]);

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
                <span className="title-checkin">Please Sign In to Continue</span>
                <IonCol size="12">
                  <IonLabel>Select Station</IonLabel>
                  <div style={{ marginTop: "10px" }}>
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
                  <IonButton className="check-button" expand="block" onClick={handleLogin}>
                    Login
                  </IonButton>
                </IonCol>
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
      </IonContent>
    </IonPage>
  );
};

export default Login;
