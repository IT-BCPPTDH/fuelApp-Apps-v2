
// import React, { useState } from 'react';
// import { IonCard, IonButton, IonLabel, IonImg, IonIcon, IonCol, IonAlert } from '@ionic/react';
// import { cameraOutline } from 'ionicons/icons';
// import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

// // Define the type for the props, including setPhotoPreview
// interface CameraInputProps {
//   setPhotoPreview: React.Dispatch<React.SetStateAction<string | undefined>>;
// }

// const CameraInput: React.FC<CameraInputProps> = ({ setPhotoPreview }) => {
//   const [showAlert, setShowAlert] = useState(false);
//   const [photoPreview, setPhotoPreviewLocal] = useState<string | undefined>(undefined); // Local state for preview

//   // Function to choose between taking a photo or selecting from the gallery
//   const handleChooseSource = () => {
//     setShowAlert(true); // Show an alert with the options
//   };

//   // Handle selecting a source (Camera or Gallery)
//   const handleSelectSource = async (source: CameraSource) => {
//     setShowAlert(false); // Close the alert
//     try {
//       const photo = await Camera.getPhoto({
//         resultType: CameraResultType.DataUrl,
//         source: source,
//         quality: 90,
//       });
//       const imageUrl = photo.dataUrl;

//       // Log the image URL to the console
//       console.log('Captured Image URL:', imageUrl);

//       setPhotoPreview(imageUrl);  // Pass the URL to the parent component
//       setPhotoPreviewLocal(imageUrl); // Optionally, update the local preview state
//     } catch (error) {
//       console.error('Error selecting photo:', error);
//     }
//   };

//   return (
//     <IonCol>
//       <IonCard style={{ height: '160px', marginTop: '-7px' }}>
//         <IonButton size="small" onClick={handleChooseSource}>
//           <IonIcon slot="start" icon={cameraOutline} />
//           Ambil Foto
//         </IonButton>
//         {/* Render the photo preview if it exists */}
//         {photoPreview && (
//           <IonCard style={{ marginTop: '10px', padding: '10px' }}>
//             <IonLabel>Preview:</IonLabel>
//             <IonImg
//               src={photoPreview}  // Correct: Use `photoPreview` (string URL) instead of `setPhotoPreview`
//               alt="Photo Preview"
//               style={{ maxWidth: '100%', maxHeight: '200px' }}
//             />
//           </IonCard>
//         )}
//       </IonCard>

//       {/* Alert for source selection (camera or gallery) */}
//       <IonAlert
//         isOpen={showAlert}
//         onDidDismiss={() => setShowAlert(false)}
//         header={'Choose Source'}
//         message={'Select whether you want to take a photo or pick from your gallery.'}
//         buttons={[
//           {
//             text: 'Camera',
//             handler: () => handleSelectSource(CameraSource.Camera),
//           },
//           {
//             text: 'Gallery',
//             handler: () => handleSelectSource(CameraSource.Photos),
//           },
//           {
//             text: 'Cancel',
//             role: 'cancel',
//             cssClass: 'secondary',
//           },
//         ]}
//       />
//     </IonCol>
//   );
// };

// export default CameraInput;

