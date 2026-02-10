import axios from "axios";

// const BASE = import.meta.env.VITE_BACKEND_API || "http://localhost:4000";
const BASE =
  import.meta.env.VITE_BACKEND_API || "http://localhost:4000";
console.log("Organisation API BASE:", import.meta.env.VITE_BACKEND_API);
const BASE_URL = `${BASE}/api/org`; // final: http://localhost:4000/api/org

console.log("API Base URL:", BASE);
console.log("Full API URL:", BASE_URL);

export async function addOrganizationApi(payload) {
  try {
    console.log("payload", payload);
    const admin = payload.admin || {};
    const phoneNumber = admin.phoneNumber ?? admin.phone ?? null;

    const body = {
      name: payload.name,
      code: payload.code,
      admin: {
        username: admin.username,
        name: admin.name,
        email: admin.email,
        password: admin.password,
        phoneNumber: phoneNumber,
      },
    };

    const res = await axios.post(`${BASE_URL}/organizations`, body, {
      withCredentials: true,
    });
    console.log("result", res);
    return res.data;
  } catch (err) {
    if (err?.response?.data) return err.response.data;
    return { ok: false, message: "Network error" };
  }
}

export async function editOrganizationApi(id, payload) {
  try {
    const body = {
      name: payload.name,
      code: payload.code,
    };

    const res = await axios.put(`${BASE_URL}/organizations/${id}`, body, {
      withCredentials: true,
    });

    return res.data;
  } catch (err) {
    if (err?.response?.data) return err.response.data;
    return { ok: false, message: "Network error" };
  }
}

export async function addAdminToOrganizationApi(orgId, payload) {
  try {
    const body = {
      username: payload.username,
      name: payload.name,
      email: payload.email,
      password: payload.password,
      phoneNumber: payload.phone || null,
    };

    const res = await axios.post(
      `${BASE_URL}/organizations/${orgId}/admins`,
      body,
      { withCredentials: true }
    );
    return res.data;
  } catch (err) {
    if (err?.response?.data) return err.response.data;
    return { ok: false, message: "Network error" };
  }
}

export const deleteOrganization = async (id) => {
  const response = await axios.delete(`${BASE_URL}/organizations/${id}`);
  return response.data;
};

export async function deleteAdminApi(adminId) {
  try {
    const res = await axios.delete(`${BASE_URL}/admins/${adminId}`, {
      withCredentials: true,
    });
    return res.data;
  } catch (err) {
    // return backend error body when available
    if (err?.response?.data) return err.response.data;
    return { ok: false, message: "Network error" };
  }
}

export async function editAdminAPI(id, data) {
  try {
    console.log("=== EDIT ADMIN API CALL ===");
    console.log("Admin ID:", id);
    console.log("Data received:", data);

    // Only include password if it's provided
    const body = {
      name: data.name,
      email: data.email,
      phoneNumber: data.phone || null, // Map 'phone' to 'phoneNumber' for backend consistency
    };

    // Add password only if provided
    if (data.password && data.password.trim() !== "") {
      body.password = data.password;
      console.log("Password included in request");
    } else {
      console.log("Password not included (empty or not provided)");
    }

    console.log("Request body:", body);

    const response = await axios.put(`${BASE_URL}/admins/${id}`, body, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Edit admin API error:", error);
    console.error("Error response:", error.response?.data);
    throw error;
  }
}

// export async function updateAdminStatusAPI(id, status){
//   try {
//     const response = await axios.put(`${BASE_URL}/admins/${id}/status`, {
//       status,
//     });
//     return response.data;
//   } catch (error) {
//     console.error("Update admin status API error:", error);
//     throw error;
//   }
// };
// Add these to your existing API functions

export async function fetchOrganizationsAPI() {
  try {
    const res = await axios.get(`${BASE_URL}/organizations`, {
      withCredentials: true,
    });
    return res.data;
  } catch (err) {
    if (err?.response?.data) return err.response.data;
    return { ok: false, message: "Network error" };
  }
}

export async function fetchOrganizationAdminsAPI(orgId) {
  try {
    const res = await axios.get(`${BASE_URL}/organizations/${orgId}/admins`, {
      withCredentials: true,
    });
    return res.data;
  } catch (err) {
    if (err?.response?.data) return err.response.data;
    return { ok: false, message: "Network error" };
  }
}

export async function updateAdminStatusAPI(id, is_active) {
  try {
    // Send is_active in the body (expecting boolean true/false)
    const body = { is_active };
    const url = `${BASE_URL}/admins/${id}/status`;

    console.log("Making API call to:", url);
    console.log("Request body:", body);
    console.log("Request headers:", { withCredentials: true });

    const response = await axios.patch(url, body, {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("API response status:", response.status);
    console.log("API response data:", response.data);

    return response.data;
  } catch (error) {
    console.error("Update admin status API error:", error);
    console.error("Error response:", error.response?.data);
    console.error("Error status:", error.response?.status);
    if (error?.response?.data) return error.response.data;
    throw error;
  }
}
