import React, { useEffect, useState } from 'react';
import { Network } from '@capacitor/network';

const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(false);

  const checkNetworkStatus = async () => {
    const status = await Network.getStatus();

    if (status.connected) {
      try {
        const response = await fetch('10.27.240.110/ping', { // Ganti dengan URL server lokal
          method: 'GET',
          mode: 'cors', // Pastikan server mendukung CORS
        });

        if (response.ok) {
          setIsOnline(true);
        } else {
          setIsOnline(false);
        }
      } catch (error) {
        console.error('Error pinging server:', error);
        setIsOnline(false);
      }
    } else {
      setIsOnline(false);
    }
  };

  useEffect(() => {
    checkNetworkStatus();

    const addListener = async () => {
      const networkListener = await Network.addListener('networkStatusChange', checkNetworkStatus);
      return networkListener;
    };

    const listenerPromise = addListener();

    return () => {
      listenerPromise.then(listener => listener.remove());
    };
  }, []);

  return (
    <div style={{ color: isOnline ? 'green' : 'red', fontSize: '14px' }}>
      <p>{isOnline ? 'Online With Internet' : 'Offline'}</p>
    </div>
  );
};

export default NetworkStatus;
