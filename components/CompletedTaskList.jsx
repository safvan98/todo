import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatTime } from '../lib/utils'

export default function CompletedTaskList({ tasks }) {
  if (tasks.length === 0) {
    return <p>No completed tasks.</p>
  }

  return (
    <div className="space-y-4">
      {tasks.map(task => (
        <Card key={task.id} className="bg-card text-card-foreground">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="line-through">{task.title}</span>
                <Badge variant="outline">{task.category}</Badge>
                <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
              </div>
              <span>Time Spent: {formatTime(task.timeSpent)}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function getPriorityColor(priority) {
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

