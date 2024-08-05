import React from 'react';
import {
  IonImg,
  IonRouterLink,
  IonCardTitle,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonNote,
  IonPage,
  IonRow,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonCardSubtitle,
  IonTitle,
  IonButton,
  IonLabel,
  useIonRouter,
  IonSearchbar
 
} from '@ionic/react';
import { logOut, push, saveOutline } from 'ionicons/icons';
import './style.css';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEY } from '../../helper/queryKeys';
import { useAtom } from 'jotai';
import { unitTypeAtom, dataObj } from '../../data/atoms';
import Cookies from 'js-cookie';

import TableData from '../../components/Table'; // Import the TableData component

interface UserData {
    session_token: string;
    data: {
        id: number
    }
}

const DashboardFuelMan = () => {
    const route = useIonRouter();
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: async ({ data, session_token }: UserData): Promise<any> => {
            try {
                const response = await fetch('/api/v1/auth-logout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user_id: data.id, session_token }),
                });

                if (!response.ok) {
                    throw new Error('Failed on sign in request');
                }

                return response.json();
            } catch (error) {
                throw new Error(`Error during login: ${error}`);
            }
        },
        onSuccess: () => {
            queryClient.removeQueries({
                queryKey: [QUERY_KEY.user]
            });

            route.push('/login');
        }
    });

    const handleClick = () => {
        route.push('/transaction');
    };

    const handleClickQouta = () => {
        route.push('/transaction-qouta');
    };

    const handleLogout = () => {
        Cookies.remove('session_token');
        route.push('/closing-data');
    };

    const cardData = [
        { title: 'Shift', subtitle: 'Day', icon: 'shit.svg' },
        { title: 'FS/FT No', subtitle: 'T112', icon: 'fs.svg' },
        { title: 'Opening Dip', subtitle: '10000 Liter', icon: 'openingdeep.svg' },
        { title: 'Receipt', subtitle: '10000 Liter', icon: 'receipt.svg' },
        { title: 'Stock On Hand', subtitle: '10000 Liter', icon: 'stock.svg' },
        { title: 'QTY Issued', subtitle: '2000 Liter', icon: 'issued.svg' },
        { title: 'Balance', subtitle: '20000 Liter', icon: 'balance.svg' },
        { title: 'Cosing Deep', subtitle: '5000 Liter', icon: 'close.svg' },
        { title: 'Flow Meter  Awal', subtitle: '5000 Liter', icon: 'flwawal.svg' },
        { title: 'Flow Meter Akhir', subtitle: '5000 Liter', icon: 'flwakhir.svg' },
        { title: 'Total Flow Meter', subtitle: '50000 Liter', icon: 'total.svg' },
        { title: 'Variance', subtitle: '50000 Liter', icon: 'variance.svg' },
    ];

    return (
        <IonPage>
            <IonContent>
                <IonHeader className="header-dash">
                    <IonRow>
                        <IonCol>
                            <div className='logoDashboard'>
                                <IonImg src="logodh.png" alt='logo-dashboard' />
                            </div>
                        </IonCol>
                        <IonCol>
                            <div className='indicator'>Online</div>
                        </IonCol>
                    </IonRow>
                </IonHeader>

                <div className='content'>
                    <div className='btn-start'>
                        <IonButton color="primary">
                            <IonImg src='refresh.svg'></IonImg>
                            Refresh
                        </IonButton>
                        <IonButton color="warning" onClick={handleLogout}>
                            Close LFK & Logout
                        </IonButton>
                    </div>
                </div>
                <div className='padding-content mr20'>
                    <h4>Hallo Team Dev</h4>
                </div>
                <IonGrid>
                    <IonRow>
                        {cardData.map((card, index) => (
                            <IonCol size="4" key={index}>
                                <IonCard>
                                    <IonCardHeader>
                                        <IonCardSubtitle style={{fontSize:"20px"}}>{card.title}</IonCardSubtitle>
                                        <div style={{display:"inline-flex", gap:"10px"}}>
                                            <IonImg src={card.icon} alt={card.title} style={{ width: '30px', height: '30px', marginTop:"10px" }} />
                                            <IonCardContent style={{fontSize:"18px", fontWeight:"600"}}>{card.subtitle}</IonCardContent>
                                        </div>
                                    </IonCardHeader>
                                </IonCard>
                            </IonCol>
                        ))}
                    </IonRow>
                </IonGrid>
                <div className='content'>
                    <p style={{color:"red"}}>* Sebelum Logout Pastikan Data Sonding Dip /Stock diisi , Klik Tombol  ‘Dip ‘ Untuk Membuka Formnya , Terima kasih </p>
                    <IonButton className='ion-button' onClick={handleClick}>
                        <IonImg src='plus.svg'></IonImg><span style={{marginLeft:"10px"}}>Tambah Data</span>
                    </IonButton>
                    {/* <IonButton className='ion-button-kouta' onClick={handleClickQouta}>
                        <IonImg src='plus.svg'></IonImg><span style={{marginLeft:"10px"}}>Tambah Kouta</span>
                    </IonButton> */}
                </div>
              
                <TableData />
              
                
            </IonContent>
           
        </IonPage>
    );
};

export default DashboardFuelMan;
