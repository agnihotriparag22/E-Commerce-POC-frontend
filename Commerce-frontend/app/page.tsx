import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingBag, Shield, Truck, Star } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-white border-b py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-light mb-6 text-gray-900">Welcome to E-Shop</h1>
          <p className="text-lg mb-8 max-w-2xl mx-auto text-gray-600 font-light">
            Discover amazing products at unbeatable prices. Shop with confidence and enjoy fast, secure delivery.
          </p>
          <div className="space-x-4">
            <Button className="bg-black text-white hover:bg-gray-800 border-0" size="lg" asChild>
              <Link href="/products">Shop Now</Link>
            </Button>
            <Button
              className="border border-gray-300 bg-white text-gray-900 hover:bg-gray-50"
              size="lg"
              variant="outline"
              asChild
            >
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-light text-center mb-12 text-gray-900">Why Choose E-Shop?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border border-gray-200 shadow-none">
              <CardHeader className="text-center">
                <ShoppingBag className="h-8 w-8 mx-auto text-gray-600 mb-4" />
                <CardTitle className="font-normal">Wide Selection</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-gray-600">
                  Browse thousands of products across multiple categories with detailed descriptions and reviews.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-none">
              <CardHeader className="text-center">
                <Shield className="h-8 w-8 mx-auto text-gray-600 mb-4" />
                <CardTitle className="font-normal">Secure Shopping</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-gray-600">
                  Shop with confidence using our secure payment system and buyer protection guarantee.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-none">
              <CardHeader className="text-center">
                <Truck className="h-8 w-8 mx-auto text-gray-600 mb-4" />
                <CardTitle className="font-normal">Fast Delivery</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-gray-600">
                  Get your orders delivered quickly with our reliable shipping partners and tracking system.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Products Preview */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-light text-center mb-12 text-gray-900">Featured Products</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { name: "Wireless Headphones", price: "₹7,999" },
              { name: "Smart Watch", price: "₹15,999" },
              { name: "Running Shoes", price: "₹6,399" },
              { name: "Coffee Maker", price: "₹11,999" },
            ].map((product, i) => (
              <Card key={i} className="border border-gray-200 shadow-none hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="aspect-square bg-gray-100 rounded mb-4 flex items-center justify-center">
                    <ShoppingBag className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="font-normal mb-2">{product.name}</h3>
                  <div className="flex items-center mb-2">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="h-3 w-3 fill-gray-400 text-gray-400" />
                    ))}
                    <span className="text-xs text-gray-500 ml-2">(4.5)</span>
                  </div>
                  <p className="text-lg font-normal text-gray-900">{product.price}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button className="bg-black text-white hover:bg-gray-800 border-0" asChild>
              <Link href="/products">View All Products</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-normal mb-4">E-Shop</h3>
              <p className="text-gray-400 font-light">
                Your trusted online shopping destination for quality products at great prices.
              </p>
            </div>
            <div>
              <h4 className="font-normal mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400 font-light">
                <li>
                  <Link href="/products" className="hover:text-white">
                    Products
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-white">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-normal mb-4">Customer Service</h4>
              <ul className="space-y-2 text-gray-400 font-light">
                <li>
                  <Link href="/help" className="hover:text-white">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/returns" className="hover:text-white">
                    Returns
                  </Link>
                </li>
                <li>
                  <Link href="/shipping" className="hover:text-white">
                    Shipping Info
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-normal mb-4">Connect</h4>
              <ul className="space-y-2 text-gray-400 font-light">
                <li>
                  <a href="#" className="hover:text-white">
                    Facebook
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Instagram
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 font-light">
            <p>&copy; 2024 E-Shop. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
