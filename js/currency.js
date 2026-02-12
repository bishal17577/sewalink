// ========== CURRENCY UTILITY ==========
// Centralized currency configuration for entire SewaLink platform

export const CURRENCY = {
  symbol: 'रु',
  code: 'NPR',
  name: 'Nepali Rupee',
  exchangeRate: 133.50, // 1 USD = 133.50 NPR (approximate)
  format: (amount, options = {}) => {
    const { showSymbol = true, showCode = false, decimals = 0 } = options;
    
    if (amount === null || amount === undefined) return `${showSymbol ? 'रु' : ''}0`;
    
    // Format number with commas for thousands
    const formattedAmount = Number(amount).toLocaleString('ne-NP', {
      maximumFractionDigits: decimals,
      minimumFractionDigits: decimals
    });
    
    if (showCode) return `${formattedAmount} ${CURRENCY.code}`;
    if (showSymbol) return `रु ${formattedAmount}`;
    return formattedAmount;
  },
  
  // Convert USD to NPR (for backward compatibility)
  fromUSD: (usdAmount) => {
    if (!usdAmount) return 0;
    return Math.round(usdAmount * CURRENCY.exchangeRate);
  },
  
  // Parse NPR amount from input
  parse: (input) => {
    if (!input) return 0;
    // Remove रु, NPR, commas, and spaces
    const cleaned = input.toString().replace(/[रु,NPR,\s]/g, '');
    return parseInt(cleaned, 10) || 0;
  }
};

// Export default for easy import
export default CURRENCY;