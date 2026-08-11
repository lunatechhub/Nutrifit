import { decode } from 'base64-arraybuffer'
import { supabase } from './supabase'

export interface ProfileEdits {
  name: string
  targetWeight: number | null
}

// Uploads to avatars/{uid}/avatar.jpg (upsert) and returns a cache-busted public URL
export async function uploadAvatar(base64: string, mimeType: string): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const ext = mimeType.split('/')[1] ?? 'jpg'
  const path = `${user.id}/avatar.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, decode(base64), { contentType: mimeType, upsert: true })
  if (uploadError) throw uploadError

  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  return `${data.publicUrl}?t=${Date.now()}`
}

export async function saveProfileEdits(edits: ProfileEdits, avatarUrl?: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase.from('profiles').update({
    name: edits.name,
    target_weight: edits.targetWeight,
    ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
  }).eq('id', user.id)

  if (error) throw error
}
