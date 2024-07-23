import { IonButton, IonCol, IonContent, IonHeader, IonToolbar, IonInput, IonItem, IonPage, IonRadio, IonRadioGroup, IonRow, IonTitle, useIonRouter } from "@ionic/react"
import "./style.css"
import { IonRoute } from "@ionic/react";


interface Shift {
    id: number;
    name: string;

}

const shift: Shift[] = [
    {
        id: 1,
        name: 'Day'
    },

    {
        id: 2,
        name: 'Nigth'
    },

];
const compareWith = (o1: Shift, o2: Shift) => {
    return o1.id === o2.id;
};

const OpeningForm = () => {
    const route = useIonRouter()
    const handleClick = () => {
        route.push('/dashboard');
        console.log("ini Klik")
    }
    return (
        <>
            <IonPage>
                <IonHeader translucent={true} className="ion-no-border">
                    <IonToolbar className="custom-header">
                        <IonTitle >Form Opening  Data Stock ( Dip ) & Sonding</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent>
                    <IonRow className="padding-content">
                        <IonCol>
                            <IonRadioGroup className="radio-display"
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
                            <IonInput fill="outline" label="Date" labelPlacement="stacked" placeholder="Enter Date"></IonInput>
                        </IonCol>
                    </IonRow>
                    <IonRow className="padding-content">
                        <IonInput fill="outline" label="HM Awal ( * Khusus Fuel Truck wajib disi susuai dengan HM/KM Kendaraan *" labelPlacement="stacked" placeholder="HM Awal"></IonInput>
                    </IonRow>
                    <IonRow className="padding-content">
                        <IonCol>
                            <IonInput fill="outline" label="Opening Sonding  ( Cm ) *" labelPlacement="stacked" placeholder="Opening Sondin"></IonInput>
                        </IonCol>

                        <IonCol>
                            <IonInput fill="outline" label="Opening Dip ( Liter ) *" labelPlacement="stacked" placeholder="Opening Dip "></IonInput>
                        </IonCol>
                    </IonRow>
                    <IonRow className="padding-content">
                        <IonInput fill="outline" label="Flow Meter Awal Nozel 1 *" labelPlacement="stacked" placeholder="Flow Meter Awal Nozel 1"></IonInput>
                    </IonRow>
                    <IonRow className="padding-content btn-start">
                        <IonButton className="check-button" onClick={handleClick}>Mulai Kerja</IonButton>
                    </IonRow>
                </IonContent>
            </IonPage>

        </>
    )
}

export default OpeningForm