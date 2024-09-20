import React, { useState } from 'react';
import { IonButton, IonAlert } from '@ionic/react';

function DynamicAlert() {
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('A message should be a short, complete sentence.');

  const handleShowAlert = () => {
    setAlertMessage('This is a dynamically set alert message.');
    setShowAlert(true);
  };

  return (
    <>
      <IonButton onClick={handleShowAlert}>Show Alert</IonButton>
      <IonAlert
        isOpen={showAlert}
        onDidDismiss={() => setShowAlert(false)}
        header="A Short Title Is Best"
        subHeader="A Sub Header Is Optional"
        message={alertMessage}
        buttons={['OK']}
      />
    </>
  );
}

export default DynamicAlert;
