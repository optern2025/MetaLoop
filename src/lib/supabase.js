import { createClient } from '@supabase/supabase-js'

let supabaseUrl = import.meta.env.VITE_SUPABASE_URL
if (!supabaseUrl || typeof supabaseUrl !== 'string' || supabaseUrl.trim() === '' || supabaseUrl === 'undefined') {
  supabaseUrl = 'https://cnvymzsgujibqsroqusn.supabase.co'
}

let supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
if (!supabaseAnonKey || typeof supabaseAnonKey !== 'string' || supabaseAnonKey.trim() === '' || supabaseAnonKey === 'undefined') {
  supabaseAnonKey = 'sb_publishable_iFQtAxeJsTsS8cgYlKRbPg_jkHAuzMt'
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/* ─── Auth Helpers ─── */

export async function signUp({ email, password, fullName, role = 'candidate' }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, role }
    }
  })
  if (error) throw error

  // Update profile role
  if (data.user) {
    await supabase.from('profiles').update({ role, full_name: fullName }).eq('id', data.user.id)
  }
  return data
}

export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data
}

export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}

/* ─── Team Helpers ─── */

export async function createTeam(teamName, leaderId) {
  const { data: team, error: teamError } = await supabase
    .from('teams')
    .insert({ team_name: teamName, leader_id: leaderId })
    .select()
    .single()
  if (teamError) throw teamError

  const { error: memberError } = await supabase
    .from('team_members')
    .insert({ team_id: team.id, user_id: leaderId, role: 'leader' })
  if (memberError) throw memberError
  return team
}

export async function joinTeam(inviteCode, userId) {
  const { data: team, error: teamError } = await supabase
    .from('teams')
    .select('*')
    .eq('invite_code', inviteCode)
    .single()
  if (teamError) throw new Error('Invalid invite code')

  const { data: members } = await supabase
    .from('team_members')
    .select('*')
    .eq('team_id', team.id)
  if (members && members.length >= team.max_members) throw new Error('Team is full')

  const { error } = await supabase
    .from('team_members')
    .insert({ team_id: team.id, user_id: userId, role: 'member' })
  if (error) throw error
  return team
}

export async function getMyTeam(userId) {
  const { data: membership, error } = await supabase
    .from('team_members')
    .select('team_id, role, teams(*, team_members(*, profiles(*)))')
    .eq('user_id', userId)
    .single()
  if (error) return null
  return membership
}

/* ─── Problem Statements ─── */

export async function getProblemStatements() {
  const { data, error } = await supabase
    .from('problem_statements')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

/* ─── Submissions ─── */

export async function createSubmission(submission) {
  const { data, error } = await supabase
    .from('submissions')
    .insert(submission)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateSubmission(id, updates) {
  const { data, error } = await supabase
    .from('submissions')
    .update({ ...updates, last_updated: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getTeamSubmission(teamId) {
  const { data, error } = await supabase
    .from('submissions')
    .select('*, problem_statements(*), evaluations(*)')
    .eq('team_id', teamId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

/* ─── Evaluations (Jury) ─── */

export async function getAllSubmissionsForJury() {
  const { data, error } = await supabase
    .from('submissions')
    .select('*, teams(team_name), problem_statements(title)')
    .in('status', ['submitted', 'under_review', 'evaluated'])
    .order('submitted_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createEvaluation(evaluation) {
  const { data, error } = await supabase
    .from('evaluations')
    .insert(evaluation)
    .select()
    .single()
  if (error) throw error

  // Update submission status
  await supabase
    .from('submissions')
    .update({ status: 'evaluated' })
    .eq('id', evaluation.submission_id)

  return data
}

export async function updateEvaluation(id, updates) {
  const { data, error } = await supabase
    .from('evaluations')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getJuryEvaluations(juryId) {
  const { data, error } = await supabase
    .from('evaluations')
    .select('*, submissions(idea_title, teams(team_name))')
    .eq('jury_id', juryId)
    .order('evaluated_at', { ascending: false })
  if (error) throw error
  return data
}

/* ─── Leaderboard ─── */

export async function getLeaderboard() {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*, teams(team_name, team_members(profiles(full_name, avatar_url)))')
    .order('rank', { ascending: true })
  if (error) throw error
  return data
}

/* ─── Admin Helpers ─── */

export async function getAllUsers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function updateUserRole(userId, newRole) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function createProblemStatement(problem) {
  const { data, error } = await supabase
    .from('problem_statements')
    .insert(problem)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateProblemStatement(id, updates) {
  const { data, error } = await supabase
    .from('problem_statements')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getAllProblems() {
  const { data, error } = await supabase
    .from('problem_statements')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getAllSubmissionsAdmin() {
  const { data, error } = await supabase
    .from('submissions')
    .select('*, teams(team_name, team_members(profiles(full_name))), problem_statements(title), evaluations(*)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function declareWinners(teamIds) {
  // Reset all winners
  await supabase.from('leaderboard').update({ is_winner: false, badge: '' }).neq('id', '')
  
  // Set winners
  for (let i = 0; i < teamIds.length; i++) {
    const badges = ['gold', 'silver', 'bronze']
    await supabase.from('leaderboard').update({ 
      is_winner: i < 3, 
      badge: badges[i] || 'finalist' 
    }).eq('team_id', teamIds[i])
  }
}

export async function getHackathonConfig() {
  const { data, error } = await supabase
    .from('hackathon_config')
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function updateHackathonConfig(id, updates) {
  const { data, error } = await supabase
    .from('hackathon_config')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}
