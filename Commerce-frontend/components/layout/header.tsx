"use client"

import { useAuth } from "@/contexts/auth-context"
import { useCart } from "@/contexts/cart-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ShoppingCart, User, LogOut, Settings } from "lucide-react"
import Link from "next/link"

export function Header() {
  const { user, logout } = useAuth()
  const { totalItems } = useCart()

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-light text-gray-900">
          E-Shop
        </Link>

        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/products" className="text-gray-600 hover:text-gray-900 font-light">
            Products
          </Link>
          {user && (
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 font-light">
              Dashboard
            </Link>
          )}
          {user?.is_admin && (
            <Link href="/admin" className="text-gray-600 hover:text-gray-900 font-light">
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center space-x-4">
          {user && (
            <Link href="/cart" className="relative">
              <Button variant="outline" size="icon" className="border-gray-300 bg-white hover:bg-gray-50">
                <ShoppingCart className="h-4 w-4" />
                {totalItems > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-black text-white">
                    {totalItems}
                  </Badge>
                )}
              </Button>
            </Link>
          )}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="border-gray-300 bg-white hover:bg-gray-50">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="border-gray-200 bg-white">
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <Settings className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button className="bg-black text-white hover:bg-gray-800 border-0" asChild>
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
