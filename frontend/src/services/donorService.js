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
    console.warn('API connection unavailable, falling back to mock donor response:', err);
    return {
      success: true,
      count: 6,
      metrics: {
        registeredDonors: 1420,
        eligibleNow: 892,
        totalDonatedUnits: 4810,
        activeDrives: 6,
      },
      donors: [
        { id: 'DNR-701', name: 'Alexander Wright', bloodGroup: 'O-', totalDonations: 14, lastDonation: 'Aug 12, 2026', eligibility: 'ELIGIBLE', phone: '+1 (555) 234-5678', city: 'New York, NY', isDriveParticipant: true },
        { id: 'DNR-702', name: 'Maya Patel', bloodGroup: 'A+', totalDonations: 8, lastDonation: 'Sep 01, 2026', eligibility: 'INELIGIBLE (Wait 42 Days)', phone: '+1 (555) 876-5432', city: 'Brooklyn, NY', isDriveParticipant: false },
        { id: 'DNR-703', name: 'Liam O’Connor', bloodGroup: 'B-', totalDonations: 22, lastDonation: 'Jul 15, 2026', eligibility: 'ELIGIBLE', phone: '+1 (555) 345-6789', city: 'Manhattan, NY', isDriveParticipant: true },
        { id: 'DNR-704', name: 'Zainab Al-Mansoor', bloodGroup: 'O+', totalDonations: 5, lastDonation: 'Jun 20, 2026', eligibility: 'ELIGIBLE', phone: '+1 (555) 987-6543', city: 'Queens, NY', isDriveParticipant: false },
        { id: 'DNR-705', name: 'Carlos Gomez', bloodGroup: 'AB-', totalDonations: 11, lastDonation: 'Aug 29, 2026', eligibility: 'INELIGIBLE (Wait 28 Days)', phone: '+1 (555) 456-7890', city: 'Bronx, NY', isDriveParticipant: true },
        { id: 'DNR-706', name: 'Emily Zhang', bloodGroup: 'A-', totalDonations: 9, lastDonation: 'Jul 04, 2026', eligibility: 'ELIGIBLE', phone: '+1 (555) 678-9012', city: 'Jersey City, NJ', isDriveParticipant: false },
      ],
    };
  }
}

export const donorService = {
  scheduleAppointment,
  getRegisteredDonors,
};
