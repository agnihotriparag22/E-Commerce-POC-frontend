"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/contexts/auth-context"
import { ordersApi } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import Link from "next/link"

// Static productId to productName mapping
const productIdToName: Record<number, string> = {
  1: "Smartphone X",
  2: "Laptop Pro",
  3: "Wireless Earbuds",
  4: "Smart Watch",
  5: "4K Monitor",
  6: "Gaming Console",
  7: "Bluetooth Speaker",
  8: "Tablet Pro",
  9: "Camera Kit",
 10: "VR Headset",
 11: "Men's T-Shirt",
 12: "Women's Dress",
 13: "Jeans",
 14: "Winter Jacket",
 15: "Running Shoes",
 16: "Formal Shirt",
 17: "Sweater",
 18: "Skirt",
 19: "Hoodie",
 20: "Swimwear",
 21: "The Great Novel",
 22: "Cookbook",
 23: "History Book",
 24: "Science Textbook",
 25: "Children's Book",
 26: "Biography",
 27: "Poetry Collection",
 28: "Self-Help Book",
 29: "Art Book",
 30: "Travel Guide",
 31: "Coffee Maker",
 32: "Blender",
 33: "Toaster",
 34: "Cookware Set",
 35: "Dinnerware Set",
 36: "Vacuum Cleaner",
 37: "Air Purifier",
 38: "Bedding Set",
 39: "Kitchen Knife Set",
 40: "Food Processor",
 41: "Yoga Mat",
 42: "Dumbbell Set",
 43: "Basketball",
 44: "Tennis Racket",
 45: "Running Shoes",
 46: "Bicycle",
 47: "Swimming Goggles",
 48: "Fitness Tracker",
 49: "Camping Tent",
 50: "Golf Set",
};

export function RecentOrders() {
  const { user } = useAuth()

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders", user?.id],
    queryFn: () => ordersApi.getOrders(user?.id),
    enabled: !!user,
  })

  const recentOrders = orders.slice(0, 5)

  const formatPrice = (price: number | undefined | null) => {
    if (price === undefined || price === null || isNaN(price)) {
      return "₹0"
    }
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "Invalid Date"
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric"
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "shipped":
        return "bg-blue-100 text-blue-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card className="border border-gray-200 shadow-none">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-normal">Recent Orders</CardTitle>
        <Button variant="outline" size="sm" className="border-gray-300 bg-white hover:bg-gray-50" asChild>
          <Link href="/orders">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : recentOrders.length === 0 ? (
          <p className="text-gray-500 text-center py-8 font-light">No orders yet</p>
        ) : (
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 rounded">
                <div>
                  <p className="font-normal">Order #{order.id}</p>
                  {order.items && order.items.length > 0 && (
                    <div className="mt-1 space-y-1">
                      {order.items.map((item, idx) => (
                        <p className="text-sm text-gray-600 font-light" key={idx}>
                          {productIdToName[Number(item.product_id)] || item.product_id} × {item.quantity}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                  <Button variant="outline" size="sm" className="border-gray-300 bg-white hover:bg-gray-50">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
