// Tailwind CSS utilities for the dashboard
// This is a simplified version for the dashboard package

export const tailwindColors = {
  primary: {
    white: "#FFFFFF",
    bluishDarkGray: "#1a1f2e",
  },
  secondary: {
    red: "#dc2626",
    cementGrey: "#9ca3af",
    ashGrey: "#6b7280",
    mildCementGrey: "#374151",
    yellow: "#eab308",
    purple: "#9333ea",
  },
  territory: {
    success: "#16a34a",
    warning: "#ca8a04",
    cyan: "#06b6d4",
  },
} as const

export const tailwindTypography = {
  desktopL14Regular: {
    css: {
      fontSize: "14px",
      lineHeight: "20px",
      fontWeight: "400",
    },
  },
  dashboardL12Regular: {
    css: {
      fontSize: "12px",
      lineHeight: "16px",
      fontWeight: "400",
    },
  },
  dashboardP14Regular: {
    css: {
      fontSize: "14px",
      lineHeight: "20px",
      fontWeight: "400",
    },
  },
} as const