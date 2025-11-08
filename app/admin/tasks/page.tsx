"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { LiquidCard } from "@/components/ui/liquid-card"
import { Navigation } from "@/components/navigation"

interface Task {
  id: string
  title: string
  description: string
  reward: number
  task_type: string
  icon: string
  action_url: string | null
  active: boolean
}

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    reward: 100,
    task_type: "daily",
    icon: "🎯",
    action_url: "",
  })

  useEffect(() => {
    checkAdminAndLoadTasks()
  }, [])

  async function checkAdminAndLoadTasks() {
    const supabase = createClient()

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()

    if (profile?.is_admin) {
      setIsAdmin(true)
      await loadTasks()
    }

    setLoading(false)
  }

  async function loadTasks() {
    const supabase = createClient()
    const { data } = await supabase.from("tasks").select("*").order("created_at", { ascending: false })

    if (data) setTasks(data)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const supabase = createClient()

    if (editingTask) {
      // Update existing task
      const { error } = await supabase
        .from("tasks")
        .update({
          title: formData.title,
          description: formData.description,
          reward: formData.reward,
          task_type: formData.task_type,
          icon: formData.icon,
          action_url: formData.action_url || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingTask.id)

      if (!error) {
        setEditingTask(null)
        resetForm()
        loadTasks()
      }
    } else {
      // Create new task
      const { error } = await supabase.from("tasks").insert([
        {
          title: formData.title,
          description: formData.description,
          reward: formData.reward,
          task_type: formData.task_type,
          icon: formData.icon,
          action_url: formData.action_url || null,
          active: true,
        },
      ])

      if (!error) {
        resetForm()
        loadTasks()
      }
    }
  }

  function editTask(task: Task) {
    setEditingTask(task)
    setFormData({
      title: task.title,
      description: task.description,
      reward: task.reward,
      task_type: task.task_type,
      icon: task.icon,
      action_url: task.action_url || "",
    })
  }

  async function toggleTaskActive(taskId: string, currentActive: boolean) {
    const supabase = createClient()
    await supabase.from("tasks").update({ active: !currentActive }).eq("id", taskId)

    loadTasks()
  }

  async function deleteTask(taskId: string) {
    if (!confirm("Are you sure you want to delete this task?")) return

    const supabase = createClient()
    await supabase.from("tasks").delete().eq("id", taskId)

    loadTasks()
  }

  function resetForm() {
    setFormData({
      title: "",
      description: "",
      reward: 100,
      task_type: "daily",
      icon: "🎯",
      action_url: "",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <LiquidCard className="p-8 text-center">
            <h1 className="text-2xl font-bold text-destructive mb-2">Access Denied</h1>
            <p className="text-muted-foreground">You do not have admin privileges.</p>
          </LiquidCard>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold mb-8 text-gradient">Task Management</h1>

        {/* Task Form */}
        <LiquidCard className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">{editingTask ? "Edit Task" : "Create New Task"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-card border border-border rounded text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Points Reward</label>
                <input
                  type="number"
                  value={formData.reward}
                  onChange={(e) => setFormData({ ...formData, reward: Number.parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-card border border-border rounded text-sm"
                  required
                  min="1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 bg-card border border-border rounded text-sm"
                rows={3}
                required
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={formData.task_type}
                  onChange={(e) => setFormData({ ...formData, task_type: e.target.value })}
                  className="w-full px-3 py-2 bg-card border border-border rounded text-sm"
                >
                  <option value="daily">Daily</option>
                  <option value="social">Social</option>
                  <option value="referral">Referral</option>
                  <option value="special">Special</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Icon (emoji)</label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full px-3 py-2 bg-card border border-border rounded text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Action URL (optional)</label>
                <input
                  type="url"
                  value={formData.action_url}
                  onChange={(e) => setFormData({ ...formData, action_url: e.target.value })}
                  className="w-full px-3 py-2 bg-card border border-border rounded text-sm"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" size="sm">
                {editingTask ? "Update Task" : "Create Task"}
              </Button>
              {editingTask && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingTask(null)
                    resetForm()
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </LiquidCard>

        {/* Tasks List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Existing Tasks ({tasks.length})</h2>
          {tasks.map((task) => (
            <LiquidCard key={task.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{task.icon}</span>
                    <h3 className="font-semibold">{task.title}</h3>
                    <span
                      className={`text-xs px-2 py-1 rounded ${task.active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}
                    >
                      {task.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>
                      Points: <span className="text-cyan-400 font-semibold">{task.reward}</span>
                    </span>
                    <span>Category: {task.task_type}</span>
                    {task.action_url && <span>Has action link</span>}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button size="sm" variant="outline" onClick={() => editTask(task)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toggleTaskActive(task.id, task.active)}>
                    {task.active ? "Deactivate" : "Activate"}
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteTask(task.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            </LiquidCard>
          ))}
        </div>
      </div>
    </div>
  )
}
