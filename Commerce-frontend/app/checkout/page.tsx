"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { useMutation } from "@tanstack/react-query"
import { ProtectedRoute } from "@/components/protected-route"
import { Header } from "@/components/layout/header"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { ordersApi, paymentsApi, authApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

interface CheckoutForm {
  firstName: string
  lastName: string
  email: string
  address: string
  city: string
  state: string
  zipCode: string
  cardNumber: string
  expiryDate: string
  cvv: string
}

export default function CheckoutPage() {
  const [step, setStep] = useState(1)
  const { items, totalPrice, clearCart } = useCart()
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (items.length === 0) {
      router.push("/cart")
    }
  }, [items.length, router])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutForm>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: user?.email || "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
    },
  })

  const createOrderMutation = useMutation({
    mutationFn: ordersApi.createOrder,
    onSuccess: () => {
      clearCart()
      toast({
        title: "Order placed successfully!",
        description: "Thank you for your purchase. You will receive a confirmation email shortly.",
      })
      router.push("/dashboard")
    },
  })

  const onSubmit = async (data: CheckoutForm) => {
    try {
      // Verify token is still valid before proceeding
      const token = authApi.getStoredToken();
      const tokenTimestamp = authApi.getTokenTimestamp();
      
      if (!token || !tokenTimestamp || Date.now() >= tokenTimestamp) {
        toast({
          title: "Session expired",
          description: "Your session has expired. Please login again to complete your purchase.",
          variant: "destructive",
        });
        router.push("/login");
        return;
      }

      // First create orders to get order IDs
      const orderPromises = items.map(item => 
        ordersApi.createOrder({
          product_id: item.id.toString(),
          quantity: item.quantity,
          user_id: user?.id || 0
        })
      );

      let orders;
      try {
        orders = await Promise.all(orderPromises);
      } catch (error) {
        if (error instanceof Error && error.message.includes('Session expired')) {
          toast({
            title: "Session expired",
            description: "Your session has expired while creating orders. Please login again to complete your purchase.",
            variant: "destructive",
          });
          router.push("/login");
          return;
        }
        throw error;
      }

      // Process payment for each order
      const paymentPromises = orders.map(order => 
        paymentsApi.createPayment({
          order_id: order.id,
          amount: items.find(item => item.id.toString() === order.product_id)!.price * order.quantity,
          card_number: data.cardNumber.replace(/\s/g, ''), // Remove spaces from card number
          card_holder_name: `${data.firstName} ${data.lastName}`,
          expiry_date: data.expiryDate,
          cvv: data.cvv
        })
      );

      let payments;
      try {
        payments = await Promise.all(paymentPromises);
      } catch (error) {
        // If payment fails, we should handle the created orders
        if (error instanceof Error && error.message.includes('Session expired')) {
          toast({
            title: "Session expired",
            description: "Your session has expired while processing payment. Please login again to complete your purchase.",
            variant: "destructive",
          });
          // TODO: Cancel created orders or mark them as failed
          router.push("/login");
          return;
        }
        throw error;
      }

      // Check if all payments were successful
      const allPaymentsSuccessful = payments.every(payment => payment.status === 'successful');
      
      if (!allPaymentsSuccessful) {
        // If any payment failed, we should handle it (e.g., cancel orders)
        throw new Error('Some payments failed. Please try again.');
      }

      clearCart();
      toast({
        title: "Orders placed successfully!",
        description: "Thank you for your purchase. You will receive a confirmation email shortly.",
      });
      router.push("/dashboard");
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Session expired')) {
          toast({
            title: "Session expired",
            description: "Your session has expired. Please login again to complete your purchase.",
            variant: "destructive",
          });
          router.push("/login");
        } else {
          toast({
            title: "Error processing order",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Error processing order",
          description: "Failed to process order. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white">
        <Header />

        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-light mb-8">Checkout</h1>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Shipping Information */}
                <Card className="border border-gray-200 shadow-none">
                  <CardHeader>
                    <CardTitle className="font-normal">Shipping Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="font-normal">
                          First Name
                        </Label>
                        <Input
                          id="firstName"
                          {...register("firstName", { required: "First name is required" })}
                          className={`border-gray-300 ${errors.firstName ? "border-red-500" : ""}`}
                        />
                        {errors.firstName && <p className="text-sm text-red-500">{errors.firstName.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="font-normal">
                          Last Name
                        </Label>
                        <Input
                          id="lastName"
                          {...register("lastName", { required: "Last name is required" })}
                          className={`border-gray-300 ${errors.lastName ? "border-red-500" : ""}`}
                        />
                        {errors.lastName && <p className="text-sm text-red-500">{errors.lastName.message}</p>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="font-normal">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        {...register("email", { required: "Email is required" })}
                        className={`border-gray-300 ${errors.email ? "border-red-500" : ""}`}
                      />
                      {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address" className="font-normal">
                        Address
                      </Label>
                      <Input
                        id="address"
                        {...register("address", { required: "Address is required" })}
                        className={`border-gray-300 ${errors.address ? "border-red-500" : ""}`}
                      />
                      {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city" className="font-normal">
                          City
                        </Label>
                        <Input
                          id="city"
                          {...register("city", { required: "City is required" })}
                          className={`border-gray-300 ${errors.city ? "border-red-500" : ""}`}
                        />
                        {errors.city && <p className="text-sm text-red-500">{errors.city.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state" className="font-normal">
                          State
                        </Label>
                        <Input
                          id="state"
                          {...register("state", { required: "State is required" })}
                          className={`border-gray-300 ${errors.state ? "border-red-500" : ""}`}
                        />
                        {errors.state && <p className="text-sm text-red-500">{errors.state.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zipCode" className="font-normal">
                          PIN Code
                        </Label>
                        <Input
                          id="zipCode"
                          {...register("zipCode", { required: "PIN code is required" })}
                          className={`border-gray-300 ${errors.zipCode ? "border-red-500" : ""}`}
                        />
                        {errors.zipCode && <p className="text-sm text-red-500">{errors.zipCode.message}</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Information */}
                <Card className="border border-gray-200 shadow-none">
                  <CardHeader>
                    <CardTitle className="font-normal">Payment Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber" className="font-normal">
                        Card Number
                      </Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        {...register("cardNumber", { required: "Card number is required" })}
                        className={`border-gray-300 ${errors.cardNumber ? "border-red-500" : ""}`}
                      />
                      {errors.cardNumber && <p className="text-sm text-red-500">{errors.cardNumber.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiryDate" className="font-normal">
                          Expiry Date
                        </Label>
                        <Input
                          id="expiryDate"
                          placeholder="MM/YY"
                          {...register("expiryDate", { required: "Expiry date is required" })}
                          className={`border-gray-300 ${errors.expiryDate ? "border-red-500" : ""}`}
                        />
                        {errors.expiryDate && <p className="text-sm text-red-500">{errors.expiryDate.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv" className="font-normal">
                          CVV
                        </Label>
                        <Input
                          id="cvv"
                          placeholder="123"
                          {...register("cvv", { required: "CVV is required" })}
                          className={`border-gray-300 ${errors.cvv ? "border-red-500" : ""}`}
                        />
                        {errors.cvv && <p className="text-sm text-red-500">{errors.cvv.message}</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Button
                  type="submit"
                  className="w-full bg-black text-white hover:bg-gray-800 border-0"
                  size="lg"
                  disabled={createOrderMutation.isPending}
                >
                  {createOrderMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Place Order
                </Button>
              </form>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="border border-gray-200 shadow-none">
                <CardHeader>
                  <CardTitle className="font-normal">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between font-light">
                      <span>
                        {item.name} x {item.quantity}
                      </span>
                      <span>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}

                  <Separator className="border-gray-200" />

                  <div className="flex justify-between font-light">
                    <span>Subtotal</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between font-light">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between font-light">
                    <span>GST (18%)</span>
                    <span>{formatPrice(totalPrice * 0.18)}</span>
                  </div>

                  <Separator className="border-gray-200" />

                  <div className="flex justify-between text-lg font-normal">
                    <span>Total</span>
                    <span>{formatPrice(totalPrice * 1.18)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
