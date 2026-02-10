import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const BPChart = ({ data, deviceType = "bp" }) => {
  // Process data for the chart based on device type
  const processChartData = () => {
    if (!data || data.length === 0) return [];

    return data
      .map((record) => {
        const baseData = {
          datetime: new Date(record.created_at),
          date: new Date(record.created_at).toLocaleDateString(),
          time: new Date(record.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          fullDate: record.created_at,
          device: record.dev_id,
        };

        if (deviceType === "bp") {
          // For BP data
          let systolic, diastolic, pulse;

          if (record.formattedBP) {
            // If formattedBP exists (e.g., "120/80")
            const bpParts = record.formattedBP.split("/");
            systolic = parseInt(bpParts[0]);
            diastolic = parseInt(bpParts[1]);
          } else if (record.systolic && record.diastolic) {
            // If separate systolic/diastolic fields exist
            systolic = record.systolic;
            diastolic = record.diastolic;
          } else if (record.data) {
            // If data is in the data field
            const recordData =
              typeof record.data === "string"
                ? JSON.parse(record.data)
                : record.data;
            systolic = recordData.systolic;
            diastolic = recordData.diastolic;
            pulse = recordData.pulse;
          }

          return {
            ...baseData,
            systolic: systolic || 0,
            diastolic: diastolic || 0,
            pulse: pulse || record.pulse || 0,
          };
        } else if (deviceType === "spo2") {
          // For SpO2 data
          let spo2, pulse, pi;

          if (record.data) {
            const recordData =
              typeof record.data === "string"
                ? JSON.parse(record.data)
                : record.data;
            spo2 = recordData.spo2;
            pulse = recordData.pulse;
            pi = recordData.pi;
          }

          return {
            ...baseData,
            spo2: spo2 || 0,
            pulse: pulse || 0,
            pi: pi || 0,
          };
        }

        return baseData;
      })
      .filter((record) => {
        // Filter out records with no valid data
        if (deviceType === "bp") {
          return record.systolic > 0 && record.diastolic > 0;
        } else if (deviceType === "spo2") {
          return record.spo2 > 0;
        }
        return false;
      })
      .sort((a, b) => a.datetime - b.datetime); // Sort chronologically
  };

  const chartData = processChartData();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-white">{`Date: ${data.date}`}</p>
          <p className="font-medium text-gray-900 dark:text-white">{`Time: ${data.time}`}</p>

          {deviceType === "bp" ? (
            <>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Systolic: <strong>{data.systolic} mmHg</strong>
              </p>
              <p className="text-sm text-red-600 dark:text-red-400">
                Diastolic: <strong>{data.diastolic} mmHg</strong>
              </p>
              {data.pulse && (
                <p className="text-sm text-green-600 dark:text-green-400">
                  Pulse: <strong>{data.pulse} bpm</strong>
                </p>
              )}
            </>
          ) : (
            <>
              <p className="text-sm text-purple-600 dark:text-purple-400">
                SpO₂: <strong>{data.spo2}%</strong>
              </p>
              {data.pulse && (
                <p className="text-sm text-green-600 dark:text-green-400">
                  Pulse: <strong>{Math.round(data.pulse)} bpm</strong>
                </p>
              )}
              {data.pi && (
                <p className="text-sm text-orange-600 dark:text-orange-400">
                  PI: <strong>{data.pi}</strong>
                </p>
              )}
            </>
          )}
        </div>
      );
    }
    return null;
  };

  // Format X-axis labels to show date and time
  const formatXAxis = (tickItem) => {
    const date = new Date(tickItem);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">
          No {deviceType === "bp" ? "blood pressure" : "SpO₂"} data available
          for chart
        </div>
      </div>
    );
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="datetime"
            stroke="#6b7280"
            fontSize={12}
            tickFormatter={formatXAxis}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            stroke="#6b7280"
            fontSize={12}
            domain={deviceType === "bp" ? [60, 180] : [80, 100]}
            label={{
              value: deviceType === "bp" ? "mmHg" : "SpO₂ %",
              angle: -90,
              position: "insideLeft",
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />

          {deviceType === "bp" ? (
            <>
              <Line
                type="monotone"
                dataKey="systolic"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
                name="Systolic (mmHg)"
              />
              <Line
                type="monotone"
                dataKey="diastolic"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
                name="Diastolic (mmHg)"
              />
            </>
          ) : (
            <>
              <Line
                type="monotone"
                dataKey="spo2"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
                name="SpO₂ (%)"
              />
              <Line
                type="monotone"
                dataKey="pulse"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
                name="Pulse (bpm)"
              />
            </>
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BPChart;
