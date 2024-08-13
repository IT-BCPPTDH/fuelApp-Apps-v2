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
} from "@ionic/react";
import Cookies from "js-cookie";
import { postAuthLogin } from "../../hooks/useAuth";
import { getStation as fetchStation } from "../../hooks/useStation";
import "./style.css";

interface Station {
  fuel_station_name: string;
}

const Login: React.FC = () => {
  const [jde, setJdeOperator] = useState<string>("");
  const [stationData, setStationData] = useState<{ value: string; label: string }[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<string>("");
  const router = useIonRouter();

  useEffect(() => {
    const fetchStationData = async () => {
      try {
        const cachedData = localStorage.getItem('stationData');
        if (cachedData) {
          const parsedData = JSON.parse(cachedData);
          setStationData(parsedData);
        } else {
          const response = await fetchStation();
          if (response?.data && Array.isArray(response.data)) {
            const stations = response.data.map((station: Station) => ({
              value: station.fuel_station_name,
              label: station.fuel_station_name,
            }));
            localStorage.setItem('stationData', JSON.stringify(stations));
            setStationData(stations);
          }
        }
      } catch (error) {
        console.error("Failed to fetch or load station data:", error);
      }
    };

    fetchStationData();
  }, []);

  const handleLogin = async () => {
    if (!jde || !selectedUnit) {
      console.error("Employee ID dan Station harus diisi.");
      return;
    }
  
    const currentDate = new Date().toISOString();
  
    try {
      const response = await postAuthLogin({
        station: selectedUnit,
        date: currentDate,
        JDE: jde,
      });
  
      // Log respons untuk memeriksa strukturnya
      console.log("Respons dari server:", response);
      console.log("Status Respons:", response.status);
      console.log("Message Respons:", response.message);
      console.log("Data Respons:", response.data);
  
      if (response.status === '200' && response.message === 'Data Created') {
        const { token, ...userData } = response.data;
        localStorage.setItem("session_token", token);
        Cookies.set("isLoggedIn", "true", { expires: 1 });
  
        console.log("Navigasi ke /opening");
        router.push("/opening");
      } else {
        console.error("Respons tidak terduga:", response);
      }
    } catch (error) {
      console.error("Kesalahan saat login:", error);
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
                  <IonSelect
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
                    onIonInput={(e) => setJdeOperator(String(e.detail.value))}
                  ></IonInput>
                </IonCol>
                <IonCol className="mr-content">
                  <IonButton className="check-button" expand="block" onClick={handleLogin}>
                    Login
                  </IonButton>
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
