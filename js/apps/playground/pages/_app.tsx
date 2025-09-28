import { useEffect } from 'react'
import type { AppProps } from 'next/app'
import '../styles/globals.css'
// Dashboard styles are included via Tailwind

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}