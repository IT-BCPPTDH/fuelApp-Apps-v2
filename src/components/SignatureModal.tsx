

import React, { useRef, useState } from 'react';
import { IonModal,IonButton, IonContent, IonCard, IonTitle } from '@ionic/react';
import './SignatureModal.css';

interface SignatureModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (signature: string) => void;
}

const SignatureModal: React.FC<SignatureModalProps> = ({ isOpen, onClose, onConfirm }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        if (context) {
            setIsDrawing(true);
            const { offsetX, offsetY } = getEventCoordinates(e);
            context.beginPath();
            context.moveTo(offsetX, offsetY);
        }
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (isDrawing && context) {
            const { offsetX, offsetY } = getEventCoordinates(e);
            context.lineTo(offsetX, offsetY);
            context.stroke();
        }
    };

    const stopDrawing = () => {
        if (context) {
            setIsDrawing(false);
            context.closePath();
        }
    };

    const clearCanvas = () => {
        if (context) {
            context.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
        }
    };

    const saveSignature = () => {
        if (canvasRef.current) {
            const dataUrl = canvasRef.current.toDataURL('image/png');
            onConfirm(dataUrl); 
            onClose();
        }
    };

    const getEventCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current!;
        const rect = canvas.getBoundingClientRect();
        const offsetX = (e as React.MouseEvent).clientX - rect.left || (e as React.TouchEvent).touches[0].clientX - rect.left;
        const offsetY = (e as React.MouseEvent).clientY - rect.top || (e as React.TouchEvent).touches[0].clientY - rect.top;
        return { offsetX, offsetY };
    };

    React.useEffect(() => {
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
                ctx.strokeStyle = 'green';
                ctx.lineWidth = 2;
                ctx.lineCap = 'round';
                setContext(ctx);
            }
        }
    }, [canvasRef]);
    return (
        <IonModal isOpen={isOpen} onDidDismiss={onClose} className="signature-modal">
    
            <IonContent>
               <div style={{marginTop:"20px"}}>
                    <IonTitle >Silahkan Tanda Tangan Di Kolom Bawah !!</IonTitle>
               </div>
                <IonCard>
                        <canvas 
                            ref={canvasRef}
                            width="478px"
                            height="150px"
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={stopDrawing}
                            style={{ border: '1px solid' }}
                        ></canvas>
                </IonCard>
                <div className="modal-buttons">
                    <IonButton expand="full" color="danger" size="small" onClick={clearCanvas}>Clear</IonButton>
                    <IonButton expand="full" color="dark" size="small" onClick={saveSignature}>Save Signature</IonButton>
                </div>
            </IonContent>
        </IonModal>
    );
};

export default SignatureModal;
