import { useFormInput } from "./utils";



export const useLoginFields = () => {
    return [
        {
            id: "station",
            label: "station",
            required: true,
            input: {
                props: {
                    type: "text",
                    placeholder: "Select Station"
                },
                state: useFormInput("")
            }
        },
        {
            id: "jde_operator",
            label: "jde_Operator",
            required: true,
            input: {
                props: {
                    type: "text",
                    placeholder: "*******"
                },
                state: useFormInput("")
            }
        }
    ];
}
