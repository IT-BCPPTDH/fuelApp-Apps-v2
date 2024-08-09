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
import { validateForm } from "../../data/utils";
import { ResponseError } from "../../helper/responseError";
import "./style.css";
import { useLoginFields } from "../../data/field";
import { postAuth } from "../../hooks/serviceApi";
import { getStation as fetchStation } from "../../hooks/useStation";

type Error = {
  id: string;
  message: string;
};

interface UserData {
  session_token: string;
  data: any;
  status: string;
  message: string;
}

interface Station {
  fuel_station_name: string;
}

const Login: React.FC = () => {
  const fields = useLoginFields();
  const [errors, setErrors] = useState<Error[]>([]);
  const [jdeOperator, setJdeOperator] = useState<string>("");
  const [stationData, setStationData] = useState<{ value: string; label: string }[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<string>(""); // Changed to default empty string
  const [showJdeError, setShowJdeError] = useState<boolean>(false);

  const queryClient = useQueryClient();
  const router = useIonRouter();

  const mutation = useMutation({
    mutationFn: async ({ station, jde_operator }: { station: string; jde_operator: string }): Promise<any> => {
      console.log("Posting auth with:", { station, jde_operator });
      return await postAuth({
        station, jde_operator,
        date: ""
      });
    },
    onSuccess: (data: UserData) => {
      console.log("Login successful:", data);
      queryClient.setQueryData([QUERY_KEY.user], data);
      Cookies.set("isLoggedIn", "true", { expires: 1 });
      router.push("/opening");
    },
    onError: (error: any) => {
      console.error("Login error:", error);
      throw new ResponseError(`Error during login:`, error);
    },
  });

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
    }
  };

  fetchStationData();
}, []);



const handleLogin = async () => {
    // Validation checks
    if (!selectedUnit || !jdeOperator) {
     
      return;
    }
    if (typeof selectedUnit !== 'string' || selectedUnit.trim().length === 0) {
      return;
    }
    if (typeof jdeOperator !== 'string' || jdeOperator.trim().length === 0) {
      return;
    }
  
    const timeout = 10000; 
  
    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out')), timeout)
    );
  
  
  
    try {
      const response = await Promise.race([
        mutation.mutateAsync({
          station: selectedUnit,
          jde_operator: jdeOperator,
        }),
        timeoutPromise
      ]);


      if (response) {
        localStorage.setItem('logLoginUser', JSON.stringify({
          jdeOperator,
         
        }));
      }
    } catch (error) {
     
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
                  <IonLabel>Select Unit</IonLabel>
                  <IonSelect style={{marginTop:"10px"}}
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
                <IonLabel>Employe ID</IonLabel>
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
              {showJdeError && (
                <div className="bg-text mr-content">
                  <IonText className="warning">Unit atau JDE Salah Harap Periksa Kembali!!</IonText>
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
