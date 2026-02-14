

// export default PatientModal;

import React, { useState, useEffect } from "react";
import {
  Home,
  ChevronRight,
  Heart,
  Mail,
  Phone,
  Calendar,
  Loader,
  AlertCircle,
  RefreshCw,
  Droplet,
  Zap,
  Activity,
  List,
  BarChart,
  User,
  BarChart3,
  Clock,
  ChevronLeft,
  Battery,
  Download,
} from "lucide-react";
import {
  useNavigate as useRouterNavigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

// components used by embedded VitalSigns
import VitalSignCard from "../components/VitalSignCard";
import BPChart from "../components/Chart";

const PatientModal = ({
  selectedPatient,
  realTimeData,
  patientDetailLoading,
  patientDetailError,
  handleBackToDashboard,
  handleRefreshPatientData,
  formatDate,
  getStatusBgColor,
  getStatusColor,
  getBPStatus,
  navigate,
}) => {
  if (!selectedPatient) return null;

  const routerNavigate = useRouterNavigate();
  const location = useLocation();
  const { patientSlug } = useParams();
  const [showEmbeddedVital, setShowEmbeddedVital] = useState(false);
  const [embeddedInitialTab, setEmbeddedInitialTab] = useState("overview");
  const [embeddedDeviceType, setEmbeddedDeviceType] = useState("bp");
  const [exporting, setExporting] = useState(false);
  const [patientProfile, setPatientProfile] = useState(null);

  const bpData = realTimeData?.latestBP?.data;
  const systolic = bpData?.systolic;
  const diastolic = bpData?.diastolic;
  const pulse = bpData?.pulse;
  const bpStatus = bpData?.bpStatus || getBPStatus(systolic, diastolic);
  const bpLastUpdated = realTimeData?.latestBP?.created_at;
  // Ensure when URL is not a vitals route, the embedded vital view is closed
  useEffect(() => {
    const path = location.pathname || "";
    if (!/\/vital-signs\//.test(path) && showEmbeddedVital) {
      setShowEmbeddedVital(false);
      setEmbeddedInitialTab("overview");
    }
  }, [location.pathname]);

  const spo2Data = realTimeData?.latestSpO2?.data;
  const spo2Value = spo2Data?.spo2 ?? null;
  const spo2Unit = "%";
  const spo2LastUpdated = realTimeData?.latestSpO2?.created_at;
  const spo2Pulse = spo2Data?.pulse ?? null;
  const spo2PI = spo2Data?.pi ?? null;
  const spo2Max = spo2Data?.maxSpo2 ?? null;
  const spo2Min = spo2Data?.minSpo2 ?? null;
  const spo2Battery = spo2Data?.deviceInfo?.batteryLevel ?? null;
  useEffect(() => {
    console.log("patient data in patient modal:", selectedPatient);
  }, [selectedPatient]);

  // --- Paste this immediately after the console.log(selectedPatient) effect ---
  useEffect(() => {
    if (!selectedPatient) return;

    // If we already have rich details, skip fetch
    const alreadyDetailed =
      selectedPatient.username ||
      selectedPatient.email ||
      selectedPatient.phoneNumber ||
      (Object.keys(selectedPatient).length > 3 && !!selectedPatient.patient_id);

    if (alreadyDetailed) return;

    let cancelled = false;
    const API_BASE =
      import.meta.env.VITE_BACKEND_API || "http://localhost:4000";

    const id =
      selectedPatient.patient_id ||
      selectedPatient.id ||
      selectedPatient._id ||
      selectedPatient.patientId ||
      null;
    if (!id) return;

    // Try hydrate from sessionStorage immediately for instant UI
    try {
      const cached = sessionStorage.getItem(`patientProfile_byId_${id}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && !patientProfile) setPatientProfile(parsed);
      }
    } catch {}

    (async () => {
      const candidatePaths = [
        `${API_BASE}/api/doctor/patients/${id}`,
        `${API_BASE}/api/patients/${id}`,
        `${API_BASE}/api/patient/${id}`,
        `${API_BASE}/api//v1/patients/${id}`,
        // add any other known shapes here
      ];

      let fetched = null;
      for (const url of candidatePaths) {
        if (cancelled) return;
        try {
          console.log("PatientModal: trying fetch", url);
          const resp = await fetch(url, { credentials: "include" });
          console.log("PatientModal: fetch status", url, resp.status);
          if (!resp.ok) {
            // try next endpoint
            continue;
          }
          const json = await resp.json();
          // normalize common shapes
          fetched =
            (json && json.data && (json.data.patient || json.data)) ||
            json.patient ||
            json.data ||
            json;
          break;
        } catch (err) {
          console.warn("PatientModal: fetch error for", url, err);
          // try next
        }
      }

      if (cancelled) return;

      if (!fetched) {
        console.warn(
          "PatientModal: failed to fetch patient details for id",
          id
        );
        return;
      }

      // Store locally for rendering without needing parent to update
      try {
        setPatientProfile(fetched);
        try {
          sessionStorage.setItem(
            `patientProfile_byId_${id}`,
            JSON.stringify(fetched)
          );
        } catch {}
      } catch {}

      // Dispatch same event Dashboard listens to so the app gets full patient object
      try {
        window.dispatchEvent(
          new CustomEvent("openPatientFromBreadcrumb", {
            detail: {
              patientId: fetched.patient_id || fetched.id || id,
              patient: fetched,
              patientName:
                fetched.name || fetched.username || selectedPatient.name,
            },
          })
        );
        console.log(
          "PatientModal: dispatched openPatientFromBreadcrumb with fetched patient"
        );
      } catch (err) {
        console.warn("PatientModal: dispatch failed", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedPatient, location.pathname]);

  const computeSpO2Status = (v) => {
    if (v === null || v === undefined) return "no-data";
    if (Number(v) < 90) return "critical";
    if (Number(v) < 95) return "warning";
    return "normal";
  };
  const spo2Status = computeSpO2Status(spo2Value);

  const ecgData = realTimeData?.latestECG?.data;
  const ecgLines = ecgData?.lines ?? [
    "Normal sinus rhythm",
    "No arrhythmia detected",
  ];
  const ecgLastUpdated = realTimeData?.latestECG?.created_at;
  const ecgStatus = ecgData ? "normal" : "no-data";

  // PDF Export Functionality
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
      doc.setProperties({
        title: "22 RPM",
      });
      // Set document properties
      doc.setProperties({
        title: `${deviceType === "bp" ? "Blood Pressure" : "SpO₂"} Report - ${
          patientData.patient.name
        }`,
        subject: "Patient Vital Signs Report",
        author: "RPM System",
      });

      // Add header
      doc.setFontSize(18);
      doc.setTextColor(40, 40, 40);
      doc.setFont(undefined, "bold");
      doc.text("22 RPM", 105, 15, { align: "center" });

      // Add report type subtitle
      doc.setFontSize(14);
      doc.setFont(undefined, "normal");
      doc.text(
        `${deviceType === "bp" ? "Blood Pressure" : "SpO₂"} Monitoring Report`,
        105,
        25,
        { align: "center" }
      );

      // Patient information
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Patient: ${patientData.patient.name}`, 20, 40);
      doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 20, 47);

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
      doc.text(periodText, 20, 54);

      // Add separator line
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 60, 190, 60);

      // Table configuration
      let startY = 70;
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

  const EmbeddedVitalSigns = ({
    initialTab,
    embedded = true,
    onBack,
    deviceType = "bp",
  }) => {
    const loc = useLocation();
    const nav = useNavigate();

    const [historicalData, setHistoricalData] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [historicalLoading, setHistoricalLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("overview");
    const [daysFilter, setDaysFilter] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [querying, setQuerying] = useState(false);

    // Query Period UI state
    const [queryMode, setQueryMode] = useState("range");
    const [dateRangeSelect, setDateRangeSelect] = useState("30");
    const [dateRangeText, setDateRangeText] = useState("Last 30 days");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const todayStr = new Date().toISOString().slice(0, 10);

    const API_BASE =
      import.meta.env.VITE_BACKEND_API || "http://localhost:4000";

    const patientData = React.useMemo(() => {
      if (!selectedPatient) return null;

      const getVitalSigns = () => {
        switch (deviceType) {
          case "bp":
            return {
              heartRate: {
                value:
                  realTimeData?.heartRate ??
                  realTimeData?.latestBP?.data?.pulse ??
                  "--",
                unit: "bpm",
                status: "normal",
                timestamp:
                  realTimeData?.latestBP?.created_at ||
                  realTimeData?.latestBP?.createdAt ||
                  realTimeData?.latestBP?.timestamp ||
                  realTimeData?.heartRateTimestamp ||
                  new Date().toISOString(),
              },
              bloodPressure: {
                value: realTimeData?.latestBP
                  ? `${realTimeData.latestBP?.data?.systolic || "--"}/${
                      realTimeData.latestBP?.data?.diastolic || "--"
                    }`
                  : "--",
                unit: "mmHg",
                status: realTimeData?.latestBP?.data?.bpStatus || "normal",
                timestamp:
                  realTimeData?.latestBP?.created_at ||
                  realTimeData?.latestBP?.createdAt ||
                  realTimeData?.latestBP?.timestamp ||
                  null,
              },
            };
          case "spo2":
            return {
              oxygenSaturation: {
                value: spo2Value ?? "--",
                unit: "%",
                status: spo2Status,
                timestamp: spo2LastUpdated || new Date().toISOString(),
              },
              pulse: {
                value: spo2Pulse ?? "--",
                unit: "bpm",
                status: "normal",
                timestamp: spo2LastUpdated || new Date().toISOString(),
              },
            };
          case "ecg":
            return {
              ecg: {
                value: ecgLines?.join(", ") ?? "--",
                unit: "",
                status: ecgStatus,
                timestamp: ecgLastUpdated || new Date().toISOString(),
              },
            };
          default:
            return {
              heartRate: {
                value: "--",
                unit: "bpm",
                status: "no-data",
                timestamp: new Date().toISOString(),
              },
            };
        }
      };

      return {
        patient: selectedPatient,
        vitalSigns: getVitalSigns(),
        lastUpdated:
          realTimeData?.latestBP?.created_at || new Date().toISOString(),
        overallStatus: "normal",
      };
    }, [
      selectedPatient,
      realTimeData,
      deviceType,
      spo2Value,
      spo2Status,
      spo2LastUpdated,
      spo2Pulse,
      ecgLines,
      ecgStatus,
      ecgLastUpdated,
    ]);

    const computeEffectiveDays = (overrideDays = null) => {
      if (overrideDays !== null && overrideDays !== undefined)
        return Number(overrideDays) || 0;

      if (queryMode === "from") {
        if (fromDate && toDate) {
          try {
            const from = new Date(fromDate);
            const to = new Date(toDate);
            const diffMs = Math.max(0, to.getTime() - from.getTime());
            const days = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
            return days > 0 ? days : parseInt(dateRangeSelect, 10) || 30;
          } catch (err) {
            return parseInt(dateRangeSelect, 10) || 30;
          }
        }
        return parseInt(dateRangeSelect, 10) || 30;
      }

      return parseInt(dateRangeSelect, 10) || 30;
    };

    useEffect(() => {
      if (patientData) {
        loadHistoricalData(null, 1, patientData.patient.id);
      }

      if (initialTab === "overview" || initialTab === "history") {
        setActiveTab(initialTab);
        try {
          delete window.__vital_initial_tab;
        } catch (err) {
          window.__vital_initial_tab = undefined;
        }
        return;
      }

      try {
        const wtab = window && window.__vital_initial_tab;
        if (wtab === "overview" || wtab === "history") {
          setActiveTab(wtab);
          try {
            delete window.__vital_initial_tab;
          } catch (err) {
            window.__vital_initial_tab = undefined;
          }
          if (!embedded) {
            nav(loc.pathname, { replace: true, state: {} });
          }
          return;
        }
      } catch (err) {}

      if (loc && loc.state && loc.state.activeTab) {
        const tab = loc.state.activeTab;
        if (tab === "overview" || tab === "history") {
          setActiveTab(tab);
          if (!embedded) {
            nav(loc.pathname, { replace: true, state: {} });
          }
        }
      }
    }, []);

    useEffect(() => {
      if (initialTab === "overview" || initialTab === "history") {
        setActiveTab(initialTab);
        try {
          delete window.__vital_initial_tab;
        } catch (err) {
          window.__vital_initial_tab = undefined;
        }
      }
    }, [initialTab]);

    useEffect(() => {
      if (embedded) return;
      if (loc && loc.state && loc.state.activeTab) {
        const tab = loc.state.activeTab;
        if (tab === "overview" || tab === "history") {
          setActiveTab(tab);
          nav(loc.pathname, { replace: true, state: {} });
        }
      }
    }, [loc, embedded]);
    const resolvePatientId = (p) =>
      p?.patient_id ?? p?.id ?? p?.userId ?? p?.user_id ?? null;

    const loadHistoricalData = async (
      days = null,
      page = 1,
      patientId = null
    ) => {
      // resolve from parameter OR current patientData
      const targetPatientId =
        patientId ?? resolvePatientId(patientData?.patient);
      if (!targetPatientId) {
        console.warn("loadHistoricalData: no patient id available", {
          patientData,
        });
        setHistoricalLoading(false);
        return;
      }

      //const targetPatientId = patientId || patientData.patient.patient_id;
      const effectiveDays = computeEffectiveDays(days);

      setHistoricalLoading(true);
      try {
        const response = await fetch(
          `${API_BASE}/api/doctor/patients/${targetPatientId}/device-data?deviceType=${deviceType}&days=${effectiveDays}&page=${page}&limit=10`,
          { method: "GET", credentials: "include" }
        );
        const data = await response.json();
        if (data.success) {
          setHistoricalData(data.data);
          setDaysFilter(effectiveDays);
          setCurrentPage(page);
        } else {
          console.error("Failed to load historical data:", data.message);
        }
      } catch (error) {
        console.error("Error loading historical data:", error);
      } finally {
        setHistoricalLoading(false);
      }
    };

    const handleRefresh = async () => {
      if (!patientData) return;
      const patientIdToUse = resolvePatientId(patientData.patient);
      if (!patientIdToUse) return;
      // use patientIdToUse in your fetch URL

      setRefreshing(true);
      try {
        const response = await fetch(
          `${API_BASE}/api/doctor/patients/${patientData.patient.id}/vital-signs`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await response.json();

        if (data.success) {
          loadHistoricalData(daysFilter, currentPage, data.data.patient.id);
        } else {
          console.error("Failed to refresh patient data:", data.message);
        }
      } catch (error) {
        console.error("Error refreshing patient data:", error);
      } finally {
        setRefreshing(false);
      }
    };

    const handleDaysFilterChange = (days) => {
      setCurrentPage(1);
      loadHistoricalData(days, 1);
    };

    const handlePageChange = (newPage) => {
      loadHistoricalData(daysFilter, newPage);
    };

    const handleQuery = async () => {
      if (!patientData) return;
      const patientIdToUse = resolvePatientId(patientData.patient);
      if (!patientIdToUse) {
        console.warn("handleQuery: no patient id to query");
        return;
      }

      setQuerying(true);
      try {
        if (queryMode === "range") {
          const days = parseInt(dateRangeSelect, 10) || daysFilter;
          await loadHistoricalData(days, 1, patientIdToUse);
        } else {
          if (fromDate && toDate) {
            const from = new Date(fromDate);
            const to = new Date(toDate);
            const diffMs = Math.max(0, to.getTime() - from.getTime());
            const days = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
            await loadHistoricalData(days || daysFilter, 1, patientIdToUse);
          } else {
            await loadHistoricalData(daysFilter, 1, patientIdToUse);
          }
        }
      } finally {
        setQuerying(false);
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
          typeof record.data === "string"
            ? JSON.parse(record.data)
            : record.data;
        return dataObj.deviceInfo?.batteryLevel || null;
      } catch (error) {
        return null;
      }
    };

    const getDeviceName = (record) => {
      try {
        const dataObj =
          typeof record.data === "string"
            ? JSON.parse(record.data)
            : record.data;
        return dataObj.deviceInfo?.name || record.dev_id || "Unknown Device";
      } catch (error) {
        return record.dev_id || "Unknown Device";
      }
    };

    const showOnlyTabWhenEmbedded =
      embedded && (initialTab === "overview" || initialTab === "history");

    const showOverview = showOnlyTabWhenEmbedded
      ? initialTab === "overview"
      : activeTab === "overview";

    const showHistory = showOnlyTabWhenEmbedded
      ? initialTab === "history"
      : activeTab === "history";

    // Updated Query Period UI with proper alignment and export
    const QueryPeriodUI = (
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
                name="queryModeModal"
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
                name="queryModeModal"
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
                    setToDate(todayStr);
                  } else if (toDate && v > toDate) {
                    setToDate(v);
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
                <RefreshCw
                  size={16}
                  className={
                    querying || historicalLoading ? "animate-spin" : ""
                  }
                />
                <span>
                  {querying || historicalLoading ? "Querying..." : "Query"}
                </span>
              </button>
              <button
                onClick={() =>
                  handleExport(
                    deviceType,
                    historicalData,
                    patientData,
                    queryMode,
                    dateRangeText,
                    fromDate,
                    toDate,
                    daysFilter
                  )
                }
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
            </div>
          </div>
        </div>
      </div>
    );

    if (!patientData) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600 dark:text-gray-400">
            No patient data available.
          </div>
        </div>
      );
    }

    const { patient, vitalSigns, lastUpdated, overallStatus } = patientData;

    // Device-specific content rendering
    const renderDeviceSpecificContent = () => {
      switch (deviceType) {
        case "bp":
          return (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <VitalSignCard
                  title="Heart Rate"
                  value={vitalSigns.heartRate.value}
                  unit={vitalSigns.heartRate.unit}
                  range="60-100"
                  status={vitalSigns.heartRate.status}
                  icon={Heart}
                  percentage={calculatePercentage(
                    "Heart Rate",
                    vitalSigns.heartRate.value
                  )}
                  timestamp={vitalSigns.heartRate.timestamp}
                />
                <VitalSignCard
                  title="Blood Pressure"
                  value={vitalSigns.bloodPressure.value}
                  unit={vitalSigns.bloodPressure.unit}
                  range="<120/80"
                  status={vitalSigns.bloodPressure.status}
                  icon={Droplet}
                  percentage={calculatePercentage(
                    "Blood Pressure",
                    vitalSigns.bloodPressure.value
                  )}
                  timestamp={vitalSigns.bloodPressure.timestamp}
                />
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
                        {lastUpdated ? "Active" : "No Data"}
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
                      : "Loading..."}
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
                              <th className="text-left py-3 px-4 text-sm font-bold text-black dark:text-gray-300">
                                Date & Time
                              </th>
                              <th className="text-left py-3 px-4 text-sm font-bold text-black dark:text-gray-300">
                                Blood Pressure
                              </th>
                              <th className="text-left py-3 px-4 text-sm font-bold text-black dark:text-gray-300">
                                Pulse
                              </th>
                              <th className="text-left py-3 px-4 text-sm font-bold text-black dark:text-gray-300">
                                Device
                              </th>
                              <th className="text-left py-3 px-4 text-sm font-bold text-black dark:text-gray-300">
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
                                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-400">
                                    {formatDateTime(record.created_at)}
                                  </td>
                                  <td className="py-3 px-4">
                                    <div className="flex items-center space-x-2">
                                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {record.formattedBP}
                                      </span>
                                      <span className="ml-2 px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                                        {bpStatusText}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className="text-sm text-gray-900 dark:text-gray-400">
                                      {record.formattedPulse}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-900">
                                    {deviceName}
                                  </td>
                                  <td className="py-3 px-4">
                                    {batteryLevel !== null ? (
                                      <div className="flex items-center space-x-2">
                                        <Battery
                                          size={16}
                                          className="text-gray-500"
                                        />
                                        <span className="text-sm text-gray-600 dark:text-gray-900">
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
                              Showing page{" "}
                              {historicalData.pagination.currentPage} of{" "}
                              {historicalData.pagination.totalPages} (
                              {historicalData.pagination.totalRecords} total
                              records)
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() =>
                                  handlePageChange(currentPage - 1)
                                }
                                disabled={
                                  !historicalData.pagination.hasPrev ||
                                  historicalLoading
                                }
                                className="flex items-center px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <ChevronLeft size={16} /> Previous
                              </button>
                              <button
                                onClick={() =>
                                  handlePageChange(currentPage + 1)
                                }
                                disabled={
                                  !historicalData.pagination.hasNext ||
                                  historicalLoading
                                }
                                className="flex items-center px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Next{" "}
                                <ChevronLeft
                                  size={16}
                                  style={{ transform: "rotate(180deg)" }}
                                />
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

        case "spo2":
          return (
            <>
              <div className="grid grid-cols-1 gap-6">
                <VitalSignCard
                  title="Oxygen Saturation"
                  value={vitalSigns.oxygenSaturation.value}
                  unit={vitalSigns.oxygenSaturation.unit}
                  range="95-100%"
                  status={vitalSigns.oxygenSaturation.status}
                  icon={Droplet}
                  percentage={calculatePercentage(
                    "Oxygen Saturation",
                    vitalSigns.oxygenSaturation.value
                  )}
                  timestamp={vitalSigns.oxygenSaturation.timestamp}
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

                              const getSpo2Status = (spo2) => {
                                if (!spo2 || spo2 === "--") return "no-data";
                                const spo2Value = parseFloat(spo2);
                                if (spo2Value < 90) return "critical";
                                if (spo2Value < 95) return "warning";
                                return "normal";
                              };

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
                                          getSpo2Status(recordData.spo2) ===
                                          "normal"
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
                                        <Battery
                                          size={16}
                                          className="text-gray-500"
                                        />
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
                              Showing page{" "}
                              {historicalData.pagination.currentPage} of{" "}
                              {historicalData.pagination.totalPages} (
                              {historicalData.pagination.totalRecords} total
                              records)
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() =>
                                  handlePageChange(currentPage - 1)
                                }
                                disabled={
                                  !historicalData.pagination.hasPrev ||
                                  historicalLoading
                                }
                                className="flex items-center px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <ChevronLeft size={16} /> Previous
                              </button>
                              <button
                                onClick={() =>
                                  handlePageChange(currentPage + 1)
                                }
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

        default:
          return (
            <div className="text-center py-8 text-gray-600 dark:text-gray-400">
              Device type not supported.
            </div>
          );
      }
    };

    // Device-specific history content
    const renderDeviceSpecificHistory = () => {
      if (
        !historicalData?.statistics ||
        historicalData.statistics.totalReadings === 0
      ) {
        return null;
      }

      return (
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
      );
    };

    return (
      <div className="space-y-6 mt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold text-primary dark:text-white">
              {deviceType === "bp" ? "Blood Pressure" : "SpO₂"} Monitoring
            </h2>
          </div>

          <div className="flex items-center space-x-4">
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
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {showOnlyTabWhenEmbedded ? (
              initialTab === "overview" ? (
                <button
                  className={`py-2 px-1 border-b-2 font-medium text-sm border-primary text-primary dark:text-darkModeText`}
                >
                  <div className="flex items-center space-x-2">
                    <Activity size={16} />
                    <span>Overview</span>
                  </div>
                </button>
              ) : (
                <button
                  className={`py-2 px-1 border-b-2 font-medium text-sm border-primary text-primary dark:text-darkModeText`}
                >
                  <div className="flex items-center space-x-2">
                    <BarChart3 size={16} />
                    <span>History & Analytics</span>
                  </div>
                </button>
              )
            ) : (
              <>
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
              </>
            )}
          </nav>
        </div>

        {showOverview && (
          <>
            {QueryPeriodUI}
            {renderDeviceSpecificContent()}
          </>
        )}

        {showHistory && (
          <div className="space-y-6">
            {QueryPeriodUI}
            {renderDeviceSpecificHistory()}

            {historicalData && historicalData.data.length > 0 && (
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
        )}
      </div>
    );
  };

  const navigateToVital = (tab, deviceType, e) => {
    if (e && e.stopPropagation) e.stopPropagation();

    // keep embedded behaviour
    console.log("Navigating to vital signs with device type:", deviceType);
    setEmbeddedDeviceType(deviceType);
    setEmbeddedInitialTab(tab);
    setShowEmbeddedVital(true);

    try {
      window.__vital_initial_tab = tab;
      window.__vital_device_type = deviceType;
      window.__vital_patient_data = {
        patient: selectedPatient,
        realTimeData: realTimeData,
      };
      // optional: persist patient name for Navbar fallback
      if (selectedPatient?.name) {
        try {
          window.__vital_patient_name = selectedPatient.name;
        } catch {}
      }
    } catch (err) {
      console.error("Error storing patient data:", err);
    }

    const patientId =
      selectedPatient?.id ||
      selectedPatient?.patient_id ||
      selectedPatient?._id;
    if (!patientId) {
      console.error("No patient ID available for navigation");
      return;
    }

    // Decide which route to use:
    // - If we came from Patients (origin: 'patient') navigate to /patients/vital-signs/:id
    // - Otherwise (dashboard flow) navigate to /dashboard/<slug>/vital-signs/:id
    const origin = location?.state?.origin || location?.state?.from || null;

    const routeState = {
      origin: origin === "patient" ? "patient" : "dashboard",
      activeTab: tab,
      deviceType,
      patientData: {
        patient: selectedPatient,
        realTimeData,
      },
      patientName: selectedPatient?.name || location?.state?.patientName,
    };

    if (
      origin === "patient" ||
      origin === "/patients" ||
      origin === "patients"
    ) {
      // patients list/modal -> use /patients/vital-signs/:patientId so Navbar shows: Patient > Name
      routerNavigate(`/patients/vital-signs/${patientId}`, {
        state: routeState,
      });
      return;
    }

    // default: dashboard flow
    const currentSlug = patientSlug || selectedPatient?.name || "patient";
    // persist reverse mapping for navbar resolution (slug -> id)
    try {
      const slugKey = encodeURIComponent(
        String(currentSlug).trim().toLowerCase().replace(/\s+/g, "-")
      );
      sessionStorage.setItem(`patientId_bySlug_${slugKey}`, String(patientId));
      if (selectedPatient?.name)
        sessionStorage.setItem(
          `patientName_bySlug_${slugKey}`,
          String(selectedPatient.name)
        );
      // cache profile if available
      try {
        sessionStorage.setItem(
          `patientProfile_byId_${patientId}`,
          JSON.stringify(selectedPatient)
        );
      } catch {}
    } catch {}
    routerNavigate(
      `/dashboard/${encodeURIComponent(
        String(currentSlug).trim().toLowerCase().replace(/\s+/g, "-")
      )}/vital-signs/${patientId}`,
      {
        state: routeState,
      }
    );
  };

  // Helper functions
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

  if (showEmbeddedVital) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setShowEmbeddedVital(false);
                try {
                  delete window.__vital_initial_tab;
                  delete window.__vital_device_type;
                } catch (err) {
                  window.__vital_initial_tab = undefined;
                  window.__vital_device_type = undefined;
                }
                routerNavigate("/patient");
              }}
              className="px-3 py-2 rounded-md bg-white dark:bg-gray-800 border text-sm font-medium hover:bg-gray-50"
            >
              ← Back to Patient
            </button>
            <div className="text-sm text-gray-700 dark:text-gray-300 font-semibold">
              Viewing {embeddedDeviceType === "bp" ? "Blood Pressure" : "SpO₂"}{" "}
              Vital Signs
            </div>
          </div>

          <div>
            <button
              onClick={() => {
                setShowEmbeddedVital(false);
                routerNavigate("/patient");
              }}
              className="px-3 py-2 rounded-md bg-white/10 text-sm"
            >
              Close
            </button>
          </div>
        </div>

        <EmbeddedVitalSigns
          initialTab={embeddedInitialTab}
          embedded={true}
          deviceType={embeddedDeviceType}
          onBack={() => {
            setShowEmbeddedVital(false);
            try {
              delete window.__vital_initial_tab;
              delete window.__vital_device_type;
            } catch (err) {
              window.__vital_initial_tab = undefined;
              window.__vital_device_type = undefined;
            }
            routerNavigate("/patient");
          }}
          selectedPatient={selectedPatient}
          realTimeData={realTimeData}
        />
      </div>
    );
  }

  // Rest of the PatientModal JSX remains the same...
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm">
        <button
          onClick={handleBackToDashboard}
          className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
        >
          <Home className="w-4 h-4" />
          <span>Dashboard</span>
        </button>
        <ChevronRight className="w-4 h-4 text-gray-400" />
        <span className="text-blue-600 dark:text-blue-400 font-semibold">
          {selectedPatient.name || selectedPatient.username}
        </span>
      </div>

      {/* Top area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-10">
        {/* Main Profile Card */}
        <div className="lg:col-span-2 bg-white dark:bg-innerDarkColor rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center">
              <div className="h-24 w-24 rounded-full bg-[#103c63] flex items-center justify-center shadow-lg">
                <User className="w-10 h-10 text-white" />
              </div>
            </div>

            {/* Profile Details */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white truncate">
                    {selectedPatient.name || selectedPatient.username}
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    @{selectedPatient.name}
                  </p>
                </div>
              </div>

              {/* Contact Info - Improved Layout */}
              <div className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-3 text-gray-400 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">
                          Email
                        </p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1 truncate">
                          {selectedPatient.email ||
                            patientProfile?.email ||
                            "No email"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-3 text-gray-400 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">
                          Phone
                        </p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                          {selectedPatient.phoneNumber ||
                            patientProfile?.phoneNumber ||
                            "Not provided"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">
                        RPM Start Date
                      </p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                        {selectedPatient.created_at ||
                        patientProfile?.created_at
                          ? new Date(
                              selectedPatient.created_at ||
                                patientProfile?.created_at
                            ).toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">
                        Last Login
                      </p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                        {formatDate(
                          selectedPatient.last_login ||
                            patientProfile?.last_login
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Patient Details Card */}
        <div className="bg-white dark:bg-innerDarkColor rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Patient Details
            </h3>
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Patient ID
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded">
                {selectedPatient.patient_id ||
                  patientProfile?.patient_id ||
                  patientProfile?.id ||
                  "N/A"}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Age
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {selectedPatient.age || patientProfile?.age || "-"}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Gender
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {selectedPatient.gender || patientProfile?.gender || "-"}
              </span>
            </div>
          </div>
        </div>
      </div>
      {patientDetailLoading && (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-center space-x-3">
            <Loader className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-gray-600 dark:text-gray-400">
              Loading real-time patient data...
            </span>
          </div>
        </div>
      )}

      {patientDetailError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            <div>
              <p className="text-red-800 dark:text-red-200 font-medium">
                Failed to load patient data
              </p>
              <p className="text-red-600 dark:text-red-300 text-sm">
                {patientDetailError}
              </p>
            </div>
            <button
              onClick={handleRefreshPatientData}
              className="ml-auto px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {!patientDetailLoading && (
        <div className="space-y-6">
          {/* Vital Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Blood Pressure Card */}
            <div className="rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-innerDarkColor overflow-hidden">
              {/* Card Header */}
              <div className="bg-[#103c63] px-4 py-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white text-center flex-1">
                    Blood Pressure
                  </h3>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-4">
                {/* Last Updated */}
                <div className="text-center mb-4">
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                    {realTimeData?.latestBP?.created_at
                      ? `Last: ${new Date(
                          realTimeData.latestBP.created_at
                        ).toLocaleString()}`
                      : "No data available"}
                  </span>
                </div>

                {/* Main BP Data */}
                <div className="text-center py-4">
                  {realTimeData?.latestBP?.data ? (
                    <>
                      <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        {realTimeData.latestBP.data.systolic}
                        <span className="text-2xl">/</span>
                        {realTimeData.latestBP.data.diastolic}
                        <span className="text-lg font-normal ml-1">mmHg</span>
                      </div>

                      {/* Additional Metrics */}
                      <div className="grid grid-cols-2 gap-3 mt-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {realTimeData.latestBP.data.pulse || "-"}
                          </div>
                          <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                            Pulse (BPM)
                          </div>
                        </div>
                        <div
                          className={`rounded-lg p-3 ${
                            realTimeData.latestBP.data.deviceInfo
                              ?.batteryLevel <= 20
                              ? "bg-red-100 dark:bg-red-900/30"
                              : "bg-green-50 dark:bg-green-900/20"
                          }`}
                        >
                          <div
                            className={`text-2xl font-bold ${
                              realTimeData.latestBP.data.deviceInfo
                                ?.batteryLevel <= 20
                                ? "text-red-600 dark:text-red-400"
                                : "text-green-600 dark:text-green-400"
                            }`}
                          >
                            {realTimeData.latestBP.data.deviceInfo
                              ?.batteryLevel || "-"}
                            %
                          </div>
                          <div
                            className={`text-xs ${
                              realTimeData.latestBP.data.deviceInfo
                                ?.batteryLevel <= 20
                                ? "text-red-600 dark:text-red-400"
                                : "text-green-600 dark:text-green-400"
                            }`}
                          >
                            Battery
                          </div>
                        </div>
                      </div>

                      {/* Device Info */}
                      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                        Device:{" "}
                        {realTimeData.latestBP.data.deviceInfo?.name ||
                          "Unknown"}
                      </div>

                      {/* Status Indicator */}
                      <div className="mt-4">
                        {(() => {
                          const systolic = realTimeData.latestBP.data.systolic;
                          const diastolic =
                            realTimeData.latestBP.data.diastolic;
                          let status = "normal";
                          let statusText = "Normal";

                          if (systolic >= 140 || diastolic >= 90) {
                            status = "high";
                            statusText = "High";
                          } else if (systolic <= 90 || diastolic <= 60) {
                            status = "low";
                            statusText = "Low";
                          }

                          return (
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                status === "normal"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                  : status === "high"
                                  ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                              }`}
                            >
                              {statusText}
                            </span>
                          );
                        })()}
                      </div>
                    </>
                  ) : (
                    <div className="py-8">
                      <div className="text-2xl font-semibold text-gray-400 dark:text-gray-500 mb-2">
                        No Data
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-600">
                        Blood pressure reading not available
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Enhanced SpO2 Card */}
            <div className="rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-innerDarkColor overflow-hidden">
              {/* Card Header */}
              <div className="bg-[#103c63] px-4 py-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white text-center flex-1">
                    SpO₂ Level
                  </h3>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-4">
                {/* Last Updated */}
                <div className="text-center mb-4">
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                    {realTimeData?.latestSpO2?.created_at
                      ? `Last: ${new Date(
                          realTimeData.latestSpO2.created_at
                        ).toLocaleString()}`
                      : "No data available"}
                  </span>
                </div>

                {/* Main SpO2 Data */}
                <div className="text-center py-4">
                  {realTimeData?.latestSpO2?.data ? (
                    <>
                      {/* Main SpO2 Value */}
                      <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        {realTimeData.latestSpO2.data.spo2}
                        <span className="text-lg font-normal ml-1">%</span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Oxygen Saturation
                      </div>

                      {/* Primary Metrics Grid */}
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2">
                          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            {realTimeData.latestSpO2.data.pulse
                              ? Math.round(realTimeData.latestSpO2.data.pulse)
                              : "-"}
                          </div>
                          <div className="text-xs text-blue-600 dark:text-blue-400">
                            Pulse
                          </div>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-2">
                          <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                            {realTimeData.latestSpO2.data.pi
                              ? `${realTimeData.latestSpO2.data.pi}%`
                              : "-"}
                          </div>
                          <div className="text-xs text-purple-600 dark:text-purple-400">
                            PI
                          </div>
                        </div>
                        <div
                          className={`rounded-lg p-2 ${
                            realTimeData.latestSpO2.data.deviceInfo
                              ?.batteryLevel <= 20
                              ? "bg-red-100 dark:bg-red-900/30"
                              : "bg-green-50 dark:bg-green-900/20"
                          }`}
                        >
                          <div
                            className={`text-lg font-bold ${
                              realTimeData.latestSpO2.data.deviceInfo
                                ?.batteryLevel <= 20
                                ? "text-red-600 dark:text-red-400"
                                : "text-green-600 dark:text-green-400"
                            }`}
                          >
                            {realTimeData.latestSpO2.data.deviceInfo
                              ?.batteryLevel
                              ? `${realTimeData.latestSpO2.data.deviceInfo.batteryLevel}%`
                              : "-"}
                          </div>
                          <div
                            className={`text-xs ${
                              realTimeData.latestSpO2.data.deviceInfo
                                ?.batteryLevel <= 20
                                ? "text-red-600 dark:text-red-400"
                                : "text-green-600 dark:text-green-400"
                            }`}
                          >
                            Battery
                          </div>
                        </div>
                      </div>

                      {/* Detailed SpO2 Range Information */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3">
                          <div className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-1">
                            SpO₂ Range
                          </div>
                          <div className="text-xs text-amber-600 dark:text-amber-400">
                            Min: {realTimeData.latestSpO2.data.minSpo2 || "-"}%
                          </div>
                          <div className="text-xs text-amber-600 dark:text-amber-400">
                            Max: {realTimeData.latestSpO2.data.maxSpo2 || "-"}%
                          </div>
                        </div>
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-3">
                          <div className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
                            Pulse Range
                          </div>
                          <div className="text-xs text-indigo-600 dark:text-indigo-400">
                            Min: {realTimeData.latestSpO2.data.minPulse || "-"}{" "}
                            BPM
                          </div>
                          <div className="text-xs text-indigo-600 dark:text-indigo-400">
                            Max: {realTimeData.latestSpO2.data.maxPulse || "-"}{" "}
                            BPM
                          </div>
                        </div>
                      </div>

                      {/* Duration Information */}
                      {realTimeData.latestSpO2.data.duration && (
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 mb-4">
                          <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">
                            Session Duration
                          </div>
                          <div className="text-lg font-bold text-slate-800 dark:text-slate-200">
                            {Math.round(
                              realTimeData.latestSpO2.data.duration / 1000
                            )}{" "}
                            seconds
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-500">
                            {realTimeData.latestSpO2.data.duration} ms
                          </div>
                        </div>
                      )}

                      {/* Device Info */}
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                        Device:{" "}
                        {realTimeData.latestSpO2.data.deviceInfo?.name ||
                          "Unknown"}
                      </div>

                      {/* Status Indicator */}
                      <div className="mb-2">
                        {(() => {
                          const spo2Value = realTimeData.latestSpO2.data.spo2;
                          let status = "normal";
                          let statusText = "Normal";

                          if (spo2Value >= 95) {
                            status = "normal";
                            statusText = "Normal";
                          } else if (spo2Value >= 90) {
                            status = "warning";
                            statusText = "Low";
                          } else {
                            status = "critical";
                            statusText = "Critical";
                          }

                          return (
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                status === "normal"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                  : status === "warning"
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                              }`}
                            >
                              {statusText}
                            </span>
                          );
                        })()}
                      </div>
                    </>
                  ) : (
                    <div className="py-8">
                      <div className="text-2xl font-semibold text-gray-400 dark:text-gray-500 mb-2">
                        No Data
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-600">
                        SpO₂ reading not available
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ECG Card - Not Developed */}
            <div className="rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-innerDarkColor overflow-hidden">
              {/* Card Header */}
              <div className="bg-[#103c63] px-4 py-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white text-center flex-1">
                    ECG Status
                  </h3>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-4">
                <div className="text-center mb-4">
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                    Feature in development
                  </span>
                </div>

                <div className="text-center py-8">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                      <Zap className="w-8 h-8 text-gray-400" />
                    </div>
                  </div>
                  <div className="text-xl font-semibold text-gray-400 dark:text-gray-500 mb-2">
                    Coming Soon
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-600 max-w-xs mx-auto">
                    ECG monitoring feature is currently under development and
                    will be available in a future update.
                  </div>
                </div>

                {/* Simulated ECG Display */}
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-xs text-gray-500 dark:text-gray-400 text-center mb-2">
                    Preview - Under Development
                  </div>
                  <div className="relative h-20 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {/* Simulated ECG Waveform */}
                    <svg viewBox="0 0 100 20" className="w-full h-full">
                      <path
                        d="M0,10 Q10,5 20,10 T40,10 T60,15 T80,5 T100,10"
                        stroke="#e5e7eb"
                        strokeWidth="0.5"
                        fill="none"
                      />
                      <path
                        d="M0,10 Q10,15 20,10 T40,10 T60,5 T80,15 T100,10"
                        stroke="#9ca3af"
                        strokeWidth="0.3"
                        fill="none"
                        strokeDasharray="1,1"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons Row - Placed below the cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Blood Pressure Actions */}
            <div className="flex justify-center space-x-8">
              <button
                type="button"
                onClick={(e) => navigateToVital("overview", "bp", e)}
                className="flex flex-col items-center text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-2">
                  <List className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm font-medium">View Data</span>
                <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Blood Pressure
                </span>
              </button>
              <button
                type="button"
                onClick={(e) => navigateToVital("history", "bp", e)}
                className="flex flex-col items-center text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-2">
                  <BarChart className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-sm font-medium">View Graph</span>
                <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Blood Pressure
                </span>
              </button>
            </div>

            {/* SpO2 Actions */}
            <div className="flex justify-center space-x-8">
              <button
                type="button"
                onClick={(e) => navigateToVital("overview", "spo2", e)}
                className="flex flex-col items-center text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-2">
                  <List className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm font-medium">View Data</span>
                <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  SpO₂ Level
                </span>
              </button>
              <button
                type="button"
                onClick={(e) => navigateToVital("history", "spo2", e)}
                className="flex flex-col items-center text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-2">
                  <BarChart className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-sm font-medium">View Graph</span>
                <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  SpO₂ Level
                </span>
              </button>
            </div>

            {/* ECG Actions - Disabled */}
            <div className="flex justify-center space-x-8 opacity-50">
              <button
                type="button"
                disabled
                className="flex flex-col items-center text-gray-400 dark:text-gray-600 cursor-not-allowed p-4 rounded-lg"
              >
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-2">
                  <List className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                </div>
                <span className="text-sm font-medium">View Data</span>
                <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  ECG Status
                </span>
              </button>
              <button
                type="button"
                disabled
                className="flex flex-col items-center text-gray-400 dark:text-gray-600 cursor-not-allowed p-4 rounded-lg"
              >
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-2">
                  <BarChart className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                </div>
                <span className="text-sm font-medium">View Graph</span>
                <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  ECG Status
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientModal;
