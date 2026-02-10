// src/pages/DeviceManagement.jsx
import React from "react";
import DeviceStatus from "../components/DeviceStatus";

const DeviceManagement = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Device Management</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Connected Devices
          </h3>
          <div className="space-y-3">
            <DeviceStatus
              device="Sensorian LD20 #001"
              status="Online"
              battery={85}
            />
            <DeviceStatus
              device="Sensorian LD20 #002"
              status="Online"
              battery={92}
            />
            <DeviceStatus
              device="Sensorian LD20 #003"
              status="Offline"
              battery={12}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Device Health
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Signal Quality</span>
                <span>Excellent</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: "95%" }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Data Transmission</span>
                <span>Good</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: "88%" }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceManagement;
