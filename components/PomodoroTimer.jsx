import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Play, Pause, RotateCcw, Settings } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const POMODORO = 25 * 60
const SHORT_BREAK = 5 * 60
const LONG_BREAK = 15 * 60

export function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isActive, setIsActive] = useState(false)
  const [mode, setMode] = useState('pomodoro')
  const { toast } = useToast()

  const [pomodoroTime, setPomodoroTime] = useState(25)
  const [shortBreakTime, setShortBreakTime] = useState(5)
  const [longBreakTime, setLongBreakTime] = useState(15)

  useEffect(() => {
    let interval = null

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      setIsActive(false)
      toast({
        title: "Time's up!",
        description: `${mode.charAt(0).toUpperCase() + mode.slice(1)} session completed.`,
      })
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, timeLeft, mode, toast])

  const toggleTimer = () => {
    setIsActive(!isActive)
  }

  const resetTimer = () => {
    setIsActive(false)
    switch (mode) {
      case 'pomodoro':
        setTimeLeft(pomodoroTime * 60)
        break
      case 'shortBreak':
        setTimeLeft(shortBreakTime * 60)
        break
      case 'longBreak':
        setTimeLeft(longBreakTime * 60)
        break
    }
  }

  const changeMode = (newMode) => {
    setMode(newMode)
    setIsActive(false)
    switch (newMode) {
      case 'pomodoro':
        setTimeLeft(pomodoroTime * 60)
        break
      case 'shortBreak':
        setTimeLeft(shortBreakTime * 60)
        break
      case 'longBreak':
        setTimeLeft(longBreakTime * 60)
        break
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const calculateProgress = () => {
    let total
    switch (mode) {
      case 'pomodoro':
        total = pomodoroTime * 60
        break
      case 'shortBreak':
        total = shortBreakTime * 60
        break
      case 'longBreak':
        total = longBreakTime * 60
        break
      default:
        total = pomodoroTime * 60
    }
    return ((total - timeLeft) / total) * 100
  }

  const handleSettingsChange = () => {
    resetTimer()
  }

  return (
    <Card className="w-full max-w-sm mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Pomodoro Timer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <Select value={mode} onValueChange={changeMode}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pomodoro">Pomodoro</SelectItem>
              <SelectItem value="shortBreak">Short Break</SelectItem>
              <SelectItem value="longBreak">Long Break</SelectItem>
            </SelectContent>
          </Select>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Timer Settings</DialogTitle>
                <DialogDescription>
                  Customize your Pomodoro timer durations here.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="pomodoro" className="text-right">
                    Pomodoro
                  </Label>
                  <Input
                    id="pomodoro"
                    type="number"
                    value={pomodoroTime}
                    onChange={(e) => setPomodoroTime(Number(e.target.value))}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="shortBreak" className="text-right">
                    Short Break
                  </Label>
                  <Input
                    id="shortBreak"
                    type="number"
                    value={shortBreakTime}
                    onChange={(e) => setShortBreakTime(Number(e.target.value))}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="longBreak" className="text-right">
                    Long Break
                  </Label>
                  <Input
                    id="longBreak"
                    type="number"
                    value={longBreakTime}
                    onChange={(e) => setLongBreakTime(Number(e.target.value))}
                    className="col-span-3"
                  />
                </div>
              </div>
              <Button onClick={handleSettingsChange}>Save Changes</Button>
            </DialogContent>
          </Dialog>
        </div>
        <div className="text-6xl font-bold text-center">{formatTime(timeLeft)}</div>
        <Progress value={calculateProgress()} className="w-full" />
        <div className="flex justify-center space-x-2">
          <Button onClick={toggleTimer} variant="outline" size="icon">
            {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button onClick={resetTimer} variant="outline" size="icon">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

