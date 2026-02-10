import React, { useState, useEffect } from "react";
import {
  Heart,
  Droplets,
  Activity,
  RefreshCw,
  Clock,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Battery,
  Download,
} from "lucide-react";
import VitalSignCard from "../components/VitalSignCard";
import BPChart from "../components/Chart";
import { useLocation, useNavigate, useParams } from "react-router-dom";

// const API_BASE = import.meta.env.VITE_BACKEND_API || "http://localhost:4000";
const API_BASE =
  import.meta.env.VITE_BACKEND_API || "api.twentytwohealth.com/rpm-be";
const VitalSigns = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { patientId } = useParams();

  const [patientData, setPatientData] = useState(null);
  const [historicalData, setHistoricalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [historicalLoading, setHistoricalLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [deviceType, setDeviceType] = useState("bp");
  const [daysFilter, setDaysFilter] = useState(30);
  const [currentPage, setCurrentPage] = useState(1);
  const [exporting, setExporting] = useState(false);

  // NEW: querying state for Query button activity indicator
  const [querying, setQuerying] = useState(false);

  // Query Period UI state
  const [queryMode, setQueryMode] = useState("range");
  const [dateRangeSelect, setDateRangeSelect] = useState("30");
  const [dateRangeText, setDateRangeText] = useState("Last 30 days");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const todayStr = new Date().toISOString().slice(0, 10);

  // helper to persist patient name to sessionStorage (Navbar expects this key)
  const persistPatientNameToSession = (id, name) => {
    try {
      if (!id || !name) return;
      sessionStorage.setItem(`infuzamed_patient_${id}`, String(name));
    } catch (e) {
      // ignore storage errors
    }
  };
  // Format a timestamp as HH:MM using the UTC time from the DB (no timezone conversion)
  const formatTimeFromDB = (timestamp) => {
    if (!timestamp) return "No data";
    // Accept Date or ISO string; use UTC getters so we show DB UTC time exactly
    const d =
      typeof timestamp === "string"
        ? new Date(timestamp)
        : new Date(String(timestamp));
    const hh = String(d.getUTCHours()).padStart(2, "0");
    const mm = String(d.getUTCMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  };

  // Format a timestamp as a readable date + time using DB UTC (YYYY-MM-DD HH:MM)
  const formatDateTimeFromDB = (timestamp) => {
    if (!timestamp) return "No data";
    const d =
      typeof timestamp === "string"
        ? new Date(timestamp)
        : new Date(String(timestamp));
    const yyyy = d.getUTCFullYear();
    const mmth = String(d.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(d.getUTCDate()).padStart(2, "0");
    const hh = String(d.getUTCHours()).padStart(2, "0");
    const min = String(d.getUTCMinutes()).padStart(2, "0");
    return `${yyyy}-${mmth}-${dd} ${hh}:${min}`;
  };

  // Detect device type from navigation
  useEffect(() => {
    console.log("=== useEffect - Device Type Detection ===");

    let detectedDeviceType = "bp";

    try {
      const windowDeviceType = window && window.__vital_device_type;
      console.log("Window device type:", windowDeviceType);
      if (windowDeviceType === "bp" || windowDeviceType === "spo2") {
        detectedDeviceType = windowDeviceType;
        try {
          delete window.__vital_device_type;
        } catch (err) {
          window.__vital_device_type = undefined;
        }
      }
    } catch (err) {
      console.error("Error checking window device type:", err);
    }

    // If navigation state included a deviceType, use it.
    if (location && location.state && location.state.deviceType) {
      const stateDeviceType = location.state.deviceType;
      console.log("Location state device type:", stateDeviceType);
      if (stateDeviceType === "bp" || stateDeviceType === "spo2") {
        detectedDeviceType = stateDeviceType;

        // preserve patientName/breadcrumbName if present before replacing state
        const preservedName =
          location.state?.patientName || location.state?.breadcrumbName;

        if (preservedName && patientId) {
          // persist to sessionStorage as well
          persistPatientNameToSession(patientId, preservedName);
        }

        // Replace state to prevent repeated triggers, but preserve patientName if we have it.
        const newState = preservedName
          ? { ...(location.state || {}), patientName: preservedName }
          : { ...(location.state || {}) };

        // clear deviceType from state (we've consumed it), but keep patientName
        if (newState.deviceType) delete newState.deviceType;

        navigate(location.pathname, { replace: true, state: newState });
      }
    }

    console.log("Final detected device type:", detectedDeviceType);
    setDeviceType(detectedDeviceType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]); // only needs location to detect incoming deviceType

  useEffect(() => {
    if (!patientId) {
      console.error("No patient ID in URL params");
      setLoading(false);
      return;
    }
    console.log("Patient ID from URL:", patientId);
    console.log("Device type:", deviceType);
    loadPatientData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId, deviceType]);

  useEffect(() => {
    console.log("=== useEffect - Window Tab Check ===");
    try {
      const wtab = window && window.__vital_initial_tab;
      console.log("Window tab value:", wtab);
      if (wtab === "overview" || wtab === "history") {
        setActiveTab(wtab);

        // if a name was put on window scope earlier, persist it
        try {
          if (window.__vital_patient_name && patientId) {
            persistPatientNameToSession(patientId, window.__vital_patient_name);
          }
        } catch (err) {}

        // preserve patientName in state (if any) when replacing state
        const preservedName =
          (location &&
            location.state &&
            (location.state.patientName || location.state.breadcrumbName)) ||
          (patientData && patientData.patient && patientData.patient.name);

        const newState = preservedName ? { patientName: preservedName } : {};
        navigate(location.pathname, { replace: true, state: newState });
        return;
      }
    } catch (err) {
      console.error("Error checking window tab:", err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run on mount

  useEffect(() => {
    console.log("=== useEffect - Location State Check ===");
    if (location && location.state && location.state.activeTab) {
      const tab = location.state.activeTab;
      console.log("Location state tab:", tab);
      if (tab === "overview" || tab === "history") {
        setActiveTab(tab);

        // Persist patientName if present
        const preservedName =
          location.state.patientName ||
          location.state.breadcrumbName ||
          (patientData?.patient?.name ?? null);
        if (preservedName && patientId) {
          persistPatientNameToSession(patientId, preservedName);
        }

        // Replace state but keep patientName so Navbar can use it
        const newState = preservedName ? { patientName: preservedName } : {};
        navigate(location.pathname, { replace: true, state: newState });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]); // run when location changes

  const loadPatientData = async () => {
    console.log("=== loadPatientData() called ===");
    console.log("Device type:", deviceType);

    if (!patientId) {
      console.error("✗ No patient ID available");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE}/api/doctor/patients/${patientId}/vital-signs`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✓ Patient data response:", data);

      if (data.success) {
        setPatientData(data.data);

        // persist patient name immediately for Navbar fallback
        try {
          const nameToPersist = data.data?.patient?.name;
          if (nameToPersist)
            persistPatientNameToSession(patientId, nameToPersist);
        } catch (err) {
          // ignore
        }

        loadHistoricalData(30, 1, patientId);
      } else {
        console.error("✗ Failed to load patient data:", data.message);
      }
    } catch (error) {
      console.error("✗ Error loading patient data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getHeartRateData = () => {
    if (!patientData) {
      return {
        value: "--",
        unit: "bpm",
        status: "no-data",
        timestamp: null,
      };
    }

    // If patientData already has heartRate, prefer it but keep raw timestamp
    if (
      patientData?.vitalSigns?.heartRate &&
      patientData.vitalSigns.heartRate.value !== "--"
    ) {
      // Prefer any raw timestamp found in patientData or historicalData (NOT preformatted)
      const backendLatestTime =
        historicalData?.data?.[0]?.created_at ||
        historicalData?.data?.[0]?.createdAt ||
        historicalData?.data?.[0]?.timestamp ||
        patientData.vitalSigns.heartRate.timestamp ||
        null;

      return {
        ...patientData.vitalSigns.heartRate,
        timestamp: backendLatestTime, // <-- RAW ISO string (e.g. "2025-10-28T10:00:00.000Z")
      };
    }

    // Fallback: use latest historical BP reading (raw timestamp)
    if (
      historicalData?.data &&
      historicalData.data.length > 0 &&
      deviceType === "bp"
    ) {
      const latestReading = historicalData.data[0];
      if (latestReading.pulse && latestReading.pulse !== "--") {
        const ts =
          latestReading.created_at ||
          latestReading.createdAt ||
          latestReading.timestamp ||
          null;

        return {
          value: String(latestReading.pulse),
          unit: "bpm",
          status: getHeartRateStatus(latestReading.pulse),
          timestamp: ts, // <-- RAW ISO string
        };
      }
    }

    return {
      value: "--",
      unit: "bpm",
      status: "no-data",
      timestamp: null,
    };
  };

  const getHeartRateStatus = (pulse) => {
    if (!pulse || pulse === "--") return "no-data";
    const pulseValue = parseInt(pulse);
    if (pulseValue < 60) return "warning";
    if (pulseValue > 100) return "warning";
    return "normal";
  };

  const getSpo2Status = (spo2) => {
    if (!spo2 || spo2 === "--") return "no-data";
    const spo2Value = parseFloat(spo2);
    if (spo2Value < 90) return "critical";
    if (spo2Value < 95) return "warning";
    return "normal";
  };

  const getSpo2Data = () => {
    if (patientData?.latestSpO2?.data) {
      const spo2Data = patientData.latestSpO2.data;
      return {
        value: spo2Data.spo2?.toString() || "--",
        unit: "%",
        status: getSpo2Status(spo2Data.spo2),
        timestamp: patientData.latestSpO2.created_at,
      };
    }

    return {
      value: "--",
      unit: "%",
      status: "no-data",
      timestamp: null,
    };
  };

  const loadHistoricalData = async (
    days = daysFilter,
    page = 1,
    providedPatientId = null
  ) => {
    console.log("=== loadHistoricalData() called ===");
    console.log("Device type for loading:", deviceType);

    const targetPatientId = providedPatientId || patientId;

    if (!targetPatientId) {
      console.error("✗ No patient ID available for loading historical data");
      setHistoricalLoading(false);
      return;
    }

    setHistoricalLoading(true);
    try {
      const response = await fetch(
        `${API_BASE}/api/doctor/patients/${targetPatientId}/device-data?deviceType=${deviceType}&days=${days}&page=${page}&limit=10`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✓ Historical data response:", data);

      if (data.success) {
        setHistoricalData(data.data);
        setDaysFilter(days);
        setCurrentPage(page);
      } else {
        console.error("✗ Failed to load historical data:", data.message);
        setHistoricalData(null);
      }
    } catch (error) {
      console.error("✗ Error loading historical data:", error);
      setHistoricalData(null);
    } finally {
      setHistoricalLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!patientId) {
      console.error("✗ No patient ID available for refresh");
      return;
    }

    setRefreshing(true);
    try {
      const response = await fetch(
        `${API_BASE}/api/doctor/patients/${patientId}/vital-signs`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (data.success) {
        setPatientData(data.data);

        // persist name on manual refresh too
        try {
          if (data.data?.patient?.name)
            persistPatientNameToSession(patientId, data.data.patient.name);
        } catch (err) {}

        loadHistoricalData(daysFilter, currentPage, patientId);
      } else {
        console.error("✗ Failed to refresh patient data:", data.message);
      }
    } catch (error) {
      console.error("✗ Error refreshing patient data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleDaysFilterChange = (days) => {
    setCurrentPage(1);
    loadHistoricalData(days, 1, patientId);
  };

  const handlePageChange = (newPage) => {
    loadHistoricalData(daysFilter, newPage, patientId);
  };

  // NEW: make handleQuery async so we can set querying state while waiting
  const handleQuery = async () => {
    if (!patientId) {
      console.error("✗ No patient ID available for query");
      return;
    }

    setQuerying(true);
    try {
      if (queryMode === "range") {
        const days = parseInt(dateRangeSelect, 10) || daysFilter;
        await loadHistoricalData(days, 1, patientId);
      } else {
        if (fromDate && toDate) {
          const from = new Date(fromDate);
          const to = new Date(toDate);
          const diffMs = Math.max(0, to.getTime() - from.getTime());
          const days = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
          await loadHistoricalData(days || daysFilter, 1, patientId);
        } else {
          await loadHistoricalData(daysFilter, 1, patientId);
        }
      }
    } finally {
      setQuerying(false);
    }
  };

  // PDF Export Functionality - Simple version without autoTable
  const handleExport = async (
    deviceType,
    historicalData,
    patientData,
    queryMode,
    dateRangeText,
    fromDate,
    toDate,
    daysFilter
  ) => {
    if (
      !patientData ||
      !historicalData?.data ||
      historicalData.data.length === 0
    ) {
      alert("No data available to export");
      return;
    }

    setExporting(true);

    try {
      // Import jsPDF
      const { default: jsPDF } = await import("jspdf");

      // Create new PDF document
      const doc = new jsPDF();

      // Set document properties
      doc.setProperties({
        title: `${deviceType === "bp" ? "Blood Pressure" : "SpO₂"} Report - ${
          patientData.patient.name
        }`,
        subject: "Patient Vital Signs Report",
        author: "RPM System",
      });

      // Add header
      doc.setFontSize(16);
      doc.setTextColor(40, 40, 40);
      doc.text(
        `${deviceType === "bp" ? "Blood Pressure" : "SpO₂"} Monitoring Report`,
        105,
        20,
        { align: "center" }
      );

      // Patient information
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Patient: ${patientData.patient.name}`, 20, 35);
      doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 20, 42);

      // Add query period information
      let periodText = "";
      if (queryMode === "range") {
        periodText = `Period: ${dateRangeText}`;
      } else if (fromDate && toDate) {
        periodText = `Period: ${new Date(
          fromDate
        ).toLocaleDateString()} to ${new Date(toDate).toLocaleDateString()}`;
      } else {
        periodText = `Period: Last ${daysFilter} days`;
      }
      doc.text(periodText, 20, 49);

      // Add separator line
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 55, 190, 55);

      // Table configuration
      let startY = 65;
      const margin = 10; // Reduced margin for more horizontal space

      // Define columns with optimized widths - giving more space to Date & Time
      let columns;

      if (deviceType === "bp") {
        columns = [
          { header: "Date & Time", width: 50, key: "datetime" }, // Increased from 38 to 50
          { header: "BP", width: 22, key: "bp" }, // Reduced from 25 to 22
          { header: "Pulse", width: 20, key: "pulse" }, // Reduced from 22 to 20
          { header: "Status", width: 22, key: "status" }, // Reduced from 25 to 22
          { header: "Device", width: 31, key: "device" }, // Reduced from 35 to 31
        ];
      } else {
        columns = [
          { header: "Date & Time", width: 50, key: "datetime" }, // Increased from 38 to 50
          { header: "SpO₂", width: 16, key: "spo2" }, // Reduced from 18 to 16
          { header: "Pulse", width: 16, key: "pulse" }, // Reduced from 18 to 16
          { header: "PI", width: 12, key: "pi" }, // Reduced from 15 to 12
          { header: "Status", width: 20, key: "status" }, // Reduced from 22 to 20
          { header: "Device", width: 31, key: "device" }, // Reduced from 34 to 31
        ];
      }

      // Calculate total table width
      const totalTableWidth = columns.reduce((sum, col) => sum + col.width, 0);

      // Draw table headers
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.setFillColor(240, 240, 240);

      let currentX = margin;

      // Draw header backgrounds and borders first
      columns.forEach((column) => {
        doc.rect(currentX, startY, column.width, 8, "F");
        doc.rect(currentX, startY, column.width, 8);
        currentX += column.width;
      });

      // Now draw header text separately
      currentX = margin;
      columns.forEach((column) => {
        // Use shorter text for headers to ensure they fit
        let headerText = column.header;
        if (headerText === "Date & Time") {
          headerText = "Date & Time"; // Keep full text for this column
        } else if (headerText.length > 8) {
          headerText = headerText.substring(0, 7) + ".";
        }

        // Center the text in the column
        const textWidth = doc.getTextWidth(headerText);
        const textX = currentX + (column.width - textWidth) / 2;

        doc.text(headerText, textX, startY + 5);
        currentX += column.width;
      });

      startY += 10;

      // Draw table data
      doc.setFontSize(8);
      historicalData.data.forEach((record, rowIndex) => {
        // Check if we need a new page
        if (startY > 270) {
          doc.addPage();
          startY = 30;

          // Redraw headers on new page
          doc.setFontSize(9);
          doc.setTextColor(0, 0, 0);
          doc.setFillColor(240, 240, 240);

          currentX = margin;
          // Draw header backgrounds
          columns.forEach((column) => {
            doc.rect(currentX, startY, column.width, 8, "F");
            doc.rect(currentX, startY, column.width, 8);
            currentX += column.width;
          });

          // Draw header text
          currentX = margin;
          columns.forEach((column) => {
            let headerText = column.header;
            if (headerText === "Date & Time") {
              headerText = "Date & Time";
            } else if (headerText.length > 8) {
              headerText = headerText.substring(0, 7) + ".";
            }
            const textWidth = doc.getTextWidth(headerText);
            const textX = currentX + (column.width - textWidth) / 2;
            doc.text(headerText, textX, startY + 5);
            currentX += column.width;
          });

          startY += 10;
          doc.setFontSize(8);
        }

        // Prepare row data with optimized date formatting
        const rowData =
          deviceType === "bp"
            ? [
                // Use shorter date format that fits better
                new Date(record.created_at).toLocaleDateString("en-GB") +
                  " " +
                  new Date(record.created_at).toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  }),
                `${record.systolic || "--"}/${record.diastolic || "--"}`,
                `${record.pulse || "--"} bpm`,
                record.bpStatus || "Normal",
                getDeviceName(record),
              ]
            : (() => {
                const recordData =
                  typeof record.data === "string"
                    ? JSON.parse(record.data)
                    : record.data;
                const getSpo2Status = (spo2) => {
                  if (!spo2 || spo2 === "--") return "No Data";
                  const spo2Value = parseFloat(spo2);
                  if (spo2Value < 90) return "Critical";
                  if (spo2Value < 95) return "Warning";
                  return "Normal";
                };
                const spo2Status = getSpo2Status(recordData.spo2);

                return [
                  new Date(record.created_at).toLocaleDateString("en-GB") +
                    " " +
                    new Date(record.created_at).toLocaleTimeString("en-GB", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    }),
                  `${recordData.spo2 || "--"}%`,
                  recordData.pulse
                    ? `${Math.round(recordData.pulse)} bpm`
                    : "N/A",
                  recordData.pi || "N/A",
                  spo2Status,
                  getDeviceName(record),
                ];
              })();

        // Draw row with borders
        currentX = margin;

        // Draw cell backgrounds for alternate rows
        if (rowIndex % 2 === 0) {
          doc.setFillColor(250, 250, 250);
          doc.rect(margin, startY, totalTableWidth, 8, "F");
        }

        // Draw cell borders and text
        columns.forEach((column, cellIndex) => {
          doc.setDrawColor(200, 200, 200);
          doc.rect(currentX, startY, column.width, 8);

          // Prepare cell text
          let cellText = String(rowData[cellIndex]);

          // Smart text truncation based on column type
          if (column.key === "datetime") {
            // For datetime, we already formatted it to be shorter
            // No need to truncate further with the new width
          } else if (column.key === "device") {
            if (cellText.length > 12) {
              cellText = cellText.substring(0, 10) + "..";
            }
          } else {
            const maxChars = Math.floor(column.width / 2);
            if (cellText.length > maxChars) {
              cellText = cellText.substring(0, maxChars - 1) + ".";
            }
          }

          // Add cell text with left padding
          doc.text(cellText, currentX + 2, startY + 5);
          currentX += column.width;
        });

        startY += 8;
      });

      // Add separator before statistics
      startY += 10;
      doc.setDrawColor(200, 200, 200);
      doc.line(20, startY, 190, startY);
      startY += 15;

      // Add statistics if available
      if (historicalData.statistics) {
        doc.setFontSize(12);
        doc.setTextColor(40, 40, 40);
        doc.text("Statistics Summary", 20, startY);

        doc.setFontSize(10);
        let statsY = startY + 8;

        if (deviceType === "bp") {
          const stats = [
            `Average BP: ${historicalData.statistics.averageSystolic || "--"}/${
              historicalData.statistics.averageDiastolic || "--"
            }`,
            `Highest BP: ${historicalData.statistics.highestSystolic || "--"}/${
              historicalData.statistics.highestDiastolic || "--"
            }`,
            `Lowest BP: ${historicalData.statistics.lowestSystolic || "--"}/${
              historicalData.statistics.lowestDiastolic || "--"
            }`,
            `Average Pulse: ${
              historicalData.statistics.averagePulse || "--"
            } bpm`,
            `Total Readings: ${historicalData.statistics.totalReadings || "0"}`,
          ];

          stats.forEach((stat) => {
            doc.text(stat, 20, statsY);
            statsY += 6;
          });
        } else {
          const stats = [
            `Average SpO₂: ${historicalData.statistics.averageSpo2 || "--"}%`,
            `Highest SpO₂: ${historicalData.statistics.highestSpo2 || "--"}%`,
            `Lowest SpO₂: ${historicalData.statistics.lowestSpo2 || "--"}%`,
            `Average Pulse: ${
              historicalData.statistics.averagePulse || "--"
            } bpm`,
            `Total Readings: ${historicalData.statistics.totalReadings || "0"}`,
          ];

          stats.forEach((stat) => {
            doc.text(stat, 20, statsY);
            statsY += 6;
          });
        }
      }

      // Add footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i} of ${pageCount}`, 105, 285, { align: "center" });
        doc.text("Generated by RPM System", 195, 285, { align: "right" });
      }

      // Save the PDF
      const fileName = `${patientData.patient.name.replace(/\s+/g, "_")}_${
        deviceType === "bp" ? "BP" : "SpO2"
      }_Report_${new Date().toISOString().split("T")[0]}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF report. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const calculatePercentage = (title, value) => {
    if (value === "--" || !value) return 0;

    try {
      const numValue = parseInt(value);
      switch (title) {
        case "Heart Rate":
          return Math.max(0, Math.min(100, ((numValue - 60) / 40) * 100));
        case "Blood Pressure":
          const systolic = parseInt(value.split("/")[0]);
          return Math.max(0, Math.min(100, (systolic / 120) * 100));
        case "Respiratory Rate":
          return Math.max(0, Math.min(100, ((numValue - 12) / 8) * 100));
        case "Oxygen Saturation":
          return Math.max(0, Math.min(100, numValue));
        default:
          return 50;
      }
    } catch (error) {
      return 50;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "normal":
        return "Normal";
      case "warning":
        return "Warning";
      case "critical":
        return "Critical";
      case "no-data":
        return "No Data";
      default:
        return "Unknown";
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "No data";
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return "No data";
    return new Date(timestamp).toLocaleString();
  };

  const getBatteryLevel = (record) => {
    try {
      const dataObj =
        typeof record.data === "string" ? JSON.parse(record.data) : record.data;
      return dataObj.deviceInfo?.batteryLevel || null;
    } catch (error) {
      return null;
    }
  };

  const getDeviceName = (record) => {
    try {
      const dataObj =
        typeof record.data === "string" ? JSON.parse(record.data) : record.data;
      return dataObj.deviceInfo?.name || record.dev_id || "Unknown Device";
    } catch (error) {
      return record.dev_id || "Unknown Device";
    }
  };

  // Reusable Query Period UI with export functionality
  const QueryPeriodUI = ({ showExport = true }) => (
    <div className="bg-white dark:bg-innerDarkColor rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="mb-4 font-semibold text-gray-900 dark:text-white">
        Query Period
      </div>

      <div className="space-y-4">
        {/* Date Range Option - Properly aligned */}
        <div className="flex items-start space-x-4">
          <label className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 w-32 mt-2">
            <input
              type="radio"
              name="queryMode"
              checked={queryMode === "range"}
              onChange={() => setQueryMode("range")}
              className="w-4 h-4"
            />
            <span>Date Range</span>
          </label>
          <div className="flex-1">
            <select
              value={dateRangeSelect}
              onChange={(e) => {
                setDateRangeSelect(e.target.value);
                const val = e.target.value;
                const labelMap = {
                  7: "Last 7 days",
                  14: "Last 14 days",
                  30: "Last 1 month",
                  90: "Last 3 months",
                  180: "Last 6 months",
                  365: "Last 1 year",
                };
                setDateRangeText(labelMap[val] || "Last 30 days");
              }}
              className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="7">7 days</option>
              <option value="14">14 days</option>
              <option value="30">1 month</option>
              <option value="90">3 months</option>
              <option value="180">6 months</option>
              <option value="365">1 year</option>
            </select>
          </div>
        </div>

        {/* From-To Date Option - Properly aligned */}
        <div className="flex items-start space-x-4">
          <label className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 w-32 mt-2">
            <input
              type="radio"
              name="queryMode"
              checked={queryMode === "from"}
              onChange={() => setQueryMode("from")}
              className="w-4 h-4"
            />
            <span>From</span>
          </label>
          <div className="flex-1 flex items-center space-x-3">
            <input
              type="date"
              value={fromDate}
              max={todayStr}
              onChange={(e) => {
                const v = e.target.value;
                setFromDate(v);
                if (v === todayStr) {
                  setToDate(todayStr); // set To to today when From is today
                } else if (toDate && v > toDate) {
                  setToDate(v); // keep To >= From
                }
              }}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <span className="text-gray-700 dark:text-gray-300 whitespace-nowrap">
              to
            </span>
            <input
              type="date"
              value={toDate}
              min={fromDate || ""}
              max={todayStr}
              disabled={!fromDate || fromDate === todayStr}
              onChange={(e) => setToDate(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {historicalData?.pagination?.totalRecords
              ? `${historicalData.pagination.totalRecords} records found`
              : historicalData?.data?.length
              ? `${historicalData.data.length} records found`
              : "No records found"}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleQuery}
              disabled={querying || historicalLoading}
              className="px-4 py-2 bg-[#103c63] text-white rounded text-sm  transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {/* show spinner when querying or historicalLoading */}
              <RefreshCw
                size={16}
                className={querying || historicalLoading ? "animate-spin" : ""}
              />
              <span>
                {querying || historicalLoading ? "Querying..." : "Query"}
              </span>
            </button>
            {showExport && (
              <button
                onClick={handleExport}
                disabled={
                  !historicalData?.data ||
                  historicalData.data.length === 0 ||
                  exporting
                }
                className="px-4 py-2 bg-[#103c63] text-white rounded text-sm  transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {exporting ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <Download size={16} />
                )}
                <span>{exporting ? "Exporting..." : "Export PDF"}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600 dark:text-gray-400">
          Loading patient data...
        </div>
      </div>
    );
  }

  // Only show the error when there's truly no patientId; otherwise show loading until data arrives
  if (!patientId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600 dark:text-gray-400">
          No patient data found. Please select a patient first.
        </div>
      </div>
    );
  }

  if (!patientData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600 dark:text-gray-400">
          Loading patient data...
        </div>
      </div>
    );
  }

  const { patient, vitalSigns, lastUpdated, overallStatus } = patientData;

  const heartRateData = getHeartRateData();
  const spo2Data = getSpo2Data();
  // Normalized latest timestamp (prefer latest historical record created_at)
  const latestTimestampRaw =
    historicalData?.data?.[0]?.created_at ||
    historicalData?.data?.[0]?.createdAt ||
    historicalData?.data?.[0]?.timestamp ||
    patientData?.latestSpO2?.created_at ||
    patientData?.latestSpO2?.createdAt ||
    patientData?.vitalSigns?.bloodPressure?.timestamp ||
    null;

  // Convert to ISO string (safe, consistent shape for child components)
  const latestTimestampISO = latestTimestampRaw
    ? new Date(latestTimestampRaw).toISOString()
    : null;

  // Render BP-specific content
  const renderBPContent = () => (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VitalSignCard
          title="Heart Rate"
          value={heartRateData.value}
          unit={heartRateData.unit}
          range="60-100"
          status={heartRateData.status}
          icon={Heart}
          percentage={calculatePercentage("Heart Rate", heartRateData.value)}
          timestamp={heartRateData.timestamp || latestTimestampRaw || null}
        />

        {vitalSigns?.bloodPressure && (
          <VitalSignCard
            title="Blood Pressure"
            value={vitalSigns.bloodPressure.value}
            unit={vitalSigns.bloodPressure.unit}
            range="<120/80"
            status={vitalSigns.bloodPressure.status}
            icon={Droplets}
            percentage={calculatePercentage(
              "Blood Pressure",
              vitalSigns.bloodPressure.value
            )}
            timestamp={
              vitalSigns.bloodPressure?.timestamp || latestTimestampRaw || null
            }
          />
        )}
      </div>

      <div className="bg-white dark:bg-innerDarkColor rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-primary dark:text-darkModeText">
            Patient: {patient.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            BP Monitoring Session
          </p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {getStatusText(overallStatus)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Overall Status
              </div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {lastUpdated
                  ? `Last updated: ${formatTimeFromDB(lastUpdated)}`
                  : "No data available"}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Monitoring Status
              </div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-center space-x-2">
                <Clock size={20} className="text-gray-500" />
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {formatTime(lastUpdated)}
                </div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Last Reading
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Blood Pressure Readings */}
      <div className="bg-white dark:bg-innerDarkColor rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-primary dark:text-darkModeText">
            Blood Pressure Readings
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {historicalData?.pagination
              ? `Page ${currentPage} of ${historicalData.pagination.totalPages}`
              : historicalLoading
              ? "Loading..."
              : "No data available"}
          </p>
        </div>
        <div className="p-6">
          {historicalLoading ? (
            <div className="flex justify-center py-8">
              <div className="text-lg text-gray-600 dark:text-gray-400">
                Loading historical data...
              </div>
            </div>
          ) : historicalData?.data && historicalData.data.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Date & Time
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Blood Pressure
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Pulse
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Device
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Battery
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {historicalData.data.map((record) => {
                      const batteryLevel = getBatteryLevel(record);
                      const deviceName = getDeviceName(record);
                      const bpStatusText = record.bpStatus
                        ? `${record.bpStatus} (Warning)`
                        : "Normal";

                      return (
                        <tr
                          key={record.id}
                          className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                            {formatDateTimeFromDB(
                              record.created_at ||
                                record.createdAt ||
                                record.timestamp
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                                {record.formattedBP ||
                                  `${record.systolic}/${record.diastolic}`}
                              </span>
                              <span className="ml-2 px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                                {bpStatusText}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {record.formattedPulse || `${record.pulse} bpm`}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                            {deviceName}
                          </td>
                          <td className="py-3 px-4">
                            {batteryLevel !== null ? (
                              <div className="flex items-center space-x-2">
                                <Battery size={16} className="text-gray-500" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {batteryLevel}%
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400 dark:text-gray-500">
                                N/A
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {historicalData.pagination &&
                historicalData.pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Showing page {historicalData.pagination.currentPage} of{" "}
                      {historicalData.pagination.totalPages} (
                      {historicalData.pagination.totalRecords} total records)
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={
                          !historicalData.pagination.hasPrev ||
                          historicalLoading
                        }
                        className="flex items-center px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft size={16} /> Previous
                      </button>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={
                          !historicalData.pagination.hasNext ||
                          historicalLoading
                        }
                        className="flex items-center px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
            </>
          ) : (
            <div className="text-center py-8 text-gray-600 dark:text-gray-400">
              No blood pressure data found for the selected period.
            </div>
          )}
        </div>
      </div>
    </>
  );

  // Render SpO2-specific content
  const renderSpO2Content = () => (
    <>
      <div className="grid grid-cols-1 gap-6">
        <VitalSignCard
          title="Oxygen Saturation"
          value={spo2Data.value}
          unit={spo2Data.unit}
          range="95-100%"
          status={spo2Data.status}
          icon={Droplets}
          percentage={calculatePercentage("Oxygen Saturation", spo2Data.value)}
          timestamp={spo2Data.timestamp}
        />
      </div>

      {/* SpO2 Readings */}
      <div className="bg-white dark:bg-innerDarkColor rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-primary dark:text-darkModeText">
            SpO₂ Readings
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {historicalData?.pagination
              ? `Page ${currentPage} of ${historicalData.pagination.totalPages}`
              : historicalLoading
              ? "Loading..."
              : "No data available"}
          </p>
        </div>
        <div className="p-6">
          {historicalLoading ? (
            <div className="flex justify-center py-8">
              <div className="text-lg text-gray-600 dark:text-gray-400">
                Loading SpO₂ data...
              </div>
            </div>
          ) : historicalData?.data && historicalData.data.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Date & Time
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                        SpO₂
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Pulse
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                        PI
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Device
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Battery
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {historicalData.data.map((record) => {
                      const batteryLevel = getBatteryLevel(record);
                      const deviceName = getDeviceName(record);
                      const recordData =
                        typeof record.data === "string"
                          ? JSON.parse(record.data)
                          : record.data;

                      return (
                        <tr
                          key={record.id}
                          className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                            {formatDateTime(record.created_at)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                                {recordData.spo2}%
                              </span>
                              <span
                                className={`ml-2 px-2 py-1 text-xs rounded-full ${
                                  getSpo2Status(recordData.spo2) === "normal"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                    : getSpo2Status(recordData.spo2) ===
                                      "warning"
                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                                    : getSpo2Status(recordData.spo2) ===
                                      "critical"
                                    ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                    : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
                                }`}
                              >
                                {getSpo2Status(recordData.spo2)}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {recordData.pulse
                                ? `${Math.round(recordData.pulse)} bpm`
                                : "N/A"}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {recordData.pi || "N/A"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                            {deviceName}
                          </td>
                          <td className="py-3 px-4">
                            {batteryLevel !== null ? (
                              <div className="flex items-center space-x-2">
                                <Battery size={16} className="text-gray-500" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {batteryLevel}%
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400 dark:text-gray-500">
                                N/A
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {historicalData.pagination &&
                historicalData.pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Showing page {historicalData.pagination.currentPage} of{" "}
                      {historicalData.pagination.totalPages} (
                      {historicalData.pagination.totalRecords} total records)
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={
                          !historicalData.pagination.hasPrev ||
                          historicalLoading
                        }
                        className="flex items-center px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft size={16} /> Previous
                      </button>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={
                          !historicalData.pagination.hasNext ||
                          historicalLoading
                        }
                        className="flex items-center px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
            </>
          ) : (
            <div className="text-center py-8 text-gray-600 dark:text-gray-400">
              No SpO₂ data found for the selected period.
            </div>
          )}
        </div>
      </div>
    </>
  );

  // Render History tab content
  const renderHistoryContent = () => (
    <div className="space-y-6">
      <QueryPeriodUI showExport={true} />

      {historicalData?.statistics &&
        historicalData.statistics.totalReadings > 0 && (
          <div className="bg-white dark:bg-innerDarkColor rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-primary dark:text-darkModeText">
                {deviceType === "bp" ? "Blood Pressure" : "SpO₂"} Statistics (
                {daysFilter} Days)
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {deviceType === "bp" ? (
                  <>
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {historicalData.statistics.averageSystolic}/
                        {historicalData.statistics.averageDiastolic}
                      </div>
                      <div className="text-sm text-blue-600 dark:text-blue-400">
                        Average BP
                      </div>
                    </div>
                    <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {historicalData.statistics.highestSystolic}/
                        {historicalData.statistics.highestDiastolic}
                      </div>
                      <div className="text-sm text-red-600 dark:text-red-400">
                        Highest BP
                      </div>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {historicalData.statistics.lowestSystolic}/
                        {historicalData.statistics.lowestDiastolic}
                      </div>
                      <div className="text-sm text-green-600 dark:text-green-400">
                        Lowest BP
                      </div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {historicalData.statistics.averagePulse}
                      </div>
                      <div className="text-sm text-purple-600 dark:text-purple-400">
                        Avg Pulse
                      </div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {historicalData.statistics.totalReadings}
                      </div>
                      <div className="text-sm text-orange-600 dark:text-orange-400">
                        Total Readings
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {historicalData.statistics.averageSpo2}%
                      </div>
                      <div className="text-sm text-blue-600 dark:text-blue-400">
                        Average SpO₂
                      </div>
                    </div>
                    <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {historicalData.statistics.highestSpo2}%
                      </div>
                      <div className="text-sm text-red-600 dark:text-red-400">
                        Highest SpO₂
                      </div>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {historicalData.statistics.lowestSpo2}%
                      </div>
                      <div className="text-sm text-green-600 dark:text-green-400">
                        Lowest SpO₂
                      </div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {historicalData.statistics.averagePulse}
                      </div>
                      <div className="text-sm text-purple-600 dark:text-purple-400">
                        Avg Pulse
                      </div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {historicalData.statistics.totalReadings}
                      </div>
                      <div className="text-sm text-orange-600 dark:text-orange-400">
                        Total Readings
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

      {historicalData &&
        historicalData.data &&
        historicalData.data.length > 0 && (
          <div className="bg-white dark:bg-innerDarkColor rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-primary dark:text-darkModeText">
                {deviceType === "bp" ? "Blood Pressure" : "SpO₂"} Trends
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Showing {historicalData.data.length} readings from the last{" "}
                {daysFilter} days
              </p>
            </div>
            <div className="p-6">
              <BPChart
                data={historicalData.data}
                chartType="line"
                showPoints={false}
                deviceType={deviceType}
              />
            </div>
          </div>
        )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <h2 className="text-2xl font-bold text-primary dark:text-white">
          {deviceType === "bp" ? "Blood Pressure" : "SpO₂"} Monitoring -{" "}
          {patient?.name || "Unknown Patient"}
        </h2>
        <div className="flex items-center space-x-4 mt-4 lg:mt-0">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {lastUpdated
              ? `Last updated: ${formatTime(lastUpdated)}`
              : "No data available"}
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 px-3 py-2 text-sm bg-primary text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "overview"
                ? "border-primary text-primary dark:text-darkModeText"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center space-x-2">
              <Activity size={16} />
              <span>Overview</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "history"
                ? "border-primary text-primary dark:text-darkModeText"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center space-x-2">
              <BarChart3 size={16} />
              <span>History & Analytics</span>
            </div>
          </button>
        </nav>
      </div>

      {activeTab === "overview" && (
        <>
          <QueryPeriodUI showExport={true} />
          {deviceType === "bp" ? renderBPContent() : renderSpO2Content()}
        </>
      )}

      {activeTab === "history" && renderHistoryContent()}
    </div>
  );
};

export default VitalSigns;
