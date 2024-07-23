import React, { useEffect, useState } from 'react';
import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
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
// import Home from './pages/Home';
import Login from './pages/Login';

// import MapSearch from './pages/MapSearch';
// import Sukses from './pages/Sukses';
// import WaitingDriver from './pages/DriverSearch';
import OpeningForm from './pages/OpeningForm';
import DashboardFuelMan from './pages/Dashboard/Dashbord';
import TransactionForm from './pages/FormTransaction/FomInput';

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
                <IonRouterOutlet>
                    <Route exact path="/">
                        {isLoggedIn ? <Redirect to="/opening" /> : <Login />}
                    </Route>
                    <Route exact path="/opening">
                        <OpeningForm/>
                    </Route>
                   
                    <Route exact path="/login">
                        {isLoggedIn ? <OpeningForm /> : <Redirect to="/login" />}
                    </Route>

                    <Route exact path="/login">
                        {isLoggedIn ? <DashboardFuelMan /> : <Redirect to="/dashboard" />}
                    </Route>

                    <Route exact path="/transaction">
                        {isLoggedIn ? <TransactionForm /> : <Redirect to="/login" />}
                    </Route>
{/* 
                    <Route exact path="/map-search">
                        {isLoggedIn ? <MapSearch /> : <Redirect to="/login" />}
                    </Route>
                    <Route exact path="/sukses">
                        {isLoggedIn ? <Sukses /> : <Redirect to="/login" />}
                    </Route>
                    <Route exact path="/menunggu">
                            {isLoggedIn ? <WaitingDriver /> : <Redirect to="/login" />}
                    </Route> */}
                  
                    
                    <Redirect to="/" />
                </IonRouterOutlet>
            </IonReactRouter>
        </IonApp>
    );
};

export default App;
