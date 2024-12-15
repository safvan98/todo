"use client"

import { TaskTemplates } from '../../components/TaskTemplates'

export default function TemplatesPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Task Templates</h2>
      <TaskTemplates />
    </div>
  )
}

