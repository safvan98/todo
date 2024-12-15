import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import useStore from '../lib/store'

export function TaskTemplates() {
  const [templateName, setTemplateName] = useState('')
  const [templateTitle, setTemplateTitle] = useState('')
  const [templateCategory, setTemplateCategory] = useState('')
  const [templateDescription, setTemplateDescription] = useState('')
  const [templatePriority, setTemplatePriority] = useState('medium')
  const [templateExpectedTime, setTemplateExpectedTime] = useState('')

  const { categories, taskTemplates, addTaskTemplate, deleteTaskTemplate, addTask } = useStore()
  const { toast } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (templateName && templateTitle && templateCategory) {
      addTaskTemplate({
        name: templateName,
        title: templateTitle,
        category: templateCategory,
        description: templateDescription,
        priority: templatePriority,
        expectedCompletionTime: templateExpectedTime,
      })
      setTemplateName('')
      setTemplateTitle('')
      setTemplateCategory('')
      setTemplateDescription('')
      setTemplatePriority('medium')
      setTemplateExpectedTime('')
      toast({
        title: "Template created",
        description: "Your task template has been created successfully.",
      })
    }
  }

  const handleUseTemplate = (template: any) => {
    addTask({
      title: template.title,
      category: template.category,
      description: template.description,
      priority: template.priority,
      expectedCompletionTime: template.expectedCompletionTime,
    })
    toast({
      title: "Task created from template",
      description: "A new task has been created using the selected template.",
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Task Template</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="templateName">Template Name</Label>
              <Input
                id="templateName"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="templateTitle">Task Title</Label>
              <Input
                id="templateTitle"
                value={templateTitle}
                onChange={(e) => setTemplateTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="templateCategory">Category</Label>
              <Select onValueChange={setTemplateCategory} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="templateDescription">Description (Optional)</Label>
              <Textarea
                id="templateDescription"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="templatePriority">Priority</Label>
              <Select onValueChange={setTemplatePriority} defaultValue={templatePriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="templateExpectedTime">Expected Completion Time (Optional)</Label>
              <Input
                id="templateExpectedTime"
                value={templateExpectedTime}
                onChange={(e) => setTemplateExpectedTime(e.target.value)}
                placeholder="HH:MM:SS"
              />
            </div>
            <Button type="submit">Create Template</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Task Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            {taskTemplates.map((template, index) => (
              <Card key={index} className="mb-4">
                <CardContent className="p-4">
                  <h3 className="font-bold">{template.name}</h3>
                  <p>Title: {template.title}</p>
                  <p>Category: {template.category}</p>
                  <p>Priority: {template.priority}</p>
                  {template.description && <p>Description: {template.description}</p>}
                  {template.expectedCompletionTime && <p>Expected Time: {template.expectedCompletionTime}</p>}
                  <div className="flex justify-between mt-2">
                    <Button onClick={() => handleUseTemplate(template)} variant="outline">Use Template</Button>
                    <Button onClick={() => deleteTaskTemplate(template.name)} variant="destructive">Delete</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

