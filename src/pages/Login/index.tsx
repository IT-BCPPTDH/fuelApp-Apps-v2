import React, { useEffect, useState } from 'react';
import { IonImg, IonButton, IonCol, IonContent, IonGrid, IonPage, IonRow, IonCard, IonSelect, IonSelectOption, IonInput, IonText, useIonRouter } from '@ionic/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { QUERY_KEY } from '../../helper/queryKeys';
import { postAuth } from '../../hooks/useAuth';
import { validateForm } from '../../data/utils';
import { ResponseError } from '../../helper/responseError';
import './style.css';
import { useLoginFields } from '../../data/field';


type Error = {
    id: string;
    message: string;
}

interface UserData {
    session_token: string;
    data: object
}

const Login: React.FC = () => {
    const fields = useLoginFields();
    const [errors, setErrors] = useState<Error[]>([]);
    const queryClient = useQueryClient();
    const router = useIonRouter();
    const [dummyData, setDummyData] = useState<{ unit: string, jde: string }>({ unit: 'DT1234', jde: 'abcd1234' });

    const mutation = useMutation({
        mutationFn: async ({ unit, jde }: any): Promise<UserData> => {
            // Simulated login process or actual API call can be placed here
            return {
                session_token: 'dummy_session_token',
                data: {}
            };
        },
        onSuccess: (data: UserData) => {
            queryClient.setQueryData([QUERY_KEY.user], data);
            Cookies.set('isLoggedIn', "true", { expires: 0 });
            router.push('/opening');
        },
        onError: (error: any) => {
            throw new ResponseError(`Error during login:`, error);
        },
    });

    const login = async () => {
        const errors = validateForm(fields);
        setErrors(errors);

        if (!errors.length) {
            let unit = "";
            let jde = "";
            fields.forEach((field: { required: any; id: string; input: { state: { value: string; }; }; }) => {
                if (field.required) {
                    if (field.id === "unit") {
                        unit = field.input.state.value;
                    } else {
                        jde = field.input.state.value;
                    }
                }
            });

            if (unit !== "" && jde !== "") {
                try {
                    await mutation.mutateAsync({ unit, jde });
                } catch (error) {
                    console.error('Login failed:', error);
                }
            }
           
        } else {
            errors.forEach((error) => {
                console.error(`Error ${error.id}: ${error.message}`);
            });
        }
       
    };

    useEffect(() => {
        fields.forEach((field) => {
            if (field.id === 'unit') {
                field.input.state.value = dummyData.unit;
            } else if (field.id === 'jde') {
                field.input.state.value = dummyData.jde;
            }
        });
    }, [fields, dummyData.unit, dummyData.jde]);

    return (
        <IonPage>
            <IonContent fullscreen className='ion-content'>
                <div className='content ion-content'>
                    <IonCard className='mt bg-card'>
                        <IonGrid className="ion-padding">
                            <IonRow className='ion-justify-content-left logo-login'>
                                <IonCol size='5'>
                                    <IonImg src='logodh.png' alt='Logo DH' />
                                    <span className='sub-title'>Fuel App</span>
                                    <p className='mt0'>V2</p>
                                </IonCol>
                            </IonRow>
                            <IonRow className="mt-content">
                                <span className='title-checkin'>Please Signin to continue</span>
                                <IonCol size="12">
                                    <IonSelect fill="solid" label="Select Unit" labelPlacement="floating">
                                        <IonSelectOption value="apple">DT1234</IonSelectOption>
                                        <IonSelectOption value="banana">FT3560</IonSelectOption>
                                    </IonSelect>
                             
                                </IonCol>
                                <IonCol size="12" className='mt10'>
                                    <IonInput
                                        fill="solid"
                                        type="password"
                                        label="Employee Jde"
                                        labelPlacement="floating"
                                        placeholder="Enter Jde"
                                    />
                                </IonCol>
                                <IonCol className='mr-content'>
                                    <IonButton className="check-button" expand="block" onClick={login}>
                                        Login
                                    </IonButton>
                                </IonCol>
                            </IonRow>
                            <div className='bg-text mr-content'>
                                <IonText className="warning">
                                    <p>Tablet belum di register ke PIT
                                    Hubungi pihak IT untuk Register</p>
                                </IonText>
                            </div>
                        </IonGrid>
                    </IonCard>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default Login;
