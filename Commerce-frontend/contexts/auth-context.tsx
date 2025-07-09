"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { authApi, AUTH_TOKEN_KEY } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

// Token expiration time in milliseconds (30 minutes)
const TOKEN_EXPIRATION_TIME = 30 * 60 * 1000;

interface User {
  id: number
  username: string
  email: string
  is_admin: boolean
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
  isAuthenticated: boolean
  tokenExpiryTime: number | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [tokenExpiryTime, setTokenExpiryTime] = useState<number | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  // Function to verify and set user from token
  const verifyAndSetUser = async (token: string) => {
    try {
      const userData = await authApi.verifyToken(token)
      setUser(userData)
      // Set token expiry time to 30 minutes from now
      setTokenExpiryTime(Date.now() + TOKEN_EXPIRATION_TIME)
    } catch (error) {
      console.error("Token verification failed:", error)
      authApi.clearToken()
      setUser(null)
      setTokenExpiryTime(null)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const token = authApi.getStoredToken()
    if (token) {
      verifyAndSetUser(token).catch(() => {
        // Token verification failed, user will be logged out
        toast({
          title: "Session expired",
          description: "Please login again to continue.",
          variant: "destructive",
        })
      })
    } else {
      setIsLoading(false)
    }
  }, [])

  // Check token expiration periodically
  useEffect(() => {
    if (!tokenExpiryTime) return

    const checkTokenExpiration = () => {
      if (Date.now() >= tokenExpiryTime) {
        // Token has expired
        authApi.clearToken()
        setUser(null)
        setTokenExpiryTime(null)
        toast({
          title: "Session expired",
          description: "Your session has expired. Please login again.",
          variant: "destructive",
        })
        router.push("/login")
      }
    }

    // Check every minute
    const intervalId = setInterval(checkTokenExpiration, 60 * 1000)
    return () => clearInterval(intervalId)
  }, [tokenExpiryTime, router, toast])

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password)
      setUser(response.user)
      // Set token expiry time to 30 minutes from now
      setTokenExpiryTime(Date.now() + TOKEN_EXPIRATION_TIME)
      
      // Redirect based on admin status
      if (response.user.is_admin) {
        router.push("/admin")
      } else {
        router.push("/dashboard")
      }
    } catch (error) {
      // Clear any existing token on login failure
      authApi.clearToken()
      setUser(null)
      setTokenExpiryTime(null)
      throw error
    }
  }

  const logout = () => {
    authApi.clearToken()
    setUser(null)
    setTokenExpiryTime(null)
    router.push("/login")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isLoading,
        isAuthenticated: !!user,
        tokenExpiryTime,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
