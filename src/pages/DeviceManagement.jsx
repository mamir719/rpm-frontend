

// export default DeviceManagement;
import React, { useEffect, useState } from "react";
import {
  Loader,
  Laptop,
  Link as LinkIcon,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const API_BASE =
  import.meta.env.VITE_BACKEND_API || "http://localhost:4000";

const DeviceManagement = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [devicesByUserId, setDevicesByUserId] = useState({}); // { [userId]: { open, loading, devices } }

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `${API_BASE}/api/doctor/assigned?page=1&limit=50`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      if (!response.ok)
        throw new Error(`Failed to fetch patients: ${response.status}`);
      const result = await response.json();
      if (result.success) setPatients(result.data || []);
      else throw new Error(result.message || "Unable to fetch patients");
    } catch (e) {
      setError(e.message);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const toggleAndFetchDevices = async (userId) => {
    console.log("toggleAndFetchDevices called for userId:", userId);
    const wasOpen = devicesByUserId[userId]?.open;
    const willBeOpen = !wasOpen;

    // Set open state immediately
    setDevicesByUserId((prev) => ({
      ...prev,
      [userId]: {
        ...(prev[userId] || {}),
        open: willBeOpen,
        loading: willBeOpen,
      },
    }));

    // If closing, don't fetch
    if (!willBeOpen) return;

    try {
      console.log("calling api");

      const res = await fetch(
        `${API_BASE}/api/dev-data/devices-used/${userId}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      let devices = [];
      if (res.ok) {
        const json = await res.json();
        console.log("response", json);

        if (json.success) devices = json.data || [];
      }

      // Final dedupe on id/name
      const seen = new Set();
      const uniqueDevices = devices.filter((d) => {
        const key = String(d.id || d.dev_id || d.name);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      setDevicesByUserId((prev) => ({
        ...prev,
        [userId]: { open: true, loading: false, devices: uniqueDevices },
      }));
    } catch (e) {
      setDevicesByUserId((prev) => ({
        ...prev,
        [userId]: { open: true, loading: false, devices: [] },
      }));
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Device Management
      </h2>

      <div className="bg-white dark:bg-innerDarkColor rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Users & Devices
          </h3>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <Loader className="w-4 h-4 animate-spin" />
              <span>Loading users...</span>
            </div>
          ) : error ? (
            <div className="text-sm text-red-600">{error}</div>
          ) : patients.length === 0 ? (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              No patients exist.
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {patients.map((p) => {
                const userId = p.patient_id ?? p.userId ?? p.user_id ?? p.id;
                const entry = devicesByUserId[userId] || {};
                const isOpen = !!entry.open;
                return (
                  <div key={userId} className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-[#103c63] rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {(p.name || p.username || "U")
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {p.name || p.username}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            @{p.username}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleAndFetchDevices(userId)}
                        className="px-3 py-2 text-sm bg-primary text-white rounded-md flex items-center space-x-2"
                      >
                        <LinkIcon className="w-4 h-4" />
                        <span>{isOpen ? "Hide devices" : "Show devices"}</span>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 ml-1" />
                        ) : (
                          <ChevronDown className="w-4 h-4 ml-1" />
                        )}
                      </button>
                    </div>

                    {isOpen && (
                      <div className="mt-3 ml-14">
                        {entry.loading ? (
                          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                            <Loader className="w-4 h-4 animate-spin" />
                            <span>Loading devices…</span>
                          </div>
                        ) : !entry.devices || entry.devices.length === 0 ? (
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            No devices found for this user.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {entry.devices.map((d) => (
                              <div
                                key={String(d.id || d.devId || d.name)}
                                className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800/50"
                              >
                                <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                  <Laptop className="w-4 h-4 text-gray-700 dark:text-gray-200" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {d.name ||
                                      d.dev_type ||
                                      `Device ${d.devId || d.id}`}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    ID: {d.devId || d.id}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeviceManagement;
