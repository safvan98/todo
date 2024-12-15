import useStore from '../lib/store'
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function TaskForm() {
  const [task, setTask] = useState({
    title: '',
    category: '',
    dueDate: '',
    expectedCompletionTime: '',
    completed: false,
    priority: 'medium',
    reminder: {
      enabled: false,
      date: '',
      time: ''
    }
  })
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const { categories, addTask } = useStore()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (task.title && task.category) {
      const newTask = {
        ...task,
        reminder: task.reminder.enabled
          ? {
              ...task.reminder,
              dateTime: new Date(`${task.reminder.date}T${task.reminder.time}`).toISOString()
            }
          : null
      }
      addTask(newTask)
      setTask({
        title: '',
        category: '',
        dueDate: '',
        expectedCompletionTime: '',
        completed: false,
        priority: 'medium',
        reminder: {
          enabled: false,
          date: '',
          time: ''
        }
      })
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setTask(prevTask => ({
      ...prevTask,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleReminderChange = (e) => {
    const { name, value, type, checked } = e.target
    setTask(prevTask => ({
      ...prevTask,
      reminder: {
        ...prevTask.reminder,
        [name]: type === 'checkbox' ? checked : value
      }
    }))
  }

  const handleCategoryChange = (value) => {
    setTask({ ...task, category: value })
  }

  const handlePriorityChange = (value) => {
    setTask({ ...task, priority: value })
  }

  const applyTemplate = (template) => {
    setTask({
      ...task,
      title: template.title,
      category: template.category,
      priority: template.priority,
      expectedCompletionTime: template.expectedCompletionTime,
    })
    setSelectedTemplate(template)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Task</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Label>Select Template</Label>
          <ScrollArea className="h-[200px] w-full border rounded-md p-4">
            {categories.map((template) => (
              <div
                key={template.name}
                className={`p-2 mb-2 cursor-pointer rounded ${
                  selectedTemplate === template ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                }`}
                onClick={() => applyTemplate(template)}
              >
                {template.name}
              </div>
            ))}
          </ScrollArea>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              name="title"
              value={task.title}
              onChange={handleChange}
              placeholder="Enter task title"
              required
            />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Select onValueChange={handleCategoryChange} required>
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
            <Label htmlFor="priority">Priority</Label>
            <Select onValueChange={handlePriorityChange} defaultValue={task.priority}>
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
            <Label htmlFor="dueDate">Due Date (Optional)</Label>
            <Input
              id="dueDate"
              name="dueDate"
              type="date"
              value={task.dueDate}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="expectedCompletionTime">Expected Completion Time (Optional)</Label>
            <Input
              id="expectedCompletionTime"
              name="expectedCompletionTime"
              type="text"
              value={task.expectedCompletionTime}
              onChange={handleChange}
              placeholder="HH:MM:SS"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="reminder-enabled"
              name="enabled"
              checked={task.reminder.enabled}
              onCheckedChange={(checked) => handleReminderChange({ target: { name: 'enabled', type: 'checkbox', checked } })}
            />
            <Label htmlFor="reminder-enabled">Enable Reminder</Label>
          </div>
          {task.reminder.enabled && (
            <div className="space-y-2">
              <div>
                <Label htmlFor="reminder-date">Reminder Date</Label>
                <Input
                  id="reminder-date"
                  name="date"
                  type="date"
                  value={task.reminder.date}
                  onChange={handleReminderChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="reminder-time">Reminder Time</Label>
                <Input
                  id="reminder-time"
                  name="time"
                  type="time"
                  value={task.reminder.time}
                  onChange={handleReminderChange}
                  required
                />
              </div>
            </div>
          )}
          <Button type="submit">Add Task</Button>
        </form>
      </CardContent>
    </Card>
  )
}

