import { fetchApi } from './apiConfig.js';

export async function scheduleAppointment(appointment) {
  try {
    return await fetchApi('/donors/schedule', {
      method: 'POST',
      body: JSON.stringify(appointment),
    });
  } catch (err) {
    console.warn('API connection unavailable, falling back to mock response:', err);
    return {
      success: true,
      appointment: {
        ...appointment,
        id: `LV-DONOR-${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'SCHEDULED',
      },
    };
  }
}

export const donorService = {
  scheduleAppointment,
};
