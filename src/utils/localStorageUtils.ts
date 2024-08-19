/**
 * Updates the localStorage with new card data.
 * @param cardData - The new card data to store in localStorage.
 */
export const updateLocalStorageCardData = (cardData: any): void => {
    // Remove the existing card data from localStorage
    localStorage.removeItem('cardDataDashboard');

    // Add the new card data to localStorage
    localStorage.setItem('cardDataDashboard', JSON.stringify(cardData));
};
