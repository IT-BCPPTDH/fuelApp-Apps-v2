import React, { useEffect, useState } from "react";
import {
  IonButton,
  IonCol,
  IonContent,
  IonHeader,
  IonToolbar,
  IonInput,
  IonItem,
  IonPage,
  IonRadio,
  IonRadioGroup,
  IonRow,
  IonTitle,
  useIonRouter,
  IonLabel,
  IonToast,
  IonDatetime,
  IonDatetimeButton,
  IonModal,
  useIonToast
} from "@ionic/react";
import "./style.css";
import { postOpening } from "../../hooks/serviceApi";

interface Shift {
  id: number;
  name: string;
  type: string;
}

const shift: Shift[] = [
  { id: 1, name: "Day", type: "" },
  { id: 2, name: "Night", type: "" },
];

interface PostOpeningResult {
  status: number;
}

const compareWith = (o1: Shift, o2: Shift) => o1.id === o2.id;

const OpeningForm = () => {
  const route = useIonRouter();

  const [openingSonding, setOpeningSonding] = useState<number | undefined>(undefined);
  const [openingDip, setOpeningDip] = useState<number | undefined>(undefined);
  const [flowMeterAwal, setFlowMeterAwal] = useState<number | undefined>(undefined);
  const [hmAwal, setHmAwal] = useState<number | undefined>(undefined);
  const [site, setSite] = useState<string | undefined>(undefined);
  const [station, setStation] = useState<string | undefined>(undefined);
  const [fuelmanid, setFuelmanID] = useState<string | undefined>(undefined);
  const [shiftSelected, setShiftSelected] = useState<Shift | undefined>(undefined);
  const [showError, setShowError] = useState<boolean>(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [dataUserLog, setDataUserLog] = useState<any | undefined>(undefined);

  const [presentToast] = useIonToast();

  useEffect(() => {
    const userData = localStorage.getItem("logLoginUser");
    if (userData) {
      const parsedData = JSON.parse(userData);
      setDataUserLog(parsedData);
      setFuelmanID(parsedData.jdeOperator);
      setStation(parsedData.station);
    }
  }, []);

  const handleDateChange = (e: CustomEvent) => {
    const selectedDate = new Date(e.detail.value);
    setDate(selectedDate);
  };

  const handlePost = async () => {
    if (
      !date ||
      !shiftSelected ||
      hmAwal === undefined ||
      openingDip === undefined ||
      openingSonding === undefined ||
      flowMeterAwal === undefined ||
      site === undefined ||
      fuelmanid === undefined ||
      station === undefined
    ) {
      setShowError(true);
      return;
    }
  
    const dataPost = {
      date: date.toISOString(),
      shift: shiftSelected.name,
      hm_start: hmAwal,
      opening_dip: openingDip,
      opening_sonding: openingSonding,
      flow_meter_start: flowMeterAwal,
      site: site,
      fuelman_id: fuelmanid,
      station: station,
    };

    try {
      const result: PostOpeningResult = await postOpening(dataPost);
      if (result.status === 200) {
        presentToast({
          message: `Data posted successfully!`,
          duration: 2000,
          position: 'top',
          color: 'success',
        });
        localStorage.setItem('awalData', JSON.stringify(dataPost));
        route.push('/');
      } else {
        setShowError(true);
      }
    } catch (error) {
      setShowError(true);
      presentToast({
        message: 'An error occurred while posting data.',
        duration: 2000,
        position: 'top',
        color: 'danger',
      });
    }
  };

  return (
    <IonPage>
      <IonHeader translucent={true} className="ion-no-border">
        <IonToolbar className="custom-header">
          <IonTitle>Form Opening Data Stock (Dip) & Sonding</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="wrapper-content">
          <IonRow className="padding-content">
            <IonCol>
              <IonInput
                type="text"
                label="Employee ID"
                value={fuelmanid}
                disabled
                onIonInput={(e) => setFuelmanID(String(e.detail.value))}
              />
            </IonCol>
            <IonCol></IonCol>
            <IonCol>
              <IonDatetimeButton style={{ marginTop: "8px" }} datetime="datetime"></IonDatetimeButton>
              <IonModal keepContentsMounted={true}>
                <IonDatetime
                  id="datetime"
                  presentation="date"
                  onIonChange={handleDateChange}
                />
              </IonModal>
            </IonCol>
          </IonRow>
          <IonRow className="padding-content">
            <IonCol>
              <IonInput
                label="Site"
                type="text"
                value={site}
                onIonInput={(e) => setSite(String(e.detail.value))}
              />
            </IonCol>
            <IonCol>
              <IonInput
                label="Station"
                type="text"
                disabled
                value={station}
                onIonInput={(e) => setStation(String(e.detail.value))}
              />
            </IonCol>
            <IonCol>
              <IonRadioGroup
                className="radio-display"
                compareWith={compareWith}
                onIonChange={(ev) => setShiftSelected(ev.detail.value)}
              >
                {shift.map((shift) => (
                  <IonItem key={shift.id} className="item-no-border">
                    <IonRadio value={shift}>
                      {shift.name}
                    </IonRadio>
                  </IonItem>
                ))}
              </IonRadioGroup>
            </IonCol>
          </IonRow>

          <div className="padding-content">
            <IonLabel>Opening Sonding (Cm) *</IonLabel>
            <IonInput
              className="custom-input"
              type="number"
              placeholder="Input opening sonding dalam cm"
              value={openingSonding}
              onIonInput={(e) => setOpeningSonding(Number(e.detail.value))}
            />
            {showError && openingSonding !== undefined && openingSonding < 100 && (
              <p style={{ color: "red" }}>* Data HM/KM diambil dari data sebelumnya</p>
            )}
          </div>
          <div className="padding-content">
            <IonLabel>Opening Dip (Liter) *</IonLabel>
            <IonInput
              className="custom-input"
              type="number"
              placeholder="Input opening dip dalam liter"
              value={openingDip}
              onIonInput={(e) => setOpeningDip(Number(e.detail.value))}
            />
            {showError && openingDip !== undefined && openingDip < 100 && (
              <p style={{ color: "red" }}>* Data opening sonding dan Dip diambil dari data closing sonding & Dip shift sebelumnya</p>
            )}
          </div>
          <div className="padding-content">
            <IonLabel>Flow Meter Awal **</IonLabel>
            <IonInput
              className="custom-input"
              type="number"
              placeholder="Input flow meter awal"
              value={flowMeterAwal}
              onIonInput={(e) => setFlowMeterAwal(Number(e.detail.value))}
            />
            {showError && flowMeterAwal !== undefined && flowMeterAwal < 100 && (
              <p style={{ color: "red" }}>* Data start meter diambil dari data close meter sebelumnya</p>
            )}
          </div>
          <div className="padding-content">
            <IonLabel>HM Awal (Khusus Fuel Truck wajib disi sesuai dengan HM/KM Kendaraan)</IonLabel>
            <IonInput
              className="custom-input"
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
            {showError && station !== "Fuel Truck" && hmAwal === 0 && (
              <p style={{ color: "red" }}>* HM Awal tidak boleh 0 jika bukan Fuel Truck</p>
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
