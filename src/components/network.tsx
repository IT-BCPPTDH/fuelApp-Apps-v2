import React, { useEffect, useState } from 'react';

// Function to check server connection
const checkServerStatus = async (serverUrl: string): Promise<boolean> => {
  try {
    const response = await fetch(serverUrl);
    // If the response is OK, return true (online)
    return response.ok;
  } catch (error) {
    console.error('Server ping failed:', error);
    return false; // If there's an error, assume offline
  }
};

const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [serverStatus, setServerStatus] = useState<boolean>(false);

  const serverUrl = 'http://10.27.240.110'; // Corrected URL

  // Effect to monitor online/offline status
  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Initial check for online status
    updateOnlineStatus();

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  // Effect to ping server periodically (only when online)
  useEffect(() => {
    if (isOnline) {
      const intervalId = setInterval(async () => {
        const isServerOnline = await checkServerStatus(serverUrl);
        setServerStatus(isServerOnline);
      }, 5000); // Ping every 5 seconds (adjust as necessary)

      return () => clearInterval(intervalId); // Cleanup interval on unmount
    } else {
      setServerStatus(false); // If offline, assume server is down
    }
  }, [isOnline]);

  return (
    <div style={{ color: isOnline && serverStatus ? 'green' : 'red', fontSize: '15px', marginTop: '0px' }}>
      <p>
        {isOnline
          ? serverStatus
            ? 'Online (Server Connected)'
            : 'Online'
          : 'Offline'}
      </p>
    </div>
  );
};

export default NetworkStatus;
