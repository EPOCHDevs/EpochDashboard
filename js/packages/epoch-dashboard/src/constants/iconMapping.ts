import { LucideIcon } from '../types/LucideIcons'

/**
 * Maps LucideIcon enum values to Lucide React icon component names
 * Icon names are in kebab-case to match Lucide's naming convention
 * Reference: https://lucide.dev/icons
 */
export const LUCIDE_ICON_NAME_MAP: Record<LucideIcon, string> = {
  // Charts & Analysis
  [LucideIcon.BarChart]: 'bar-chart',
  [LucideIcon.BarChart2]: 'bar-chart-2',
  [LucideIcon.BarChart3]: 'bar-chart-3',
  [LucideIcon.Chart]: 'bar-chart-3', // Legacy name maps to BarChart3
  [LucideIcon.LineChart]: 'line-chart',
  [LucideIcon.AreaChart]: 'area-chart',
  [LucideIcon.PieChart]: 'pie-chart',
  [LucideIcon.CandlestickChart]: 'candlestick-chart',
  [LucideIcon.Activity]: 'activity',
  [LucideIcon.TrendingUp]: 'trending-up',
  [LucideIcon.TrendingDown]: 'trending-down',

  // Financial & Money
  [LucideIcon.DollarSign]: 'dollar-sign',
  [LucideIcon.Euro]: 'euro',
  [LucideIcon.PoundSterling]: 'pound-sterling',
  [LucideIcon.Bitcoin]: 'bitcoin',
  [LucideIcon.CreditCard]: 'credit-card',
  [LucideIcon.Wallet]: 'wallet',
  [LucideIcon.Coins]: 'coins',
  [LucideIcon.Banknote]: 'banknote',
  [LucideIcon.Calculator]: 'calculator',
  [LucideIcon.Percent]: 'percent',

  // Documents & Files
  [LucideIcon.FileText]: 'file-text',
  [LucideIcon.File]: 'file',
  [LucideIcon.Files]: 'files',
  [LucideIcon.Receipt]: 'receipt',
  [LucideIcon.Newspaper]: 'newspaper',
  [LucideIcon.BookOpen]: 'book-open',
  [LucideIcon.Clipboard]: 'clipboard',

  // Alerts & Notifications
  [LucideIcon.Bell]: 'bell',
  [LucideIcon.BellRing]: 'bell-ring',
  [LucideIcon.AlertCircle]: 'alert-circle',
  [LucideIcon.AlertTriangle]: 'alert-triangle',
  [LucideIcon.AlertOctagon]: 'alert-octagon',
  [LucideIcon.Info]: 'info',
  [LucideIcon.HelpCircle]: 'help-circle',
  [LucideIcon.MessageCircle]: 'message-circle',

  // Actions & Signals
  [LucideIcon.Signal]: 'zap', // Signal maps to Zap
  [LucideIcon.Zap]: 'zap',
  [LucideIcon.Play]: 'play',
  [LucideIcon.Pause]: 'pause',
  [LucideIcon.Square]: 'square',
  [LucideIcon.Flag]: 'flag',
  [LucideIcon.Bookmark]: 'bookmark',
  [LucideIcon.Target]: 'target',

  // Arrows & Directions
  [LucideIcon.ArrowUp]: 'arrow-up',
  [LucideIcon.ArrowDown]: 'arrow-down',
  [LucideIcon.ArrowLeft]: 'arrow-left',
  [LucideIcon.ArrowRight]: 'arrow-right',
  [LucideIcon.ArrowLeftRight]: 'arrow-left-right',
  [LucideIcon.ArrowUpDown]: 'arrow-up-down',
  [LucideIcon.ChevronsUp]: 'chevrons-up',
  [LucideIcon.ChevronsDown]: 'chevrons-down',
  [LucideIcon.MoveUp]: 'move-up',
  [LucideIcon.MoveDown]: 'move-down',

  // Status & Checks
  [LucideIcon.CheckCircle]: 'check-circle',
  [LucideIcon.Check]: 'check',
  [LucideIcon.X]: 'x',
  [LucideIcon.XCircle]: 'x-circle',
  [LucideIcon.Circle]: 'circle',
  [LucideIcon.CircleDot]: 'circle-dot',
  [LucideIcon.Minus]: 'minus',
  [LucideIcon.Plus]: 'plus',

  // Trading & Markets
  [LucideIcon.Trade]: 'arrow-left-right', // Trade maps to ArrowLeftRight
  [LucideIcon.Position]: 'layers', // Position maps to Layers
  [LucideIcon.Layers]: 'layers',
  [LucideIcon.Split]: 'split',
  [LucideIcon.Shuffle]: 'shuffle',
  [LucideIcon.Repeat]: 'repeat',
  [LucideIcon.RefreshCw]: 'refresh-cw',

  // Time & Calendar
  [LucideIcon.Calendar]: 'calendar',
  [LucideIcon.CalendarDays]: 'calendar-days',
  [LucideIcon.Clock]: 'clock',
  [LucideIcon.Timer]: 'timer',
  [LucideIcon.Hourglass]: 'hourglass',

  // Data & Database
  [LucideIcon.Database]: 'database',
  [LucideIcon.Table]: 'table',
  [LucideIcon.Filter]: 'filter',
  [LucideIcon.Search]: 'search',
  [LucideIcon.Download]: 'download',
  [LucideIcon.Upload]: 'upload',

  // Settings & Tools
  [LucideIcon.Settings]: 'settings',
  [LucideIcon.Wrench]: 'wrench',
  [LucideIcon.Sliders]: 'sliders',
  [LucideIcon.Edit]: 'edit',
  [LucideIcon.Copy]: 'copy',
  [LucideIcon.Trash]: 'trash',

  // Shapes & UI
  [LucideIcon.Box]: 'box',
  [LucideIcon.Package]: 'package',
  [LucideIcon.Folder]: 'folder',
  [LucideIcon.Star]: 'star',
  [LucideIcon.Heart]: 'heart',
  [LucideIcon.Eye]: 'eye',
  [LucideIcon.EyeOff]: 'eye-off',

  // People & Users
  [LucideIcon.User]: 'user',
  [LucideIcon.Users]: 'users',
  [LucideIcon.UserPlus]: 'user-plus',
  [LucideIcon.UserMinus]: 'user-minus',

  // Communication
  [LucideIcon.Mail]: 'mail',
  [LucideIcon.Phone]: 'phone',
  [LucideIcon.Send]: 'send',
  [LucideIcon.Share]: 'share',

  // Miscellaneous
  [LucideIcon.Globe]: 'globe',
  [LucideIcon.Map]: 'map',
  [LucideIcon.MapPin]: 'map-pin',
  [LucideIcon.Lock]: 'lock',
  [LucideIcon.Unlock]: 'unlock',
  [LucideIcon.Shield]: 'shield',
  [LucideIcon.Award]: 'award',
  [LucideIcon.Gift]: 'gift',
  [LucideIcon.Sparkles]: 'sparkles',
}

/**
 * Get Lucide icon component name from enum value
 * @param icon - LucideIcon enum value
 * @returns Lucide icon name in kebab-case
 */
export function getLucideIconName(icon: LucideIcon): string {
  return LUCIDE_ICON_NAME_MAP[icon]
}

/**
 * Get Lucide icon name from string (case-insensitive)
 * Handles both C++ enum string and TypeScript enum
 * @param iconStr - Icon name as string (e.g., "Flag", "AlertTriangle")
 * @returns Lucide icon name in kebab-case, or undefined if not found
 */
export function getLucideIconNameFromString(iconStr: string): string | undefined {
  // Try direct enum lookup first
  const enumValue = iconStr as LucideIcon
  if (enumValue in LUCIDE_ICON_NAME_MAP) {
    return LUCIDE_ICON_NAME_MAP[enumValue]
  }

  // Try case-insensitive lookup
  const upperStr = iconStr.toUpperCase()
  for (const [key, value] of Object.entries(LUCIDE_ICON_NAME_MAP)) {
    if (key.toUpperCase() === upperStr) {
      return value
    }
  }

  return undefined
}
