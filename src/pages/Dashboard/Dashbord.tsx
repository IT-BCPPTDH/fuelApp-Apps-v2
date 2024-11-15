import React, { useEffect, useState, SetStateAction } from 'react';
import {
  IonImg,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonPage,
  IonRow,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonCardSubtitle,
  IonButton,
  useIonRouter,
  IonItem,
  IonText,
  IonLabel,
  IonSpinner,
  IonSkeletonText,
  IonThumbnail,
  

} from '@ionic/react';
import TableData from '../../components/Table';
import { getLatestLkfId, getShiftDataByLkfId, getCalculationIssued, getCalculationReceive, getLatestLkfDataDate } from '../../utils/getData';
import { getHomeByIdLkf, getHomeTable } from '../../hooks/getHome';
import NetworkStatus from '../../components/network';
import { fetchUnitData, getDataFromStorage } from '../../services/dataService';
import { handLeftSharp, home, navigate } from 'ionicons/icons';
import { updateDataInDB, updateDataInTrx, } from '../../utils/update';
import { addDataTrxType } from '../../utils/insertData';
import { deleteAllDataTransaksi } from '../../utils/delete';
import { Network } from '@capacitor/network';


// Define the data structure for the card
interface cardDash {
  title: string;
  value: string | number;
  icon: string;
}


interface TableDataItem {
  hm_km: any;
  from_data_id: number;
  unit_no: string;
  model_unit: string;
  owner: string;
  fbr_historis: string;
  jenis_trx: string;
  qty_issued: number;
  fm_awal: number;
  fm_akhir: number;
  hm_last: number;
  jde_operator: string;
  name_operator: string;

  status: number;
}

interface DataFormTrx {
  date: string | number | Date;
  id?: number; // Auto-incremented ID
  liters: number;
  cm: number;
  from_data_id: string;
  no_unit: string;
  model_unit: string;
  owner: string;
  date_trx: string;
  hm_last: number;
  hm_km: number;
  qty_last: number;
  qty: number;
  name_operator: string;
  fbr: number;
  flow_start: number;
  flow_end: number;
  signature: string;
  foto: string;
  type: string;
  lkf_id?: string;
  status: number;
  jde_operator: string; // Required
  fuelman_id: string;
  dip_start: number;
  dip_end: number;
  sonding_start: number;
  sonding_end: number;
  reference: number;
  start: string; // Required
  end: string; // Required
  created_at: string | number | Date;
}


