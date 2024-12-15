import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Trash, Edit, Play, Square, ChevronDown, ChevronUp } from 'lucide-react'
import useStore from '../lib/store'
import { Progress } from "@/components/ui/progress"

export default function TaskItem({ task }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedTask, setEditedTask] = useState(task)
  const [showTimerHistory, setShowTimerHistory] = useState(false)
  const [currentTime, setCurrentTime] = useState(task.timeSpent)
  const { categories, updateTask, deleteTask, startTimer, stopTimer, completeTask, activeTaskId } = useStore()

  const updateCurrentTime = useCallback(() => {
    if (task.timerActive) {
      const elapsedTime = Date.now() - task.timerStart;
      setCurrentTime(task.timeSpent + elapsedTime);
    } else {
      setCurrentTime(task.timeSpent);
    }
  }, [task.timerActive, task.timerStart, task.timeSpent]);

  useEffect(() => {
    updateCurrentTime();
    const interval = setInterval(updateCurrentTime, 1000);
    return () => clearInterval(interval);
  }, [updateCurrentTime]);

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = () => {
    updateTask(editedTask)
    setIsEditing(false)
  }

  const handleChange = (e) => {
    const { name, value, type,checked } = e.target
    setEditedTask({
      ...editedTask,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleCategoryChange = (value) => {
    setEditedTask({ ...editedTask, category: value })
  }

  const handlePriorityChange = (value) => {
    setEditedTask({ ...editedTask, priority: value })
  }

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    return `${hours.toString().padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`
  }

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  }

  const getProgressColor = () => {
    if (!task.expectedCompletionTime) return 'bg-primary';
    const remainingTime = Math.max(0, task.expectedCompletionTime - currentTime);
    if (remainingTime <= 0) return 'bg-destructive'
    if (remainingTime <= 10000) return 'bg-destructive'
    if (remainingTime <= 60000) return 'bg-warning'
    return 'bg-primary'
  }

  const getProgressValue = () => {
    if (!task.expectedCompletionTime) return 0;
    const progress = (currentTime / task.expectedCompletionTime) * 100;
    return Math.min(Math.max(progress, 0), 100);
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low':
        return 'bg-blue-500 text-white'
      case 'medium':
        return 'bg-yellow-500 text-black'
      case 'high':
        return 'bg-red-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  return (
    <Card className="bg-card text-card-foreground">
      <CardContent className="p-4">
        {isEditing ? (
          <div className="space-y-2">
            <Input
              type="text"
              name="title"
              value={editedTask.title}
              onChange={handleChange}
              className="w-full"
            />
            <Select onValueChange={handleCategoryChange} defaultValue={editedTask.category}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={handlePriorityChange} defaultValue={editedTask.priority}>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              name="dueDate"
              value={editedTask.dueDate}
              onChange={handleChange}
            />
            <Input
              type="text"
              name="expectedCompletionTime"
              value={editedTask.expectedCompletionTime}
              onChange={handleChange}
              placeholder="Expected completion time (HH:MM:SS)"
            />
            <div className="flex justify-end space-x-2">
              <Button onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      completeTask(task.id)
                    } else {
                      updateTask({ ...task, completed: false })
                    }
                  }}
                  className="border-primary"
                />
                <span className={task.completed ? 'line-through' : ''}>{task.title}</span>
                <Badge variant="outline">{task.category}</Badge>
                <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
              </div>
              <div className="flex items-center space-x-2">
                <span>Total: {formatTime(currentTime)}</span>
                {!task.timerActive ? (
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="bg-secondary text-secondary-foreground hover:bg-secondary/80" 
                    onClick={() => !task.completed && startTimer(task.id)}
                    disabled={activeTaskId !== null && activeTaskId !== task.id}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button variant="outline" size="icon" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" onClick={() => stopTimer(task.id)}>
                    <Square className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="outline" size="icon" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" onClick={handleEdit}>
                  <Edit className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="icon" className="bg-secondary text-secondary-foreground hover:bg-secondary/80">
                      <Trash className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your task.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteTask(task.id)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
            {task.expectedCompletionTime && (
              <div className="mt-2">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Expected completion time:</span>
                  <span className="text-sm font-medium">{formatTime(Math.max(0, task.expectedCompletionTime - currentTime))}</span>
                </div>
                <Progress
                  value={getProgressValue()}
                  className={`h-2 ${getProgressColor()}`}
                />
              </div>
            )}
            {task.reminder && (
              <div className="mt-2 text-sm">
                <span className="font-semibold">Reminder:</span> {new Date(task.reminder.dateTime).toLocaleString()}
              </div>
            )}
            <Button
              variant="outline"
              onClick={() => setShowTimerHistory(!showTimerHistory)}
              className="mt-2 w-full justify-center"
            >
              {showTimerHistory ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-2" />
                  Hide Timer History
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-2" />
                  Show Timer History
                </>
              )}
            </Button>
            {showTimerHistory && (
              <div className="mt-4 space-y-4 text-sm">
                {task.timerHistory.reduce((acc, entry, index, array) => {
                  if (entry.start) {
                    const stopEntry = array[index + 1];
                    if (stopEntry && stopEntry.stop) {
                      const sessionStart = new Date(entry.start);
                      const sessionEnd = new Date(stopEntry.stop);
                      const sessionDuration = stopEntry.duration || (sessionEnd - sessionStart);
                      acc.push(
                        <div key={index} className="bg-secondary/50 p-3 rounded-lg space-y-2">
                          <div className="font-semibold text-base">Session {acc.length + 1}</div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>Started:</div>
                            <div>{formatDateTime(entry.start)}</div>
                            <div>Stopped:</div>
                            <div>{formatDateTime(stopEntry.stop)}</div>
                            <div>Duration:</div>
                            <div>{formatTime(sessionDuration)}</div>
                          </div>
                        </div>
                      );
                    }
                  }
                  return acc;
                }, [])}
              </div>
            )}
            {task.completed && (
              <div className="mt-4 p-3 bg-secondary/50 rounded-lg space-y-2">
                <div className="font-semibold text-base">Task Completed</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Expected Time:</div>
                  <div>{formatTime(task.expectedCompletionTime || 0)}</div>
                  <div>Actual Time Taken:</div>
                  <div>{formatTime(task.timeSpent)}</div>
                  {task.timeSpent > (task.expectedCompletionTime || 0) && (
                    <>
                      <div>Additional Time:</div>
                      <div>{formatTime(task.timeSpent - (task.expectedCompletionTime || 0))}</div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

