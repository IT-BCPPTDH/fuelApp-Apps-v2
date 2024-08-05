import React, { useState } from "react";
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
  IonModal
} from "@ionic/react";
import "./style.css";

interface Shift {
  id: number;
  name: string;
  type: string;
}

const shift: Shift[] = [
  {
    id: 1,
    name: "Day",
    type: "",
  },
  {
    id: 2,
    name: "Night",
    type: "",
  },
];

const compareWith = (o1: Shift, o2: Shift) => o1.id === o2.id;

const OpeningForm = () => {
  const route = useIonRouter();
  
  // State variables for form inputs
  const [date, setDate] = useState<string>('');
  const [openingSonding, setOpeningSonding] = useState<number | undefined>(undefined);
  const [openingDip, setOpeningDip] = useState<number | undefined>(undefined);
  const [flowMeterAwal, setFlowMeterAwal] = useState<number | undefined>(undefined);
  const [hmAwal, setHmAwal] = useState<number | undefined>(undefined);
  
  // State variable for toast and error message
 
  const [showError, setShowError] = useState<boolean>(false);
  
 
  const handleClick = () => {
    // Validate inputs
    if (
      openingSonding === undefined ||
      openingDip === undefined ||
      flowMeterAwal === undefined ||
      hmAwal === undefined ||
      openingSonding < 100 ||
      openingDip < 100 ||
      flowMeterAwal < 100 ||
      hmAwal < 100
    ) {
     
      setShowError(true);
      return;
    }
    route.push('/');
   
  };
  
  
  return (
    <IonPage>
      <IonHeader translucent={true} className="ion-no-border">
        <IonToolbar className="custom-header">
          <IonTitle>Form Opening Data Stock (Dip) & Sonding</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonRow className="padding-content">
          <IonCol>
            <IonRadioGroup
              className="radio-display"
              compareWith={compareWith}
              onIonChange={(ev) => console.log('Current value:', JSON.stringify(ev.detail.value))}
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
          <IonCol>
            <IonLabel>Date</IonLabel>
            <IonDatetimeButton datetime="datetime"></IonDatetimeButton>
            <IonModal keepContentsMounted={true}>
              <IonDatetime id="datetime"></IonDatetime>
            </IonModal>
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
            <p style={{color: "red"}}>* Data HM/KM diambil dari data sebelumnya</p>
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
            <p style={{color: "red"}}>* Data opening sonding dan Dip diambil dari data closing sonding & Dip shift sebelumnya</p>
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
            <p style={{color: "red"}}>* Data start meter diambil dari data close meter sebelumnya</p>
          )}
        </div>
        <div className="padding-content">
          <IonLabel>HM Awal (Khusus Fuel Truck wajib disi sesuai dengan HM/KM Kendaraan)</IonLabel>
          <IonInput
            className="custom-input"
            type="number"
            placeholder="Input HM awal"
            value={hmAwal}
            onIonInput={(e) => setHmAwal(Number(e.detail.value))}
          />
          {showError && hmAwal !== undefined && hmAwal < 100 && (
            <p style={{color: "red"}}>* Berikan 0 jika di fuel station</p>
          )}
        </div>
        <IonRow className="padding-content btn-start">
          <IonButton className="check-button" onClick={handleClick}>
            Mulai Kerja
          </IonButton>
        </IonRow>
      </IonContent>

    
    </IonPage>
  );
};

export default OpeningForm;
