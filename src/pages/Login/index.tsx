import React, { useState, useEffect } from "react";
import {
  IonImg,
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonPage,
  IonRow,
  IonCard,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonText,
  useIonRouter,
  IonLabel,
} from "@ionic/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { QUERY_KEY } from "../../helper/queryKeys";
import { validateForm } from "../../data/utils";
import { ResponseError } from "../../helper/responseError";
import "./style.css";
import { useLoginFields } from "../../data/field";

type Error = {
  id: string;
  message: string;
};

interface UserData {
  session_token: string;
  data: object;
}

const Login: React.FC = () => {
  const fields = useLoginFields();
  const [errors, setErrors] = useState<Error[]>([]);
  const [jde, setJde] = useState<string>("");
  const [showJdeError, setShowJdeError] = useState<boolean>(false);
  const queryClient = useQueryClient();
  const router = useIonRouter();
  const [selectedUnit, setSelectedUnit] = useState<string>("");

  const mutation = useMutation({
    mutationFn: async ({ unit, jde }: { unit: string; jde: string }): Promise<UserData> => {
     
      return {
        session_token: "dummy_session_token",
        data: {},
      };
    },
    onSuccess: (data: UserData) => {
      queryClient.setQueryData([QUERY_KEY.user], data);
      Cookies.set("isLoggedIn", "true", { expires: 1 });
      router.push("/opening");
    },
    onError: (error: any) => {
      throw new ResponseError(`Error during login:`, error);
    },
  });

  const validateJde = (jde: string): boolean => {

    return jde === "abcd1234";
  };

  const login = async () => {
    const formErrors = validateForm(fields);
    setErrors(formErrors);

    if (!formErrors.length) {
      if (selectedUnit && jde) {
        if (validateJde(jde)) {
          try {
            await mutation.mutateAsync({ unit: selectedUnit, jde });
            setShowJdeError(false); 
          } catch (error) {
            console.error("Login failed:", error);
          }
        } else {
          setShowJdeError(true);
        }
      } else {
        setShowJdeError(true); 
      }
    } else {
      formErrors.forEach((error) => {
        console.error(`Error ${error.id}: ${error.message}`);
      });
    }
  };

  useEffect(() => {
    fields.forEach((field) => {
      if (field.id === "unit") {
        field.input.state.value = selectedUnit;
      } else if (field.id === "jde") {
        field.input.state.value = jde;
      }
    });
  }, [fields, selectedUnit, jde]);

  return (
    <IonPage>
      <IonContent fullscreen className="ion-content">
        <div className="content ion-content">
          <IonCard className="mt bg-card">
            <IonGrid className="ion-padding">
              <IonRow className="ion-justify-content-left logo-login">
                <IonCol size="5">
                  <IonImg className="img" src="logodh.png" alt="Logo DH" />
                  <span className="sub-title">Fuel App V2.0</span>
                </IonCol>
              </IonRow>
              <IonRow className="mt-content">
                <span className="title-checkin">Please Signin to continue</span>
                <IonCol size="12">
                  <IonLabel>Select Unit</IonLabel>
                  <IonSelect
                    fill="solid"
                    interface="popover" 
                    labelPlacement="floating"
                    value={selectedUnit}
                    onIonChange={(e) => setSelectedUnit(e.detail.value as string)}
                  >
                    <IonSelectOption value="DT1234">DT1234</IonSelectOption>
                    <IonSelectOption value="FT3560">FT3560</IonSelectOption>
                  </IonSelect>
                </IonCol>
                <IonCol size="12" className="mt10">
                  <IonInput
                    className="custom-input"
                    type="password"
                    placeholder="Employee ID "
                    value={jde}
                    onIonInput={(e) => setJde(e.detail.value as string)}
                  ></IonInput>
                </IonCol>
                <IonCol className="mr-content">
                  <IonButton className="check-button" expand="block" onClick={login}>
                    Login
                  </IonButton>
                </IonCol>
              </IonRow>
              {showJdeError && (
                <div className="bg-text mr-content">
                  <IonText className="warning">Unit atau Jde Salah Harap Periksa Kembali !!</IonText>
                </div>
              )}
            </IonGrid>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
