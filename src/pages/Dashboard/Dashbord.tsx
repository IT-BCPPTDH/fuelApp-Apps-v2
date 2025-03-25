import React, { useEffect, useState, SetStateAction } from "react";
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
  IonLabel,
} from "@ionic/react";
import TableData from "../../components/Table";
import {
  getLatestLkfId,
  getShiftDataByLkfId,
  getCalculationIssued,
  getCalculationReceive,
  getLatestLkfDataDate,
  getCalculationITransfer,
  bulkInsertDataMasterTransaksi,
  UpdateBulkInsertDataMasterTransaksi,
} from "../../utils/getData";
import { getHomeByIdLkf, getHomeTable } from "../../hooks/getHome";
import NetworkStatus from "../../components/network";
import {
  fetchLasTrx,
  fetchOperatorData,
  fetchQuotaData,
  fetchUnitData,
  getDataFromStorage,
  saveDataToStorage,
} from "../../services/dataService";
import { addDataToDB, addDataTrxType, clearDataTrxType } from "../../utils/insertData";
import { postOpening, updateData } from "../../hooks/serviceApi";
import useOnlineStatus from "../../helper/onlineStatus";
import { updateQuota } from "../../hooks/getQoutaUnit";
import { postLog } from "../../hooks/useAuth";

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
  jde_operator: string;
  fuelman_id: string;
  dip_start: number;
  dip_end: number;
  sonding_start: number;
  sonding_end: number;
  reference: number;
  start: string;
  end: string;
  created_at: string | number | Date;
}

