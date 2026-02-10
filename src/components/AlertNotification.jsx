// import React, { useState, useEffect, useRef } from "react";
// import { Bell, User, Phone, X, MessageSquare } from "lucide-react";
// import { useSocket } from "../context/SocketContext";

// const AlertNotification = () => {
//   const { alerts, newAlert, clearNewAlert } = useSocket();
//   const [visibleAlerts, setVisibleAlerts] = useState([]);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [currentAlert, setCurrentAlert] = useState(null);
//   const audioRef = useRef(null);
//   const animationIntervalRef = useRef(null);
//   const shownNotificationsRef = useRef(new Set());
//   const stopRequestedRef = useRef(false); // track when user explicitly requested stop

//   // Chat UI state: which alert has chat open and draft messages
//   const [chatOpenMap, setChatOpenMap] = useState({}); // { [alertId]: true }
//   const [chatMessageMap, setChatMessageMap] = useState({}); // { [alertId]: "..." }
//   const chatInputRefs = useRef({}); // refs to focus inputs

//   // API base (same pattern as ChatInterface)
//   const API_BASE = import.meta.env.VITE_BACKEND_API || "http://localhost:4000";

//   // helper to find current user id (same fallback pattern used elsewhere)
//   const getCurrentUserId = () => {
//     try {
//       const userData = localStorage.getItem("user");
//       if (userData) {
//         const user = JSON.parse(userData);
//         return user.id;
//       }
//     } catch (err) {
//       // ignore
//     }
//     return null;
//   };

//   // Sound files configuration
//   const alertSounds = {
//     high: {
//       audio: "/sounds/high.mp3",
//       message: "CRITICAL ALERT! Patient needs immediate attention!",
//       color: "border-red-500 bg-red-50",
//       textColor: "text-red-800",
//       icon: "🚨",
//       bgColor: "bg-red-100",
//       animation: "emergency-pulse",
//     },
//     medium: {
//       audio: "/sounds/medium.mp3",
//       message: "URGENT ALERT! Patient requires attention!",
//       color: "border-orange-500 bg-orange-50",
//       textColor: "text-orange-800",
//       icon: "⚠️",
//       bgColor: "bg-orange-100",
//       animation: "warning-pulse",
//     },
//     low: {
//       audio: "/sounds/low.wav",
//       message: "PATIENT ALERT! Please check patient status.",
//       color: "border-blue-500 bg-blue-50",
//       textColor: "text-blue-800",
//       icon: "ℹ️",
//       bgColor: "bg-blue-100",
//       animation: "info-pulse",
//     },
//   };

//   // Handle new alerts from SocketContext
//   useEffect(() => {
//     if (newAlert) {
//       try {
//         const incomingId = newAlert?.alert?.id || newAlert?.id;

//         // Add to visible alerts only if not already present
//         setVisibleAlerts((prev) => {
//           if (incomingId && prev.some((a) => (a?.alert?.id || a?.id) === incomingId)) {
//             return prev;
//           }
//           const updated = [newAlert, ...prev];
//           return sortAlertsByPriority(updated);
//         });

//         // Set as current alert and start playing sound
//         setCurrentAlert(newAlert);

//         // Play sound continuously - DO NOT set stopRequested here (internal stop)
//         const alertType = newAlert.alert?.type || newAlert.type || "medium";
//         playContinuousSound(alertType);

//         // Show browser notification (dedupe inside)
//         showBrowserNotification(newAlert);

//         clearNewAlert();
//       } catch (error) {
//         console.error("❌ Error processing new alert:", error);
//         console.error("❌ Alert data that caused error:", newAlert);
//       }
//     }
//   }, [newAlert, clearNewAlert]);

//   // Sort alerts by priority: high -> medium -> low
//   const sortAlertsByPriority = (alerts) => {
//     const priorityOrder = { high: 1, medium: 2, low: 3 };
//     return alerts.sort((a, b) => {
//       const aType = a.alert?.type || a.type || "medium";
//       const bType = b.alert?.type || b.type || "medium";
//       const aPriority = priorityOrder[aType] || 999;
//       const bPriority = priorityOrder[bType] || 999;
//       return aPriority - bPriority;
//     });
//   };

