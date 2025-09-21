import type { Context } from 'telegraf'

export const maintenance = (ctx: Context) => ctx.reply('Agora não vai rolar 😥')

export async function withTyping<T>(
	ctx: Context<any>,
	fn: () => Promise<T>,
	options?: { intervalMs?: number },
): Promise<T> {
	const intervalMs = options?.intervalMs ?? 4000
	let timer: any | undefined
	const send = async () => {
		try {
			await ctx.sendChatAction('typing')
		} catch {}
	}
	try {
		await send()
		timer = setInterval(send, intervalMs)
		const result = await fn()
		return result
	} finally {
		if (timer) clearInterval(timer)
	}
}

export function safeTruncate(input: string, maxLength: number): string {
	const points = Array.from(input)
	if (points.length <= maxLength) return input
	return points.slice(0, maxLength).join('')
}
export const TELEGRAM_QUIZ_EXPLANATION_MAX_CHARS = 190
