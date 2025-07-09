"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingBag, User, Heart, HelpCircle } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export function QuickActions() {
  const { toast } = useToast()

  const handleComingSoon = (feature: string) => {
    toast({
      title: "Coming Soon!",
      description: `${feature} will be available soon in E-Shop.`,
    })
  }

  const actions = [
    {
      title: "Browse Products",
      description: "Discover new items",
      icon: ShoppingBag,
      href: "/products",
      color: "text-blue-600",
      onClick: undefined,
    },
    {
      title: "Update Profile",
      description: "Manage your account",
      icon: User,
      href: "#",
      color: "text-green-600",
      onClick: () => handleComingSoon("Profile Management"),
    },
    {
      title: "Wishlist",
      description: "View saved items",
      icon: Heart,
      href: "#",
      color: "text-red-600",
      onClick: () => handleComingSoon("Wishlist"),
    },
    {
      title: "Help Center",
      description: "Get support",
      icon: HelpCircle,
      href: "#",
      color: "text-purple-600",
      onClick: () => handleComingSoon("Help Center"),
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action) => (
          <Button 
            key={action.title} 
            variant="outline" 
            className="w-full justify-start h-auto p-4" 
            onClick={action.onClick}
            asChild={!action.onClick}
          >
            {action.onClick ? (
              <div className="flex items-center w-full">
                <action.icon className={`mr-3 h-5 w-5 ${action.color}`} />
                <div className="text-left">
                  <p className="font-medium">{action.title}</p>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
              </div>
            ) : (
              <Link href={action.href}>
                <action.icon className={`mr-3 h-5 w-5 ${action.color}`} />
                <div className="text-left">
                  <p className="font-medium">{action.title}</p>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
              </Link>
            )}
          </Button>
        ))}
      </CardContent>
    </Card>
  )
}
