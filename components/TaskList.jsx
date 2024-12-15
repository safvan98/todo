import TaskItem from './TaskItem'
import { ScrollArea } from "@/components/ui/scroll-area"

export default function TaskList({ tasks }) {
  const activeTasks = tasks.filter(task => !task.completed)

  if (activeTasks.length === 0) {
    return <p>No active tasks found. Add a new task to get started!</p>
  }

  return (
    <ScrollArea className="h-[calc(100vh-200px)] pr-4">
      <div className="space-y-4">
        {activeTasks.map(task => (
          <TaskItem 
            key={task.id} 
            task={task}
          />
        ))}
      </div>
    </ScrollArea>
  )
}

