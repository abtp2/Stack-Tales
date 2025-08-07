'use client'
import {createContext,useContext,useState,useEffect,ReactNode,} from 'react'

type Theme = 'light' | 'dark'
interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  setTheme: () => {},
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light')
  // Load theme from localStorage on mount
  useEffect(() => {
    const storedTheme = localStorage.getItem('StackTales-theme') as Theme | null
    if (storedTheme) {
      setThemeState(storedTheme)
    }
  }, [])
  // Apply theme class to body whenever theme changes
  useEffect(() => {
    document.body.className = theme
  }, [theme])
  // Set theme and persist in localStorage
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem('StackTales-theme', newTheme)
  }
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}