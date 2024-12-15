import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import useStore from '../lib/store'

export default function CategoryManagement() {
  const [newCategory, setNewCategory] = useState('')
  const { categories, addCategory } = useStore()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (newCategory && !categories.includes(newCategory)) {
      addCategory(newCategory)
      setNewCategory('')
    }
  }

  return (
    <Card className="bg-card text-card-foreground">
      <CardHeader>
        <CardTitle>Manage Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="New category name"
          />
          <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">Add Category</Button>
        </form>
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Existing Categories:</h3>
          <ul className="list-disc list-inside">
            {categories.map(category => (
              <li key={category}>{category}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

