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
  fetchUnitData,
  fetchLasTrx,
  fetchLasLKF,
} from "../../services/dataService";
import Select from "react-select";
import { bulkInsertDataMasterTransaksi } from "../../utils/getData";
import { getAllSonding } from "../../hooks/getAllSonding";
import { getTrasaksiSemua } from "../../hooks/getAllTransaksi";
interface LoginProps {
  onLoginSuccess: () => void;
}

interface operator {
  JDE: string;
  fullname: string;
  admin_fuel: string;
  falsedivision: string;
  fuelman: boolean;
  id: BigInteger;
  position: string;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [jde, setJdeOperator] = useState<string>("");
  const [stationData, setStationData] = useState<
    { value: string; label: string; site: string; fuel_station_type: string }[]
  >([]);
  const [selectedUnit, setSelectedUnit] = useState<string>("");
  const [showError, setShowError] = useState<boolean>(false);

  const [alreadyLoggedIn, setAlreadyLoggedIn] = useState<boolean>(false);
  const router = useIonRouter();
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [dtTrx, setDtTrx] = useState<{ hm_km: string; no_unit: string }[]>([]);

  const [transaksiData, setTransaksiData] = useState<any>(null);
  const [qouta, setQouta] = useState();
  const [jdeOptions, setJdeOptions] = useState<
    { JDE: string; fullname: string }[]
  >([]);

  const loadStationData = useCallback(async () => {
    try {
      setLoading(true);
      const cachedData = await getDataFromStorage("stationData");

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
      console.error("Error loading station data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStationData(); 
    const timeoutId = setTimeout(() => {
      loadStationData(); 
    }, 2000); 
    return () => clearTimeout(timeoutId);
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    if (!jde || !selectedUnit) {
      console.error("Employee ID dan Station harus diisi.");
      setShowError(true);
      setLoading(false);
      return;
    }

    const selectedStation = stationData.find(
      (station) => station.value === selectedUnit
    );
    if (!selectedStation) {
      console.error("Selected station not found");
      setShowError(true);
      setLoading(false);
      return;
    }
    setLoading(false);
    try {
      const op = await getDataFromStorage("allOperator");
      console.log("operator", op);

      let checkID = op.find((v: operator) => v.JDE === jde);
      console.log("id", checkID);
      if (checkID.fuelman) {
        console.log("login");

        const loginData = {
          station: selectedUnit,
          jde: checkID.JDE,
          site: selectedStation.site,
          fullname: checkID.fullname,
        };

        saveDataToStorage("loginData", loginData);
        Cookies.set("isLoggedIn", "true", { expires: 1 });
        await handleGet();
        router.push("/opening");
        onLoginSuccess();
        setShowAlert(true);
        console.log("off");
      } else {
        console.log("salah");
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
      const transaksiData = await getDataFromStorage("lastTrx");
      if (transaksiData) {
        const transaksiDataParsed =
          typeof transaksiData === "string"
            ? JSON.parse(transaksiData)
            : transaksiData;
        if (
          Array.isArray(transaksiDataParsed) &&
          transaksiDataParsed.length > 0
        ) {
          await bulkInsertDataMasterTransaksi(transaksiDataParsed);
        } else {
        }
      } else {
        console.warn("Tidak ada data transaksi yang tersedia di localStorage.");
      }
    } catch (error) {
      console.error(
        "Error saat melakukan bulk insert dari localStorage:",
        error
      );
    }
  };

  const loadOperator = async () => {
    try {
      const cachedData = await getDataFromStorage("allOperator");
      if (cachedData && Array.isArray(cachedData)) {
        setJdeOptions(cachedData); 
      } else {
        const fetchedJdeOptions = await fetchOperatorData();
        if (fetchedJdeOptions.length > 0) {
          setJdeOptions(fetchedJdeOptions); 
        } else {
          console.error("No valid operator data fetched");
        }
      }
    } catch (error) {
      console.error("Error loading operator data:", error);
    }
  };

  useEffect(() => {
    loadOperator(); 
  }, []);

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
    loadUnitDataQuota()
    loadUnitData();
    loadLastTrx();
    loadLastLKF();
    fetchSondingMasterData();
  }, []);

  const fetchSondingMasterData = async () => {
    try {
      const response = await getAllSonding();
      if (response.status === "200" && Array.isArray(response.data)) {
        await saveDataToStorage("masterSonding", response.data);
      } else {
        console.error("Unexpected data format");
      }
    } catch (error) {
      console.error("Failed to fetch sonding master data", error);
    }
  };

  const loadUnitDataQuota = async () => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    try {
        const quotaData = await fetchQuotaData(formattedDate);
        // console.log('Fetched Qouta Login ', quotaData);
  
        // if (quotaData && Array.isArray(quotaData)) {
        //     let foundUnitQuota = quotaData.find((unit) => unit.no_unit === selectedUnit);
  
        //     if (!foundUnitQuota) {
        //         const yesterday = new Date(today);
        //         yesterday.setDate(today.getDate() - 1);
        //         const formattedYesterday = yesterday.toISOString().split('T')[0];
        //         const previousQuotaData = await fetchQuotaData(formattedYesterday);
        //         // console.log('Fetched previous quota data:', previousQuotaData);
        //         foundUnitQuota = previousQuotaData.find((unit) => unit.no_unit === selectedUnit);
        //     }
        // } else {
        //     console.error('No quota data found for the specified date');
        // }
    } catch (error) {
        console.error('Error fetching quota data:', error);
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
                  <IonImg className="img" src="logodhbaru1.png" alt="Logo DH" />
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
                          value={stationData.find(
                            (station) => station.value === selectedUnit
                          )}
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
                        onIonInput={(e) =>
                          setJdeOperator(e.detail.value as string)
                        }></IonInput>
                    </IonCol>
                    <IonCol className="mr-content">
                      <IonButton
                        className="check-button"
                        expand="block"
                        onClick={handleLogin}
                        disabled={loading}>
                        {loading ? "Loading..." : "Login"}
                      </IonButton>

                      <IonButton
                        color="warning"
                        expand="block"
                        onClick={handleGet}
                        disabled={loading}>
                        {loading ? "Loading..." : "Refresh Data"}
                      </IonButton>
                    </IonCol>
                  </>
                )}
              </IonRow>
              {showError && (
                <IonRow className="bg-text">
                  <IonCol>
                    <IonTitle style={{ fontSize: "14px" }}>
                      <span>Station atau Employee ID Salah !!</span>
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
          header={"Login Sukses"}
          message={"Anda berhasil login!"}
          buttons={["OK"]}
        />
      </IonContent>
    </IonPage>
  );
};

export default Login;
