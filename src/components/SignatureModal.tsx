import React, { useRef, useState, useEffect } from 'react';
import { IonModal, IonButton, IonContent, IonCard, IonTitle } from '@ionic/react';
import './SignatureModal.css';

interface SignatureModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (signature: string) => void;
   
}



const SignatureModal: React.FC<SignatureModalProps> = ({ isOpen, onClose, onConfirm }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDrawing(true);
        const { offsetX, offsetY } = getEventCoordinates(e);
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
            ctx.beginPath();
            ctx.moveTo(offsetX, offsetY);
        }
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        const { offsetX, offsetY } = getEventCoordinates(e);
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
            ctx.lineTo(offsetX, offsetY);
            ctx.stroke();
        }
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
            ctx.closePath();
        }
    };

    const clearCanvas = () => {
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx && canvasRef.current) {
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
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
        let clientX, clientY;

        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        const offsetX = clientX - rect.left;
        const offsetY = clientY - rect.top;

        return { offsetX, offsetY };
    };

    useEffect(() => {
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
            ctx.strokeStyle = 'green';
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
        }
    }, []);

    return (
        <IonModal isOpen={isOpen} onDidDismiss={onClose} className="signature-modal">
            <IonContent>
                <div style={{ marginTop: "20px" }}>
                    <IonTitle>Silahkan Tanda Tangan Di Kolom Bawah !!</IonTitle>
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
