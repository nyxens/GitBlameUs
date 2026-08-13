export async function scheduleDonation(req, res) {
  try {
    const { name, phone, email, bloodGroup, city, date } = req.body;
    return res.status(201).json({
      success: true,
      appointment: {
        id: `LV-DONOR-${Math.floor(1000 + Math.random() * 9000)}`,
        name,
        phone,
        email,
        bloodGroup,
        city,
        date,
        status: 'SCHEDULED',
      },
    });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
}
