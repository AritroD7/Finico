import { supabase } from "../lib/supabase"

export async function saveScenario(user, payload) {
  if (!user) throw new Error("Sign in required")
  const { data, error } = await supabase
    .from("scenarios")
    .insert({
      user_id: user.id,
      name: payload.name || "Untitled",
      page: payload.page,
      inputs: payload.inputs || {},
      results: payload.results || null
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function listScenarios(user, page) {
  if (!user) return []
  const { data, error } = await supabase
    .from("scenarios")
    .select("*")
    .eq("user_id", user.id)
    .eq("page", page)
    .order("created_at", { ascending: false })
  if (error) throw error
  return data || []
}
