import { IonButton, IonCol, IonContent, IonGrid, IonImg, IonPage, IonRouterLink, IonRow } from '@ionic/react';
import './Home.css';
import { usePWAInstall } from '../components/Installer';

const Home = () => {

  const install = usePWAInstall()

  return (
    <IonPage className='homePage'>
      <IonContent fullscreen>
        <div className='getStarted'>
          <IonGrid>
            <IonRow className={`ion-text-center ion-justify-content-center`}>
              <IonCol size="8" className={`headingText`}>
                <IonImg src='logo.png' alt='Logo' />
                
                {install ? (
                  <IonButton onClick={install}>Install</IonButton>
                ) : (
                  <>
                    <IonRouterLink routerLink="/login" className="custom-link">
                      <IonButton className={`getStartedButton`} size='large' color="light" expand='full'>Mulai</IonButton>
                    </IonRouterLink>

                    <IonRouterLink routerLink="/map-search" className="custom-link">
                      <IonButton className={`getStartedButton`} size='large' color="primary" expand='full'>Testing</IonButton>
                    </IonRouterLink>
                  </>
                )}

              </IonCol>
            </IonRow>
          </IonGrid>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;