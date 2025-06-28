"use client"

import { useQuery } from "@tanstack/react-query"
import { productsApi, paymentsApi, ordersApi } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, ShoppingCart, DollarSign, Users } from "lucide-react"

export function AdminStats() {
  const { data: productsData } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => productsApi.getProducts({ limit: 1000 }),
  })

  // Use the new method that returns order summary
  const { data: orderSummary = { total_orders: 0, total_customers: 0, unique_customers: 0 } } = useQuery({
    queryKey: ["admin-orders-with-totals"],
    queryFn: () => ordersApi.getAllOrdersWithTotals(),
  })

  // Fetch total revenue from paymentsApi
  const { data: totalRevenue = 0 } = useQuery({
    queryKey: ["admin-total-revenue"],
    queryFn: () => paymentsApi.getTotalSuccessfulPayments(),
  })

  const totalProducts = productsData?.total || 0
  const totalOrders = orderSummary.total_orders
  const totalCustomers = orderSummary.unique_customers

  const formatPrice = (price: number) => {
    if (typeof price !== "number" || isNaN(price)) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const stats = [
    {
      title: "Total Products",
      value: totalProducts,
      icon: Package,
      color: "text-gray-600",
    },
    {
      title: "Total Orders",
      value: totalOrders,
      icon: ShoppingCart,
      color: "text-gray-600",
    },
    {
      title: "Revenue",
      value: formatPrice(totalRevenue),
      icon: DollarSign,
      color: "text-gray-600",
    },
    {
      title: "Customers",
      value: totalCustomers,
      icon: Users,
      color: "text-gray-600",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <Card key={stat.title} className="border border-gray-200 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-normal">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-normal">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}