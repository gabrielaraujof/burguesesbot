import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createWhosplayingController, createLongweekController } from '../src/modules/infra/controllers/events.controllers.js'
import { MockAiProvider } from '../src/modules/infra/mocks/ai.mock.js'
import { whosplayingExpert, whosplayingHistory } from '../src/modules/ai/index.js'
import type { WhosplayingService } from '../src/modules/infra/controllers/events.controllers.js'

const createMockContext = () => ({
  reply: vi.fn(),
  replyWithPhoto: vi.fn(),
  editMessageText: vi.fn(),
  deleteMessage: vi.fn(),
  replyWithQuiz: vi.fn()
})

const createMockWhosplayingService = (): WhosplayingService => ({
  getOnlineMembers: vi.fn()
})

describe('Event Controllers', () => {
  describe('WhosplayingController', () => {
  let mockAiProvider: MockAiProvider
    let mockWhosplayingService: WhosplayingService
    let controller: ReturnType<typeof createWhosplayingController>

    beforeEach(() => {
      mockAiProvider = new MockAiProvider()
      mockWhosplayingService = createMockWhosplayingService()
      controller = createWhosplayingController({
        aiProvider: mockAiProvider,
        whosplayingService: mockWhosplayingService
      })
    })

    it('should handle whosplaying command successfully and call AI with expected shape', async () => {
      const mockContext = createMockContext()
      const mockMembers = [
        { displayName: 'User1', username: 'user1', activities: [{ name: 'Playing Game' }] }
      ]
      const mockAiResponseText = 'User1 is playing Game!'

      vi.mocked(mockWhosplayingService.getOnlineMembers).mockResolvedValue(mockMembers)
      mockAiProvider.setMockResponse(JSON.stringify(mockMembers), mockAiResponseText)
      const spy = vi.spyOn(mockAiProvider, 'generate')

      await controller(mockContext as any)

      expect(mockWhosplayingService.getOnlineMembers).toHaveBeenCalledOnce()
      expect(mockContext.reply).toHaveBeenCalledWith('User1 is playing Game!')
      expect(spy).toHaveBeenCalledWith(
        JSON.stringify(mockMembers),
        { system: whosplayingExpert, history: whosplayingHistory }
      )
    })

    it('should handle errors gracefully', async () => {
      const mockContext = createMockContext()
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      vi.mocked(mockWhosplayingService.getOnlineMembers).mockRejectedValue(new Error('Service error'))

      await controller(mockContext as any)

      expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error))
      expect(mockContext.reply).not.toHaveBeenCalled()

      consoleSpy.mockRestore()
    })
  })

  describe('LongweekController', () => {
    it('should respond with the expected message', async () => {
      const mockContext = createMockContext()
      const controller = createLongweekController()

      await controller(mockContext as any)

      expect(mockContext.reply).toHaveBeenCalledWith('cadê a live?')
    })
  })
})