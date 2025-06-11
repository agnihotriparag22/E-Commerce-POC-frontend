"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/contexts/auth-context"
import { ordersApi, OrderStatus } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingBag, Package, Clock, CheckCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export function DashboardStats() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ["orders", user?.id],
    queryFn: async () => {
      try {
        return await ordersApi.getOrders(user?.id)
      } catch (error) {
        if (error instanceof Error && error.message.includes('Session expired')) {
          toast({
            title: "Session expired",
            description: "Your session has expired. Please login again.",
            variant: "destructive",
          })
          router.push("/login")
          throw error
        }
        throw error
      }
    },
    enabled: !!user,
    retry: false, // Don't retry on error
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[60px]" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-red-200 bg-red-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-600">
                {error instanceof Error && error.message.includes('Session expired')
                  ? "Session expired"
                  : "Error loading stats"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-red-600">
                {error instanceof Error && error.message.includes('Session expired')
                  ? "Please login again to view your dashboard"
                  : "Failed to load order statistics. Please try again."}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const stats = [
    {
      title: "Total Orders",
      value: orders.length,
      icon: ShoppingBag,
      color: "text-blue-600",
    },
    {
      title: "Pending",
      value: orders.filter((o) => o.status === OrderStatus.pending).length,
      icon: Clock,
      color: "text-yellow-600",
    },
    {
      title: "Completed",
      value: orders.filter((o) => o.status === OrderStatus.completed).length,
      icon: Package,
      color: "text-purple-600",
    },
    {
      title: "Cancelled",
      value: orders.filter((o) => o.status === OrderStatus.cancelled).length,
      icon: CheckCircle,
      color: "text-green-600",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
