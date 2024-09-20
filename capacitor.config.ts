import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'FuelApp',
  webDir: 'dist',
  // bundledWebRuntime:false,
  server:{
    url:"http://192.168.1.21:5173"
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;
