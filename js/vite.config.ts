import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      exclude: ['**/*.test.ts', '**/*.test.tsx', 'src/examples/**']
    })
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'EpochDashboard',
      formats: ['es', 'cjs', 'umd'],
      fileName: (format) => {
        if (format === 'es') return 'index.esm.js'
        if (format === 'cjs') return 'index.js'
        return `index.${format}.js`
      }
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'highcharts', 'highcharts-react-official'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          highcharts: 'Highcharts',
          'highcharts-react-official': 'HighchartsReact'
        }
      }
    },
    sourcemap: true,
    minify: 'esbuild'
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@types': path.resolve(__dirname, './src/types'),
      '@config': path.resolve(__dirname, './src/config'),
      '@services': path.resolve(__dirname, './src/services'),
      '@context': path.resolve(__dirname, './src/context')
    }
  }
})