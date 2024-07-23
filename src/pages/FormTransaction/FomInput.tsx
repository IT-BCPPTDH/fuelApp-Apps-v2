import { IonButton, IonCol, IonContent, IonHeader, IonImg, IonInput, IonItem, IonPage, IonRadio, IonRadioGroup, IonRow, IonTitle, useIonRouter } from "@ionic/react"
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

const TransactionForm = () => {
    const route =useIonRouter()

    const handleClick = () =>{
        route.push('/dashboard');
        console.log("ini Klik")
    }
    return (
        <>
            <IonPage>
                <IonContent>
                    <IonHeader className="header-content" style={{ boxShadow: 'none' }} >
                        <IonTitle >Form Tambah Issued / Transfer / Receipt & Receipt KPC</IonTitle>
                    </IonHeader>
                    <IonRow className="padding-content">
                        <IonCol>
                            <IonRadioGroup className="radio-display"
                                compareWith={compareWith}
                                onIonChange={(ev) => console.log('Current value:', JSON.stringify(ev.detail.value))}
                            >
                                {shift.map((shift) => (
                                    <IonItem>
                                        <IonRadio key={shift.id} value={shift}>
                                            {shift.name}
                                        </IonRadio>
                                    </IonItem>
                                ))}
                            </IonRadioGroup>
                        </IonCol>
                        <IonCol>
                            <IonInput fill="solid" label="Date" labelPlacement="floating" placeholder="Enter Date"></IonInput>
                        </IonCol>
                    </IonRow>
                    <IonRow className="padding-content">
                        <IonInput fill="solid"  label="HM Awal ( * Khusus Fuel Truck wajib disi susuai dengan HM/KM Kendaraan *"  labelPlacement="floating" placeholder="HM Awal"></IonInput>
                    </IonRow>
                    <IonRow className="padding-content">
                        <IonCol>
                        <IonInput fill="solid"   label="Opening Sonding  ( Cm ) *" labelPlacement="floating" placeholder="Opening Sondin"></IonInput>
                        </IonCol>
                        
                        <IonCol>
                        <IonInput fill="solid"  label="Opening Dip ( Liter ) *" labelPlacement="floating" placeholder="Opening Dip "></IonInput>
                        </IonCol>
                    </IonRow>
                    <IonRow className="padding-content">
                        <IonInput fill="solid"  label="Flow Meter Awal Nozel 1 *" labelPlacement="floating"  placeholder="Flow Meter Awal Nozel 1"></IonInput>
                    </IonRow>
                    <IonRow className="padding-content btn-start">
                        <IonButton  className=" check-button" onClick={handleClick}>Mulai Kerja</IonButton>
                    </IonRow>
                </IonContent>
            </IonPage>

        </>
    )
}

export default TransactionForm