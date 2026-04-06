// Utility functions for G5 LAPTOP

/**
 * Format number as currency
 * @param {number} amount - The amount to format
 * @returns {string} - Formatted currency string
 */
function formatCurrency(amount) {
    return '$' + amount.toFixed(2);
}

/**
 * Validate email address format
 * @param {string} email - The email address to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

/**
 * LocalStorage helper class
 */
class LocalStorageHelper {
    static setItem(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    static getItem(key) {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : null;
    }

    static removeItem(key) {
        localStorage.removeItem(key);
    }
}