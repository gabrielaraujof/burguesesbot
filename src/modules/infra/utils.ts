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
	if (maxLength <= 0) return ''
	const AnyIntl: any = globalThis.Intl as any
	const hasSegmenter = !!(AnyIntl && AnyIntl.Segmenter)
	if (hasSegmenter) {
		const seg = new AnyIntl.Segmenter(undefined, { granularity: 'grapheme' })
		const segments: string[] = []
		for (const s of seg.segment(input) as any) {
			segments.push(s.segment)
		}
		if (segments.length <= maxLength) return input
		return segments.slice(0, maxLength).join('')
	} else {
		const points = Array.from(input)
		if (points.length <= maxLength) return input
		return points.slice(0, maxLength).join('')
	}
}
export const TELEGRAM_QUIZ_EXPLANATION_MAX_CHARS = 190
