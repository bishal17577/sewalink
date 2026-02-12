// ========== GLOBAL CURRENCY COMPONENT ==========
// Include this in every page for consistent currency formatting

export function formatNPR(amount) {
  if (!amount && amount !== 0) return 'रु 0';
  return `रु ${Number(amount).toLocaleString('ne-NP')}`;
}

export function formatNPRShort(amount) {
  if (!amount) return 'रु 0';
  if (amount >= 10000000) return `रु ${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `रु ${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `रु ${(amount / 1000).toFixed(1)}K`;
  return `रु ${amount}`;
}

// Add this script to every page
// <script type="module" src="js/currency-component.js"></script>