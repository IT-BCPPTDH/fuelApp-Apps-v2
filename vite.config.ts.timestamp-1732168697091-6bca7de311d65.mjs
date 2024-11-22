// vite.config.ts
import legacy from "file:///Users/septian-tm/app/New-Fuel-App-Tab/node_modules/@vitejs/plugin-legacy/dist/index.mjs";
import react from "file:///Users/septian-tm/app/New-Fuel-App-Tab/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { defineConfig } from "file:///Users/septian-tm/app/New-Fuel-App-Tab/node_modules/vite/dist/node/index.js";
import { VitePWA } from "file:///Users/septian-tm/app/New-Fuel-App-Tab/node_modules/vite-plugin-pwa/dist/index.js";
import { webUpdateNotice } from "file:///Users/septian-tm/app/New-Fuel-App-Tab/node_modules/@plugin-web-update-notify/vite/dist/index.js";
import million from "file:///Users/septian-tm/app/New-Fuel-App-Tab/node_modules/million/dist/packages/compiler.mjs";
var vite_config_default = defineConfig({
  plugins: [
    million.vite({ auto: true }),
    react(),
    legacy(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
        navigateFallback: "/index.html",
        navigateFallbackAllowlist: [
          new RegExp("^/_")
        ],
        clientsClaim: true,
        skipWaiting: true
      },
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "icon-maskable-192x192.png"],
      manifest: {
        name: "Hanggar Sales App",
        short_name: "Sales App",
        description: "Aplikasi Fuel App BCP",
        theme_color: "#ffffff",
        start_url: "/",
        display: "standalone",
        id: "/",
        icons: [
          {
            src: "icon-144x144.png",
            sizes: "144x144",
            type: "image/png"
          },
          {
            src: "icon-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "icon-512x512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "icon-maskable-144x144.png",
            sizes: "144x144",
            type: "image/png",
            purpose: "maskable"
          },
          {
            src: "icon-maskable-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable"
          },
          {
            src: "icon-maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ]
      }
      //injectRegister: 'auto'
    }),
    webUpdateNotice({
      logVersion: true,
      checkInterval: 0.5 * 60 * 1e3
    })
  ]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvc2VwdGlhbi10bS9hcHAvTmV3LUZ1ZWwtQXBwLVRhYlwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL3NlcHRpYW4tdG0vYXBwL05ldy1GdWVsLUFwcC1UYWIvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL3NlcHRpYW4tdG0vYXBwL05ldy1GdWVsLUFwcC1UYWIvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgbGVnYWN5IGZyb20gJ0B2aXRlanMvcGx1Z2luLWxlZ2FjeSdcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCdcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnXG5pbXBvcnQgeyBWaXRlUFdBIH0gZnJvbSAndml0ZS1wbHVnaW4tcHdhJzsgXG5pbXBvcnQgeyB3ZWJVcGRhdGVOb3RpY2UgfSBmcm9tICdAcGx1Z2luLXdlYi11cGRhdGUtbm90aWZ5L3ZpdGUnXG5pbXBvcnQgbWlsbGlvbiBmcm9tIFwibWlsbGlvbi9jb21waWxlclwiO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbXG4gICAgbWlsbGlvbi52aXRlKHsgYXV0bzogdHJ1ZSB9KSxcbiAgICByZWFjdCgpLFxuICAgIGxlZ2FjeSgpLFxuICAgIFZpdGVQV0Eoe1xuICAgICAgcmVnaXN0ZXJUeXBlOiAnYXV0b1VwZGF0ZScsXG4gICAgICBkZXZPcHRpb25zOiB7XG4gICAgICAgIGVuYWJsZWQ6IHRydWVcbiAgICAgIH0sXG4gICAgICB3b3JrYm94OiB7XG4gICAgICAgIGdsb2JQYXR0ZXJuczogWycqKi8qLntqcyxjc3MsaHRtbCxpY28scG5nLHN2Z30nXSxcbiAgICAgICAgbWF4aW11bUZpbGVTaXplVG9DYWNoZUluQnl0ZXM6IDEwICogMTAyNCAqIDEwMjQsIFxuICAgICAgICBuYXZpZ2F0ZUZhbGxiYWNrOiAnL2luZGV4Lmh0bWwnLFxuICAgICAgICBuYXZpZ2F0ZUZhbGxiYWNrQWxsb3dsaXN0OiBbXG4gICAgICAgICAgbmV3IFJlZ0V4cCgnXi9fJyksXG4gICAgICAgIF0sXG4gICAgICAgIGNsaWVudHNDbGFpbTogdHJ1ZSxcbiAgICAgICAgc2tpcFdhaXRpbmc6IHRydWVcbiAgICAgIH0sXG4gICAgICBpbmNsdWRlQXNzZXRzOiBbJ2Zhdmljb24uaWNvJywgJ2FwcGxlLXRvdWNoLWljb24ucG5nJywgJ2ljb24tbWFza2FibGUtMTkyeDE5Mi5wbmcnXSxcbiAgICAgIG1hbmlmZXN0OiB7XG4gICAgICAgIG5hbWU6ICdIYW5nZ2FyIFNhbGVzIEFwcCcsXG4gICAgICAgIHNob3J0X25hbWU6ICdTYWxlcyBBcHAnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0FwbGlrYXNpIEZ1ZWwgQXBwIEJDUCcsXG4gICAgICAgIHRoZW1lX2NvbG9yOiAnI2ZmZmZmZicsXG4gICAgICAgIHN0YXJ0X3VybDogXCIvXCIsXG4gICAgICAgIGRpc3BsYXk6IFwic3RhbmRhbG9uZVwiLFxuICAgICAgICBpZDogXCIvXCIsXG4gICAgICAgIGljb25zOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3JjOiAnaWNvbi0xNDR4MTQ0LnBuZycsXG4gICAgICAgICAgICBzaXplczogJzE0NHgxNDQnLFxuICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZydcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHNyYzogJ2ljb24tMTkyeDE5Mi5wbmcnLFxuICAgICAgICAgICAgc2l6ZXM6ICcxOTJ4MTkyJyxcbiAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBzcmM6ICdpY29uLTUxMng1MTIucG5nJyxcbiAgICAgICAgICAgIHNpemVzOiAnNTEyeDUxMicsXG4gICAgICAgICAgICB0eXBlOiAnaW1hZ2UvcG5nJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3JjOiAnaWNvbi1tYXNrYWJsZS0xNDR4MTQ0LnBuZycsXG4gICAgICAgICAgICBzaXplczogXCIxNDR4MTQ0XCIsXG4gICAgICAgICAgICB0eXBlOiBcImltYWdlL3BuZ1wiLFxuICAgICAgICAgICAgcHVycG9zZTogXCJtYXNrYWJsZVwiXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBzcmM6ICdpY29uLW1hc2thYmxlLTE5MngxOTIucG5nJyxcbiAgICAgICAgICAgIHNpemVzOiBcIjE5MngxOTJcIixcbiAgICAgICAgICAgIHR5cGU6IFwiaW1hZ2UvcG5nXCIsXG4gICAgICAgICAgICBwdXJwb3NlOiBcIm1hc2thYmxlXCJcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHNyYzogJ2ljb24tbWFza2FibGUtNTEyeDUxMi5wbmcnLFxuICAgICAgICAgICAgc2l6ZXM6IFwiNTEyeDUxMlwiLFxuICAgICAgICAgICAgdHlwZTogXCJpbWFnZS9wbmdcIixcbiAgICAgICAgICAgIHB1cnBvc2U6IFwibWFza2FibGVcIlxuICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgICAgfSxcbiAgICAgIC8vaW5qZWN0UmVnaXN0ZXI6ICdhdXRvJ1xuICAgIH0pLFxuICAgIHdlYlVwZGF0ZU5vdGljZSh7XG4gICAgICBsb2dWZXJzaW9uOiB0cnVlLFxuICAgICAgY2hlY2tJbnRlcnZhbDogMC41ICogNjAgKiAxMDAwLFxuICAgIH0pLFxuICBdXG59KVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFvUyxPQUFPLFlBQVk7QUFDdlQsT0FBTyxXQUFXO0FBQ2xCLFNBQVMsb0JBQW9CO0FBQzdCLFNBQVMsZUFBZTtBQUN4QixTQUFTLHVCQUF1QjtBQUNoQyxPQUFPLGFBQWE7QUFFcEIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsUUFBUSxLQUFLLEVBQUUsTUFBTSxLQUFLLENBQUM7QUFBQSxJQUMzQixNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUEsSUFDUCxRQUFRO0FBQUEsTUFDTixjQUFjO0FBQUEsTUFDZCxZQUFZO0FBQUEsUUFDVixTQUFTO0FBQUEsTUFDWDtBQUFBLE1BQ0EsU0FBUztBQUFBLFFBQ1AsY0FBYyxDQUFDLGdDQUFnQztBQUFBLFFBQy9DLCtCQUErQixLQUFLLE9BQU87QUFBQSxRQUMzQyxrQkFBa0I7QUFBQSxRQUNsQiwyQkFBMkI7QUFBQSxVQUN6QixJQUFJLE9BQU8sS0FBSztBQUFBLFFBQ2xCO0FBQUEsUUFDQSxjQUFjO0FBQUEsUUFDZCxhQUFhO0FBQUEsTUFDZjtBQUFBLE1BQ0EsZUFBZSxDQUFDLGVBQWUsd0JBQXdCLDJCQUEyQjtBQUFBLE1BQ2xGLFVBQVU7QUFBQSxRQUNSLE1BQU07QUFBQSxRQUNOLFlBQVk7QUFBQSxRQUNaLGFBQWE7QUFBQSxRQUNiLGFBQWE7QUFBQSxRQUNiLFdBQVc7QUFBQSxRQUNYLFNBQVM7QUFBQSxRQUNULElBQUk7QUFBQSxRQUNKLE9BQU87QUFBQSxVQUNMO0FBQUEsWUFDRSxLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUEsVUFDUjtBQUFBLFVBQ0E7QUFBQSxZQUNFLEtBQUs7QUFBQSxZQUNMLE9BQU87QUFBQSxZQUNQLE1BQU07QUFBQSxVQUNSO0FBQUEsVUFDQTtBQUFBLFlBQ0UsS0FBSztBQUFBLFlBQ0wsT0FBTztBQUFBLFlBQ1AsTUFBTTtBQUFBLFVBQ1I7QUFBQSxVQUNBO0FBQUEsWUFDRSxLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUEsWUFDTixTQUFTO0FBQUEsVUFDWDtBQUFBLFVBQ0E7QUFBQSxZQUNFLEtBQUs7QUFBQSxZQUNMLE9BQU87QUFBQSxZQUNQLE1BQU07QUFBQSxZQUNOLFNBQVM7QUFBQSxVQUNYO0FBQUEsVUFDQTtBQUFBLFlBQ0UsS0FBSztBQUFBLFlBQ0wsT0FBTztBQUFBLFlBQ1AsTUFBTTtBQUFBLFlBQ04sU0FBUztBQUFBLFVBQ1g7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBO0FBQUEsSUFFRixDQUFDO0FBQUEsSUFDRCxnQkFBZ0I7QUFBQSxNQUNkLFlBQVk7QUFBQSxNQUNaLGVBQWUsTUFBTSxLQUFLO0FBQUEsSUFDNUIsQ0FBQztBQUFBLEVBQ0g7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
