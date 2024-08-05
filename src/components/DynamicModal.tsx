// src/components/DynamicModal.tsx

import React from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButton, IonContent, IonItem, IonInput, IonSelect, IonSelectOption, IonTextarea } from '@ionic/react';
import { OverlayEventDetail } from '@ionic/core/components';

export interface FormField {
  name: string;
  type: 'text' | 'select' | 'textarea'; // Ensure correct union type
  label: string;
  options?: string[]; // Only for select fields
  placeholder?: string;
}

interface DynamicModalProps {
  isOpen: boolean;
  title: string;
  confirmText?: string;
  cancelText?: string;
  formFields: FormField[];
  onConfirm: (formData: any) => void;
  onCancel?: () => void;
  onWillDismiss?: (ev: CustomEvent<OverlayEventDetail>) => void;
}

const DynamicModal: React.FC<DynamicModalProps> = ({
  isOpen,
  title,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  formFields,
  onConfirm,
  onCancel,
  onWillDismiss
}) => {
  const [formData, setFormData] = React.useState<any>({});

  const handleChange = (name: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleConfirm = () => {
    onConfirm(formData);
  };

  return (
    <IonModal isOpen={isOpen} onWillDismiss={onWillDismiss}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{title}</IonTitle>
          <IonButton slot="end" onClick={handleConfirm}>
            {confirmText}
          </IonButton>
          {onCancel && (
            <IonButton slot="start" onClick={onCancel}>
              {cancelText}
            </IonButton>
          )}
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {formFields.map((field) => (
          <IonItem key={field.name}>
            <label>{field.label}</label>
            {field.type === 'text' && (
              <IonInput
                value={formData[field.name] || ''}
                placeholder={field.placeholder}
                onIonChange={e => handleChange(field.name, (e.target as unknown as HTMLInputElement).value)}
              />
            )}
            {field.type === 'select' && (
              <IonSelect
                value={formData[field.name] || ''}
                placeholder={field.placeholder}
                onIonChange={e => handleChange(field.name, e.detail.value)}
              >
                {field.options?.map(option => (
                  <IonSelectOption key={option} value={option}>{option}</IonSelectOption>
                ))}
              </IonSelect>
            )}
            {field.type === 'textarea' && (
              <IonTextarea
                value={formData[field.name] || ''}
                placeholder={field.placeholder}
                onIonChange={e => handleChange(field.name, (e.target as unknown as HTMLTextAreaElement).value)}
              />
            )}
          </IonItem>
        ))}
      </IonContent>
    </IonModal>
  );
};

export default DynamicModal;
