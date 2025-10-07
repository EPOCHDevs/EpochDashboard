import { useEffect } from 'react'
import type { AppProps } from 'next/app'
import { ThemeProvider } from 'next-themes'
import '../styles/globals.css'
// Dashboard styles are included via Tailwind

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <Component {...pageProps} />
    </ThemeProvider>
  )
}