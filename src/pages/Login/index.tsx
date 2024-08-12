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
  IonText,
  useIonRouter,
  IonLabel,
} from "@ionic/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { QUERY_KEY } from "../../helper/queryKeys";
import { ResponseError } from "../../helper/responseError";
import "./style.css";
import { useLoginFields } from "../../data/field";
import { postAuthLogin } from "../../hooks/useAuth";
import { getStation as fetchStation } from "../../hooks/useStation";
import { User } from "../../hooks/useUser";

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  UNAUTHORIZED: 401,
};

const STATUS_MESSAGE = {
  INVALID_JDE: "Invalid JDE.",
  CRED_NOT_FOUND: "Credentials not found.",
  ERR_AUTH: "Error during authentication.",
};


interface Error {
  id: string;
  message: string;
}

interface UserData {
  session_token: string;
  data: any;
  status: string;
  message: string;
}

interface Station {
  fuel_station_name: string;
}

interface PostAuthParams {
  date: string;
  station: string;
  jde: string;
  site: string;
}

const Login: React.FC = () => {
  const fields = useLoginFields();
  const [errors, setErrors] = useState<Error[]>([]);
  const [jdeOperator, setJdeOperator] = useState<string>("");
  const [stationData, setStationData] = useState<{ value: string; label: string }[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isJdeValid, setIsJdeValid] = useState<boolean>(true);
  const [isPasswordValid, setIsPasswordValid] = useState<boolean>(true);
  const [userData, setUserData] = useState<User | null>(null); 
  const queryClient = useQueryClient();
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
            console.log("Fetched and cached station data:", stations);
          } else {
            console.error("Invalid response data:", response.data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch or load station data:", error);
        setErrorMessage("Failed to load station data.");
      }
    };

    fetchStationData();
  }, []);

  const handleLogin = async () => {
    if (!jdeOperator || !selectedUnit) {
        setIsJdeValid(!!jdeOperator);
        setIsPasswordValid(!!selectedUnit);
        setErrorMessage("Employee ID atau Username Salah.");
        return;
    }

    const currentDate = new Date().toISOString();

    try {
        console.log("login data:", {
            station: selectedUnit,
            date: currentDate,
            jde: jdeOperator,
            site: "",
        });

        const response = await postAuthLogin({
            station: selectedUnit,
            date: currentDate,
            jde: jdeOperator,
            site: "",
        });

        console.log("Login API response:", response);

        if (response.success) {
            localStorage.setItem("session_token", response.data.token); // Store the token
            setUserData(response.data);
            Cookies.set("isLoggedIn", "true", { expires: 1 });
            router.push("/opening");
            window.location.reload();
        } else {
            setErrorMessage(response.message || STATUS_MESSAGE.ERR_AUTH);
        }
    } catch (error) {
        console.error("Error during login:", error);
        setErrorMessage(STATUS_MESSAGE.ERR_AUTH);
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
                  <IonSelect style={{ marginTop: "10px" }}
                    fill="solid"
                    labelPlacement="floating"
                    value={selectedUnit}
                    placeholder="Select a station"
                    onIonChange={(e) => {
                      const selectedValue = e.detail.value as string;
                      setSelectedUnit(selectedValue);
                      console.log("Selected station:", selectedValue);
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
                    type="password"
                    errorText="Invalid employee ID"
                    placeholder="Employee ID"
                    value={jdeOperator}
                    onIonInput={(e) => setJdeOperator(e.detail.value as string)}
                  ></IonInput>
                </IonCol>
                <IonCol className="mr-content">
                  <IonButton className="check-button" expand="block" onClick={handleLogin}>
                    Login
                  </IonButton>
                </IonCol>
              </IonRow>
              {errorMessage && (
                <div className="bg-text mr-content">
                  <IonText className="warning">{errorMessage}</IonText>
                </div>
              )}
            </IonGrid>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
