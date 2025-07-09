"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface ProductFiltersProps {
  category: number | undefined
  onCategoryChange: (category: number | undefined) => void
}

const categories = [
  { id: undefined, label: "All Categories" },
  { id: 1, label: "Electronics" },
  { id: 2, label: "Sports" },
  { id: 3, label: "Home" },
  { id: 4, label: "Fashion" },
  { id: 5, label: "Books" },
]

export function ProductFilters({ category, onCategoryChange }: ProductFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-medium mb-3">Category</h3>
          <RadioGroup value={category?.toString() || ""} onValueChange={(value) => onCategoryChange(value ? Number(value) : undefined)}>
            {categories.map((cat) => (
              <div key={cat.id?.toString() || "all"} className="flex items-center space-x-2">
                <RadioGroupItem value={cat.id?.toString() || ""} id={cat.id?.toString() || "all"} />
                <Label htmlFor={cat.id?.toString() || "all"} className="text-sm">
                  {cat.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  )
}
