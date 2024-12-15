import { create } from 'zustand'
import { persist } from 'zustand/middleware'

function convertToMilliseconds(timeString) {
  const [hours, minutes, seconds] = timeString.split(':').map(Number);
  return ((hours * 60 + minutes) * 60 + seconds) * 1000;
}

const useStore = create(
  persist(
    (set, get) => ({
      tasks: [],
      categories: ['Work', 'Personal', 'Learning'],
      activeTaskId: null,
      taskTemplates: [],
      addTask: (task) => set((state) => ({ 
        tasks: [...state.tasks, { 
          ...task, 
          id: Date.now(), 
          timeSpent: 0, 
          timerActive: false, 
          timerStart: null,
          timerHistory: [],
          expectedCompletionTime: task.expectedCompletionTime ? convertToMilliseconds(task.expectedCompletionTime) : null,
          remainingTime: task.expectedCompletionTime ? convertToMilliseconds(task.expectedCompletionTime) : null,
          reminder: task.reminder
        }] 
      })),
      updateTask: (updatedTask) => set((state) => ({
        tasks: state.tasks.map(task => 
          task.id === updatedTask.id 
            ? {
                ...updatedTask,
                timerActive: updatedTask.completed ? false : updatedTask.timerActive,
                timeSpent: updatedTask.timeSpent,
                timerStart: updatedTask.timerStart,
                timerHistory: updatedTask.timerHistory,
                remainingTime: updatedTask.remainingTime
              }
            : task
        ),
        activeTaskId: updatedTask.completed ? null : state.activeTaskId
      })),
      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter(task => task.id !== id),
        activeTaskId: state.activeTaskId === id ? null : state.activeTaskId
      })),
      addCategory: (category) => set((state) => ({
        categories: [...state.categories, category]
      })),
      addTaskTemplate: (template) => set((state) => ({
        taskTemplates: [...state.taskTemplates, template]
      })),
      deleteTaskTemplate: (templateName) => set((state) => ({
        taskTemplates: state.taskTemplates.filter(template => template.name !== templateName)
      })),
      startTimer: (id) => set((state) => {
        const now = Date.now();
        return {
          tasks: state.tasks.map(task => 
            task.id === id ? { 
              ...task, 
              timerActive: true, 
              timerStart: now,
              timerHistory: [...task.timerHistory, { start: new Date(now).toISOString() }],
              remainingTime: task.expectedCompletionTime
            } : task
          ),
          activeTaskId: id
        };
      }),
      stopTimer: (id) => set((state) => {
        const now = Date.now();
        const task = state.tasks.find(t => t.id === id);
        if (!task) return state;

        const elapsedTime = now - task.timerStart;
        const newTimeSpent = task.timeSpent + elapsedTime;

        return {
          tasks: state.tasks.map(t => 
            t.id === id ? { 
              ...t, 
              timerActive: false, 
              timeSpent: newTimeSpent,
              timerStart: null,
              timerHistory: [...t.timerHistory, { 
                stop: new Date(now).toISOString(),
                duration: elapsedTime
              }],
              remainingTime: t.expectedCompletionTime 
                ? Math.max(0, t.expectedCompletionTime - newTimeSpent)
                : null
            } : t
          ),
          activeTaskId: null
        };
      }),
      completeTask: (id) => set((state) => {
        const task = state.tasks.find(t => t.id === id);
        if (!task) return state;

        const now = Date.now();
        const elapsedTime = task.timerActive ? now - task.timerStart : 0;
        const newTimeSpent = task.timeSpent + elapsedTime;

        return {
          tasks: state.tasks.map(t => 
            t.id === id 
              ? { 
                  ...t, 
                  completed: true, 
                  timerActive: false, 
                  timeSpent: newTimeSpent,
                  timerStart: null,
                  timerHistory: [...t.timerHistory, ...(t.timerActive ? [{ 
                    stop: new Date(now).toISOString(),
                    duration: elapsedTime
                  }] : [])]
                } 
              : t
          ),
          activeTaskId: state.activeTaskId === id ? null : state.activeTaskId
        };
      }),
      getTimeTakenToday: () => {
        const today = new Date().setHours(0, 0, 0, 0);
        return get().tasks.reduce((total, task) => {
          if (task.timerStart && task.timerStart >= today) {
            return total + task.timeSpent + (task.timerActive ? Date.now() - task.timerStart : 0);
          }
          return total + task.timeSpent;
        }, 0);
      },
      getTimeTakenByCategory: () => {
        return get().tasks.reduce((acc, task) => {
          const categoryTime = acc[task.category] || 0;
          acc[task.category] = categoryTime + task.timeSpent + (task.timerActive ? Date.now() - task.timerStart : 0);
          return acc;
        }, {});
      },
      reminders: [],
      addReminder: (reminder) => set((state) => ({
        reminders: [...state.reminders, { ...reminder, id: Date.now(), notified: false }]
      })),
      removeReminder: (id) => set((state) => ({
        reminders: state.reminders.filter(reminder => reminder.id !== id)
      })),
      updateReminder: (updatedReminder) => set((state) => ({
        reminders: state.reminders.map(reminder => 
          reminder.id === updatedReminder.id ? updatedReminder : reminder
        )
      })),
      checkDueReminders: () => {
        const now = new Date();
        get().tasks.forEach(task => {
          if (task.reminder && !task.reminder.notified && new Date(task.reminder.dateTime) <= now) {
            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              new Notification(`Task Reminder: ${task.title}`, {
                body: `Your task "${task.title}" is due now.`,
                icon: '/icon.png'
              });
            }
            set(state => ({
              tasks: state.tasks.map(t => 
                t.id === task.id ? { ...t, reminder: { ...t.reminder, notified: true } } : t
              )
            }));
          }
        });
      },
    }),
    {
      name: 'todo-storage',
      partialize: (state) => ({
        tasks: state.tasks,
        categories: state.categories,
        taskTemplates: state.taskTemplates,
        reminders: state.reminders,
      }),
    }
  )
)

export default useStore

