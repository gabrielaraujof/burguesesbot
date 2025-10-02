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
        { system: expect.stringContaining('BurguesesBot'), history: whosplayingHistory }
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
    let mockAiProvider: MockAiProvider
    let controller: ReturnType<typeof createLongweekController>

    beforeEach(() => {
      mockAiProvider = new MockAiProvider()
      controller = createLongweekController({ aiProvider: mockAiProvider })
    })

    it('should respond with AI-generated message using streaming', async () => {
      const mockContext = createMockContext()
      const mockAiResponse = 'Hora de relaxar! Que tal uma sessão de jogos ou assistir algumas streams juntos? 🎮'
      
      // Mock the streaming response
      mockAiProvider.setMockResponse(
        'A semana foi tão longa e cansativa! Preciso de algo para ajudar a relaxar e descansar.', 
        mockAiResponse
      )
      const spy = vi.spyOn(mockAiProvider, 'generateStream')

      await controller(mockContext as any)

      expect(mockContext.reply).toHaveBeenCalledWith(mockAiResponse)
      expect(spy).toHaveBeenCalledWith(
        'A semana foi tão longa e cansativa! Preciso de algo para ajudar a relaxar e descansar.',
        expect.objectContaining({
          system: expect.stringContaining('BurguesesBot'),
          config: expect.objectContaining({
            temperature: 0.8,
            maxTokens: 120
          })
        })
      )
    })

    it('should fallback to hardcoded message on AI error', async () => {
      const mockContext = createMockContext()
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      // Mock AI provider to throw error
      const aiProvider = {
        generateStream: vi.fn().mockRejectedValue(new Error('AI error')),
        generate: vi.fn().mockRejectedValue(new Error('AI error'))
      }
      const controller = createLongweekController({ aiProvider: aiProvider as any })

      await controller(mockContext as any)

      expect(mockContext.reply).toHaveBeenCalledWith('cadê a live?')
      expect(consoleSpy).toHaveBeenCalledWith('Longweek AI error:', expect.any(Error))

      consoleSpy.mockRestore()
    })
  })
})