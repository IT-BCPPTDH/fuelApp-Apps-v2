import React, { useState } from 'react';
import {
    IonButton,
    IonIcon,
    IonImg,
    IonLabel,
    IonInput,
    IonItem,
    IonContent,
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonGrid,
    IonRow,
    IonCol
} from '@ionic/react';
import { cameraOutline, imagesOutline } from 'ionicons/icons';

const ImageUpload: React.FC = () => {
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Handle file input change
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files ? event.target.files[0] : null;
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                if (reader.result && typeof reader.result === 'string') {
                    setImagePreview(reader.result);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle file upload
    const handleFileUpload = async () => {
        if (selectedImage) {
            const formData = new FormData();
            formData.append('file', selectedImage);
            // Example upload URL
            const uploadUrl = 'https://example.com/upload';
            try {
                await fetch(uploadUrl, {
                    method: 'POST',
                    body: formData,
                });
                alert('Image uploaded successfully!');
            } catch (error) {
                console.error('Error uploading image:', error);
                alert('Failed to upload image.');
            }
        } else {
            alert('No image selected!');
        }
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Upload Image</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonGrid>
                    <IonRow>
                        <IonCol size="12" className="ion-text-center">
                            <IonItem>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                    id="fileInput"
                                />
                                <IonButton
                                    expand="full"
                                    color="primary"
                                    onClick={() => document.getElementById('fileInput')?.click()}
                                >
                                    <IonIcon slot="start" icon={imagesOutline} />
                                    Select Image
                                </IonButton>
                            </IonItem>
                        </IonCol>
                    </IonRow>
                    {imagePreview && (
                        <IonRow>
                            <IonCol size="12" className="ion-text-center">
                                <IonImg src={imagePreview} />
                            </IonCol>
                        </IonRow>
                    )}
                    <IonRow>
                        <IonCol size="6" className="ion-text-center">
                            <IonButton
                                expand="full"
                                color="secondary"
                                onClick={handleFileUpload}
                            >
                                <IonIcon slot="start" icon={cameraOutline} />
                                Upload Image
                            </IonButton>
                        </IonCol>
                    </IonRow>
                </IonGrid>
            </IonContent>
        </IonPage>
    );
};

export default ImageUpload;