//   // Play sound continuously until stopped
//   const playContinuousSound = (alertType) => {
//     try {
//       const soundConfig = alertSounds[alertType] || alertSounds.high;

//       // Reset user stop flag for new play attempt
//       stopRequestedRef.current = false;

//       // Stop any existing audio WITHOUT marking it as a user-requested stop
//       stopAllSounds(false);

//       // Create new audio element
//       audioRef.current = new Audio(soundConfig.audio);
//       audioRef.current.loop = true;
//       audioRef.current.volume = getVolumeForAlertType(alertType);

//       audioRef.current
//         .play()
//         .then(() => {
//           setIsPlaying(true);
//         })
//         .catch((error) => {
//           // fallback to speech synthesis if audio autoplay blocked or failed
//           speakAlertMessage(alertType, true);
//         });

//       audioRef.current.onerror = () => {
//         speakAlertMessage(alertType, true);
//       };
//     } catch (error) {
//       speakAlertMessage(alertType, true);
//     }
//   };

//   const getVolumeForAlertType = (alertType) => {
//     switch (alertType) {
//       case "high":
//         return 0.8;
//       case "medium":
//         return 0.6;
//       case "low":
//         return 0.4;
//       default:
//         return 0.5;
//     }
//   };

//   /**
//    * Stop all sounds.
//    * @param {boolean} userRequested - if true, this was an explicit user "Stop Alert" and we should prevent future speech/autoplay.
//    *                                  if false, it's internal cleanup/replace and we should allow new playback to start.
//    */
//   const stopAllSounds = (userRequested = true) => {
//     try {
//       // If user explicitly requested stop, set flag so speech won't restart.
//       if (userRequested) stopRequestedRef.current = true;

//       if (audioRef.current) {
//         try {
//           audioRef.current.pause();
//           audioRef.current.currentTime = 0;
//         } catch (err) {
//           // ignore audio element errors
//         }
//         audioRef.current = null;
//       }

//       // cancel any ongoing or queued speech synthesis
//       if ("speechSynthesis" in window) {
//         try {
//           window.speechSynthesis.cancel();
//         } catch (err) {
//           // ignore
//         }
//       }
//     } finally {
//       setIsPlaying(false);
//     }
//   };

//   // Speak alert message using speech synthesis; supports continuous mode but respects stopRequestedRef
//   const speakAlertMessage = (alertType, continuous = false) => {
//     const soundConfig = alertSounds[alertType] || alertSounds.high;

//     if (!("speechSynthesis" in window)) return;

//     // Do not start if user already explicitly stopped alerts
//     if (stopRequestedRef.current) return;

//     const utterance = new SpeechSynthesisUtterance(soundConfig.message);
//     utterance.volume = getVolumeForAlertType(alertType);
//     utterance.rate = 0.8;
//     utterance.pitch = 1.2;

//     utterance.onend = () => {
//       // only schedule next repetition if continuous AND stop not requested
//       if (continuous && !stopRequestedRef.current) {
//         setTimeout(() => {
//           if (!stopRequestedRef.current) speakAlertMessage(alertType, true);
//         }, 2000);
//       }
//     };

//     try {
//       window.speechSynthesis.speak(utterance);
//     } catch (err) {
//       // ignore
//     }
//   };

//   // Show browser notification
//   const showBrowserNotification = (alertData) => {
//     if (!("Notification" in window) || Notification.permission !== "granted") return;

//     const alert = alertData.alert || alertData;
//     const patient = alertData.patient || {};
//     const id = alert?.id || alertData?.id;

//     if (id && shownNotificationsRef.current.has(id)) return;
//     if (id) shownNotificationsRef.current.add(id);

//     new Notification(`${alert.type?.toUpperCase()} Alert`, {
//       body: `${alert.desc}${patient.name ? ` - ${patient.name}` : ""}`,
//       icon: "/favicon.ico",
//       tag: `alert-${id}`,
//     });
//   };

