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

#### MockAiService (`src/modules/infra/mocks/ai.mock.ts`)

Provides predictable AI responses for testing:

```typescript
const mockAi = new MockAiService()
mockAi.setMockResponse('input', { response: { text: () => 'output' } })
```

## Architecture Benefits

The refactored controllers now:

1. **Accept injected dependencies** instead of importing services directly
2. **Are easily testable** with mock services
3. **Maintain identical behavior** to the original implementation
4. **Support different service implementations** (real vs mock)

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