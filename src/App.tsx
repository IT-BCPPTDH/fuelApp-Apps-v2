import React, { useEffect, useState } from 'react';
import { Redirect, Route } from 'react-router-dom';
import { IonApp, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Cookies from 'js-cookie';

// Importing styles
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

import './theme/variables.css';
import Login from './pages/Login';
import OpeningForm from './pages/OpeningForm';
import DashboardFuelMan from './pages/Dashboard/Dashbord';
import FormTrx from './pages/FormTransaction/FomInput';
import FormClosing from './pages/ClosingData';
import ReviewData from './pages/ReviewData';

setupIonicReact();

const App: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState<string | null>(null);

    useEffect(() => {
        const isLoggedInCookie = Cookies.get('isLoggedIn');
        setIsLoggedIn(isLoggedInCookie === 'true' ? 'true' : 'false');
    }, []);

    const updateLoginStatus = () => {
        const isLoggedInCookie = Cookies.get('isLoggedIn');
        setIsLoggedIn(isLoggedInCookie === 'true' ? 'true' : 'false');
    };

   
 if (isLoggedIn === null) {
        return <div>Loading...</div>; 
    }
    console.log(isLoggedIn)
    return (

        <IonApp>
            
            <IonReactRouter>
                
                <Route exact path="/login">
                    {isLoggedIn === 'true' ? <Redirect to="/opening" /> : <Login onLoginSuccess={updateLoginStatus} />}
                </Route>
                <Route exact path="/opening">
                    {isLoggedIn === 'true' ? <OpeningForm /> : <Redirect to="/login" />}
                </Route>
                <Route exact path="/dashboard">
                    {isLoggedIn === 'true' ? <DashboardFuelMan /> : <Redirect to="/login" />}
                </Route>
                <Route exact path="/transaction">
                    {isLoggedIn === 'true' ? <FormTrx setDataHome={function (data: any[]): void {
                        throw new Error('Function not implemented.');
                    } } /> : <Redirect to="/login" />}
                </Route>
                <Route exact path="/closing-data">
                    {isLoggedIn === 'true' ? <FormClosing /> : <Redirect to="/login" />}
                </Route>
                <Route exact path="/review-data">
                    {isLoggedIn === 'true' ? <ReviewData /> : <Redirect to="/login" />}
                </Route>
                <Route exact path="/">
                    {isLoggedIn === 'true' ? <Redirect to="/dashboard" /> : <Redirect to="/login" />}
                </Route>
            </IonReactRouter>
        </IonApp>
    );
};

export default App;
