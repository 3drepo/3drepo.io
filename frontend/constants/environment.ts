export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

export const IS_MAINTENANCE = window.ClientConfig && window.ClientConfig.maintenanceMode === true;
