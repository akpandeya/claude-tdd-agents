# TDD Principles and Best Practices

## Red-Green-Refactor Cycle

### RED: Write Failing Test
1. **Write a test** for the next bit of functionality
2. **Run the test** and watch it fail
3. **Verify** it fails for the right reason
4. **NO implementation** code yet

Why fail first?
- Ensures the test can catch bugs
- Verifies test is actually running
- Confirms test assertions work

### GREEN: Make It Pass
1. **Write minimal code** to make the test pass
2. **Run tests frequently** (every few minutes)
3. **No premature optimization**
4. **No extra features**

Why minimal code?
- Prevents over-engineering
- Keeps focus on requirements
- Faster feedback loops

### REFACTOR: Improve Quality
1. **Improve code quality** while tests stay green
2. **Extract functions/classes**
3. **Remove duplication** (DRY principle)
4. **Clarify names**
5. **Run tests after each change**

Why refactor after green?
- Safe to refactor (tests protect you)
- Quality improvements without breaking functionality
- Keeps codebase maintainable

## Coverage Requirements

### Minimum Thresholds (All must pass)
- **Lines:** 80%
- **Branches:** 80%
- **Functions:** 80%
- **Statements:** 80%

### What to Exclude
- Configuration files (*.config.*, *.rc.*)
- Test files themselves (*.test.*, *.spec.*)
- Type definitions (*.d.ts)
- Build output (dist/, .astro/, node_modules/)
- Mock/fixture files

### Coverage is NOT Quality
High coverage doesn't guarantee:
- Tests are good quality
- All edge cases are covered
- Code is bug-free

But it does:
- Ensure code is exercised
- Provide safety net for refactoring
- Catch obvious bugs

## Testing Best Practices

### AAA Pattern (Arrange, Act, Assert)
```typescript
it('should calculate total when items added', () => {
  // Arrange: Set up test data
  const cart = new ShoppingCart();
  const item1 = new Item('Book', 10);
  const item2 = new Item('Pen', 5);

  // Act: Execute the function
  cart.addItem(item1);
  cart.addItem(item2);
  const total = cart.getTotal();

  // Assert: Verify the result
  expect(total).toBe(15);
});
```

### One Assertion Per Test
```typescript
// GOOD - One logical assertion
it('should create user with correct properties', () => {
  const user = User.create('john@example.com', 'John Doe');

  expect(user).toEqual({
    email: 'john@example.com',
    name: 'John Doe',
    status: 'active'
  });
});

// BAD - Multiple unrelated assertions
it('should work', () => {
  expect(getUserName()).toBe('John');
  expect(getOrderTotal()).toBe(100);
  expect(isLoggedIn()).toBe(true);
});
```

### Descriptive Test Names
```typescript
// GOOD - Clear what's being tested
it('should throw error when email is invalid format', () => {
  /* ... */
});

it('should return empty array when no posts found', () => {
  /* ... */
});

// BAD - Unclear what's expected
it('test email', () => {
  /* ... */
});

it('works', () => {
  /* ... */
});
```

### Test Independence
```typescript
// GOOD - Each test is independent
describe('BlogPost', () => {
  it('should publish when status is draft', () => {
    const post = BlogPost.create('Title', 'Content');
    post.publish();
    expect(post.status).toBe('published');
  });

  it('should unpublish when status is published', () => {
    const post = BlogPost.create('Title', 'Content');
    post.publish();
    post.unpublish();
    expect(post.status).toBe('draft');
  });
});

// BAD - Tests depend on each other
let post; // Shared state!

it('should create post', () => {
  post = BlogPost.create('Title', 'Content');
});

it('should publish post', () => {
  post.publish(); // Depends on previous test
  expect(post.status).toBe('published');
});
```

### Mock Only External Dependencies
```typescript
// GOOD - Mock external API
it('should fetch user data', async () => {
  const mockApi = vi.fn().mockResolvedValue({ id: 1, name: 'John' });

  const result = await fetchUser(1, mockApi);

  expect(result.name).toBe('John');
  expect(mockApi).toHaveBeenCalledWith(1);
});

// BAD - Mocking internal logic
it('should calculate total', () => {
  const cart = new ShoppingCart();
  vi.spyOn(cart, 'calculateSubtotal').mockReturnValue(100);

  // Don't mock what you're testing!
  const total = cart.getTotal();
});
```

## Common Patterns

### Testing Async Code
```typescript
it('should fetch data when API succeeds', async () => {
  const mockData = { id: 1 };
  vi.spyOn(api, 'fetch').mockResolvedValue(mockData);

  const result = await fetchUser(1);

  expect(result).toEqual(mockData);
});

it('should handle error when API fails', async () => {
  vi.spyOn(api, 'fetch').mockRejectedValue(new Error('Network error'));

  await expect(fetchUser(1)).rejects.toThrow('Network error');
});
```

### Testing Errors
```typescript
it('should throw error when email invalid', () => {
  expect(() => User.create('invalid-email', 'Name'))
    .toThrow('Invalid email format');
});

it('should throw specific error type', () => {
  expect(() => validateInput(null))
    .toThrow(ValidationError);
});
```

### Testing Side Effects
```typescript
it('should call logger when error occurs', () => {
  const logSpy = vi.spyOn(console, 'error');

  performOperation('invalid');

  expect(logSpy).toHaveBeenCalledWith(
    expect.stringContaining('Error')
  );

  logSpy.mockRestore();
});
```

## TDD Workflow

1. **Think** - What's the next small piece of functionality?
2. **Write test** - Create failing test for that functionality
3. **Run test** - Verify it fails (RED)
4. **Write code** - Minimal implementation
5. **Run test** - Verify it passes (GREEN)
6. **Refactor** - Improve code quality
7. **Run test** - Ensure still green
8. **Commit** - Save your progress
9. **Repeat** - Next small piece of functionality

## Benefits of TDD

**Short-term:**
- Fewer bugs
- Better design
- Living documentation
- Confidence to refactor

**Long-term:**
- Easier maintenance
- Faster feature development
- Less technical debt
- Better team collaboration

## Common Mistakes

1. **Writing tests after implementation**
   - Loses the design benefits of TDD
   - Tests may be biased by implementation

2. **Testing implementation details**
   - Makes refactoring harder
   - Brittle tests that break easily

3. **No refactoring**
   - Code becomes messy over time
   - Harder to maintain

4. **Too much mocking**
   - Tests become complex
   - May not catch integration issues

5. **Large test steps**
   - Harder to debug failures
   - Longer feedback loops
