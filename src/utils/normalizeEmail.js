/**
 * Universal Email Normalization Utility
 * 
 * Gmail ignores dots in the local part (before @), so:
 *   shane.richard266@gmail.com === shanerichard266@gmail.com
 * 
 * This utility ensures a single, consistent identity across the entire app.
 * Applied at every entry point: OAuth, Supabase fetch, account storage, display.
 */

/**
 * Normalize a Gmail address by removing dots from the local part
 * and converting to lowercase.
 * 
 * @param {string} email - The raw email address
 * @returns {string} The normalized email (lowercase, no dots in local part for Gmail)
 * 
 * @example
 *   normalizeEmail('Shane.Richard266@Gmail.Com')  => 'shanerichard266@gmail.com'
 *   normalizeEmail('shanerichard266@gmail.com')    => 'shanerichard266@gmail.com'
 *   normalizeEmail('user.name@outlook.com')        => 'user.name@outlook.com' (non-Gmail untouched)
 */
export function normalizeEmail(email) {
    if (!email || typeof email !== 'string') return email || '';

    const cleaned = email.trim().toLowerCase();
    const atIndex = cleaned.indexOf('@');

    if (atIndex === -1) return cleaned;

    const localPart = cleaned.substring(0, atIndex);
    const domain = cleaned.substring(atIndex); // includes the @

    // Only strip dots for Gmail addresses (Gmail ignores them)
    const isGmail = domain === '@gmail.com' || domain === '@googlemail.com';

    if (isGmail) {
        return localPart.replace(/\./g, '') + domain;
    }

    return cleaned;
}

/**
 * Generate a consistent account_id from an email address.
 * Uses normalizeEmail first, then replaces non-alphanumeric chars with underscores.
 * 
 * @param {string} email - The raw email address
 * @returns {string} A consistent, safe ID string
 * 
 * @example
 *   toAccountId('Shane.Richard266@Gmail.Com')  => 'shanerichard266_gmail_com'
 *   toAccountId('shanerichard266@gmail.com')    => 'shanerichard266_gmail_com'
 */
export function toAccountId(email) {
    return normalizeEmail(email).replace(/[^a-z0-9]/g, '_');
}

export default normalizeEmail;
