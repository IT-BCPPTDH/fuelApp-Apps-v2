import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'co.id.ptdh.fuel.app',
  appName: 'FuelApp',
  webDir: 'dist',
  // bundledWebRuntime:false,
  // server:{
  //   url:"http://192.168.1.21:5173"
  // },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
  },
  server: {
    hostname: 'localhost',
    androidScheme: 'http',
    iosScheme: 'http',
    cleartext: true, 
  }
};

export default config;
