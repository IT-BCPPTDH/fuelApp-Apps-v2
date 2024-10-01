import React, { useEffect, useState } from 'react';
import { Network, NetworkStatus as CapacitorNetworkStatus } from '@capacitor/network';


const NetworkStatus: React.FC = () => {
    const [networkStatus, setNetworkStatus] = useState<CapacitorNetworkStatus | null>(null);

    useEffect(() => {
        const logCurrentNetworkStatus = async () => {
            const status = await Network.getStatus();
            setNetworkStatus(status);
            console.log('Network status:', status);
        };

        // Initial check for network status
        logCurrentNetworkStatus();

        // Listener for network status changes
        const unsubscribe = Network.addListener('networkStatusChange', (status: CapacitorNetworkStatus) => {
            console.log('Network status changed', status);
            setNetworkStatus(status);
        });

        return () => {
            // Clean up the listener on component unmount
        };
    }, []);

    return (
      
            <>
             {networkStatus ? (
                    <div>
                        <p>{networkStatus.connected ? 'Online' : 'Offline'}</p>
                        
                    </div>
                ) : (
                    <p>Loading network status...</p>
                )}
            </>
         
               
           
       
    );
};

export default NetworkStatus;
