// DynamicInput.tsx
import React from 'react';
import { IonInput, IonItem, IonLabel } from '@ionic/react';

interface DynamicInputProps {
    label: string;
    type: 'text' | 'number' | 'password' | 'email';
    value: string | number | undefined;
    onChange: (value: string | number | undefined) => void;
    placeholder?: string;
    disabled?: boolean;
}

const DynamicInput: React.FC<DynamicInputProps> = ({ label, type, value, onChange, placeholder, disabled }) => {
    const handleInputChange = (event: CustomEvent) => {
        const inputValue = event.detail.value;
        if (inputValue === null) {
            onChange(undefined);
        } else {
            onChange(inputValue);
        }
    };

    return (
        <IonItem>
            <IonLabel>{label}</IonLabel>
            <IonInput   className="custom-input"
                type={type}
                value={value}
                placeholder={placeholder}
                onIonInput={handleInputChange}
                disabled={disabled}
            />
        </IonItem>
    );
};

export default DynamicInput;
