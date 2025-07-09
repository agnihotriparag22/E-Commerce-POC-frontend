"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { Header } from "@/components/layout/header"
import { useCart } from "@/contexts/cart-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalPrice, totalItems } = useCart()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  if (items.length === 0) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-white">
          <Header />
          <div className="container mx-auto px-4 py-16 text-center">
            <ShoppingBag className="h-16 w-16 mx-auto text-gray-400 mb-6" />
            <h1 className="text-2xl font-light mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-8 font-light">Looks like you haven't added any items to your cart yet.</p>
            <Button className="bg-black text-white hover:bg-gray-800 border-0" asChild>
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white">
        <Header />

        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-light mb-8">Shopping Cart</h1>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="border border-gray-200 shadow-none">
                <CardHeader>
                  <CardTitle className="font-normal">Cart Items ({totalItems})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        width={80}
                        height={80}
                        className="rounded object-cover"
                      />

                      <div className="flex-1">
                        <h3 className="font-normal">{item.name}</h3>
                        <p className="text-lg font-normal text-gray-900">{formatPrice(item.price)}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="border-gray-300 bg-white hover:bg-gray-50"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.id, Number.parseInt(e.target.value) || 1)}
                          className="w-20 text-center border-gray-300"
                          min="1"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="border-gray-300 bg-white hover:bg-gray-50"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="text-right">
                        <p className="font-normal">{formatPrice(item.price * item.quantity)}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="mt-2 border-gray-300 bg-white hover:bg-gray-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="border border-gray-200 shadow-none">
                <CardHeader>
                  <CardTitle className="font-normal">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between font-light">
                    <span>Subtotal ({totalItems} items)</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between font-light">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between font-light">
                    <span>Tax</span>
                    <span>{formatPrice(totalPrice * 0.18)}</span>
                  </div>
                  <hr className="border-gray-200" />
                  <div className="flex justify-between text-lg font-normal">
                    <span>Total</span>
                    <span>{formatPrice(totalPrice * 1.18)}</span>
                  </div>

                  <Button className="w-full bg-black text-white hover:bg-gray-800 border-0" size="lg" asChild>
                    <Link href="/checkout">Proceed to Checkout</Link>
                  </Button>

                  <Button variant="outline" className="w-full border-gray-300 bg-white hover:bg-gray-50" asChild>
                    <Link href="/products">Continue Shopping</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