//   // Request notification permission
//   useEffect(() => {
//     if ("Notification" in window && Notification.permission === "default") {
//       Notification.requestPermission();
//     }
//   }, []);

//   // Cleanup on unmount
//   useEffect(() => {
//     return () => {
//       // treat as user stop on unmount to ensure speech is cancelled
//       stopAllSounds(true);
//       if (animationIntervalRef.current) {
//         clearInterval(animationIntervalRef.current);
//       }
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // Get alert configuration
//   const getAlertConfig = (alertType) => {
//     return alertSounds[alertType] || alertSounds.medium;
//   };

//   const currentConfig = currentAlert
//     ? getAlertConfig(currentAlert.alert?.type || currentAlert.type)
//     : null;

//   // --- Chat handlers ---
//   const toggleChatForAlert = (alertId) => {
//     setChatOpenMap((prev) => {
//       const next = { ...prev, [alertId]: !prev[alertId] };
//       // if opening, focus the input shortly after render
//       if (next[alertId]) {
//         setTimeout(() => {
//           const ref = chatInputRefs.current[alertId];
//           if (ref && ref.focus) ref.focus();
//         }, 50);
//       }
//       return next;
//     });
//   };

//   const handleChatInputChange = (alertId, value) => {
//     setChatMessageMap((prev) => ({ ...prev, [alertId]: value }));
//   };

//   // Modified: call the same API as ChatInterface (/api/messages/send)
//   const handleSendChat = async (alertId, alertData) => {
//     const message = (chatMessageMap[alertId] || "").trim();
//     if (!message) return;

//     // Try to obtain receiver id from alertData.patient
//     const receiverId = alertData?.patient?.id || alertData?.patient?.patient_id || null;

//     // Keep original dispatch for compatibility (some consumers might listen)
//     try {
//       window.dispatchEvent(
//         new CustomEvent("alertChatMessage", {
//           detail: {
//             alertId,
//             message,
//             alert: alertData.alert || alertData,
//             patient: alertData.patient || null,
//             timestamp: new Date().toISOString(),
//           },
//         })
//       );
//     } catch (err) {
//       // ignore
//     }

//     // Call the same HTTP API used in ChatInterface
//     try {
//       if (!receiverId) {
//         console.error("No receiverId found for alert chat - cannot send via API");
//       } else {
//         await fetch(`${API_BASE}/api/messages/send`, {
//           method: "POST",
//           credentials: "include",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             receiverId: receiverId,
//             message: message,
//           }),
//         });
//         // We intentionally don't try to replicate the full optimistic UI here —
//         // the main ChatInterface + socket will populate the conversation as usual.
//       }
//     } catch (error) {
//       console.error("Failed to send alert chat via HTTP API:", error);
//     }

//     // reset draft & close chat input (keeps UX identical)
//     setChatMessageMap((prev) => ({ ...prev, [alertId]: "" }));
//     setChatOpenMap((prev) => ({ ...prev, [alertId]: false }));
//   };

//   // Render chat box inline under the alert content
//   const renderChatBox = (alertId, alertData) => {
//     const isOpen = !!chatOpenMap[alertId];
//     const draft = chatMessageMap[alertId] || "";

//     if (!isOpen) return null;

//     return (
//       <div className="mt-3">
//         <div className="flex items-center space-x-2">
//           <input
//             ref={(el) => (chatInputRefs.current[alertId] = el)}
//             value={draft}
//             onChange={(e) => handleChatInputChange(alertId, e.target.value)}
//             placeholder="Write a quick message to clinician..."
//             className="flex-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-offset-1"
//           />
//           <button
//             onClick={() => handleSendChat(alertId, alertData)}
//             className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
//           >
//             Send
//           </button>
//           <button
//             onClick={() => toggleChatForAlert(alertId)}
//             className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
//           >
//             Close
//           </button>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <>
//       {/* Full Screen Animation Overlay */}
//       {currentAlert && currentConfig && (
//         <div
//           className={`fixed inset-0 z-40 pointer-events-none ${currentConfig.bgColor} ${currentConfig.animation} opacity-20`}
//         ></div>
//       )}

