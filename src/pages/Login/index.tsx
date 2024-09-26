import React, { useState, useEffect } from "react";
import {
  IonImg,
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonPage,
  IonRow,
  IonCard,
  IonSelect,
  IonSelectOption,
  IonInput,
  useIonRouter,
  IonLabel,
  IonTitle,
} from "@ionic/react";
import Cookies from "js-cookie";
import { postAuthLogin } from "../../hooks/useAuth";
import "./style.css";
import { fetchStationData, fetchUnitData, fetchQuotaData, saveDataToStorage, getDataFromStorage } from "../../services/dataService";
import { Station } from "../../models/interfaces";

const Login: React.FC = () => {
  const [jde, setJdeOperator] = useState<string>("");
  const [stationData, setStationData] = useState<{ value: string; label: string; site: string; fuel_station_type: string }[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<string>("");
  const [showError, setShowError] = useState<boolean>(false);
  const router = useIonRouter();
  const [openingForm, setOpeningForm] = useState<{ id: string; closing_sonding: string; flow_meter_end: string; hm_end: string }[]>([]);


  useEffect(() => {
    const loadStationData = async () => {
      const cachedData = await getDataFromStorage('stationData');
      if (cachedData) {
        setStationData(cachedData);
      } else {
        const stations: Station[] = await fetchStationData();
        const formattedStations = stations.map((station) => ({
          value: station.fuel_station_name,
          label: station.fuel_station_name,
          site: station.site,
          fuel_station_type: station.fuel_station_type,
        }));
        setStationData(formattedStations);
      }
    };

    loadStationData();
  }, []);


  useEffect(() => {
    const loadUnitData = async () => {
      const cachedUnitData = await getDataFromStorage('allUnit');
      if (cachedUnitData) {
        setOpeningForm(cachedUnitData);
      } else {
        const units = await fetchUnitData();
        setOpeningForm(units);
      }
    };

    loadUnitData();
  }, []);



  useEffect(() => {
    const loadQuotaData = async () => {
      const cachedQuotaData = await getDataFromStorage('unitQuota');
      if (cachedQuotaData) {
        setOpeningForm(cachedQuotaData);
      } else {
        const todayDate = new Date().toISOString().split('T')[0];
        const quotas = await fetchQuotaData(todayDate);
        setOpeningForm(quotas);
      }
    };

    loadQuotaData();
  }, []);


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
                  <IonSelect className="select-custom"
                    style={{ marginTop: "10px" }}
                    fill="solid"
                    labelPlacement="floating"
                    value={selectedUnit}
                    placeholder="Select a station"
                    onIonChange={(e) => {
                      const selectedValue = e.detail.value as string;
                      setSelectedUnit(selectedValue);
                    }}
                  >
                    {stationData.length > 0 ? (
                      stationData.map((station) => (
                        <IonSelectOption key={station.value} value={station.value}>
                          {station.label}
                        </IonSelectOption>
                      ))
                    ) : (
                      <IonSelectOption value="" disabled>No stations available</IonSelectOption>
                    )}
                  </IonSelect>
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