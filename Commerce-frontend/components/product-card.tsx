"use client"

import { useCart } from "@/contexts/cart-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, ShoppingCart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

interface Product {
  id: number
  name: string
  description: string
  price: number
  stock: number
  category_id: number
  created_at: string
  updated_at: string
  category: {
    id: number
    name: string
    description: string
  }
  image?: string
  rating?: number
}

interface ProductCardProps {
  product: Product
  viewMode?: "grid" | "list"
}

export function ProductCard({ product, viewMode = "grid" }: ProductCardProps) {
  const { addItem } = useCart()
  const { toast } = useToast()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const handleAddToCart = () => {
    addItem({
      id: product.id.toString(),
      name: product.name,
      price: product.price,
      image: product.image || "/placeholder.svg",
    })
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    })
  }

  if (viewMode === "list") {
    return (
      <Card className="flex flex-col sm:flex-row border border-gray-200 shadow-none">
        <div className="sm:w-48 h-48 sm:h-auto">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            width={200}
            height={200}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 p-6">
          <div className="flex justify-between items-start mb-2">
            <Link href={`/products/${product.id}`}>
              <h3 className="text-lg font-normal hover:text-gray-600">{product.name}</h3>
            </Link>
            <Badge variant="secondary" className="bg-gray-100 text-gray-700">
              {product.category.name}
            </Badge>
          </div>

          {product.rating && (
            <div className="flex items-center mb-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < Math.floor(product.rating!) ? "fill-gray-400 text-gray-400" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600 ml-2">({product.rating})</span>
            </div>
          )}

          <p className="text-gray-600 mb-4 line-clamp-2 font-light">{product.description}</p>

          <div className="flex justify-between items-center">
            <div>
              <p className="text-xl font-normal text-gray-900">{formatPrice(product.price)}</p>
              <p className="text-sm text-gray-500 font-light">{product.stock} in stock</p>
            </div>
            <Button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="bg-black text-white hover:bg-gray-800 border-0"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="border border-gray-200 shadow-none hover:shadow-sm transition-shadow">
      <CardContent className="p-4">
        <div className="aspect-square relative mb-4 overflow-hidden">
          <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
          <Badge className="absolute top-2 right-2 bg-white text-gray-700 border border-gray-200" variant="secondary">
            {product.category.name}
          </Badge>
        </div>

        <Link href={`/products/${product.id}`}>
          <h3 className="font-normal mb-2 hover:text-gray-600 line-clamp-2">{product.name}</h3>
        </Link>

        {product.rating && (
          <div className="flex items-center mb-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < Math.floor(product.rating!) ? "fill-gray-400 text-gray-400" : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 ml-2">({product.rating})</span>
          </div>
        )}

        <p className="text-gray-600 text-sm mb-4 line-clamp-2 font-light">{product.description}</p>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <div className="w-full">
          <div className="flex justify-between items-center mb-3">
            <p className="text-lg font-normal text-gray-900">{formatPrice(product.price)}</p>
            <p className="text-sm text-gray-500 font-light">{product.stock} in stock</p>
          </div>
          <Button
            onClick={handleAddToCart}
            className="w-full bg-black text-white hover:bg-gray-800 border-0"
            disabled={product.stock === 0}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
