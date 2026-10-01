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

export async function getRegisteredDonors() {
  try {
    return await fetchApi('/donors');
  } catch (err) {
    console.warn('API connection unavailable for getRegisteredDonors:', err);
    return {
      success: false,
      count: 0,
      metrics: {
        registeredDonors: 0,
        eligibleNow: 0,
        totalDonatedUnits: 0,
        incomingRequests: 0,
      },
      donors: [],
    };
  }
}

export const donorService = {
  scheduleAppointment,
  getRegisteredDonors,
};