//       {/* Alert Bell - Fixed Position */}
//       <div className="fixed top-4 right-4 z-50">
//         <div className="bg-red-500 p-3 rounded-lg shadow-lg pointer-events-auto">
//           <Bell className="h-6 w-6 animate-pulse text-white" />
//         </div>
//       </div>

//       {/* Multiple Alerts Container - Organized by Priority */}
//       {visibleAlerts.length > 0 && (
//         <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 max-w-sm space-y-3 max-h-[80vh] overflow-y-auto scrollbar-hide pointer-events-auto">
//           {visibleAlerts.map((alertData, index) => {
//             const alert = alertData.alert;
//             const config = getAlertConfig(alert.type);
//             const isCurrentAlert = currentAlert && currentAlert.alert.id === alert.id;
//             const alertId = alert.id || alertData.id || index;

//             return (
//               <div
//                 key={alert.id || index}
//                 className={`border-l-4 p-4 rounded-lg shadow-lg animate-slide-in ${config.color} ${
//                   isCurrentAlert ? "ring-2 ring-red-500 ring-opacity-50" : ""
//                 } ${isCurrentAlert ? "animate-shake" : ""} ${index === 0 ? "border-2 border-yellow-400" : ""}`}
//                 style={{
//                   zIndex: 1000 - index,
//                 }}
//               >
//                 <div className="flex items-start space-x-3">
//                   <div className={`p-2 rounded-full ${config.bgColor}`}>
//                     <span className="text-2xl">{config.icon}</span>
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <div className="flex items-center justify-between">
//                       <p className={`text-lg font-bold ${config.textColor}`}>{alert.type?.toUpperCase()} ALERT</p>

//                       <div className="flex items-center space-x-2">
//                         {/* CHAT button (added) */}
//                         {/* CHAT button (visible + consistent) */}
// <button
//   onClick={() => toggleChatForAlert(alertId)}
//   title="Chat with clinician"
//   className="flex items-center space-x-2 px-2 py-1 text-xs text-gray-600 hover:text-gray-800 rounded"
// >
//   <MessageSquare className="h-4 w-4" />
//   <span className="hidden sm:inline">Chat</span>
// </button>


//                         <button
//                           onClick={() => {
//                             setVisibleAlerts((prev) => prev.filter((_, i) => i !== index));
//                             if (isCurrentAlert) {
//                               setCurrentAlert(null);
//                               // treat this as user stop so speech/audio won't restart
//                               stopAllSounds(true);
//                             }
//                           }}
//                           className="text-gray-400 hover:text-gray-600"
//                         >
//                           <X className="h-5 w-5" />
//                         </button>
//                       </div>
//                     </div>

//                     <p className={`mt-1 text-sm ${config.textColor}`}>{alert.desc}</p>

//                     {alertData.patient && (
//                       <div className="mt-2 flex items-center space-x-2 text-xs text-gray-600">
//                         <User className="h-3 w-3" />
//                         <span>{alertData.patient.name}</span>
//                         {alertData.patient.phoneNumber && (
//                           <>
//                             <Phone className="h-3 w-3 ml-2" />
//                             <span>{alertData.patient.phoneNumber}</span>
//                           </>
//                         )}
//                       </div>
//                     )}

//                     {/* Chat box (toggleable) */}
//                     {renderChatBox(alertId, alertData)}

//                     <div className="mt-2 flex items-center justify-between">
//                       <span className="text-xs text-gray-500">{new Date(alert.created_at).toLocaleTimeString()}</span>
//                       <div className="flex space-x-2">
//                         <button
//                           onClick={() => {
//                             // dispatch markAlertRead event so Navbar will mark as read and decrement counter
//                             try {
//                               const id = alert.id || alertData.id;
//                               window.dispatchEvent(
//                                 new CustomEvent("markAlertRead", {
//                                   detail: { alertId: id ?? null },
//                                 })
//                               );
//                             } catch (err) {
//                               // ignore
//                             }

