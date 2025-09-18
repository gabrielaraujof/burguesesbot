# Testing Guide

This document describes the testing setup for BurguesesBot after the DI factory refactor.

## Testing Framework

- **Framework**: Vitest (fast, modern testing framework)
- **Mocking**: Built-in Vitest mocking capabilities
- **Type Support**: Full TypeScript support

## Running Tests

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov
```

## Test Structure

### Controllers Tests (`tests/controllers.test.ts`)

Tests the refactored event controllers that now use dependency injection:

- **WhosplayingController**: Tests AI integration with mock services
- **LongweekController**: Tests simple response handling
- Error handling and edge cases

### Mock Services

#### MockAiProvider (`src/modules/infra/mocks/ai.mock.ts`)

Provider-agnostic AI mock returning plain text via `AiResponse`:

```typescript
const mockAi = new MockAiProvider()
mockAi.setMockResponse('input', 'output')
// controller deps
const controller = createWhosplayingController({ aiProvider: mockAi, whosplayingService })
```

Deterministic fallback:

If you do not register a specific mock response via `setMockResponse`, the mock generates a stable hashed output derived from the tuple `(input, system, history, config)`:

```
// Unseeded call
const { text } = await mockAi.generate('some input', { system: 'sys' })
// text -> e.g. mock:3fae9c1b7d2a4f10 (hex hash prefix)
```

This guarantees the same inputs always yield the same mock output (stable object key ordering via custom serializer), removing randomness from tests while keeping responses compact.

## Architecture Benefits

The refactored controllers now:

1. **Accept injected dependencies** instead of importing services directly
2. **Are easily testable** with mock services
3. **Maintain identical behavior** to the original implementation
4. **Support different provider implementations** (real vs mock) behind `AiProvider`

## Adding New Tests

When adding new controller tests:

1. Create mock implementations of required services
2. Use Vitest's `vi.fn()` for function mocking
3. Test both success and error scenarios
4. Verify the correct methods are called with expected parameters

Example:
```typescript
describe('NewController', () => {
  it('should handle command successfully', async () => {
    // Arrange
    const mockService = { method: vi.fn().mockResolvedValue('result') }
    const controller = createNewController({ service: mockService })
    
    // Act
    await controller(mockContext)
    
    // Assert
    expect(mockService.method).toHaveBeenCalledOnce()
  })
})
```