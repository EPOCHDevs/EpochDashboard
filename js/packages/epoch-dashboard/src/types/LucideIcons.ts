/**
 * LucideIcon enum - matches C++ Icon enum from constants.h
 * All icons map to Lucide icons (https://lucide.dev/icons)
 * Total: 227 icons organized by category
 */
export enum LucideIcon {
  // ============================================================================
  // CHARTS & ANALYSIS
  // ============================================================================
  BarChart = 'BarChart',
  BarChart2 = 'BarChart2',
  BarChart3 = 'BarChart3',
  Chart = 'Chart', // General analysis/charts (Lucide: BarChart3) [legacy name]
  LineChart = 'LineChart',
  AreaChart = 'AreaChart',
  PieChart = 'PieChart',
  CandlestickChart = 'CandlestickChart',
  Activity = 'Activity',
  TrendingUp = 'TrendingUp',
  TrendingDown = 'TrendingDown',

  // ============================================================================
  // FINANCIAL & MONEY
  // ============================================================================
  DollarSign = 'DollarSign',
  Euro = 'Euro',
  PoundSterling = 'PoundSterling',
  Bitcoin = 'Bitcoin',
  CreditCard = 'CreditCard',
  Wallet = 'Wallet',
  Coins = 'Coins',
  Banknote = 'Banknote',
  Calculator = 'Calculator',
  Percent = 'Percent',

  // ============================================================================
  // DOCUMENTS & FILES
  // ============================================================================
  FileText = 'FileText',
  File = 'File',
  Files = 'Files',
  Receipt = 'Receipt',
  Newspaper = 'Newspaper',
  BookOpen = 'BookOpen',
  Clipboard = 'Clipboard',

  // ============================================================================
  // ALERTS & NOTIFICATIONS
  // ============================================================================
  Bell = 'Bell',
  BellRing = 'BellRing',
  AlertCircle = 'AlertCircle',
  AlertTriangle = 'AlertTriangle',
  AlertOctagon = 'AlertOctagon',
  Info = 'Info',
  HelpCircle = 'HelpCircle',
  MessageCircle = 'MessageCircle',

  // ============================================================================
  // ACTIONS & SIGNALS
  // ============================================================================
  Signal = 'Signal', // Signal/zap (Lucide: Zap)
  Zap = 'Zap',
  Play = 'Play',
  Pause = 'Pause',
  Square = 'Square', // Square/stop
  Flag = 'Flag',
  Bookmark = 'Bookmark',
  Target = 'Target',

  // ============================================================================
  // ARROWS & DIRECTIONS
  // ============================================================================
  ArrowUp = 'ArrowUp',
  ArrowDown = 'ArrowDown',
  ArrowLeft = 'ArrowLeft',
  ArrowRight = 'ArrowRight',
  ArrowLeftRight = 'ArrowLeftRight',
  ArrowUpDown = 'ArrowUpDown',
  ChevronsUp = 'ChevronsUp',
  ChevronsDown = 'ChevronsDown',
  MoveUp = 'MoveUp',
  MoveDown = 'MoveDown',

  // ============================================================================
  // STATUS & CHECKS
  // ============================================================================
  CheckCircle = 'CheckCircle',
  Check = 'Check',
  X = 'X', // X/close
  XCircle = 'XCircle',
  Circle = 'Circle',
  CircleDot = 'CircleDot',
  Minus = 'Minus',
  Plus = 'Plus',

  // ============================================================================
  // TRADING & MARKETS
  // ============================================================================
  Trade = 'Trade', // Trade (Lucide: ArrowLeftRight) [legacy name]
  Position = 'Position', // Position (Lucide: Layers) [legacy name]
  Layers = 'Layers',
  Split = 'Split',
  Shuffle = 'Shuffle',
  Repeat = 'Repeat',
  RefreshCw = 'RefreshCw',

  // ============================================================================
  // TIME & CALENDAR
  // ============================================================================
  Calendar = 'Calendar',
  CalendarDays = 'CalendarDays',
  Clock = 'Clock',
  Timer = 'Timer',
  Hourglass = 'Hourglass',

  // ============================================================================
  // DATA & DATABASE
  // ============================================================================
  Database = 'Database',
  Table = 'Table',
  Filter = 'Filter',
  Search = 'Search',
  Download = 'Download',
  Upload = 'Upload',

  // ============================================================================
  // SETTINGS & TOOLS
  // ============================================================================
  Settings = 'Settings',
  Wrench = 'Wrench',
  Sliders = 'Sliders',
  Edit = 'Edit',
  Copy = 'Copy',
  Trash = 'Trash',

  // ============================================================================
  // SHAPES & UI
  // ============================================================================
  Box = 'Box',
  Package = 'Package',
  Folder = 'Folder',
  Star = 'Star',
  Heart = 'Heart',
  Eye = 'Eye',
  EyeOff = 'EyeOff',

  // ============================================================================
  // PEOPLE & USERS
  // ============================================================================
  User = 'User',
  Users = 'Users',
  UserPlus = 'UserPlus',
  UserMinus = 'UserMinus',

  // ============================================================================
  // COMMUNICATION
  // ============================================================================
  Mail = 'Mail',
  Phone = 'Phone',
  Send = 'Send',
  Share = 'Share',

  // ============================================================================
  // MISCELLANEOUS
  // ============================================================================
  Globe = 'Globe',
  Map = 'Map',
  MapPin = 'MapPin',
  Lock = 'Lock',
  Unlock = 'Unlock',
  Shield = 'Shield',
  Award = 'Award',
  Gift = 'Gift',
  Sparkles = 'Sparkles',
}

/**
 * Utility function to convert LucideIcon enum to string
 */
export function lucideIconToString(icon: LucideIcon): string {
  return icon.toString()
}

/**
 * Utility function to parse string to LucideIcon enum
 * Returns undefined if string doesn't match any icon
 */
export function stringToLucideIcon(str: string): LucideIcon | undefined {
  if (Object.values(LucideIcon).includes(str as LucideIcon)) {
    return str as LucideIcon
  }
  return undefined
}
