"use client"

import { useState, useEffect } from 'react'
import TaskList from '../../components/TaskList'
import CompletedTaskList from '../../components/CompletedTaskList'
import TaskForm from '../../components/TaskForm'
import Search from '../../components/Search'
import useStore from '../../lib/store'
import { Button } from "@/components/ui/button"
import { Download } from 'lucide-react'
import * as XLSX from 'xlsx'
import FileSaver from 'file-saver'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatTime } from '../../lib/utils'

export default function Tasks() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortOption, setSortOption] = useState('none')
  const { tasks, categories, addTask, updateTask, deleteTask, checkDueReminders } = useStore()

  const filteredTasks = tasks.filter(task => 
    (task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.category.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedCategory === 'all' || task.category === selectedCategory)
  )

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortOption) {
      case 'a-z':
        return a.title.localeCompare(b.title)
      case 'z-a':
        return b.title.localeCompare(a.title)
      case 'dueDate':
        return new Date(a.dueDate) - new Date(b.dueDate)
      case 'priority':
        const priorityOrder = { high: 1, medium: 2, low: 3 }
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      default:
        return 0
    }
  })

  const activeTasks = sortedTasks.filter(task => !task.completed)
  const completedTasks = sortedTasks.filter(task => task.completed)

  const generateExcelReport = () => {
    const worksheet = XLSX.utils.json_to_sheet(tasks.map(task => ({
      Title: task.title,
      Category: task.category,
      Priority: task.priority,
      Status: task.completed ? 'Completed' : 'Pending',
      'Time Spent': formatTime(task.timeSpent),
      'Expected Completion Time': task.expectedCompletionTime ? formatTime(task.expectedCompletionTime) : 'N/A',
      'Due Date': task.dueDate || 'N/A',
      'Timer History': task.timerHistory.map(entry => 
        `${entry.start ? new Date(entry.start).toLocaleString() : ''} - ${entry.stop ? new Date(entry.stop).toLocaleString() : ''}`
      ).join(', ')
    })))

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tasks Report")

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    FileSaver.saveAs(blob, "tasks_report.xlsx")
  }

  useEffect(() => {
    const reminderInterval = setInterval(() => {
      checkDueReminders();
    }, 60000); // Check every minute

    return () => clearInterval(reminderInterval);
  }, [checkDueReminders]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Tasks</h2>
        <Button onClick={generateExcelReport} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Download className="mr-2 h-4 w-4" /> Download Report
        </Button>
      </div>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 flex space-x-4">
          <Search 
            setSearchTerm={setSearchTerm} 
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
          <Select onValueChange={setSortOption} defaultValue={sortOption}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No sorting</SelectItem>
              <SelectItem value="a-z">A-Z</SelectItem>
              <SelectItem value="z-a">Z-A</SelectItem>
              <SelectItem value="dueDate">Due Date</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-8">
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="active">Active Tasks</TabsTrigger>
              <TabsTrigger value="completed">Completed Tasks</TabsTrigger>
            </TabsList>
            <TabsContent value="active">
              <ScrollArea className="h-[calc(100vh-300px)]">
                <TaskList tasks={activeTasks} />
              </ScrollArea>
            </TabsContent>
            <TabsContent value="completed">
              <ScrollArea className="h-[calc(100vh-300px)]">
                <CompletedTaskList tasks={completedTasks} />
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
        <div className="col-span-4">
          <TaskForm />
        </div>
      </div>
    </div>
  )
}

