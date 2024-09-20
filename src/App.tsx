import React, { useEffect, useState } from 'react';
import { Redirect, Route } from 'react-router-dom'; // Import useHistory
import { IonApp, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Cookies from 'js-cookie'; // Import js-cookie library

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Ionic Dark Mode */
// import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';
import Login from './pages/Login';
import OpeningForm from './pages/OpeningForm';
import DashboardFuelMan from './pages/Dashboard/Dashbord';
import FormTrx from './pages/FormTransaction/FomInput';
import FormClosing from './pages/ClosingData';
import ReviewData from './pages/ReviewData';
import FormTRXKouta from './pages/FormTransaction/FomInputKouta';

setupIonicReact();

const App: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    useEffect(() => {
        const isLoggedInCookie = Cookies.get('isLoggedIn') === 'true';
        setIsLoggedIn(isLoggedInCookie);
    }, []);

    return (
        <IonApp>
            <IonReactRouter>
                <Route exact path="/">
                    {isLoggedIn ? <Redirect to="/dashboard" /> : <Login />}
                </Route>
                <Route exact path="/opening">
                    <OpeningForm />
                </Route>
                <Route exact path="/dashboard">
                     <DashboardFuelMan />
                </Route>
                <Route exact path="/transaction">
                    <FormTrx />
                </Route>
                <Route exact path="/transaction-qouta">
                    {isLoggedIn ? <FormTRXKouta /> : <Redirect to="/" />}
                </Route>
                <Route exact path="/closing-data">
                     <FormClosing /> 
                </Route>
                <Route exact path="/review-data">
                    <ReviewData />
                </Route>
                <Redirect to="/" />
            </IonReactRouter>
        </IonApp>
    );
};

export default App;