const DashboardFuelMan: React.FC = () => {
  const [fullname, setFullname] = useState('');
  // New state for Fuelman
  //const [currentDate, setCurrentDate] = useState<string>(''); // State for current date
  const [latestDate, setLatestDate] = useState<string>(''); // State for latest date
  const route = useIonRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [lkfId, setLkfId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  const [jde, setJde] = useState<string>('');
  const [data, setData] = useState<TableDataItem[] | undefined>(undefined);
  const [jdeOptions, setJdeOptions] = useState<
    { JDE: string; fullname: string }[]
  >([]);

  const [opDip, setOpDip] = useState<number | null>(null)
  const [shift, setOpShift] = useState<string | null>(null)
  const [station, setOpStation] = useState<string | null>(null)
  const [receipt, setOpReceipt] = useState<number | null>(null)
  const [transfer, setOpTransfer] = useState<string | null>(null)
  const [receiveKpc, setOpReceiveKpc] = useState<number | null>(null)
  const [totalPengeluaran, setTotalPengeluaran] = useState(0);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  
  const [pendingStatus, setPendingStatus] = useState(true);
  const [closeShift, setCloseShift] = useState<any[]>([]); // Initialize as an array
  const [openingSonding, setOpeningSonding] = useState<number | undefined>(undefined);
  const [result, setResult] = useState<number | null>(null);
  const [openingDip, setOpeningDip] = useState<number | undefined>(undefined);
  const [unitOptions, setUnitOptions] = useState<
    {
      hm_km: SetStateAction<number | null>;
      qty: SetStateAction<number | null>;
      hm_last: SetStateAction<number | null>;
      id: string;
      unit_no: string;
      brand: string;
      owner: string
    }[]
  >([]);
  const [totalQuantityIssued, setTotalQuantityIssued] = useState<number>(0);

  const [flowMeterAwal, setFlowMeterAwal] = useState<number | undefined>(undefined);
  const [dataHome, setDataHome] = useState<any[]>([
  

  ]);

  const [totalIssued, setTotalIssued] = useState<number | null>(null); // State to store total_issued

  const [cardDash, setcardDash] = useState<cardDash[]>([
  
  ]);


//   useEffect(() => {
//     const handleOnline = () => setIsOnline(true);
//     const handleOffline = () => setIsOnline(false);

//     window.addEventListener('online', handleOnline);
//     window.addEventListener('offline', handleOffline);

//     // Cek data di local storage saat komponen di-mount
//     const cachedData = localStorage.getItem('cardDash');
//     if (cachedData) {
//         setDataHome(JSON.parse(cachedData));
//     }

//     // Cleanup event listeners
//     return () => {
//         window.removeEventListener('online', handleOnline);
//         window.removeEventListener('offline', handleOffline);
//     };
// }, []);

useEffect(() => {
  const updateOnlineStatus = () => setIsOnline(navigator.onLine);
  const updateOflineStatus = () => setIsOnline(navigator.onLine);

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);

  return () => {
    window.removeEventListener('online', updateOnlineStatus);
    window.removeEventListener('offline', updateOnlineStatus);
  };
}, []);

  useEffect(() => {
    // Function to format date as "Tanggal : 25 Januari 2025"
    const formatDate = (date: Date): string => {
      const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
      return `Tanggal : ${new Intl.DateTimeFormat('id-ID', options).format(date)}`;
    };

    const fetchDate = async () => {
      try {
        const latestDataDate = await getLatestLkfDataDate();
        if (latestDataDate && latestDataDate.date) {
          const date = new Date(latestDataDate.date);
          setLatestDate(formatDate(date));
        } else {
          setLatestDate('No Date Available');
        }
      } catch (error) {
        console.error('Error fetching latest data date:', error);
        setLatestDate('Error fetching date');
      }
    };


    const fetchLkfIdAndData = async () => {
      try {
        const id = await getLatestLkfId();
        if (id) {
          setLkfId(id);

          const shiftData = await getShiftDataByLkfId(id);
          const calculationIssued = await getCalculationIssued(id);
          const calculationReceive = await getCalculationReceive(id);

          const qtyReceive = typeof calculationReceive === 'number' ? calculationReceive : 0;
          const qtyIssued = typeof calculationIssued === 'number' ? calculationIssued : 0;

          const openingDip = shiftData.openingDip ?? 0;
          const stockOnHand = openingDip + qtyReceive - qtyIssued;
          const flowMeterStart = shiftData.flowMeterStart ?? 0;
          const flowMeterEnd = flowMeterStart + qtyIssued;
          const totalFlowMeter = qtyIssued;
          const variance = totalFlowMeter - qtyIssued;


       
          const homeData = await getHomeByIdLkf(id);
          const loginData = localStorage.getItem('loginData');
          if (loginData) {
            const { jde } = JSON.parse(loginData);
            if (homeData && homeData.fullname) {
              const matchedEmployee = homeData.fullname.find((employee: any) => employee.JDE === jde);
              if (matchedEmployee) {

                setJde(matchedEmployee.jde);
              } else {

              }
            }
          }
        } else {
          setError('No LKF ID found');
        }
      } catch (error) {
        if (error instanceof Error) {
          setError(`Error fetching data: ${error.message}`);
        } else {
          setError('An unexpected error occurred.');
        }
        console.error('Error fetching shift data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDate();
    fetchLkfIdAndData();
  }, []);


  
  const handleLogout = () => {
    route.push('/closing-data');
  };

  useEffect(() => {
    const fetchJdeOptions = async () => {
      const storedJdeOptions = await getDataFromStorage("allOperator");

      if (storedJdeOptions) {
        // If you are certain the data is in the correct format
        if (Array.isArray(storedJdeOptions)) {
          setJdeOptions(storedJdeOptions);
        } else {
          console.log("Data FuelMan");
        }
      } else {
        console.log("No JDE options found in storage.");
      }
    };

    fetchJdeOptions();
  }, []);

  useEffect(() => {
    const fetchJdeOptions = async () => {
      // Fetch loginData and allOperator from Capacitor Storage
      const storedLoginData = await getDataFromStorage("loginData");
      const storedJdeOptions = await getDataFromStorage("allOperator");

      if (storedLoginData && storedJdeOptions) {
        // Parse the stored loginData and allOperator
        const loginData = JSON.parse(storedLoginData);
        const allOperators = Array.isArray(storedJdeOptions) ? storedJdeOptions : JSON.parse(storedJdeOptions);

        // Get the JDE from loginData
        const loggedInJde = loginData.jde;

        // Find the operator that matches the JDE from loginData
        const operator = allOperators.find((emp: { jde: string }) => emp.jde === loggedInJde);

        // If the operator is found, set it; otherwise, set an empty array
        setJdeOptions(operator ? [operator] : []);
        setFullname(operator ? operator.fullname : ""); // Set fullname for the Fuelman display
      } else {
        console.log("No JDE options or loginData found in storage.");
      }
    };

    fetchJdeOptions();
  }, []);



  

  useEffect(() => {
    const loadUnitData = async () => {
      const cachedUnitData = await getDataFromStorage('allUnit');
      if (cachedUnitData) {
        setUnitOptions(cachedUnitData);
      } else {
        const units = await fetchUnitData();
        setUnitOptions(units);

      }
    };

    loadUnitData();
  }, []);

  const updateAllData = async () => {
    const units = await fetchUnitData();
  }


  const TambahData = async () => {
    route.push("/transaction");
  };



const handleGetTrx =  async() => {

}
  
  
  const handleRefresh = async () => {
    if (lkfId) {
      setLoading(true); // Start loading state
      try {
        const response = await getHomeTable(lkfId);
        console.log("Fetched Edit Transaksi:", response);

        // Ensure response.data is an array
        if (response && response.data && Array.isArray(response.data)) {
          const newData = response.data;

          // First, delete all existing data in dataTransaksi
          await deleteAllDataTransaksi();

          // Then, add the new data
          for (const item of newData) {
            const dataPost: DataFormTrx = {
              date: new Date().toISOString(),
              from_data_id: item.from_data_id,
              no_unit: item.no_unit,
              model_unit: item.model_unit,
              owner: item.owner,
              date_trx: new Date().toISOString(),
              hm_last: Number(item.hm_last) || 0,
              hm_km: Number(item.hm_km) || 0,
              qty_last: Number(item.qty_last) || 0,
              qty: Number(item.qty) || 0,
              flow_start: Number(item.flow_start) || 0,
              flow_end: Number(item.flow_end) || 0,
              name_operator: item.name_operator,
              fbr: item.fbr,
              lkf_id: item.lkf_id ?? "",
              signature: item.signature ?? "",
              type: item.type ?? "",
              foto: item.foto ?? "",
              fuelman_id: item.fuelman_id,
              status: item.status ?? 1,
              jde_operator: item.jde_operator, 
              dip_start: 0, // Replace with actual value
              dip_end: 0, // Replace with actual value
              sonding_start: 0, // Replace with actual value
              sonding_end: 0, // Replace with actual value
              reference: 0, // Replace with actual value
              start: item.start, // Ensure this is defined
              end: item.end, // Ensure this is defined
              created_at: new Date().toISOString(),
              liters: 0,
              cm: 0
            };
            

            await addDataTrxType(dataPost);
          }


          setData(newData);
        } else {
          console.error("Expected an array in response.data but got:", response);
          setData([]); // Reset to empty array on error
        }
      } catch (error) {
        console.error("Failed to refresh data:", error);
        setError("Failed to refresh data");
        setData([]);
      } finally {
        setLoading(false);
      }
    } else {
      console.log("No LKF ID to refresh data for");
      setData([]);
      setLoading(false);
    }
    updateAllData()
    updateCard()
    
  };
  const IssuedTotal = async () => {
    try {
      const fetchedResult = await getCalculationIssued(lkfId);
      console.log(`Fetched result: ${fetchedResult}`); 
      setResult(fetchedResult ?? null); 
      // Set to null if fetchedResult is undefined
    } catch (error) {
      console.error('Error fetching issued total:', error);
    }
  };

  useEffect(() => {
    IssuedTotal();
  }, [lkfId]);
 

  useEffect(() => {
    const cachedData = localStorage.getItem('cardDash');
    if (cachedData) {
        setDataHome(JSON.parse(cachedData));
    }
}, []);

const updateCard = async () => {
  localStorage.removeItem('cardDash')
  const cards = await fetchcardDash(lkfId);
}

const fetchData = async () => {
  setLoading(true);
  try {
    const cachedShiftData = await getDataFromStorage('shiftCloseData');
    if (cachedShiftData && cachedShiftData.length > 0) {
      setCloseShift(cachedShiftData);
      const latestShiftData = cachedShiftData[cachedShiftData.length - 1]; 
      if (latestShiftData.closing_sonding !== undefined) {
        setOpeningSonding(latestShiftData.closing_sonding); 
      }
      if (latestShiftData.flow_meter_end !== undefined) {
        setFlowMeterAwal(latestShiftData.flow_meter_end); 
      }
      if (latestShiftData.opening_dip !== undefined) {
        setOpeningDip(latestShiftData.opening_dip); 
      }
    
    } else {
      console.error("No cached shift data found");
    }
  } catch (error) {
    console.error("Error fetching shift data:", error);
  } finally {
    setLoading(false);
  }
};
useEffect(() => {
  fetchData(); 
}, []);

const fetchcardDash = async (lkfId: string) => {
  try {
    console.log("Fetching data for LKF ID:", lkfId);
    const cachedData = localStorage.getItem('cardDash');
    if (cachedData) {
      console.log("Using cached data");
      const preparedData = JSON.parse(cachedData);
      setDataHome(preparedData); 
      return; 
    }

    // Cek status online
    if (!navigator.onLine) {
      console.warn("Offline: Using cached data only");
      return; 
    }

    const dataHome = await getHomeByIdLkf(lkfId);
    console.log("Full Content Cards:", dataHome); 
    if (dataHome && dataHome.data && Array.isArray(dataHome.data) && dataHome.data.length > 0) {
      const item = dataHome.data[0];
      const openingDip = item.total_opening || 0;
      const received = item.total_receive || 0;
      const receivedKpc = item.total_receive_kpc || 0;
      const issued = item.total_issued || 0;
      const transfer = item.total_transfer || 0;
      const stockOnHand = openingDip + received + receivedKpc - issued - transfer;
      const totalReceive = received + receiveKpc

      // Ambil total quantity issued
      const fetchedResult = await getCalculationIssued(lkfId);
      console.log("Fetched total quantity issued:", fetchedResult); // Log hasil yang diambil

      // Update state dengan data yang diambil
      setTotalQuantityIssued(fetchedResult ?? 0);
      setOpShift(item.shift);
      setOpDip(openingDip);
      setOpStation(item.station);
      setOpReceipt(received);
      setTotalIssued(issued);
      setOpTransfer(transfer);
      setOpReceiveKpc(receivedKpc);

      // Siapkan data untuk dirender
      const preparedData = [
        { title: 'Shift', value: item.shift || 'No Data', icon: 'shift.svg' },
        { title: 'FS/FT No', value: item.station || 'No Data', icon: 'fs.svg' },
        { title: 'Opening Dip', value: openingDip, icon: 'openingdeep.svg' },
        { title: 'Receipt', value: totalReceive, icon: 'receipt.svg' },
        { title: 'Stock On Hand', value: stockOnHand || 'No Data', icon: 'stock.svg' },
        { title: 'QTY Issued', value: fetchedResult ?? 0, icon: 'issued.svg' },
        { title: 'Balance', value: stockOnHand || 0, icon: 'balance.svg' },
        { title: 'Closing Dip', value: openingDip || 0, icon: 'close.svg' },
        { title: 'Flow Meter Awal', value: item.flow_meter_start || 0, icon: 'flwawal.svg' },
        { title: 'Flow Meter Akhir', value: (item.flow_meter_start + issued) || 0, icon: 'flwakhir.svg' },
        { title: 'Total Flow Meter', value: issued || 0, icon: 'total.svg' },
        { title: 'Variance', value: item.totalVariance || 0, icon: 'variance.svg' },
      ];

      setDataHome(preparedData);
      localStorage.setItem('cardDash', JSON.stringify(preparedData)); // Cache data yang sudah disiapkan

    } else {
      console.error("No valid data found:", dataHome);
      setDataHome([]); // Kosongkan data jika tidak ada atau format tidak valid
    }
  } catch (error) {
    console.error("Error fetching card data:", error);
    setDataHome([]); // Kosongkan data jika terjadi kesalahan
  }
};

  
  
  useEffect(() => {
    if (lkfId) {
      fetchcardDash(lkfId);
    }
  }, [lkfId]);
  

  const isOffline = !navigator.onLine; // Check if the user is offline

  // Retrieve cached data from local storage if offline
  const cachedData = localStorage.getItem('cardDash');
  const displayData = isOffline && cachedData ? JSON.parse(cachedData) : dataHome;
  

 
  return (
    <IonPage>
      <IonContent>
        <IonHeader style={{ height: "60px" }}>
          <IonRow>
            <IonCol>
              <div className='logoDashboard'>
                <IonImg style={{ padding: "10px", marginLeft: "15px" }} src="logodh.png" alt='logo-dashboard' />
              </div>
            </IonCol>
            <IonCol style={{ textAlign: 'right' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                marginRight: '15px',
                color: "green"

              }}>
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: isOnline ? '#73A33F' : 'red',
                    marginRight: '5px',

                  }}
                />
                <NetworkStatus />
              </div>
            </IonCol>
          </IonRow>
        </IonHeader>

        <div className='content'>
          <div className='btn-start'>
            <IonButton color="primary" onClick={handleRefresh} >
              <IonImg src='refresh.svg' alt="Refresh" />
              Refresh
            </IonButton>
            {/* <IonButton color="primary" onClick={updateAllData}>
              <IonImg src='refresh.svg' alt="Refresh" />
              Update Data
            </IonButton> */}
             <IonButton color="warning" style={{ marginLeft: "10px" }} onClick={handleLogout} disabled={pendingStatus}>
              Close LKF & Logout
            </IonButton>
          </div>
        </div>

        <div className='padding-content mr20' style={{ marginTop: "20px" }}>
          <IonGrid>
            <IonRow >
              <IonCol></IonCol>
            </IonRow>
          </IonGrid>
          <IonRow style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h4 >Fuelman {jde}</h4>

            <h4 >{latestDate}</h4>
          </IonRow>
        </div>
        <IonGrid >
          <IonRow >
            {/* {cardDash.map((card, index) => (
              <IonCol size="4" key={index}>
                <IonCard style={{height:"90px"}} >
                  <IonCardHeader>
                    <IonCardSubtitle style={{ fontSize: "16px" }}>{card.title}</IonCardSubtitle>
                    <div style={{ display: "inline-flex", gap: "10px" }}>
                      <IonImg src={card.icon} alt={card.title} style={{ width: '30px', height: '30px', marginTop: "10px" }} />
                      <IonCardContent style={{ fontSize: "24px", fontWeight: "500" , marginTop:"-10px"}}>{card.value}</IonCardContent>
                    </div>
                    
                  </IonCardHeader>
                  
                </IonCard>
              </IonCol>
            ))} */}


            {dataHome.length > 0 ? (
              dataHome.map((card, index) => (
                <IonCol size="4" key={index}>
                  <IonCard style={{ height: "90px" }}>
                    <IonCardHeader>
                      <IonCardSubtitle style={{ fontSize: "16px" }}>
                        {card.title}
                      </IonCardSubtitle>
                      <div style={{ display: "inline-flex", gap: "10px" }}>
                        <IonImg
                          src={card.icon}
                          alt={card.title}
                          style={{ width: '30px', height: '30px', marginTop: "10px" }}
                        />
                        <IonCardContent
                          style={{ fontSize: "24px", fontWeight: "500", marginTop: "-10px" }}
                        >
                          {card.value}
                        </IonCardContent>
                      </div>
                    </IonCardHeader>
                  </IonCard>
                </IonCol>
              ))
            ) : (
              Array(12).fill(0).map((_, index) => (
                <IonCol size="4" key={index}>
                  <IonCard style={{ height: "90px" }}>
                    <IonCardHeader>
                      <IonCardSubtitle style={{ fontSize: "16px" }}>
                        <IonSkeletonText animated={true} style={{ width: "60%" }} />
                      </IonCardSubtitle>
                      <div style={{ display: "inline-flex", gap: "10px" }}>
                        <IonThumbnail slot="start">
                          <IonSkeletonText animated={true} style={{ width: '30px', height: '30px' }} />
                        </IonThumbnail>
                        <IonText style={{ fontSize: "16px" }}>
                          <IonSkeletonText animated={true} style={{ width: "60%" }} />
                        </IonText>
                        <IonCardContent
                          style={{ fontSize: "24px", fontWeight: "500", marginTop: "-10px" }}
                        >
                          <IonSkeletonText animated={true} style={{ width: "50%" }} />
                        </IonCardContent>
                      </div>
                    </IonCardHeader>
                  </IonCard>
                </IonCol>
              ))
            )}

            <IonRow>
              <p style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexDirection: 'column',
              }}>
                <p style={{
                  color: "#E16104",
                  textAlign: 'justify',
                  marginLeft: "15px",
                  marginRight: "15px",
                  marginTop: "-15px"
                }}>
                  * Sebelum Logout Pastikan Data Sonding Dip /Stock diisi, Klik Tombol ‘Dip’ Untuk Membuka Formnya, Terima kasih
                  * QTY Issued adalah Issued + Transfer
                </p>
              </p>
            </IonRow>
          </IonRow>
       
          <IonButton
          style={{ padding: "15px", marginTop: "-40px" }}
          className='check-button'
          onClick={TambahData}>
          <IonImg src='plus.svg' />
          <span style={{ marginLeft: "10px" }}>Tambah Data</span>
        </IonButton>
          <TableData setPendingStatus={setPendingStatus} />
        </IonGrid>

      </IonContent>
    </IonPage>
  );
};

export default DashboardFuelMan;
