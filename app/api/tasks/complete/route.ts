import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { taskId } = await request.json()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get task details
    const { data: task, error: taskError } = await supabase.from("tasks").select("*").eq("id", taskId).single()

    if (taskError || !task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Check if task already completed
    const { data: existingCompletion } = await supabase
      .from("task_completions")
      .select("id")
      .eq("user_id", user.id)
      .eq("task_id", taskId)
      .single()

    if (existingCompletion) {
      return NextResponse.json({ error: "Task already completed" }, { status: 400 })
    }

    const { error: completionError } = await supabase.from("task_completions").insert({
      user_id: user.id,
      task_id: taskId,
      points_awarded: task.reward,
    })

    if (completionError) {
      return NextResponse.json({ error: "Failed to complete task" }, { status: 500 })
    }

    const { error: pointsError } = await supabase.rpc("increment_points", {
      user_id: user.id,
      points_to_add: task.reward,
    })

    if (pointsError) {
      console.error("[v0] Failed to update points:", pointsError)
      // Rollback completion if points update fails
      await supabase.from("task_completions").delete().eq("user_id", user.id).eq("task_id", taskId)
      return NextResponse.json({ error: "Failed to award points" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      pointsAwarded: task.reward,
    })
  } catch (error) {
    console.error("[v0] Task completion error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
