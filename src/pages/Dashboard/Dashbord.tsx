import { IonImg, IonRouterLink, IonCardTitle, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonNote, IonPage, IonRow, useIonRouter, useIonViewWillEnter, IonRippleEffect, IonCard, IonCardHeader, IonCardContent, IonCardSubtitle, IonTitle, IonButton, IonLabel, IonSearchbar } from '@ionic/react';
import { logOut, push } from 'ionicons/icons';
import { useEffect, useState } from 'react';
import './style.css'
import ChartDonut from '../../components/Chart';
import FloatingCard from '../../components/FloatingCard';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEY } from '../../helper/queryKeys';
import { useAtom } from 'jotai';
import { unitTypeAtom, dataObj } from '../../data/atoms';
import Cookies from 'js-cookie';
import ListContent from '../../components/ListCard';
import { Icon } from 'ionicons/dist/types/components/icon/icon';

interface UserData {
    session_token: string;
    data: {
        id: number
    }
}

const DashboardFuelMan = () => {
    const router = useIonRouter();
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
            })

            router.push('/login')
        }
    })
  
    const handleClick = ()=>{
        
        const route =useIonRouter()
        route.push('/transaction');
    }

    const handleLogout = () => {
        Cookies.remove('session_token');
        router.push('/login');
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
        { title: 'Flow Meter Akhir', subtitle: '5000 Liter' ,icon: 'flwakhir.svg' },
        { title: 'Total Flow Meter', subtitle: '50000 Liter', icon: 'total.svg' },
        { title: 'Variance', subtitle: '50000 Liter', icon: 'variance.svg' },
    ];

    return (
        <IonPage>
            <IonContent>
                <IonHeader className="header-dash">
                    <div className='logoDashboard'>
                        <IonImg src="logodh.png" alt='logo-dashboard' />
                    </div>
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
                                        <IonImg   src={card.icon} alt={card.title}  style={{ width: '30px', height: '30px', marginTop:"10px" }}  />
                                        <IonCardContent style={{fontSize:"18px", fontWeight:"600"}}>{card.subtitle}</IonCardContent>
                                      </div>
                                    </IonCardHeader>
                                </IonCard>
                            </IonCol>
                        ))}
                    </IonRow>
                </IonGrid>
                <div className='padding-content'>
                <p style={{color:"red"}}>* Sebelum Logout Pastikan Data Sonding Dip /Stock diisi , Klik Tombol  ‘Dip ‘ Untuk Membuka Formnya , Terima kasih </p>
                    <IonButton color="success" onClick={handleClick}>Tambah Data</IonButton>
                    <IonButton color="danger">Isi Closing Dip</IonButton>
                    <IonButton color="tertiary">Nozel 1</IonButton>
                  
                </div>
                <IonRow>
                    <IonCol>
                         <p className='padding-content'>LKF0001</p>
                    </IonCol>
                    <IonCol>
                        <IonSearchbar  className='padding-content' placeholder="Serach Data"></IonSearchbar>
                    </IonCol>
                </IonRow>
            </IonContent>
        </IonPage>
    );
};

export default DashboardFuelMan;
