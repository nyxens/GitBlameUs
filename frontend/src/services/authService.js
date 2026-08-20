// services/authService.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Centralized helper to get the Auth base endpoint
const getAuthUrl = (endpoint) => {
  let base = API_URL;
  if (base.endsWith('/api/v1')) {
    base = base.replace('/api/v1', '/api/auth');
  } else if (base.endsWith('/api')) {
    base = base.replace('/api', '/api/auth');
  } else if (!base.includes('/api/auth')) {
    // Trim trailing slash if present
    if (base.endsWith('/')) {
      base = base.slice(0, -1);
    }
    base = `${base}/api/auth`;
  }
  return `${base}${endpoint}`;
};

export async function loginUser(email, password, role) {
  let response;
  try {
    const url = getAuthUrl('/login');
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, role }),
    });
  } catch (err) {
    console.warn('API connection unavailable, falling back to mock login:', err);
    return {
      success: true,
      token: 'mock-jwt-token-lifevault-2026',
      user: {
        id: `LV-USER-${Math.floor(1000 + Math.random() * 9000)}`,
        name: email.split('@')[0],
        email,
        role: role || (email.includes('hospital') ? 'HOSPITAL' : 'DONOR'),
      },
    };
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    return {
      success: false,
      error: errorData.error || `API Error: ${response.statusText} (${response.status})`,
    };
  }

  return await response.json();
}

export async function signupUser(signupData) {
  let response;
  try {
    const url = getAuthUrl('/signup');
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(signupData),
    });
  } catch (err) {
    console.warn('API connection unavailable, falling back to mock signup:', err);
    return {
      success: true,
      message: 'Verification OTP sent to email',
      email: signupData.email,
    };
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    return {
      success: false,
      error: errorData.error || `API Error: ${response.statusText} (${response.status})`,
    };
  }

  return await response.json();
}

export async function verifyOtpUser(email, otp, signupData) {
  let response;
  try {
    const url = getAuthUrl('/verify-otp');
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp }),
    });
  } catch (err) {
    console.warn('API connection unavailable, falling back to mock OTP verification:', err);
    return {
      success: true,
      user: {
        id: signupData?.role === 'HOSPITAL' ? `HOSP-${Math.floor(1000 + Math.random() * 9000)}` : `LV-DONOR-${Math.floor(1000 + Math.random() * 9000)}`,
        name: signupData?.name || signupData?.hospitalName || 'User',
        email: email,
        role: signupData?.role || 'DONOR',
        bloodGroup: signupData?.bloodGroup || 'O+',
        hospitalName: signupData?.hospitalName,
        licenseId: signupData?.licenseId,
        phone: signupData?.phone,
        city: signupData?.city || 'New York',
      },
    };
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    return {
      success: false,
      error: errorData.error || `API Error: ${response.statusText} (${response.status})`,
    };
  }

  return await response.json();
}

export const authService = {
  loginUser,
  signupUser,
  verifyOtpUser,
};
