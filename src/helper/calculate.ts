export const calculateZoomLevel = (distance: number): number => {
    const earthRadiusKm = 6371;
    const distanceRadians = distance / earthRadiusKm;
    const zoomLevel = Math.round(Math.log(360 / distanceRadians) / Math.LN2);
    const result = zoomLevel - 6
    return result;
}

export const getCenterPoint = (lat1: number, lon1: number, lat2: number, lon2: number): { latitude: number, longitude: number } => {
    const centerLat = (lat1 + lat2) / 2;
    const centerLon = (lon1 + lon2) / 2;
    return { latitude: centerLat, longitude: centerLon };
}

export const transformToSingleDigitDecimal = (numberString: any) => {
    const number = parseFloat(numberString);
    const roundedNumber = Math.round(number * 10) / 10;
    const roundedString = roundedNumber.toString();
    return roundedString;
};

export const formatTime = (decimalNumber: any) => {
    const minutes = Math.floor(decimalNumber);
    const remainingSeconds = Math.round((decimalNumber - minutes) * 60);
    const formattedTime = `${minutes} menit, ${remainingSeconds} detik`;
    return formattedTime;
};

export const roundNumber = (number: any) => {
    const roundedNumber = Math.round(number / 1000) * 1000;
    return roundedNumber;
};