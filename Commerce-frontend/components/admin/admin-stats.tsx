"use client"

import { useQuery } from "@tanstack/react-query"
import { productsApi, ordersApi } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, ShoppingCart, DollarSign, Users } from "lucide-react"

export function AdminStats() {
  const { data: productsData } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => productsApi.getProducts({ limit: 1000 }),
  })

  const { data: orders = [] } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => ordersApi.getOrders(),
  })

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
  const totalProducts = productsData?.total || 0
  const totalOrders = orders.length
  const totalCustomers = new Set(orders.map((o) => o.userId)).size

  const formatPrice = (price: number) => {
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
