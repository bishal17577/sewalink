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
// ========== GIFT FUNCTIONS ==========

/**
 * Send coins as gift to another user
 * @param {string} receiverId - Receiver's user ID
 * @param {number} amount - Amount of coins to send
 * @param {string} message - Optional message
 * @param {string} type - Gift type (birthday, thank you, etc.)
 */
export async function sendGift(receiverId, amount, message = '', type = 'general') {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  
  return await runTransaction(db, async (transaction) => {
    // Get sender's data
    const senderRef = doc(db, 'users', user.uid);
    const senderSnap = await transaction.get(senderRef);
    
    if (!senderSnap.exists()) {
      throw new Error('Sender not found');
    }

    const senderCoins = senderSnap.data().coins || 0;
    
    if (senderCoins < amount) {
      throw new Error('Insufficient coins');
    }

    // Get receiver's data
    const receiverRef = doc(db, 'users', receiverId);
    const receiverSnap = await transaction.get(receiverRef);
    
    if (!receiverSnap.exists()) {
      throw new Error('Receiver not found');
    }

    const receiverCoins = receiverSnap.data().coins || 0;

    // Update balances
    transaction.update(senderRef, {
      coins: senderCoins - amount
    });

    transaction.update(receiverRef, {
      coins: receiverCoins + amount
    });
  });
}

/**
 * Get user's gift history
 * @param {string} userId - User ID
 * @param {number} limit - Number of records to fetch
 */
export async function getUserGifts(userId, limitCount = 50) {
  const sentQuery = query(
    collection(db, 'gifts'),
    where('senderId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  
  const receivedQuery = query(
    collection(db, 'gifts'),
    where('receiverId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );

  const [sentSnapshot, receivedSnapshot] = await Promise.all([
    getDocs(sentQuery),
    getDocs(receivedQuery)
  ]);

  const sent = [];
  sentSnapshot.forEach(doc => {
    sent.push({ id: doc.id, ...doc.data(), direction: 'sent' });
  });

  const received = [];
  receivedSnapshot.forEach(doc => {
    received.push({ id: doc.id, ...doc.data(), direction: 'received' });
  });

  return {
    sent,
    received,
    all: [...sent, ...received].sort((a, b) => {
      const timeA = a.createdAt?.toDate?.() || new Date(0);
      const timeB = b.createdAt?.toDate?.() || new Date(0);
      return timeB - timeA;
    })
  };
}

/**
 * Get gift statistics for a user
 * @param {string} userId - User ID
 */
export async function getGiftStats(userId) {
  const giftsRef = collection(db, 'gifts');
  
  const sentQuery = query(giftsRef, where('senderId', '==', userId));
  const receivedQuery = query(giftsRef, where('receiverId', '==', userId));

  const [sentSnapshot, receivedSnapshot] = await Promise.all([
    getDocs(sentQuery),
    getDocs(receivedQuery)
  ]);

  let sentTotal = 0;
  let receivedTotal = 0;
  let sentCount = 0;
  let receivedCount = 0;

  sentSnapshot.forEach(doc => {
    const gift = doc.data();
    sentTotal += gift.amount || 0;
    sentCount++;
  });

  receivedSnapshot.forEach(doc => {
    const gift = doc.data();
    receivedTotal += gift.amount || 0;
    receivedCount++;
  });

  return {
    sent: {
      count: sentCount,
      total: sentTotal
    },
    received: {
      count: receivedCount,
      total: receivedTotal
    }
  };
}

/**
 * Get top gift senders
 * @param {number} limit - Number of top senders to fetch
 */
export async function getTopGiftSenders(limitCount = 10) {
  const giftsRef = collection(db, 'gifts');
  const snapshot = await getDocs(giftsRef);
  
  const senderStats = {};
  
  snapshot.forEach(doc => {
    const gift = doc.data();
    if (gift.senderId) {
      if (!senderStats[gift.senderId]) {
        senderStats[gift.senderId] = {
          userId: gift.senderId,
          name: gift.senderName || 'Unknown',
          count: 0,
          total: 0
        };
      }
      senderStats[gift.senderId].count++;
      senderStats[gift.senderId].total += gift.amount || 0;
    }
  });

  return Object.values(senderStats)
    .sort((a, b) => b.total - a.total)
    .slice(0, limitCount);
}

/**
 * Get top gift receivers
 * @param {number} limit - Number of top receivers to fetch
 */
export async function getTopGiftReceivers(limitCount = 10) {
  const giftsRef = collection(db, 'gifts');
  const snapshot = await getDocs(giftsRef);
  
  const receiverStats = {};
  
  snapshot.forEach(doc => {
    const gift = doc.data();
    if (gift.receiverId) {
      if (!receiverStats[gift.receiverId]) {
        receiverStats[gift.receiverId] = {
          userId: gift.receiverId,
          name: gift.receiverName || 'Unknown',
          count: 0,
          total: 0
        };
      }
      receiverStats[gift.receiverId].count++;
      receiverStats[gift.receiverId].total += gift.amount || 0;
    }
  });

  return Object.values(receiverStats)
    .sort((a, b) => b.total - a.total)
    .slice(0, limitCount);
}
