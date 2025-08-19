// DHIS2 Configuration
// Update these values with your actual DHIS2 server details

export const DHIS2_CONFIG = {
  // Base URL for your DHIS2 instance
  BASE_URL: import.meta.env.VITE_DHIS2_URL || 'https://play.dhis2.udsm.ac.tz',
  
  // Authentication credentials
  USERNAME: import.meta.env.VITE_DHIS2_USERNAME || 'student',
  PASSWORD: import.meta.env.VITE_DHIS2_PASSWORD || 'Dhis2@2025',
  
  // API endpoints
  API_BASE: '/api',
  DATA_STORE_ENDPOINT: '/dataStore',
  
  // Default namespace for the resource repository
  DEFAULT_NAMESPACE: import.meta.env.VITE_DHIS2_DATASTORE_NAMESPACE || 'resource-repository',
  
  // Timeout settings
  REQUEST_TIMEOUT: 30000, // 30 seconds
  
  // Retry settings
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  const fullUrl = `${DHIS2_CONFIG.BASE_URL}${DHIS2_CONFIG.API_BASE}${endpoint}`;
  console.log('[CONFIG DEBUG] getApiUrl - Endpoint:', endpoint);
  console.log('[CONFIG DEBUG] getApiUrl - Base URL:', DHIS2_CONFIG.BASE_URL);
  console.log('[CONFIG DEBUG] getApiUrl - API Base:', DHIS2_CONFIG.API_BASE);
  console.log('[CONFIG DEBUG] getApiUrl - Full URL:', fullUrl);
  return fullUrl;
};

// Helper function to get auth headers
export const getAuthHeaders = (): Record<string, string> => {
  const credentials = btoa(`${DHIS2_CONFIG.USERNAME}:${DHIS2_CONFIG.PASSWORD}`);
  const headers = {
    'Authorization': `Basic ${credentials}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };
  console.log('[CONFIG DEBUG] getAuthHeaders - Username:', DHIS2_CONFIG.USERNAME);
  console.log('[CONFIG DEBUG] getAuthHeaders - Credentials encoded:', credentials.substring(0, 10) + '...');
  console.log('[CONFIG DEBUG] getAuthHeaders - Headers:', headers);
  return headers;
}; 