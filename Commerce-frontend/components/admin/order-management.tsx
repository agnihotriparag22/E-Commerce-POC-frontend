"use client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ordersApi, OrderStatus, Order } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

// Static userId to username mapping
const userIdToUsername: Record<number, string> = {
  1: "admin",
  2: "prakhar",
  3: "hrishab",
  4: "parag",
  5: "ishita",
  6: "sanika",
  7: "viral",
  8: "rachit",
  9: "abhishek",
 10: "shefali",
 11: "anshu",
 12: "vividh",
 13: "durgesh",
 14: "aditya",
 15: "rajkuwar",
};

export function OrderManagement() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery<Order[]>({
    queryKey: ["admin-all-orders"],
    queryFn: () => ordersApi.getAllCustomersOrders(),
  });
  const orders = data ?? [];

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: OrderStatus }) => 
      ordersApi.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders-with-totals"] })
      toast({
        title: "Order updated",
        description: "Order status has been successfully updated.",
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  })

  const formatPrice = (price: number) => {
    if (typeof price !== "number" || isNaN(price)) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleStatusChange = (orderId: number, newStatus: string) => {
    updateStatusMutation.mutate({ id: orderId, status: newStatus as OrderStatus })
  }

  if (isLoading) {
    return (
      <Card className="border border-gray-200 shadow-none">
        <CardHeader>
          <CardTitle className="font-normal">Order Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border border-gray-200 shadow-none">
      <CardHeader>
        <CardTitle className="font-normal">Order Management</CardTitle>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No orders found
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-normal">Order ID</TableHead>
                <TableHead className="font-normal">Customer</TableHead>
               
                <TableHead className="font-normal">Status</TableHead>
                <TableHead className="font-normal">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-normal">#{order.id}</TableCell>
                  <TableCell className="font-light">
                    {userIdToUsername[order.user_id] || `User ${order.user_id}`}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select 
                      value={order.status} 
                      onValueChange={(value) => handleStatusChange(order.id, value)}
                      disabled={updateStatusMutation.isPending}
                    >
                      <SelectTrigger className="w-32 border-gray-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-gray-200 bg-white">
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}