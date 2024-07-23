import React from "react";
import { IonInput, IonLabel } from "@ionic/react";
import './CustomeField.css'

interface CustomFieldProps {
  field: any;
  errors: any;
}

const CustomField: React.FC<CustomFieldProps> = ({ field, errors }) => {
  
  const error = errors?.find((_: any) => _.id === field.id);
  const errorMessage = error ? error.message : null;

  return (
    <div className={`field`}>

      <IonInput
      label={field.label} labelPlacement="floating" fill="outline"
        
        {...field.input.props}
        {...field.input.state}
      />

        {error && (
          <p className="animate__animated animate__bounceIn error-message">{errorMessage}</p>
        )}
    </div>
  );
};

export default CustomField;
