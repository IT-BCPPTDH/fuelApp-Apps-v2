import React, { useState } from 'react';
import {
    IonButton,
    IonContent,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonListHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    useIonRouter,

} from '@ionic/react';
import { closeCircleOutline, saveOutline } from 'ionicons/icons';
import Cookies from 'js-cookie';

const ReviewData: React.FC = () => {
    const route = useIonRouter();

    const handleLogout = () => {
        route.push('/'); 
    };
    return (
        <IonPage>
            <IonHeader translucent={true} className="ion-no-border">
                <IonToolbar className="custom-header">
                    <IonTitle>Review Data Sebelum Logout</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <div style={{ marginTop: "20px" }}>
                    <IonList>
                        <IonListHeader>
                            <IonLabel>Review Data</IonLabel>
                            <IonButton>See All</IonButton>
                        </IonListHeader>
                        <IonItem>
                            <IonLabel>Open Sonding / Dip:</IonLabel>
                        </IonItem>
                        <IonItem>
                            <IonLabel>Receive : </IonLabel>
                        </IonItem>
                        <IonItem>
                            <IonLabel>Stock On Hand : </IonLabel>
                        </IonItem>
                        <IonItem>
                            <IonLabel>Issued :</IonLabel>
                        </IonItem>
                        <IonItem>
                            <IonLabel>Balance : </IonLabel>
                        </IonItem>
                        <IonItem>
                            <IonLabel>Closing Sonding / Dip : </IonLabel>
                        </IonItem>
                        <IonItem>
                            <IonLabel> Start Meter :</IonLabel>
                        </IonItem>
                        <IonItem>
                            <IonLabel> Total Meter :</IonLabel>
                        </IonItem>
                        <IonItem>
                            <IonLabel>  Daily Variance :</IonLabel>
                        </IonItem>



                    </IonList>
                </div>
                <div style={{ marginTop: "20px", float: "inline-end" }}>
                    <IonButton color="light">
                        <IonIcon slot="start" icon={closeCircleOutline} />Batal
                    </IonButton>
                    <IonButton onClick={handleLogout} className="check-close">
                        <IonIcon slot="start" icon={saveOutline} />Close Shift & Logout
                    </IonButton>
                </div>
            </IonContent>
        </IonPage>
    );


};

export default ReviewData;