const DashboardFuelMan: React.FC = () => {
  const [fullname, setFullname] = useState("");
  const [latestDate, setLatestDate] = useState<string>("");
  const route = useIonRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [lkfId, setLkfId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const [jde, setJde] = useState<string>("");
  const [data, setData] = useState<TableDataItem[] | undefined>(undefined);
  const [jdeOptions, setJdeOptions] = useState<
    { JDE: string; fullname: string }[]
  >([]);
  const [opDip, setOpDip] = useState<number | null>(null);
  const [shift, setOpShift] = useState<string | null>(null);
  const [receipt, setOpReceipt] = useState<number | null>(null);
  const [transfer, setOpTransfer] = useState<string | null>(null);
  const [receiveKpc, setOpReceiveKpc] = useState<number | null>(null);
  const [totalPengeluaran, setTotalPengeluaran] = useState(0);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [fuelmanID, setFuelmanID] = useState<string>("");
  const [station, setStation] = useState<string>("");
  const [site, setSite] = useState<string>("");
  const [pendingStatus, setPendingStatus] = useState(true);
  const [closeShift, setCloseShift] = useState<any[]>([]); // Initialize as an array
  const [openingSonding, setOpeningSonding] = useState<number | undefined>(
    undefined
  );
  const [result, setResult] = useState<number | null>(null);
  const [openingDip, setOpeningDip] = useState<number | undefined>(undefined);
  const [fuelmanName, setFuelmanName] = useState<string | undefined>(undefined);
  const [unitOptions, setUnitOptions] = useState<
    {
      hm_km: SetStateAction<number | null>;
      qty: SetStateAction<number | null>;
      hm_last: SetStateAction<number | null>;
      id: string;
      unit_no: string;
      brand: string;
      owner: string;
    }[]
  >([]);
  const [totalQuantityIssued, setTotalQuantityIssued] = useState<number>(0);
  const [flowMeterAwal, setFlowMeterAwal] = useState<number | undefined>(
    undefined
  );
  const [dataHome, setDataHome] = useState<any[]>([]);
  const [tanggalTransaksi, setTanggalTransaksi] = useState<string | null>(null);
  const [stockOnHand, setStockOnHand] = useState<number>(0);
  const [totalIssued, setTotalIssued] = useState<number | null>(null); // State to store total_issued
  const [cardDash, setcardDash] = useState<cardDash[]>([
    { title: "Shift", value: "No Data", icon: "shit.svg" },
    { title: "FS/FT No", value: "No Data", icon: "fs.svg" },
    { title: "Opening Dip", value: "No Data", icon: "openingdeep.svg" },
    { title: "Receipt", value: "No Data", icon: "receipt.svg" },
    { title: "Stock On Hand", value: "No Data", icon: "stock.svg" },
    { title: "QTY Issued", value: "No Data", icon: "issued.svg" },
    { title: "Balance", value: "No Data", icon: "balance.svg" },
    { title: "Closing Dip", value: "No Data", icon: "close.svg" },
    { title: "Flow Meter Awal", value: "No Data", icon: "flwawal.svg" },
    { title: "Flow Meter Akhir", value: "No Data", icon: "flwakhir.svg" },
    { title: "Total Flow Meter", value: "No Data", icon: "total.svg" },
    { title: "Variance", value: "No Data", icon: "variance.svg" },
  ]);
  const [btnRefresh, setBtnRefresh] = useState<boolean>(false);


  useEffect(() => {
    checkOn()
  }, []);

  const checkOn = async () =>{
    const on = await useOnlineStatus()
    setIsOnline(on)
  }

  useEffect(() => {
    const userData = async () => {
      const data = await getDataFromStorage("loginData");
      if (data) {
        const parsedData = data; // Assuming data is already an object.
        setFuelmanName(parsedData.fullname);
        setFuelmanID(parsedData.jde);
      }
    };

    userData();
  }, []);

  useEffect(() => {
    const fetchShiftData = async () => {
      try {
        const lkfId = await getLatestLkfId();
        if (lkfId) {
          const shiftData = await getShiftDataByLkfId(lkfId);
          const calculationIssued = await getCalculationIssued(lkfId);
          const calculationReceive = await getCalculationReceive(lkfId);
          const calculationTransfer = await getCalculationITransfer(lkfId);
          const qtyReceive =
            typeof calculationReceive === "number" ? calculationReceive : 0;
          const qtyIssued =
            typeof calculationIssued === "number" ? calculationIssued : 0;
          const qtyTransfer =
            typeof calculationTransfer === "number" ? calculationTransfer : 0;
          const openingDip = shiftData.openingDip ?? 0;
          const stockOnHand = openingDip + qtyReceive - qtyIssued - (calculationTransfer?calculationTransfer:0);
          const balance = stockOnHand - qtyIssued;
          setStockOnHand(stockOnHand);
          const cardData = [
            {
              title: "Shift",
              value: shiftData.shift || "No Data",
              icon: "shift.svg",
            },
            {
              title: "FS/FT No",
              value: shiftData.station || "No Data",
              icon: "fs.svg",
            },
            {
              title: "Opening Dip",
              value: openingDip || 0,
              icon: "openingdeep.svg",
            },
            { title: "Receipt", value: qtyReceive || 0, icon: "receipt.svg" },
            { title: "Transfer", value: qtyTransfer || 0, icon: "issued.svg" },
            { title: "QTY Issued", value: qtyIssued || 0, icon: "issued.svg" },
            // { title: 'Balance', value: stockOnHand || 0, icon: 'balance.svg' },
            // { title: 'Closing Dip', value: shiftData.openingDip ?? 0, icon: 'close.svg' },
            {
              title: "Flow Meter Awal",
              value: shiftData.flowMeterStart ?? 0,
              icon: "flwawal.svg",
            },
            {
              title: "Flow Meter Akhir",
              value:
                (shiftData.flowMeterStart ?? 0) +
                (qtyIssued ?? 0) +
                (qtyTransfer ?? 0),
              icon: "flwakhir.svg",
            },
            {
              title: "Total Flow Meter",
              value: qtyIssued + qtyTransfer || 0,
              icon: "total.svg",
            },
            {
              title: "Stock On Hand",
              value: stockOnHand || 0,
              icon: "stock.svg",
            },
            // { title: 'Variance', value: (shiftData.openingDip ?? 0) - (balance ?? 0), icon: 'variance.svg' }
          ];
          localStorage.setItem("cardDash", JSON.stringify(cardData));
          setcardDash(cardData);
        }
      } catch (error) {
        console.error("Error fetching shift data:", error);
      }
    };

    fetchShiftData();
    checkOpening();
    
  }, []);

  const checkOpening = async () => {
    if (isOnline) {
      let dataPost = await getDataFromStorage("openingSonding");
      if (dataPost && dataPost.status === "pending") {
        const result = await postOpening(dataPost);
        if (result.status === "201" && result.message === "Data Created") {
          dataPost = {
            ...dataPost,
            status: "sent",
          };

          await saveDataToStorage("openingSonding", dataPost);
          await addDataToDB(dataPost);
        }
      }
    }
  };

  const checkUpdateQuota = async () =>{
    const quotaUpdate = await getDataFromStorage("quotaUpdate");
    // console.log(19,quotaUpdate)
    if(quotaUpdate){
      let data = quotaUpdate.filter((v:any) => v.status === 'pending')
      
      if(data.length === 0){
        loadUnitDataQuota()
      }else{
        let dataUp = []
        for(let i = 0; i < data.length;i++){
          const response = await updateQuota(data[i])
          if(response.status === '200'){
            const updatedData = quotaUpdate.map((item:any) => {
              // console.log(0,item.id,data[i].id)
              if (item.id === data[i].id) {
                return { ...item, status: "sent" };  
              }else{
                return item;  
              }
            });
            dataUp = updatedData
          }
        }
        // console.log(dataUp)
        await saveDataToStorage("quotaUpdate", dataUp);
      }
    }else{
      console.log('get Quota Update')
      loadUnitDataQuota()
    }
  }

  const loadLastTrx = async () => {
    const units = await fetchLasTrx();
    const transaksiDataParsed =
          typeof units === "string"
            ? JSON.parse(units)
            : units;
        if (
          Array.isArray(transaksiDataParsed) &&
          transaksiDataParsed.length > 0
        ) {
          // console.log(transaksiDataParsed)
          await UpdateBulkInsertDataMasterTransaksi(transaksiDataParsed);
        }
  };

  const loadUnitDataQuota = async () => {
    // console.log(111)
    const opening = await getDataFromStorage("openingSonding");
    const today = new Date(opening.date);
    console.log(0,today)
    const formattedDate = today.toISOString().split('T')[0];
    // console.log(1,formattedDate)
    try {
      console.log("date",formattedDate)
        const quotaData = await fetchQuotaData(formattedDate);
        // console.log(123,quotaData)
        // console.log('Fetched Qouta Login ', quotaData);
  
        // if (quotaData && Array.isArray(quotaData)) {
        //     let foundUnitQuota = quotaData.find((unit) => unit.no_unit === selectedUnit);
  
        //     if (!foundUnitQuota) {
        //         const yesterday = new Date(today);
        //         yesterday.setDate(today.getDate() - 1);
        //         const formattedYesterday = yesterday.toISOString().split('T')[0];
        //         const previousQuotaData = await fetchQuotaData(formattedYesterday);
        //         // console.log('Fetched previous quota data:', previousQuotaData);
        //         foundUnitQuota = previousQuotaData.find((unit) => unit.no_unit === selectedUnit);
        //     }
        // } else {
        //     console.error('No quota data found for the specified date');
        // }
    } catch (error) {
        console.error('Error fetching quota data:', error);
    }
  };

  // useEffect(() => {
    
    
  //   checkUpdateQuota()
  // }, [])
  
  function formatToDDMMYYYY(dateString: string): string {
    const date = new Date(dateString);
    
    // Convert to GMT+8
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'Asia/Singapore', // GMT+8
    };
  
    return date.toLocaleDateString('en-GB', options); // en-GB ensures DD/MM/YYYY format
  }
 

  useEffect(() => {
    const tanggal = async () => {
      const savedDate = await getDataFromStorage("openingSonding");
      // console.log(savedDate)
      setLkfId(savedDate.lkf_id)
      if (savedDate) {
        const transactionDate = savedDate.date;
        if (transactionDate) {
          const dt = transactionDate.split('T')
          setTanggalTransaksi(dt[0]);
          // console.log(1234,transactionDate.toLocaleDateString("id-ID"))
        } else {
          console.error("Invalid date format in localStorage:", savedDate);
          setTanggalTransaksi("Invalid Date");
        }
      }
    };
    tanggal();
  }, []);

  const handleLogout = () => {
    route.push("/closing-data");
  };

  useEffect(() => {
    const fetchJdeOptions = async () => {
      const storedJdeOptions = await getDataFromStorage("allOperator");
      if (storedJdeOptions) {
        if (Array.isArray(storedJdeOptions)) {
          setJdeOptions(storedJdeOptions);
        }
      }
    };

    fetchJdeOptions();
  }, []);

  useEffect(() => {
    const loadUnitData = async () => {
      const cachedUnitData = await getDataFromStorage("allUnit");
      if (cachedUnitData) {
        setUnitOptions(cachedUnitData);
      } else {
        const units = await fetchUnitData();
        setUnitOptions(units);
      }
    };

    loadUnitData();
  }, []);

  // useEffect(() => {
  //   const loadQuota = async () => {
  //     try {
  //       const tanggal = await getDataFromStorage("tanggalTransaksi");
  //       if (!tanggal) {
  //         throw new Error("tanggalTransaksi is not available in storage.");
  //       }
  //       let formattedDate: string;
  //       if (typeof tanggal === "string" && tanggal.includes("/")) {
  //         const [day, month, year] = tanggal.split("/");
  //         formattedDate = `${day}-${month}-${year}`;
  //         const quotaData = await fetchQuotaData(formattedDate);
  //       }
  //     } catch (error) {
  //       console.error("Error in loadUnitDataQuota:", error);
  //     }
  //   };
  //   loadQuota();
  // }, []);

  const updateAllData = async () => {
    const units = await fetchUnitData();
    const unit = await getHomeTable(lkfId);
  };

  const TambahData = async () => {
    localStorage.getItem("cardDash");
    route.push("/transaction");
  };

  const loadOperator = async () => {
      try {
          const fetchedJdeOptions = await fetchOperatorData();
          console.log(fetchedJdeOptions)
      } catch (error) {
        console.error("Error loading operator data:", error);
      }
    };

  const loadUnitData = async () => {
      const units = await fetchUnitData();
    };

  const handleRefresh = async () => {
    setBtnRefresh(true)
    await checkUpdateQuota()
    await loadLastTrx()
    await handleLog()
    await loadOperator()
    await loadUnitData()
    if (lkfId) {
      try {
        // console.log(1,lkfId)
        const response = await getHomeTable(lkfId);
        // console.log(123,response)
        if (response && response.data && Array.isArray(response.data)) {
          const newData = response.data;
          await clearDataTrxType();
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
              dip_start: 0,
              dip_end: 0,
              sonding_start: 0,
              sonding_end: 0,
              reference: 0,
              start: item.start,
              end: item.end,
              created_at: new Date().toISOString(),
              liters: 0,
              cm: 0,
            };
            await addDataTrxType(dataPost);
          }
          setData(newData);
          setBtnRefresh(false)
          window.location.reload()
        } else {
          setBtnRefresh(false)
          console.error(
            "Expected an array in response.data but got:",
            response
          );
          // setData([]);
        }
      } catch (error) {
        setBtnRefresh(false)
        console.error("Failed to refresh data:", error);
        setError("Failed to refresh data");
        // setData([]);
      } finally {
        setBtnRefresh(false)
        setLoading(false);
      }
    } else {
      console.log("No LKF ID to refresh data for");
      // setData([]);
      setLoading(false);
    }
    updateAllData();
  };

  const handleLog = async () =>{
    const data = await getDataFromStorage("dataLog");

    if(data.login_status === "pending"){
      const response = await postLog(data)
      if(response.status === '200'){
        let updata = {
          ...data,
          login_status:'sent'
        }
        saveDataToStorage('dataLog',updata)
      }
    }
  }

  useEffect(() => {
    IssuedTotal();
  }, []);

  useEffect(() => {
    const cachedData = localStorage.getItem("cardDash");

    if (cachedData) {
      setDataHome(JSON.parse(cachedData));
    }
  }, []);

  const updateDataHome = (newData: React.SetStateAction<any[]>) => {
    setDataHome(newData);
    localStorage.setItem("cardDash", JSON.stringify(newData));
  };

  const modifyDataExample = (newData: any) => {
    if (!Array.isArray(newData)) {
      return;
    }

    const updatedData = [...newData];
    const qtyIssuedIndex = updatedData.findIndex(
      (item) => item.title === "QTY Issued"
    );
    const qtyfloweEndIndex = updatedData.findIndex(
      (item) => item.title === "Flow Meter Akhir"
    );

    if (qtyIssuedIndex !== -1) {
      const qtyIssuedItem = updatedData[qtyIssuedIndex];
      const qtyFlowAkhirItem = updatedData[qtyfloweEndIndex];
      const currentQtyIssued =
        typeof qtyIssuedItem.value === "number" ? qtyIssuedItem.value : 0;
      const qtyLast =
        typeof qtyIssuedItem.qty_last === "number" ? qtyIssuedItem.qty_last : 0;
      updatedData[qtyIssuedIndex].value = currentQtyIssued + qtyLast;
    }

    updateDataHome(updatedData);
  };

  useEffect(() => {
    const cachedData = localStorage.getItem("cardDash");
    if (cachedData) {
      const data = JSON.parse(cachedData);
      setDataHome(data);

      modifyDataExample(data);
    }
  }, [data]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const cachedShiftData = await getDataFromStorage("shiftCloseData");
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
      }
      // else {
      //   console.error("No cached shift data found");
      // }
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
      const cachedData = localStorage.getItem("cardDash");

      if (cachedData) {
        const preparedData = JSON.parse(cachedData);
        const flowMeterStart =
          preparedData.find((item: any) => item.title === "Flow Meter Awal")
            ?.value || 0;
        const issued =
          preparedData.find((item: any) => item.title === "QTY Issued")
            ?.value || 0;
        const transfer =
          preparedData.find((item: any) => item.title === "Transfer")?.value ||
          0;
        const flowMeterAkhir = flowMeterStart + issued + transfer;
        const updatedData = preparedData.map((item: any) =>
          item.title === "Flow Meter Akhir"
            ? { ...item, value: flowMeterAkhir }
            : item
        );

        setDataHome(updatedData);
        return;
      }

      if (!navigator.onLine) {
        console.warn("Offline mode - cannot fetch new data.");
        return;
      }

      const dataHome = await getHomeByIdLkf(lkfId);
      
      if (
        dataHome &&
        dataHome.data &&
        Array.isArray(dataHome.data) &&
        dataHome.data.length > 0
      ) {
        const item = dataHome.data[0];

        const openingDip = item.total_opening || 0;
        const received = item.total_receive || 0;
        const receivedKpc = item.total_receive_kpc || 0;
        const issued = item.total_issued || 0;
        const transfer = item.total_transfer || 0;
        const stockOnHand =
          openingDip + received + receivedKpc - issued - transfer;
        const totalReceive = received + receivedKpc;
        
        const fetchedResult = await getCalculationIssued(lkfId);

        setTotalQuantityIssued(fetchedResult ?? 0);
        setOpShift(item.shift);
        setOpDip(openingDip);
        setStation(item.station);
        setOpReceipt(received);
        setTotalIssued(issued);
        setOpTransfer(transfer);
        setOpReceiveKpc(receivedKpc);

        const flowMeterStart = item.flow_meter_start || 0;
        const flowMeterAkhir = flowMeterStart + issued + transfer;

        const preparedData = [
          { title: "Shift", value: item.shift || "No Data", icon: "shift.svg" },
          {
            title: "FS/FT No",
            value: item.station || "No Data",
            icon: "fs.svg",
          },
          { title: "Opening Dip", value: openingDip, icon: "openingdeep.svg" },
          { title: "Receipt", value: totalReceive, icon: "receipt.svg" },
          {
            title: "Stock On Hand",
            value: stockOnHand || "No Data",
            icon: "stock.svg",
          },
          {
            title: "QTY Issued",
            value: fetchedResult ?? 0,
            icon: "issued.svg",
          },
          // { title: 'Balance', value: stockOnHand || 0, icon: 'balance.svg' },
          // { title: 'Closing Dip', value: openingDip || 0, icon: 'close.svg' },
          {
            title: "Flow Meter Awal",
            value: flowMeterStart,
            icon: "flwawal.svg",
          },
          {
            title: "Flow Meter Akhir",
            value: flowMeterAkhir,
            icon: "flwakhir.svg",
          },
          {
            title: "Total Flow Meter",
            value: issued + transfer || 0,
            icon: "total.svg",
          },
          // { title: 'Variance', value: item.totalVariance || 0, icon: 'variance.svg' },
        ];

        setDataHome(preparedData);
        localStorage.setItem("cardDash", JSON.stringify(preparedData));
      } else {
        console.error("No valid data found:", dataHome);
        setDataHome([]);
      }
    } catch (error) {
      console.error("Error fetching card data:", error);
      setDataHome([]);
    }
  };

  useEffect(() => {
    if (lkfId) {
      fetchcardDash(lkfId);
    }
  }, []);

  const IssuedTotal = async () => {
    try {
      const fetchedResult = await getCalculationIssued(lkfId);
      setResult(fetchedResult ?? null);
    } catch (error) {
      console.error("Error fetching issued total:", error);
    }
  };

  const isOffline = !navigator.onLine;
  const cachedData = localStorage.getItem("cardDash");
  const displayData =
    isOffline && cachedData ? JSON.parse(cachedData) : dataHome;

  return (
    <IonPage>
      <IonContent>
        <IonHeader style={{ height: "60px" }}>
          <IonRow>
            <IonCol>
              <div className="logoDashboard">
                <IonImg
                  style={{ padding: "5px", marginLeft: "15px", width: "120px" }}
                  src="logodhbaru1.png"
                  alt="logo-dashboard"
                />
              </div>
            </IonCol>
            <IonCol style={{ textAlign: "right" }}>
              {/* <div
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
                    backgroundColor: isOnline ? "#73A33F" : "red",
                    marginRight: "5px",
                  }}
                /> */}
                <NetworkStatus />
              {/* </div> */}
            </IonCol>
          </IonRow>
        </IonHeader>
        <div className="content">
          <div className="btn-start">
            <IonButton color="primary" onClick={handleRefresh} disabled={btnRefresh}>
              <IonImg src="refresh.svg" alt="Refresh" />
              Refresh
            </IonButton>
            <IonButton
              color="warning"
              style={{ marginLeft: "10px" }}
              onClick={handleLogout}
              disabled={pendingStatus}>
              Close LKF & Logout
            </IonButton>
          </div>
        </div>
        <div className="padding-content mr20" style={{ marginTop: "20px" }}>
          <IonGrid>
            <IonRow>
              <IonCol></IonCol>
            </IonRow>
          </IonGrid>
          <IonRow style={{ display: "flex", justifyContent: "space-between" }}>
            <IonLabel>
              Fuelman : {fuelmanName} : {fuelmanID}
            </IonLabel>
            {tanggalTransaksi ? (
              <IonLabel>Tanggal: {formatToDDMMYYYY(tanggalTransaksi)}</IonLabel>
            ) : (
              <IonLabel>Tidak ada tanggal yang disimpan.</IonLabel>
            )}
          </IonRow>
        </div>
        <IonGrid>
          <IonRow>
            {cardDash.map((card, index) => (
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
                        style={{
                          width: "30px",
                          height: "30px",
                          marginTop: "10px",
                        }}
                      />
                      <IonCardContent
                        style={{
                          fontSize: "24px",
                          fontWeight: "500",
                          marginTop: "-10px",
                        }}>
                        {card.value}
                      </IonCardContent>
                    </div>
                  </IonCardHeader>
                </IonCard>
              </IonCol>
            ))}
            <IonRow>
              <p
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexDirection: "column",
                }}>
                <p
                  style={{
                    color: "#E16104",
                    textAlign: "justify",
                    marginLeft: "15px",
                    marginRight: "15px",
                    marginTop: "-15px",
                  }}>
                  * Sebelum Logout Pastikan Data Sonding Dip /Stock diisi, Klik
                  Tombol ‘Tambah’ Untuk Membuka Formnya, Terima kasih
                </p>
              </p>
            </IonRow>
          </IonRow>

          <IonButton
            style={{ padding: "15px", marginTop: "-40px" }}
            className="check-button"
            onClick={TambahData}>
            <IonImg src="plus.svg" />
            <span style={{ marginLeft: "10px" }}>Tambah Data</span>
          </IonButton>
          <TableData setPendingStatus={setPendingStatus} />
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};
export default DashboardFuelMan;
