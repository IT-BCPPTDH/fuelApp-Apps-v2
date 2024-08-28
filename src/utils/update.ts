// import { db } from "../models/db";
// export const updateStockOnHand = async (unitNo: string, quantity: number) => {
//     try {
//       // Retrieve current stock data
//       const stockRecord = await db.cards.get();
  
//       if (stockRecord) {
//         // Update stock quantity
//         const updatedStock = stockRecord.quantity + quantity;
  
//         // Save updated stock data
//         await db.cards.put({ ...stockRecord, quantity: updatedStock });
//       } else {
//         // If no record found, create a new one
//         await db.cards.add({ unitNo, quantity });
//       }
  
//       console.log(`Stock for unit ${unitNo} updated to ${quantity}`);
//     } catch (error) {
//       console.error('Failed to update stock data:', error);
//     }
//   };