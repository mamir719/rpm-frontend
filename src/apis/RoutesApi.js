import axios from "axios";


const BASE =
  import.meta.env.VITE_BACKEND_API || "http://localhost:4000";

const BASE_URL = `${BASE}/api/alerts`; // final: http://localhost:4000/api/alerts

console.log("Alert API Base URL:", BASE);
console.log("Full Alert API URL:", BASE_URL);

// Debug endpoint to check connected users
export async function getDebugConnectedUsersAPI() {
  try {
    const res = await axios.get(`${BASE_URL}/debug-connected-users`, {
      withCredentials: true,
    });
    return res.data;
  } catch (err) {
    if (err?.response?.data) return err.response.data;
    return { ok: false, message: "Network error" };
  }
}

// Test endpoint to send direct notification
export async function sendTestNotificationAPI(doctor_id, message) {
  try {
    const body = {
      doctor_id,
      message: message || "Test notification from frontend!",
    };

    const res = await axios.post(`${BASE_URL}/test-notification`, body, {
      withCredentials: true,
    });
    return res.data;
  } catch (err) {
    if (err?.response?.data) return err.response.data;
    return { ok: false, message: "Network error" };
  }
}

// Test alert creation (temporary route for testing)
export async function createTestAlertAPI(payload) {
  try {
    const body = {
      dr_ids: payload.dr_ids || [],
      type: payload.type,
      desc: payload.desc,
      patient_id: payload.patient_id || 15,
    };

    const res = await axios.post(`${BASE_URL}/test-alert`, body, {
      withCredentials: true,
    });
    return res.data;
  } catch (err) {
    if (err?.response?.data) return err.response.data;
    return { ok: false, message: "Network error" };
  }
}

// Create a new alert (authenticated route)
export async function createAlertAPI(payload) {
  try {
    const body = {
      dr_ids: payload.dr_ids || [],
      type: payload.type,
      desc: payload.desc,
    };

    const res = await axios.post(`${BASE_URL}/`, body, {
      withCredentials: true,
    });
    return res.data;
  } catch (err) {
    if (err?.response?.data) return err.response.data;
    return { ok: false, message: "Network error" };
  }
}

// Get unread alerts count for notification badge
export async function getUnreadAlertsCountAPI() {
  try {
    const res = await axios.get(`${BASE_URL}/unread-count`, {
      withCredentials: true,
    });
    return res.data;
  } catch (err) {
    if (err?.response?.data) return err.response.data;
    return { ok: false, message: "Network error" };
  }
}

// Get all alerts for a clinician (with read status)
export async function getMyAlertsAPI() {
  try {
    const res = await axios.get(`${BASE_URL}/my-alerts`, {
      withCredentials: true,
    });
    return res.data;
  } catch (err) {
    if (err?.response?.data) return err.response.data;
    return { ok: false, message: "Network error" };
  }
}

// Get only unread alerts for a clinician
export async function getUnreadAlertsAPI() {
  try {
    const res = await axios.get(`${BASE_URL}/my-alerts/unread`, {
      withCredentials: true,
    });
    return res.data;
  } catch (err) {
    if (err?.response?.data) return err.response.data;
    return { ok: false, message: "Network error" };
  }
}

// Mark a specific alert as read
export async function markAlertAsReadAPI(alert_id) {
  try {
    const res = await axios.patch(
      `${BASE_URL}/${alert_id}/read`,
      {},
      {
        withCredentials: true,
      }
    );
    return res.data;
  } catch (err) {
    if (err?.response?.data) return err.response.data;
    return { ok: false, message: "Network error" };
  }
}

// Mark all alerts as read for a clinician
export async function markAllAlertsAsReadAPI() {
  try {
    const res = await axios.patch(
      `${BASE_URL}/mark-all-read`,
      {},
      {
        withCredentials: true,
      }
    );
    return res.data;
  } catch (err) {
    if (err?.response?.data) return err.response.data;
    return { ok: false, message: "Network error" };
  }
}

// Utility function to validate alert type
export function validateAlertType(type) {
  return ["high", "medium", "low"].includes(type);
}

// Utility function to format alert data for API calls
export function formatAlertData(alertData) {
  return {
    dr_ids: Array.isArray(alertData.dr_ids) ? alertData.dr_ids : [],
    type: alertData.type,
    desc: alertData.desc || "",
    patient_id: alertData.patient_id || null,
  };
}

// Utility function to handle alert API errors
export function handleAlertAPIError(error) {
  console.error("Alert API Error:", error);

  if (error?.response?.data) {
    return {
      ok: false,
      message: error.response.data.message || "API Error",
      details: error.response.data,
    };
  }

  return {
    ok: false,
    message: "Network error occurred",
    error: error.message,
  };
}
