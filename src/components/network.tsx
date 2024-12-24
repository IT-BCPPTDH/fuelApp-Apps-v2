import React, { useEffect, useState } from 'react';

// Function to check server connection
const checkServerStatus = async (serverUrl: string): Promise<boolean> => {
  try {
    const response = await fetch(serverUrl, { method: 'GET' });
    return response.ok;
  } catch (error) {
    console.error('Server ping failed:', error);
    return false; 
  }
};

const NetworkStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [serverStatus, setServerStatus] = useState<boolean>(false);

  const serverUrl = import.meta.env.VITE_BACKEND_URL+'/online'

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
    const fetchServerStatus = async () => {
      const isServerOnline = await checkServerStatus(serverUrl);
      setServerStatus(isServerOnline);
    };

    if (isOnline) {
      fetchServerStatus();
      const intervalId = setInterval(async () => {
        const isServerOnline = await checkServerStatus(serverUrl);
        setServerStatus(isServerOnline);
      }, 5000); // Ping every 5 seconds
      
      return () => clearInterval(intervalId); 
    } else {
      setServerStatus(false); 
    }
  }, [isOnline, serverUrl]);

  return (
    <>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  marginRight: "15px",
                  color: "green",
                }}>
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    backgroundColor: serverStatus ? "#73A33F" : "red",
                    marginRight: "5px",
                  }}
                />
      {
        serverStatus?(
          <>
          <div style={{ color:'green' , fontSize: '15px', marginTop: '0px' }}>
            <p>
              online
            </p>
          </div>
          </>
        ):(
          <>
            <div style={{ color:'red' , fontSize: '15px', marginTop: '0px' }}>
              <p>
                offline
              </p>
            </div>
          </>
        )
      }
      </div>
    </>
  );
};

export default NetworkStatus;