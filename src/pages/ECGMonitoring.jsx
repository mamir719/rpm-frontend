import React, { useState, useEffect, useRef } from "react";

const ECGWaveform = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [isRunning, setIsRunning] = useState(true);
  const [heartRate, setHeartRate] = useState(75);

  const ecgPattern = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.05, 0.15, 0.25, 0.2, 0.1,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -0.1, -0.05, 0, 0.2, 0.6,
    1.0, 0.4, 0.1, 0, -0.15, -0.25, -0.1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.1,
    0.25, 0.35, 0.3, 0.2, 0.1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0,
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let currentX = 0;
    let waveformData = [];
    let lastTime = performance.now();

    const draw = (currentTime) => {
      if (!isRunning) {
        animationRef.current = requestAnimationFrame(draw);
        return;
      }

      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      ctx.fillStyle = getComputedStyle(document.documentElement)
        .getPropertyValue("--canvas-bg")
        .trim();
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drawGrid(ctx, canvas);

      const centerY = canvas.height / 2;
      const amplitude = Math.min(canvas.height * 0.3, 120);
      const speed = 50;
      const beatsPerSecond = heartRate / 60;
      const samplesPerBeat = ecgPattern.length;
      const timePerSample = 1 / (beatsPerSecond * samplesPerBeat);

      currentX += speed * deltaTime;

      if (currentX > canvas.width + 100) {
        currentX = -100;
      }

      const cycleTime = performance.now() / 1000;
      const beatProgress = (cycleTime * beatsPerSecond) % 1;
      const patternIndex = Math.floor(beatProgress * ecgPattern.length);
      const waveValue = ecgPattern[patternIndex] || 0;

      const noise = (Math.random() - 0.5) * 0.02;
      const currentY = centerY - waveValue * amplitude + noise * amplitude;

      waveformData.push({
        x: currentX,
        y: currentY,
        time: currentTime,
      });

      waveformData = waveformData.filter(
        (point) =>
          point.x < canvas.width + 50 && currentTime - point.time < 20000
      );

      if (waveformData.length > 1) {
        ctx.strokeStyle = getComputedStyle(document.documentElement)
          .getPropertyValue("--ecg-trace")
          .trim();
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        ctx.beginPath();
        for (let i = 0; i < waveformData.length; i++) {
          const point = waveformData[i];
          if (i === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        }
        ctx.stroke();
      }

      ctx.strokeStyle = getComputedStyle(document.documentElement)
        .getPropertyValue("--sweep-line")
        .trim();
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(currentX, 0);
      ctx.lineTo(currentX, canvas.height);
      ctx.stroke();

      const gradient = ctx.createLinearGradient(
        currentX - 15,
        0,
        currentX + 15,
        0
      );
      gradient.addColorStop(0, "rgba(255, 0, 0, 0)");
      gradient.addColorStop(
        0.5,
        getComputedStyle(document.documentElement)
          .getPropertyValue("--sweep-glow")
          .trim()
      );
      gradient.addColorStop(1, "rgba(255, 0, 0, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(currentX - 15, 0, 30, canvas.height);

      const clearWidth = 5;
      ctx.fillStyle = getComputedStyle(document.documentElement)
        .getPropertyValue("--canvas-bg")
        .trim();
      ctx.fillRect(currentX + 1, 0, clearWidth, canvas.height);

      animationRef.current = requestAnimationFrame(draw);
    };

    const drawGrid = (ctx, canvas) => {
      ctx.strokeStyle = getComputedStyle(document.documentElement)
        .getPropertyValue("--grid-major")
        .trim();
      ctx.lineWidth = 0.5;

      const majorVerticalSpacing = canvas.width / 50;
      for (let i = 0; i <= 50; i++) {
        const x = i * majorVerticalSpacing;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      const majorHorizontalSpacing = canvas.height / 20;
      for (let i = 0; i <= 20; i++) {
        const y = i * majorHorizontalSpacing;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      ctx.strokeStyle = getComputedStyle(document.documentElement)
        .getPropertyValue("--grid-minor")
        .trim();
      ctx.lineWidth = 0.25;

      const minorVerticalSpacing = majorVerticalSpacing / 5;
      for (let i = 0; i <= 250; i++) {
        const x = i * minorVerticalSpacing;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      const minorHorizontalSpacing = majorHorizontalSpacing / 5;
      for (let i = 0; i <= 100; i++) {
        const y = i * minorHorizontalSpacing;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    };

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    animationRef.current = requestAnimationFrame(draw);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [isRunning, heartRate]);

  const toggleRunning = () => {
    setIsRunning(!isRunning);
  };

  return (
    <div className="w-full h-screen bg-darkModeBackGround dark:bg-gray-950 flex flex-col border-gray-500 dark:border-gray-600 border-b shadow-lg rounded-md overflow-hidden">
      <div className="bg-white dark:bg-innerDarkColor p-4 border-b border-gray-700 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-8 bg-red-500 dark:bg-red-600 rounded flex items-center justify-center animate-pulse">
              <span className="text-white dark:text-gray-100 font-bold text-sm">
                EKG
              </span>
            </div>
            <div>
              <h1 className="text-gray-900 dark:text-gray-100 text-xl font-semibold">
                ECG Waveform Display
              </h1>
              <p className="text-gray-400 dark:text-gray-500 text-sm">
                Real-time cardiac monitoring
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-red-400 dark:text-red-300 text-3xl font-bold font-mono">
                {heartRate}
              </div>
              <div className="text-gray-400 dark:text-gray-500 text-xs">
                BPM
              </div>
            </div>
            <div className="text-center">
              <div className="text-green-400 dark:text-green-300 text-lg font-mono">
                98%
              </div>
              <div className="text-gray-400 dark:text-gray-500 text-xs">
                SpO₂
              </div>
            </div>
            <div
              className={`w-3 h-3 rounded-full ${
                isRunning
                  ? "bg-red-400 dark:bg-red-300 animate-pulse"
                  : "bg-gray-400 dark:bg-gray-500"
              }`}
            ></div>
          </div>
        </div>
      </div>

      <div className="flex-1 relative">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{
            "--canvas-bg": "white",
            "--ecg-trace": "#ff0000",
            "--sweep-line": "#ff4444",
            "--sweep-glow": "rgba(255, 0, 0, 0.2)",
            "--grid-major": "rgba(0, 255, 0, 0.3)",
            "--grid-minor": "rgba(0, 255, 0, 0.15)",
          }}
        />
        <div className="absolute top-4 left-4 flex flex-col space-y-2">
          <button
            onClick={toggleRunning}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              isRunning
                ? "bg-red-600 dark:bg-red-700 text-white dark:text-gray-100 shadow-lg shadow-red-600/25 dark:shadow-red-700/25"
                : "bg-green-600 dark:bg-green-700 text-white dark:text-gray-100 shadow-lg shadow-green-600/25 dark:shadow-green-700/25"
            }`}
          >
            {isRunning ? "⏸ Pause" : "▶ Start"}
          </button>
        </div>

        <div className="absolute top-4 right-4 bg-gray-100/90 dark:bg-gray-700/90 backdrop-blur-sm rounded-lg p-4">
          <div className="text-primary dark:text-blue-400 text-sm font-medium mb-2">
            Heart Rate
          </div>
          <input
            type="range"
            min="30"
            max="200"
            value={heartRate}
            onChange={(e) => setHeartRate(parseInt(e.target.value))}
            className="w-32 h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
          />
          <div className="text-primary dark:text-blue-400 text-xs text-center mt-1">
            {heartRate} BPM
          </div>
        </div>
      </div>

      <div className="bg-gray-200 dark:bg-gray-700 p-3 border-t border-gray-700 dark:border-gray-600">
        <div className="flex justify-between items-center text-sm">
          <div className="flex space-x-6 text-gray-400 dark:text-gray-500">
            <span className="flex items-center space-x-2">
              <div className="w-3 h-0.5 bg-red-500 dark:bg-red-400"></div>
              <span>ECG Lead II</span>
            </span>
            <span>Paper Speed: 25 mm/s</span>
            <span>Sensitivity: 10 mm/mV</span>
          </div>
          <div className="flex items-center space-x-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isRunning
                  ? "bg-red-400 dark:bg-red-300 animate-pulse"
                  : "bg-gray-400 dark:bg-gray-500"
              }`}
            ></div>
            <span
              className={`text-sm ${
                isRunning
                  ? "text-red-400 dark:text-red-300"
                  : "text-gray-400 dark:text-gray-500"
              }`}
            >
              {isRunning ? "MONITORING" : "PAUSED"}
            </span>
          </div>
        </div>
      </div>

      <style jsx>{`
        :root {
          --canvas-bg: white;
          --ecg-trace: #ff0000;
          --sweep-line: #ff4444;
          --sweep-glow: rgba(255, 0, 0, 0.2);
          --grid-major: rgba(0, 255, 0, 0.3);
          --grid-minor: rgba(0, 255, 0, 0.15);
        }
        .dark {
          --canvas-bg: #1f2937;
          --ecg-trace: #ef4444;
          --sweep-line: #f87171;
          --sweep-glow: rgba(248, 113, 113, 0.2);
          --grid-major: rgba(74, 222, 128, 0.3);
          --grid-minor: rgba(74, 222, 128, 0.15);
        }
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #dc2626;
          cursor: pointer;
          box-shadow: 0 0 8px rgba(220, 38, 38, 0.5);
        }
        input[type="range"]::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #dc2626;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 8px rgba(220, 38, 38, 0.5);
        }
      `}</style>
    </div>
  );
};

export default ECGWaveform;
