'use server'

import { revalidatePath } from 'next/cache'
import { saveMessage } from '@/app/lib/messages'

export interface ActionState {
  success: boolean
  error?: string
  at?: number
}

export async function submitMessage(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const name = (formData.get('name') as string) ?? ''
  const message = (formData.get('message') as string) ?? ''

  if (!message.trim()) {
    return { success: false, error: 'Vui lòng nhập nội dung tin nhắn.' }
  }

  if (message.trim().length > 500) {
    return { success: false, error: 'Tin nhắn tối đa 500 ký tự.' }
  }

  try {
    await saveMessage(name, message)
    revalidatePath('/')
    return { success: true, at: Date.now() }
  } catch {
    return { success: false, error: 'Có lỗi xảy ra. Vui lòng thử lại.' }
  }
}
