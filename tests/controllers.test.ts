import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createWhosplayingController, createLongweekController } from '../src/modules/infra/controllers/events.controllers.js'
import { MockAiService } from '../src/modules/infra/mocks/ai.mock.js'
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
    let mockAiService: MockAiService
    let mockWhosplayingService: WhosplayingService
    let controller: ReturnType<typeof createWhosplayingController>

    beforeEach(() => {
      mockAiService = new MockAiService()
      mockWhosplayingService = createMockWhosplayingService()
      controller = createWhosplayingController({
        aiService: mockAiService,
        whosplayingService: mockWhosplayingService
      })
    })

    it('should handle whosplaying command successfully', async () => {
      const mockContext = createMockContext()
      const mockMembers = [
        { displayName: 'User1', username: 'user1', activities: [{ name: 'Playing Game' }] }
      ]
      const mockAiResponse = {
        response: { text: () => 'User1 is playing Game!' }
      }

      vi.mocked(mockWhosplayingService.getOnlineMembers).mockResolvedValue(mockMembers)
      mockAiService.setMockResponse(JSON.stringify(mockMembers), mockAiResponse)

      await controller(mockContext as any)

      expect(mockWhosplayingService.getOnlineMembers).toHaveBeenCalledOnce()
      expect(mockContext.reply).toHaveBeenCalledWith('User1 is playing Game!')
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