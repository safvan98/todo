"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Play, Square, CheckSquare } from 'lucide-react'
import useStore from '../lib/store'
import { PomodoroTimer } from '../components/PomodoroTimer'

export default function Dashboard() {
  const { tasks, getTimeTakenToday, getTimeTakenByCategory, activeTaskId, startTimer, stopTimer, completeTask } = useStore()
  const [timeTakenToday, setTimeTakenToday] = useState(0)
  const [timeTakenByCategory, setTimeTakenByCategory] = useState({})
  const [currentTime, setCurrentTime] = useState(0)

  useEffect(() => {
    const updateTimes = () => {
      setTimeTakenToday(getTimeTakenToday())
      setTimeTakenByCategory(getTimeTakenByCategory())
    }

    updateTimes()
    const interval = setInterval(updateTimes, 1000)

    return () => clearInterval(interval)
  }, [getTimeTakenToday, getTimeTakenByCategory])

  useEffect(() => {
    let interval
    if (activeTaskId) {
      interval = setInterval(() => {
        setCurrentTime(prev => prev + 1000)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [activeTaskId])

  const completedTasks = tasks.filter(task => task.completed).length
  const pendingTasks = tasks.length - completedTasks
  const activeTask = tasks.find(task => task.id === activeTaskId)

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`
  }

  const getProgressValue = () => {
    if (!activeTask || !activeTask.expectedCompletionTime) return 0
    const progress = (currentTime / activeTask.expectedCompletionTime) * 100
    return Math.min(Math.max(progress, 0), 100)
  }

  const getProgressColor = () => {
    if (!activeTask || !activeTask.expectedCompletionTime) return 'bg-primary'
    const remainingTime = Math.max(0, activeTask.expectedCompletionTime - currentTime)
    if (remainingTime <= 0) return 'bg-destructive'
    if (remainingTime <= 60000) return 'bg-warning'
    return 'bg-primary'
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Dashboard</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card text-card-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-card text-card-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks}</div>
          </CardContent>
        </Card>
        <Card className="bg-card text-card-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTasks}</div>
          </CardContent>
        </Card>
        <Card className="bg-card text-card-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Taken Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(timeTakenToday)}</div>
          </CardContent>
        </Card>
      </div>
      {activeTask && (
        <Card className="bg-card text-card-foreground mt-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Currently Active Task</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <div>
                <div className="text-xl font-bold">{activeTask.title}</div>
                <Badge variant="outline" className="mt-1">{activeTask.category}</Badge>
              </div>
              <div className="space-x-2">
                {!activeTask.timerActive ? (
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="bg-secondary text-secondary-foreground hover:bg-secondary/80" 
                    onClick={() => startTimer(activeTask.id)}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="bg-secondary text-secondary-foreground hover:bg-secondary/80" 
                    onClick={() => stopTimer(activeTask.id)}
                  >
                    <Square className="h-4 w-4" />
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="bg-secondary text-secondary-foreground hover:bg-secondary/80" 
                  onClick={() => completeTask(activeTask.id)}
                >
                  <CheckSquare className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="text-sm text-muted-foreground mb-2">Time Spent: {formatTime(currentTime)}</div>
            {activeTask.expectedCompletionTime && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{formatTime(Math.max(0, activeTask.expectedCompletionTime - currentTime))} remaining</span>
                </div>
                <Progress value={getProgressValue()} className={`h-2 ${getProgressColor()}`} />
              </div>
            )}
          </CardContent>
        </Card>
      )}
      <h3 className="text-2xl font-bold mt-8">Time Taken by Category</h3>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(timeTakenByCategory).map(([category, time]) => (
          <Card key={category} className="bg-card text-card-foreground">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{category}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatTime(time)}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <h3 className="text-2xl font-bold mt-8">Pomodoro Timer</h3>
      <PomodoroTimer />
    </div>
  )
}

