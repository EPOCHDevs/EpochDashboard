# Epoch Dashboard Examples

This directory contains standalone examples demonstrating different ways to use the `@epochlab/epoch-dashboard` package.

## Available Examples

### 1. Basic Usage (`basic-usage/`)
Demonstrates the simplest way to use the Epoch Dashboard with minimal configuration.

```tsx
import { TearsheetDashboard } from '@epochlab/epoch-dashboard'

<TearsheetDashboard tearsheet={data} />
```

### 2. Custom Theming (`custom-theming/`)
Shows how to customize the dashboard appearance using:
- CSS custom properties
- Tailwind CSS classes
- Custom color schemes

### 3. File Upload (`file-upload/`)
Complete example with:
- Drag & drop file upload
- File validation
- Error handling
- Loading states

## Usage

Each example is a standalone React component that can be:

1. **Copied directly** into your project
2. **Used as reference** for implementation patterns
3. **Modified** to fit your specific needs

## Installation

To use these examples in your project:

```bash
npm install @epochlab/epoch-dashboard
```

Then copy any example component and adapt it to your needs.

## File Structure

```
examples/
├── basic-usage/
│   └── index.tsx          # Simple dashboard usage
├── custom-theming/
│   └── index.tsx          # Custom styling example
├── file-upload/
│   └── index.tsx          # File upload integration
└── README.md              # This file
```

## Dependencies

All examples assume you have:
- React 18+
- Tailwind CSS 3+
- TypeScript (recommended)

## Next Steps

- Check the [playground app](../playground/) for live examples
- Read the [package documentation](../../packages/epoch-dashboard/README.md)
- Explore the [main project README](../../README.md)