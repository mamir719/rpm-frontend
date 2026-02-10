import React, { useState, useEffect } from "react";

const ThemeToggle = () => {
  // Initialize theme state
  const [theme, setTheme] = useState("light");
  const [isMounted, setIsMounted] = useState(false);

  // Initialize theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    setIsMounted(true);

    // Apply theme to <html> tag
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Apply theme changes and persist to localStorage
  useEffect(() => {
    if (isMounted) {
      console.log("🎨 Applying theme:", theme);
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
        console.log("🌙 Dark mode applied");
      } else {
        document.documentElement.classList.remove("dark");
        console.log("☀️ Light mode applied");
      }
      localStorage.setItem("theme", theme);
      console.log("💾 Theme saved to localStorage:", theme);
    }
  }, [theme, isMounted]);

  // Toggle between light and dark themes
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    console.log("🔄 Toggling theme from", theme, "to", newTheme);
    setTheme(newTheme);
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!isMounted) {
    return (
      <div className="w-14 h-8 rounded-full bg-gray-200 animate-pulse"></div>
    );
  }

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        console.log("🖱️ Button clicked!");
        toggleTheme();
      }}
      className="relative w-14 h-8 rounded-full transition-all duration-300 ease-in-out bg-gray-300 dark:bg-gray-700 z-[200] pointer-events-auto"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {/* Thumb with icon */}
      <div
        className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out flex items-center justify-center ${
          theme === "dark" ? "translate-x-7" : "translate-x-1"
        }`}
      >
        {theme === "dark" ? (
          // Moon icon for dark mode
          <svg
            className="w-3 h-3 text-gray-700"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        ) : (
          // Sun icon for light mode
          <svg
            className="w-3 h-3 text-amber-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>

      {/* Optional: Accessibility - show current state text for screen readers */}
      <span className="sr-only">
        Current mode: {theme === "dark" ? "dark" : "light"}
      </span>

      {/* Debug info - remove this later */}
    </button>
  );
};

export default ThemeToggle;
