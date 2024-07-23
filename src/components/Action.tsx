import React from 'react'; 
import { IonCol, IonRouterLink, IonRow } from "@ionic/react";

interface ActionProps {
    message: string;
    link: string;
    text: string;
}

const Action: React.FC<ActionProps> = ({ message, link, text }) => ( 
    <IonRow className="ion-text-center ion-justify-content-center">
        <IonCol size="12">
            <p>
                {message}
                <IonRouterLink className="custom-link" routerLink={link}> {text} &rarr;</IonRouterLink>
            </p>
        </IonCol>
    </IonRow>
);

export default Action; 
