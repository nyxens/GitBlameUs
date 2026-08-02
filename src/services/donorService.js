export const donorService = {
  async scheduleAppointment(appointment) {
    // Simulating API call for development team
    return {
      ...appointment,
      id: `LV-DONOR-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Scheduled',
    };
  },
};