//                             // remove this alert from visible alerts
//                             setVisibleAlerts((prev) => prev.filter((_, i) => i !== index));

//                             // if it was the currently-playing alert, also stop sound and clear it (user stop)
//                             if (isCurrentAlert) {
//                               setCurrentAlert(null);
//                               stopAllSounds(true);
//                             }
//                           }}
//                           className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
//                         >
//                           Stop Alert
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </>
//   );
// };

// export default AlertNotification;
import React, { useState, useEffect, useRef } from "react";
import { Bell, User, Phone, X, MessageSquare } from "lucide-react";
import { useSocket } from "../context/SocketContext";

const AlertNotification = () => {
  const { alerts, newAlert, clearNewAlert } = useSocket();
  const [visibleAlerts, setVisibleAlerts] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAlert, setCurrentAlert] = useState(null);
  const audioRef = useRef(null);
  const animationIntervalRef = useRef(null);
  const shownNotificationsRef = useRef(new Set());
  const stopRequestedRef = useRef(false); // track when user explicitly requested stop

  // Chat UI state: which alert has chat open and draft messages
  const [chatOpenMap, setChatOpenMap] = useState({}); // { [alertId]: true }
  const [chatMessageMap, setChatMessageMap] = useState({}); // { [alertId]: "..." }
  const chatInputRefs = useRef({}); // refs to focus inputs

  // API base (same pattern as ChatInterface)
  const API_BASE = import.meta.env.VITE_BACKEND_API || "http://localhost:4000";

  // helper to find current user id (same fallback pattern used elsewhere)
  const getCurrentUserId = () => {
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        return user.id;
      }
    } catch (err) {
      // ignore
    }
    return null;
  };

  // Sound files configuration (added 'abnormal')
  const alertSounds = {
    high: {
      audio: "/sounds/high.mp3",
      message: "CRITICAL ALERT! Patient needs immediate attention!",
      color: "border-red-500 bg-red-50",
      textColor: "text-red-800",
      icon: "🚨",
      bgColor: "bg-red-100",
      animation: "emergency-pulse",
    },
    medium: {
      audio: "/sounds/medium.mp3",
      message: "URGENT ALERT! Patient requires attention!",
      color: "border-orange-500 bg-orange-50",
      textColor: "text-orange-800",
      icon: "⚠️",
      bgColor: "bg-orange-100",
      animation: "warning-pulse",
    },
    low: {
      audio: "/sounds/low.wav",
      message: "PATIENT ALERT! Please check patient status.",
      color: "border-blue-500 bg-blue-50",
      textColor: "text-blue-800",
      icon: "ℹ️",
      bgColor: "bg-blue-100",
      animation: "info-pulse",
    },
    abnormal: {
      audio: "/sounds/abnormal.mp3",
      message: "ABNORMAL READING! Mixed high/low — review required!",
      color: "border-purple-500 bg-purple-50",
      textColor: "text-purple-800",
      icon: "⚡️",
      bgColor: "bg-purple-100",
      animation: "abnormal-pulse",
    },
  };

  // Handle new alerts from SocketContext
  useEffect(() => {
    if (newAlert) {
      try {
        const incomingId = newAlert?.alert?.id || newAlert?.id;

        // Add to visible alerts only if not already present
        setVisibleAlerts((prev) => {
          if (incomingId && prev.some((a) => (a?.alert?.id || a?.id) === incomingId)) {
            return prev;
          }
          const updated = [newAlert, ...prev];
          return sortAlertsByPriority(updated);
        });

        // Set as current alert and start playing sound
        setCurrentAlert(newAlert);

        // Play sound continuously - DO NOT set stopRequested here (internal stop)
        const alertType = (newAlert.alert?.type || newAlert.type || "medium").toLowerCase();
        playContinuousSound(alertType);

        // Show browser notification (dedupe inside)
        showBrowserNotification(newAlert);

        clearNewAlert();
      } catch (error) {
        console.error("❌ Error processing new alert:", error);
        console.error("❌ Alert data that caused error:", newAlert);
      }
    }
  }, [newAlert, clearNewAlert]);

  // Sort alerts by priority: abnormal/high -> medium -> low
  const sortAlertsByPriority = (alerts) => {
    const priorityOrder = { abnormal: 1, high: 1, medium: 2, low: 3 };
    return alerts.sort((a, b) => {
      const aType = (a.alert?.type || a.type || "medium").toLowerCase();
      const bType = (b.alert?.type || b.type || "medium").toLowerCase();
      const aPriority = priorityOrder[aType] || 999;
      const bPriority = priorityOrder[bType] || 999;
      return aPriority - bPriority;
    });
  };

  // Play sound continuously until stopped
  const playContinuousSound = (alertType) => {
    try {
      const soundConfig = alertSounds[alertType] || alertSounds.high;

      // Reset user stop flag for new play attempt
      stopRequestedRef.current = false;

      // Stop any existing audio WITHOUT marking it as a user-requested stop
      stopAllSounds(false);

      // Create new audio element
      audioRef.current = new Audio(soundConfig.audio);
      audioRef.current.loop = true;
      audioRef.current.volume = getVolumeForAlertType(alertType);

      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((error) => {
          // fallback to speech synthesis if audio autoplay blocked or failed
          speakAlertMessage(alertType, true);
        });

      audioRef.current.onerror = () => {
        speakAlertMessage(alertType, true);
      };
    } catch (error) {
      speakAlertMessage(alertType, true);
    }
  };

  const getVolumeForAlertType = (alertType) => {
    switch (alertType) {
      case "high":
        return 0.8;
      case "abnormal":
        return 0.75;
      case "medium":
        return 0.6;
      case "low":
        return 0.4;
      default:
        return 0.5;
    }
  };

  /**
   * Stop all sounds.
   * @param {boolean} userRequested - if true, this was an explicit user "Stop Alert" and we should prevent future speech/autoplay.
   *                                  if false, it's internal cleanup/replace and we should allow new playback to start.
   */
  const stopAllSounds = (userRequested = true) => {
    try {
      // If user explicitly requested stop, set flag so speech won't restart.
      if (userRequested) stopRequestedRef.current = true;

      if (audioRef.current) {
        try {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        } catch (err) {
          // ignore audio element errors
        }
        audioRef.current = null;
      }

      // cancel any ongoing or queued speech synthesis
      if ("speechSynthesis" in window) {
        try {
          window.speechSynthesis.cancel();
        } catch (err) {
          // ignore
        }
      }
    } finally {
      setIsPlaying(false);
    }
  };

  // Speak alert message using speech synthesis; supports continuous mode but respects stopRequestedRef
  const speakAlertMessage = (alertType, continuous = false) => {
    const soundConfig = alertSounds[alertType] || alertSounds.high;

    if (!("speechSynthesis" in window)) return;

    // Do not start if user already explicitly stopped alerts
    if (stopRequestedRef.current) return;

    const utterance = new SpeechSynthesisUtterance(soundConfig.message);
    utterance.volume = getVolumeForAlertType(alertType);
    utterance.rate = 0.8;
    utterance.pitch = 1.2;

    utterance.onend = () => {
      // only schedule next repetition if continuous AND stop not requested
      if (continuous && !stopRequestedRef.current) {
        setTimeout(() => {
          if (!stopRequestedRef.current) speakAlertMessage(alertType, true);
        }, 2000);
      }
    };

    try {
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      // ignore
    }
  };

  // Show browser notification
  const showBrowserNotification = (alertData) => {
    if (!("Notification" in window) || Notification.permission !== "granted") return;

    const alert = alertData.alert || alertData;
    const patient = alertData.patient || {};
    const id = alert?.id || alertData?.id;

    if (id && shownNotificationsRef.current.has(id)) return;
    if (id) shownNotificationsRef.current.add(id);

    new Notification(`${(alert.type || alertData.type || "").toUpperCase()} Alert`, {
      body: `${alert.desc}${patient.name ? ` - ${patient.name}` : ""}`,
      icon: "/favicon.ico",
      tag: `alert-${id}`,
    });
  };

  // Request notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // treat as user stop on unmount to ensure speech is cancelled
      stopAllSounds(true);
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Get alert configuration
  const getAlertConfig = (alertType) => {
    const key = (alertType || "").toLowerCase();
    return alertSounds[key] || alertSounds.medium;
  };

  const currentConfig = currentAlert
    ? getAlertConfig(currentAlert.alert?.type || currentAlert.type)
    : null;

  // --- Chat handlers ---
  const toggleChatForAlert = (alertId) => {
    setChatOpenMap((prev) => {
      const next = { ...prev, [alertId]: !prev[alertId] };
      // if opening, focus the input shortly after render
      if (next[alertId]) {
        setTimeout(() => {
          const ref = chatInputRefs.current[alertId];
          if (ref && ref.focus) ref.focus();
        }, 50);
      }
      return next;
    });
  };

  const handleChatInputChange = (alertId, value) => {
    setChatMessageMap((prev) => ({ ...prev, [alertId]: value }));
  };

  // Modified: call the same API as ChatInterface (/api/messages/send)
  const handleSendChat = async (alertId, alertData) => {
    const message = (chatMessageMap[alertId] || "").trim();
    if (!message) return;

    // Try to obtain receiver id from alertData.patient
    const receiverId = alertData?.patient?.id || alertData?.patient?.patient_id || null;

    // Keep original dispatch for compatibility (some consumers might listen)
    try {
      window.dispatchEvent(
        new CustomEvent("alertChatMessage", {
          detail: {
            alertId,
            message,
            alert: alertData.alert || alertData,
            patient: alertData.patient || null,
            timestamp: new Date().toISOString(),
          },
        })
      );
    } catch (err) {
      // ignore
    }

    // Call the same HTTP API used in ChatInterface
    try {
      if (!receiverId) {
        console.error("No receiverId found for alert chat - cannot send via API");
      } else {
        await fetch(`${API_BASE}/api/messages/send`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            receiverId: receiverId,
            message: message,
          }),
        });
        // We intentionally don't try to replicate the full optimistic UI here — 
        // the main ChatInterface + socket will populate the conversation as usual.
      }
    } catch (error) {
      console.error("Failed to send alert chat via HTTP API:", error);
    }

    // reset draft & close chat input (keeps UX identical)
    setChatMessageMap((prev) => ({ ...prev, [alertId]: "" }));
    setChatOpenMap((prev) => ({ ...prev, [alertId]: false }));
  };

  // Render chat box inline under the alert content
  const renderChatBox = (alertId, alertData) => {
    const isOpen = !!chatOpenMap[alertId];
    const draft = chatMessageMap[alertId] || "";

    if (!isOpen) return null;

    return (
      <div className="mt-3">
        <div className="flex items-center space-x-2">
          <input
            ref={(el) => (chatInputRefs.current[alertId] = el)}
            value={draft}
            onChange={(e) => handleChatInputChange(alertId, e.target.value)}
            placeholder="Write a quick message to clinician..."
            className="flex-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-offset-1"
          />
          <button
            onClick={() => handleSendChat(alertId, alertData)}
            className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
          >
            Send
          </button>
          <button
            onClick={() => toggleChatForAlert(alertId)}
            className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Full Screen Animation Overlay */}
      {currentAlert && currentConfig && (
        <div
          className={`fixed inset-0 z-40 pointer-events-none ${currentConfig.bgColor} ${currentConfig.animation} opacity-20`}
        ></div>
      )}

      {/* Alert Bell - Fixed Position */}
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-red-500 p-3 rounded-lg shadow-lg pointer-events-auto">
          <Bell className="h-6 w-6 animate-pulse text-white" />
        </div>
      </div>

      {/* Multiple Alerts Container - Organized by Priority */}
      {visibleAlerts.length > 0 && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 max-w-sm space-y-3 max-h-[80vh] overflow-y-auto scrollbar-hide pointer-events-auto">
          {visibleAlerts.map((alertData, index) => {
            const alert = alertData.alert;
            const config = getAlertConfig(alert.type);
            const isCurrentAlert = currentAlert && currentAlert.alert.id === alert.id;
            const alertId = alert.id || alertData.id || index;

            return (
              <div
                key={alert.id || index}
                className={`border-l-4 p-4 rounded-lg shadow-lg animate-slide-in ${config.color} ${isCurrentAlert ? "ring-2 ring-red-500 ring-opacity-50" : ""} ${isCurrentAlert ? "animate-shake" : ""} ${index === 0 ? "border-2 border-yellow-400" : ""}`}
                style={{
                  zIndex: 1000 - index,
                }}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full ${config.bgColor}`}>
                    <span className="text-2xl">{config.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-lg font-bold ${config.textColor}`}>{(alert.type || "").toUpperCase()} ALERT</p>

                      <div className="flex items-center space-x-2">
                        {/* CHAT button (added) */}
<button
  onClick={() => toggleChatForAlert(alertId)}
  title="Chat with clinician"
  className="flex items-center space-x-2 px-2 py-1 text-xs text-gray-600 hover:text-gray-800 rounded"
>
  <MessageSquare className="h-4 w-4" />
  <span className="hidden sm:inline">Chat</span>
</button>

                        <button
                          onClick={() => {
                            setVisibleAlerts((prev) => prev.filter((_, i) => i !== index));
                            if (isCurrentAlert) {
                              setCurrentAlert(null);
                              // treat this as user stop so speech/audio won't restart
                              stopAllSounds(true);
                            }
                          }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    <p className={`mt-1 text-sm ${config.textColor}`}>{alert.desc}</p>

                    {/* NEW: Abnormal reading card (shows vitals) */}
                    {((alert.type || "").toLowerCase() === "abnormal" || (alertData.alert?.type || alertData.type || "").toLowerCase() === "abnormal") && (
                      <div className="mt-3 p-2 rounded-md border border-purple-200 bg-purple-50 text-sm text-purple-800">
                        <div className="font-semibold mb-1">ABNORMAL READING</div>
                        {alertData.vital_data ? (
                          <div className="flex flex-col text-xs">
                            <div>Systolic: {alertData.vital_data.systolic ?? "—"}</div>
                            <div>Diastolic: {alertData.vital_data.diastolic ?? "—"}</div>
                          </div>
                        ) : (
                          <div className="text-xs">Vitals not provided</div>
                        )}
                      </div>
                    )}

                    {alertData.patient && (
                      <div className="mt-2 flex items-center space-x-2 text-xs text-gray-600">
                        <User className="h-3 w-3" />
                        <span>{alertData.patient.name}</span>
                        {alertData.patient.phoneNumber && (
                          <>
                            <Phone className="h-3 w-3 ml-2" />
                            <span>{alertData.patient.phoneNumber}</span>
                          </>
                        )}
                      </div>
                    )}

                    {/* Chat box (toggleable) */}
                    {renderChatBox(alertId, alertData)}

                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-gray-500">{new Date(alert.created_at).toLocaleTimeString()}</span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            // dispatch markAlertRead event so Navbar will mark as read and decrement counter
                            try {
                              const id = alert.id || alertData.id;
                              window.dispatchEvent(
                                new CustomEvent("markAlertRead", {
                                  detail: { alertId: id ?? null },
                                })
                              );
                            } catch (err) {
                              // ignore
                            }

                            // remove this alert from visible alerts
                            setVisibleAlerts((prev) => prev.filter((_, i) => i !== index));

                            // if it was the currently-playing alert, also stop sound and clear it (user stop)
                            if (isCurrentAlert) {
                              setCurrentAlert(null);
                              stopAllSounds(true);
                            }
                          }}
                          className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          Stop Alert
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

export default AlertNotification;
