import { useState, useEffect } from "react";

const useOnlineStatus = async () => {
      try {
        // Attempt to fetch the URL
        const response = await fetch(import.meta.env.VITE_BACKEND_URL+'/online', { method: 'GET' });
        // console.log(123,response)
        return response.ok
      } catch (error) {
        return false
      }
    };



export default useOnlineStatus