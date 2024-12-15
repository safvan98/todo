"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Bell, Trash2, Download } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import useStore from '../../lib/store'
import * as XLSX from 'xlsx'
import FileSaver from 'file-saver'

export default function Reminders() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [reminderTime, setReminderTime] = useState('')
  const { reminders, addReminder, removeReminder, updateReminder } = useStore()
  const { toast } = useToast()
  const [notificationPermission, setNotificationPermission] = useState('default')

  // useEffect(() => {
  //   if (typeof window !== 'undefined' && 'Notification' in window) {
  //     setNotificationPermission(Notification.permission)
  //   }
  // }, [])

  useEffect(() => {
    const checkReminders = setInterval(() => {
      reminders.forEach(reminder => {
        if (new Date(reminder.time) <= new Date() && !reminder.notified) {
          showNotification(reminder)
          updateReminder({ ...reminder, notified: true })
        }
      })
    }, 1000)

    return () => clearInterval(checkReminders)
  }, [reminders, updateReminder])

  const showNotification = (reminder) => {
    if (notificationPermission === 'granted') {
      new Notification(reminder.title, { body: reminder.description })
    } else {
      toast({
        title: reminder.title,
        description: reminder.description,
      })
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (title && reminderTime) {
      addReminder({ title, description, time: new Date(reminderTime).toISOString() })
      setTitle('')
      setDescription('')
      setReminderTime('')
      toast({
        title: "Reminder created",
        description: "Your reminder has been set successfully.",
      })
    }
  }

  const handleRemoveReminder = (id) => {
    removeReminder(id)
    toast({
      title: "Reminder removed",
      description: "The reminder has been deleted.",
    })
  }

  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const permission = await Notification.requestPermission()
      setNotificationPermission(permission)
      if (permission === 'granted') {
        toast({
          title: "Notifications enabled",
          description: "You will now receive reminder notifications.",
        })
      } else {
        toast({
          title: "Notifications not enabled",
          description: "You will see reminders as toasts instead.",
          variant: "destructive",
        })
      }
    }
  }

  const generateExcelReport = () => {
    const worksheet = XLSX.utils.json_to_sheet(reminders.map(reminder => ({
      Title: reminder.title,
      Description: reminder.description,
      Time: new Date(reminder.time).toLocaleString(),
      Notified: reminder.notified ? 'Yes' : 'No'
    })))

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reminders Report")

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    FileSaver.saveAs(blob, "reminders_report.xlsx")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Reminders</h2>
        <Button onClick={generateExcelReport} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Download className="mr-2 h-4 w-4" /> Download Report
        </Button>
      </div>
      {notificationPermission !== 'granted' && (
        <Button onClick={requestNotificationPermission}>
          Enable Browser Notifications
        </Button>
      )}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8 overflow-hidden">
          <div className="space-y-4">
            {reminders.map(reminder => (
              <Card key={reminder.id}>
                <CardContent className="flex justify-between items-center p-4">
                  <div>
                    <h4 className="font-semibold">{reminder.title}</h4>
                    <p className="text-sm text-muted-foreground">{reminder.description}</p>
                    <p className="text-sm">{new Date(reminder.time).toLocaleString()}</p>
                  </div>
                  <Button variant="destructive" size="icon" onClick={() => handleRemoveReminder(reminder.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <div className="col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>Create a New Reminder</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="reminderTime">Reminder Time</Label>
                  <Input
                    id="reminderTime"
                    type="datetime-local"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit">Add Reminder</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

