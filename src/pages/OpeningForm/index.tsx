import React, { useEffect, useState } from "react";
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
  IonPage
} from "@ionic/react";
import "./style.css";
import { postOpening } from "../../hooks/serviceApi";
import { addDataToDB, getOfflineData, removeDataFromDB } from "../../utils/insertData";
import { DataLkf } from "../../models/db";
import { getUser } from "../../hooks/getAllUser";
import { getAllUnit } from "../../hooks/getAllUnit";

interface Shift {
  id: number;
  name: string;
  type: string;
}

const shifts: Shift[] = [
  { id: 1, name: "Day", type: "" },
  { id: 2, name: "Night", type: "" },
];

const compareWith = (o1: Shift, o2: Shift) => o1.id === o2.id;

const OpeningForm: React.FC = () => {
  const [openingSonding, setOpeningSonding] = useState<number | undefined>(undefined);
  const [openingDip, setOpeningDip] = useState<number | undefined>(undefined);
  const [flowMeterAwal, setFlowMeterAwal] = useState<number | undefined>(undefined);
  const [hmAwal, setHmAwal] = useState<number | undefined>(undefined);
  const [site, setSite] = useState<string | undefined>(undefined);
  const [station, setStation] = useState<string | undefined>(undefined);
  const [fuelmanId, setFuelmanID] = useState<string | undefined>(undefined);
  const [shiftSelected, setShiftSelected] = useState<Shift | undefined>(undefined);
  const [showError, setShowError] = useState<boolean>(false);
  const [date, setDate] = useState<string | undefined>(undefined); // Changed to string to work with IonInput value
  const [dataUserLog, setDataUserLog] = useState<any | undefined>(undefined);
  const [lkfId, setLkfId] = useState<string | undefined>(undefined);
  const [showDateModal, setShowDateModal] = useState<boolean>(false);
  const router = useIonRouter();
  const [presentToast] = useIonToast();
  const [allUsers, setAllUser] = useState<string>('');
  const [unitOptions, setUnitOptions] = useState<{ id: string; unit_no: string; brand: string; owner: string }[]>([]);

  useEffect(() => {
    const generateLkfId = () => {
      const timestamp = Date.now();
      return (timestamp % 100000000).toString().padStart(8, '0');
    };

    setLkfId(generateLkfId());

    const userData = localStorage.getItem("loginData");
    if (userData) {
      const parsedData = JSON.parse(userData);
      setDataUserLog(parsedData);
      setFuelmanID(parsedData.jde);
      setStation(parsedData.station);
      setSite(parsedData.site);
    }
  }, []);

  const handleDateChange = (e: CustomEvent) => {
    const selectedDate = e.detail.value as string;
    setDate(selectedDate);
    setShowDateModal(false);
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getUser();
        if (response.status === '200' && Array.isArray(response.data)) {
          localStorage.setItem('employeeData', JSON.stringify(response.data));
          setAllUser(response.data);
        } else {
          console.error('Unexpected data format');
        }
      } catch (error) {
        console.error('Failed to fetch user data', error);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchUnitOptions = async () => {
      try {
        const response = await getAllUnit();
        if (response.status === '200' && Array.isArray(response.data)) {
          localStorage.setItem('masterUnit', JSON.stringify(response.data));
          setUnitOptions(response.data);
        } else {
          console.error('Unexpected data format');
        }
      } catch (error) {
        console.error('Failed to fetch unit options', error);
      }
    };

    fetchUnitOptions();
  }, []);

  const handlePost = async () => {
    if (
      !date ||
      !shiftSelected ||
      hmAwal === undefined ||
      openingDip === undefined ||
      openingSonding === undefined ||
      flowMeterAwal === undefined ||
      site === undefined ||
      fuelmanId === undefined ||
      station === undefined ||
      lkfId === undefined
    ) {
      setShowError(true);
      return;
    }

    const dataPost: DataLkf = {
      date: new Date(date).toISOString(),
      shift: shiftSelected.name,
      hm_start: hmAwal,
      opening_dip: openingDip,
      opening_sonding: openingSonding,
      flow_meter_start: flowMeterAwal,
      site: site,
      fuelman_id: fuelmanId,
      station: station,
      jde: fuelmanId,
      lkf_id: lkfId,
      issued: undefined,
      receipt: undefined,
      stockOnHand: 0,
      name: ""
    };

    try {
      const result = await postOpening(dataPost);

      if (result.status === '201' && result.message === 'Data Created') {
        presentToast({
          message: 'Data posted successfully!',
          duration: 2000,
          position: 'top',
          color: 'success',
        });
        await addDataToDB(dataPost);
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
    } catch (error) {
      setShowError(true);
      presentToast({
        message: 'You are offline. Data saved locally and will be sent when online.',
        duration: 2000,
        position: 'top',
        color: 'warning',
      });
      await addDataToDB(dataPost);
      router.push("/dashboard");
      window.location.reload();
    }
  };

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

  useEffect(() => {
    window.addEventListener('online', checkAndSendOfflineData);
    return () => window.removeEventListener('online', checkAndSendOfflineData);
  }, []);

  return (
    <IonPage>
      <IonHeader translucent={true} className="ion-no-border">
        <IonToolbar className="custom-header">
          <IonTitle>Form Opening Data Stock (Dip) & Sonding</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="wrapper-content">
          <div className="padding-content">
            <h2 style={{textAlign:"center", fontSize:"30px"}}>LKF ID : {lkfId}</h2>
            <h4>Employee ID : {fuelmanId}</h4>
            <h4>Site : {site}</h4>
            <h4>Station : {station}</h4>
          </div>
          <IonRow className="padding-content">
            <IonCol>
              <IonLabel>
                Shift *
              </IonLabel>
              <IonRadioGroup
                className="radio-display"
                compareWith={compareWith}
                onIonChange={(ev) => setShiftSelected(ev.detail.value)}
              >
                {shifts.map((shift) => (
                  <IonItem key={shift.id} className="item-no-border">
                    <IonRadio value={shift}>
                      {shift.name}
                    </IonRadio>
                  </IonItem>
                ))}
              </IonRadioGroup>
            </IonCol>
            <IonCol>
              <IonItem>
                <IonInput
                  value={date}
                  placeholder="Select Date"
                  readonly
                  onClick={() => setShowDateModal(true)}
                />
              </IonItem>
              <IonModal isOpen={showDateModal} onDidDismiss={() => setShowDateModal(false)}>
                <IonDatetime
                  presentation="date"
                  value={date}
                  onIonChange={handleDateChange}
                />
              </IonModal>
            </IonCol>
          </IonRow>
          <div className="padding-content">
            <IonLabel className={showError && (openingSonding === undefined || Number.isNaN(openingSonding) || openingSonding < 100) ? "error" : ""}>
              Opening Sonding (Cm) *
            </IonLabel>
            <IonInput
              className={`custom-input ${showError && (openingSonding === undefined || Number.isNaN(openingSonding) || openingSonding < 100) ? "input-error" : ""}`}
              type="number"
              placeholder="Input opening sonding dalam cm"
              value={openingSonding}
              onIonInput={(e) => setOpeningSonding(Number(e.detail.value))}
            />
            {showError && openingSonding === undefined && (
              <p style={{ color: "red" }}>* Field harus diisi</p>
            )}
          </div>
          <div className="padding-content">
            <IonLabel className={showError && (openingDip === undefined || Number.isNaN(openingDip) || openingDip < 100) ? "error" : ""}>
              Opening Dip (Liter) *
            </IonLabel>
            <IonInput
              className={`custom-input ${showError && (openingDip === undefined || Number.isNaN(openingDip) || openingDip < 100) ? "input-error" : ""}`}
              type="number"
              placeholder="Input opening dip dalam liter"
              value={openingDip}
              onIonInput={(e) => setOpeningDip(Number(e.detail.value))}
            />
            {showError && openingDip === undefined && (
              <p style={{ color: "red" }}>* Field harus diisi</p>
            )}
          </div>
          <div className="padding-content">
            <IonLabel className={showError && (flowMeterAwal === undefined || Number.isNaN(flowMeterAwal) || flowMeterAwal < 100) ? "error" : ""}>
              Flow Meter Awal **
            </IonLabel>
            <IonInput
              className={`custom-input ${showError && (flowMeterAwal === undefined || Number.isNaN(flowMeterAwal) || flowMeterAwal < 100) ? "input-error" : ""}`}
              type="number"
              placeholder="Input flow meter awal"
              value={flowMeterAwal}
              onIonInput={(e) => setFlowMeterAwal(Number(e.detail.value))}
            />
            {showError && flowMeterAwal === undefined && (
              <p style={{ color: "red" }}>* Field harus diisi</p>
            )}
          </div>
          <div className="padding-content">
            <IonLabel className={showError && (hmAwal === undefined || (station !== "Fuel Truck" && hmAwal === 0)) ? "error" : ""}>
              HM Awal (Khusus Fuel Truck wajib disi sesuai dengan HM/KM Kendaraan)
            </IonLabel>
            <IonInput
              className={`custom-input ${showError && (hmAwal === undefined || (station !== "Fuel Truck" && hmAwal === 0)) ? "input-error" : ""}`}
              type="number"
              placeholder={station === "Fuel Truck" ? "Input HM Awal (0 jika di Fuel Truck)" : "Input HM Awal"}
              value={hmAwal}
              onIonInput={(e) => {
                const value = Number(e.detail.value);
                if (station !== "Fuel Truck" && value === 0) {
                  setHmAwal(undefined); 
                  setShowError(true);
                } else {
                  setHmAwal(value);
                  setShowError(false);
                }
              }}
            />
            {showError && hmAwal === undefined && (
              <p style={{ color: "red" }}>* Field harus diisi</p>
            )}
          </div>
          <IonRow className="padding-content btn-start">
            <IonButton className="check-button" onClick={handlePost}>
              Mulai Kerja
            </IonButton>
          </IonRow>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default OpeningForm;
