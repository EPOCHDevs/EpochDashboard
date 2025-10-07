import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import postcss from 'rollup-plugin-postcss'
import dts from 'rollup-plugin-dts'
import { readFileSync } from 'fs'

const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'))

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: packageJson.main,
        format: 'cjs',
        sourcemap: true,
        exports: 'named'
      },
      {
        file: packageJson.module,
        format: 'esm',
        sourcemap: true,
        exports: 'named'
      }
    ],
    plugins: [
      peerDepsExternal(),
      resolve({
        browser: true,
        preferBuiltins: false
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        exclude: ['**/*.test.*', '**/*.spec.*']
      }),
      postcss({
        extract: true,
        minimize: true,
        sourceMap: true
      })
    ],
    external: [
      // React ecosystem
      'react',
      'react-dom',
      'react/jsx-runtime',

      // Styling
      'tailwindcss',

      // Charting
      'highcharts',
      'highcharts/modules/xrange',
      'highcharts/modules/heatmap',
      'highcharts/modules/more',
      'highcharts-react-official',

      // UI Libraries
      '@radix-ui/themes',
      'lucide-react',

      // Data/State Management
      '@tanstack/react-query',
      '@tanstack/react-table',
      '@tanstack/react-virtual',

      // Forms
      'react-hook-form',
      '@hookform/resolvers',
      'zod',

      // Data Processing
      'apache-arrow',
      'date-fns',
      'date-fns-tz',
      'lodash',

      // HTTP
      'axios',

      // Proto
      '@epochlab/epoch-protos',
      /^@epochlab\/epoch-protos\//,

      // Utils
      'clsx',
      'ms',
      'protobufjs'
    ]
  },
  {
    input: 'src/index.ts',
    output: [{ file: 'dist/index.d.ts', format: 'esm' }],
    plugins: [dts()],
    external: [/\.css$/]
  }
]