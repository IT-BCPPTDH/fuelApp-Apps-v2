import { useState } from "react";

export interface Field {
    id: string;
    required?: boolean;
    input: {
        state: { value: string };
    };
}

export interface Error {
    id: string;
    message: string;
}

export const useFormInput = (initialValue = ""): {
    value: string;
    reset: (newValue: string) => void;
    onIonChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
} => {
    const [value, setValue] = useState(initialValue);

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const tempValue = e.currentTarget.value;
        setValue(tempValue);
    };

    return {
        value,
        reset: (newValue) => setValue(newValue),
        onIonChange: handleChange,
    };
};

export const validateForm = (fields: Field[]): Error[] => {
    let errors: Error[] = [];

    fields.forEach((field) => {
        if (field.required) {
            const fieldValue = field.input.state.value;

            if (fieldValue === "") {
                const error: Error = {
                    id: field.id,
                    message: `Please check your ${field.id}`,
                };
                errors.push(error);
            }
        }
    });

    return errors;
};
