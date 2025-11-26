/**
 * SVG path data for Lucide icons used in Highcharts flags
 * These paths are extracted from lucide-react for use in data URLs
 *
 * Each icon uses a 24x24 viewBox, stroke-width 2, stroke-linecap round, stroke-linejoin round
 */

// Icon path definitions - extracted from lucide-react
export const LUCIDE_SVG_PATHS: Record<string, string[]> = {
  // Charts & Analysis
  'bar-chart': ['M12 20V10', 'M18 20V4', 'M6 20v-4'],
  'bar-chart-2': ['M18 20V10', 'M12 20V4', 'M6 20v-6'],
  'bar-chart-3': ['M3 3v18h18', 'M18 17V9', 'M13 17V5', 'M8 17v-3'],
  'line-chart': ['M3 3v18h18', 'M18 17 13 10 8 15 3 9'],
  'area-chart': ['M3 3v18h18', 'M7 12v5h12v-5L14 7l-5 5-2-2z'],
  'candlestick-chart': ['M9 5v4', 'M9 13v6', 'M15 5v4', 'M15 13v6', 'M5 9h4', 'M5 19h4', 'M15 9h4', 'M15 19h4', 'M6 9v6a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1', 'M12 9v6a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1'],
  'activity': ['M22 12h-4l-3 9L9 3l-3 9H2'],
  'trending-up': ['M22 7 13.5 15.5 8.5 10.5 2 17', 'M16 7h6v6'],
  'trending-down': ['M22 17 13.5 8.5 8.5 13.5 2 7', 'M16 17h6v-6'],

  // Financial
  'dollar-sign': ['M12 2v20', 'M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6'],
  'euro': ['M4 10h12', 'M4 14h9', 'M19 6a7.7 7.7 0 0 0-5.2-2A7.9 7.9 0 0 0 6 12a7.9 7.9 0 0 0 7.8 8 7.7 7.7 0 0 0 5.2-2'],
  'coins': ['M12 4a4 4 0 0 0-4 4 4 4 0 0 0 4 4 4 4 0 0 0 4-4 4 4 0 0 0-4-4', 'M12 12a4 4 0 0 0-4 4 4 4 0 0 0 4 4 4 4 0 0 0 4-4 4 4 0 0 0-4-4'],
  'wallet': ['M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4', 'M4 6v12c0 1.1.9 2 2 2h14v-4', 'M18 12a2 2 0 0 0 0 4h4v-4z'],
  'percent': ['M19 5 5 19', 'M6.5 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5', 'M17.5 20a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5'],
  'credit-card': ['M2 10h20', 'M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2'],

  // Alerts & Notifications
  'bell': ['M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9', 'M10.3 21a1.94 1.94 0 0 0 3.4 0'],
  'bell-ring': ['M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9', 'M10.3 21a1.94 1.94 0 0 0 3.4 0', 'M4 2C2.8 3.7 2 5.7 2 8', 'M22 8c0-2.3-.8-4.3-2-6'],
  'alert-circle': ['M12 12m-10 0a10 10 0 1 0 20 0a10 10 0 1 0 -20 0', 'M12 8v4', 'M12 16h.01'],
  'alert-triangle': ['M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0', 'M12 9v4', 'M12 17h.01'],
  'alert-octagon': ['M7.86 2h8.28L22 7.86v8.28L16.14 22H7.86L2 16.14V7.86z', 'M12 8v4', 'M12 16h.01'],
  'info': ['M12 12m-10 0a10 10 0 1 0 20 0a10 10 0 1 0 -20 0', 'M12 16v-4', 'M12 8h.01'],
  'help-circle': ['M12 12m-10 0a10 10 0 1 0 20 0a10 10 0 1 0 -20 0', 'M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3', 'M12 17h.01'],

  // Actions & Signals
  'zap': ['M13 2 3 14h9l-1 8 10-12h-9z'],
  'play': ['M6 3l14 9-14 9z'],
  'pause': ['M6 4h4v16H6z', 'M14 4h4v16h-4z'],
  'square': ['M3 3h18v18H3z'],
  'flag': ['M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528'],
  'bookmark': ['m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z'],
  'target': ['M12 12m-10 0a10 10 0 1 0 20 0a10 10 0 1 0 -20 0', 'M12 12m-6 0a6 6 0 1 0 12 0a6 6 0 1 0 -12 0', 'M12 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0'],
  'star': ['M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'],

  // Arrows
  'arrow-up': ['M12 19V5', 'M5 12l7-7 7 7'],
  'arrow-down': ['M12 5v14', 'M19 12l-7 7-7-7'],
  'arrow-left': ['M19 12H5', 'M12 19l-7-7 7-7'],
  'arrow-right': ['M5 12h14', 'M12 5l7 7-7 7'],
  'arrow-up-down': ['M21 16V8', 'M3 8v8', 'M21 12l-3 4-3-4', 'M3 12l3-4 3 4'],
  'arrow-left-right': ['M8 3H16', 'M8 21H16', 'M12 3l4 3-4 3', 'M12 21l-4-3 4-3'],
  'chevron-up': ['M18 15l-6-6-6 6'],
  'chevron-down': ['M6 9l6 6 6-6'],
  'chevron-left': ['M15 18l-6-6 6-6'],
  'chevron-right': ['M9 18l6-6-6-6'],
  'chevrons-up': ['M17 11l-5-5-5 5', 'M17 18l-5-5-5 5'],
  'chevrons-down': ['M7 13l5 5 5-5', 'M7 6l5 5 5-5'],

  // Status
  'check': ['M20 6 9 17l-5-5'],
  'check-circle': ['M12 12m-10 0a10 10 0 1 0 20 0a10 10 0 1 0 -20 0', 'M9 12l2 2 4-4'],
  'x': ['M18 6 6 18', 'M6 6l12 12'],
  'x-circle': ['M12 12m-10 0a10 10 0 1 0 20 0a10 10 0 1 0 -20 0', 'M15 9l-6 6', 'M9 9l6 6'],
  'circle': ['M12 12m-10 0a10 10 0 1 0 20 0a10 10 0 1 0 -20 0'],
  'circle-dot': ['M12 12m-10 0a10 10 0 1 0 20 0a10 10 0 1 0 -20 0', 'M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0'],
  'minus': ['M5 12h14'],
  'plus': ['M5 12h14', 'M12 5v14'],

  // Trading
  'layers': ['M12 2 2 7l10 5 10-5-10-5z', 'M2 17l10 5 10-5', 'M2 12l10 5 10-5'],
  'split': ['M16 3h5v5', 'M8 3H3v5', 'M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3', 'M15 9l6-6'],
  'shuffle': ['M16 3h5v5', 'M4 20 21 3', 'M21 16v5h-5', 'M15 15l6 6', 'M4 4l5 5'],
  'repeat': ['M17 1l4 4-4 4', 'M3 11V9a4 4 0 0 1 4-4h14', 'M7 23l-4-4 4-4', 'M21 13v2a4 4 0 0 1-4 4H3'],
  'refresh-cw': ['M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8', 'M21 3v5h-5', 'M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16', 'M3 21v-5h5'],

  // Time & Calendar
  'calendar': ['M16 2v4', 'M8 2v4', 'M3 10h18', 'M21 6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z'],
  'calendar-days': ['M16 2v4', 'M8 2v4', 'M3 10h18', 'M21 6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z', 'M8 14h.01', 'M12 14h.01', 'M16 14h.01', 'M8 18h.01', 'M12 18h.01', 'M16 18h.01'],
  'clock': ['M12 12m-10 0a10 10 0 1 0 20 0a10 10 0 1 0 -20 0', 'M12 6v6l4 2'],
  'timer': ['M12 12m-10 0a10 10 0 1 0 20 0a10 10 0 1 0 -20 0', 'M12 6v6'],
  'hourglass': ['M5 22h14', 'M5 2h14', 'M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22', 'M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2'],

  // Data & Database
  'database': ['M12 3c-4.97 0-9 1.79-9 4v10c0 2.21 4.03 4 9 4s9-1.79 9-4V7c0-2.21-4.03-4-9-4', 'M3 7c0 2.21 4.03 4 9 4s9-1.79 9-4', 'M3 12c0 2.21 4.03 4 9 4s9-1.79 9-4'],
  'table': ['M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18'],
  'filter': ['M22 3H2l8 9.46V19l4 2v-8.54z'],
  'search': ['M12 12m-8 0a8 8 0 1 0 16 0a8 8 0 1 0 -16 0', 'M21 21l-4.35-4.35'],
  'download': ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'M7 10l5 5 5-5', 'M12 15V3'],
  'upload': ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'M17 8l-5-5-5 5', 'M12 3v12'],

  // Settings & Tools
  'settings': ['M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z', 'M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0'],
  'sliders': ['M4 21v-7', 'M4 10V3', 'M12 21v-9', 'M12 8V3', 'M20 21v-5', 'M20 12V3', 'M1 14h6', 'M9 8h6', 'M17 16h6'],
  'edit': ['M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7', 'M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z'],
  'copy': ['M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2', 'M8 8h12v12H8z'],
  'trash': ['M3 6h18', 'M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6', 'M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2'],

  // Shapes & UI
  'eye': ['M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z', 'M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0'],
  'eye-off': ['M9.88 9.88a3 3 0 1 0 4.24 4.24', 'M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68', 'M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61', 'M2 2l20 20'],

  // Documents
  'file': ['M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z', 'M14 2v6h6'],
  'file-text': ['M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z', 'M14 2v6h6', 'M16 13H8', 'M16 17H8', 'M10 9H8'],
  'folder': ['M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2z'],
  'newspaper': ['M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2', 'M18 14h-8', 'M15 18h-5', 'M10 6h8v4h-8z'],

  // People
  'user': ['M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2', 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'],
  'users': ['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M22 21v-2a4 4 0 0 0-3-3.87', 'M16 3.13a4 4 0 0 1 0 7.75'],
  'user-plus': ['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M19 8v6', 'M22 11h-6'],
  'user-minus': ['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M22 11h-6'],

  // Misc
  'globe': ['M12 12m-10 0a10 10 0 1 0 20 0a10 10 0 1 0 -20 0', 'M2 12h20', 'M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z'],
  'map-pin': ['M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z', 'M12 10m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0'],
  'lock': ['M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z', 'M7 11V7a5 5 0 0 1 10 0v4'],
  'unlock': ['M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z', 'M7 11V7a5 5 0 0 1 9.9-1'],
  'shield': ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'],
  'shield-alert': ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', 'M12 8v4', 'M12 16h.01'],
  'award': ['M12 15m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0', 'M8.21 13.89 7 23l5-3 5 3-1.21-9.12'],
  'sparkles': ['M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z', 'M20 3v4', 'M22 5h-4', 'M4 17v2', 'M5 18H3'],

  // Communication
  'mail': ['M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z', 'M22 6l-10 7L2 6'],
  'message-square': ['M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'],
  'message-circle': ['M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z'],
  'phone': ['M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z'],
  'send': ['M22 2 11 13', 'M22 2 15 22l-4-9-9-4z'],

  // Home & Navigation
  'home': ['M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', 'M9 22V12h6v10'],
  'package': ['M16.5 9.4 7.55 4.24', 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z', 'M3.27 6.96 12 12.01l8.73-5.05', 'M12 22.08V12'],
  'box': ['M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z', 'M3.3 7 12 12l8.7-5', 'M12 22V12'],
  'external-link': ['M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6', 'M15 3h6v6', 'M10 14 21 3'],
  'link': ['M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71', 'M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71'],
}

/**
 * Generate an SVG string for a Lucide icon
 * @param iconName - kebab-case Lucide icon name (e.g., 'trending-up')
 * @param color - hex color for the icon stroke
 * @param size - icon size in pixels (default 16)
 */
export function generateLucideSvgString(iconName: string, color: string = '#FFFFFF', size: number = 16): string | null {
  const paths = LUCIDE_SVG_PATHS[iconName]
  if (!paths) return null

  const pathElements = paths.map(d => `<path d="${d}"/>`).join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${pathElements}</svg>`
}

/**
 * Generate a data URL for a Lucide icon that can be used in Highcharts flags
 * @param iconName - kebab-case Lucide icon name (e.g., 'trending-up')
 * @param color - hex color for the icon stroke
 * @param size - icon size in pixels (default 16)
 */
export function generateLucideDataUrl(iconName: string, color: string = '#FFFFFF', size: number = 16): string | null {
  const svg = generateLucideSvgString(iconName, color, size)
  if (!svg) return null

  // Encode SVG as base64 data URL
  const base64 = btoa(unescape(encodeURIComponent(svg)))
  return `url(data:image/svg+xml;base64,${base64})`
}

/**
 * Get all available icon names
 */
export function getAvailableLucideIconNames(): string[] {
  return Object.keys(LUCIDE_SVG_PATHS)
}
