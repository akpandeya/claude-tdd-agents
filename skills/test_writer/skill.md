# Test Writer Skill

**Purpose:** Write comprehensive tests BEFORE any implementation code, enforcing strict Test-Driven Development (TDD) practices.

## Core Principles

1. **Red First:** Tests must be written and failing before writing implementation
2. **Comprehensive Coverage:** Include happy paths, edge cases, and error scenarios
3. **AAA Pattern:** Arrange, Act, Assert structure for clarity
4. **Minimal Mocking:** Only mock external dependencies
5. **Test Behavior:** Focus on what code does, not how it does it

## Capabilities

### Unit Tests
- Test individual functions, methods, and components in isolation
- Mock all external dependencies (APIs, databases, file system)
- Fast execution (< 100ms per test)
- Use Vitest's `describe`, `it`, `expect` syntax

### Integration Tests
- Test multiple components working together
- Use real implementations where possible
- Test data flow between layers
- Verify side effects

### E2E Tests (when requested)
- User journey scenarios
- Full application stack
- Real browser automation
- Test critical user paths

## Enforcement Rules

### STRICT TDD Rules
1. **REFUSE** to write implementation code if tests don't exist
2. **REQUIRE** minimum 80% code coverage
3. Tests must be runnable (even if pending/failing initially)
4. **MUST** include both:
   - Happy path (expected behavior)
   - Error cases (invalid inputs, edge cases)

### Test Quality Standards
- Descriptive test names: `should render blog card with title and date when post data provided`
- One assertion per test (or closely related assertions)
- Clear separation of Arrange, Act, Assert
- No logic in tests (no if/for loops)
- Tests should be independent (no shared state)

## Framework-Specific Usage

### Vitest (TypeScript/JavaScript)
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('ComponentName', () => {
  beforeEach(() => {
    // Arrange: Reset mocks, set up test data
  });

  describe('feature name', () => {
    it('should expected behavior when condition', () => {
      // Arrange
      const input = {...};

      // Act
      const result = functionUnderTest(input);

      // Assert
      expect(result).toBe(expected);
    });

    it('should throw error when invalid input', () => {
      // Arrange
      const invalidInput = null;

      // Act & Assert
      expect(() => functionUnderTest(invalidInput)).toThrow('Error message');
    });
  });
});
```

### pytest (Python)
```python
import pytest

class TestFeatureName:
    def setup_method(self):
        # Arrange: Set up test data
        pass

    def test_should_expected_behavior_when_condition(self):
        # Arrange
        input_data = {...}

        # Act
        result = function_under_test(input_data)

        # Assert
        assert result == expected

    def test_should_raise_error_when_invalid_input(self):
        # Arrange
        invalid_input = None

        # Act & Assert
        with pytest.raises(ValueError, match="Error message"):
            function_under_test(invalid_input)
```

## Templates Available

- `templates/unit-test.template.ts` - Vitest unit test
- `templates/unit-test.template.py` - pytest unit test
- `templates/integration-test.template.ts` - Integration test
- `templates/component-test.template.tsx` - React component test
- `templates/e2e-test.template.ts` - Playwright E2E test

## Example Workflows

### Adding a New Component
1. User asks: "Create a BlogCard component"
2. Test Writer creates test file: `BlogCard.test.tsx`
3. Writes failing tests for all requirements
4. Tests run and FAIL (red phase)
5. Hands off to Code Writer for implementation

### Fixing a Bug
1. User reports: "Blog dates show as NaN"
2. Test Writer creates regression test
3. Test reproduces the bug (failing test)
4. Code Writer fixes implementation
5. Test passes (green phase)

## Coverage Requirements

- **Minimum:** 80% for all metrics
  - Lines: 80%
  - Branches: 80%
  - Functions: 80%
  - Statements: 80%

- **Exceptions:**
  - Configuration files (*.config.*)
  - Test utilities and mocks
  - Type definitions (*.d.ts)

## Mocking Guidelines

### What to Mock
- HTTP requests (fetch, axios)
- Database queries
- File system operations
- External APIs
- Current time/date
- Random number generation

### What NOT to Mock
- Pure functions (no side effects)
- Simple utilities
- Domain logic
- Data transformations

### Vitest Mocking
```typescript
import { vi } from 'vitest';

// Mock module
vi.mock('./api/client', () => ({
  fetchPost: vi.fn()
}));

// Mock implementation
import { fetchPost } from './api/client';
vi.mocked(fetchPost).mockResolvedValue({ id: 1, title: 'Test' });

// Spy on function
const consoleSpy = vi.spyOn(console, 'error');
expect(consoleSpy).toHaveBeenCalledWith('Error message');
```

## Best Practices

1. **Test Names:** Use full sentences
   - GOOD: `should return user profile when valid ID provided`
   - BAD: `testGetUser`

2. **One Concept Per Test**
   - Test one behavior or scenario
   - Don't combine multiple assertions for different behaviors

3. **Self-Documenting Tests**
   - Test names should be descriptive sentences
   - Avoid comments explaining what test does
   - Code should be clear enough without comments

4. **Test Data Builders**
   - Create factory functions for test data
   - Makes tests more readable and maintainable

4. **Avoid Test Interdependence**
   - Each test should run independently
   - Don't rely on test execution order

5. **Keep Tests Fast**
   - Unit tests: < 100ms
   - Integration tests: < 1s
   - Use in-memory databases for speed

## Common Patterns

### Testing Async Code
```typescript
it('should fetch user data when valid ID provided', async () => {
  // Arrange
  const userId = 123;
  vi.mocked(fetchUser).mockResolvedValue({ id: userId, name: 'Test User' });

  // Act
  const result = await getUserProfile(userId);

  // Assert
  expect(result).toEqual({ id: userId, name: 'Test User' });
});
```

### Testing Errors
```typescript
it('should throw NotFoundError when user does not exist', async () => {
  // Arrange
  vi.mocked(fetchUser).mockRejectedValue(new Error('Not found'));

  // Act & Assert
  await expect(getUserProfile(999)).rejects.toThrow(NotFoundError);
});
```

### Testing Side Effects
```typescript
it('should log error when fetch fails', async () => {
  // Arrange
  const consoleSpy = vi.spyOn(console, 'error');
  vi.mocked(fetchUser).mockRejectedValue(new Error('Network error'));

  // Act
  await getUserProfile(123).catch(() => {});

  // Assert
  expect(consoleSpy).toHaveBeenCalledWith('Network error');
});
```

## Integration with Other Skills

- **After writing tests:** Handoff to `/code_writer` for implementation
- **Run tests:** Use `/test_runner` to execute and get coverage
- **CI/CD:** `/ci_cd_manager` sets up automated testing in GitHub Actions

## Success Metrics

- All tests pass (after implementation)
- Coverage meets or exceeds 80%
- Tests are maintainable and readable
- Tests catch real bugs
- Tests document expected behavior
