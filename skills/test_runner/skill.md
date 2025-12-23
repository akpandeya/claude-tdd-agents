# Test Runner Skill

**Purpose:** Execute tests, analyze results, provide detailed feedback, and generate coverage reports.

## Core Capabilities

1. **Run Tests:** Execute Vitest/pytest with appropriate configuration
2. **Parse Results:** Interpret test output and coverage metrics
3. **Report Failures:** Identify failing tests with clear diagnostics
4. **Track Coverage:** Monitor code coverage trends
5. **Suggest Fixes:** Analyze failures and recommend solutions

## Commands

### Vitest (JavaScript/TypeScript)
```bash
npm run test              # Watch mode (default for TDD)
npm run test:run          # Run once (CI mode)
npm run test:coverage     # With coverage report
npm run test:ui           # Open Vitest UI
npm run test -- --reporter=verbose  # Detailed output
npm run test -- path/to/test.ts     # Run specific test
```

### pytest (Python)
```bash
uv run pytest                    # Run all tests
uv run pytest --cov             # With coverage
uv run pytest -v                # Verbose output
uv run pytest -k test_name      # Run specific test
uv run pytest --maxfail=1       # Stop after first failure
uv run pytest --lf              # Run last failed tests only
```

## Coverage Requirements

### Minimum Thresholds
- **Lines:** 80%
- **Branches:** 80%
- **Functions:** 80%
- **Statements:** 80%

### Exceptions
- Configuration files (*.config.*, *.rc.*)
- Test files (*.test.*, *.spec.*)
- Type definitions (*.d.ts)
- Mock/fixture files

## Output Interpretation

### Test Results Format
```
✓ ComponentName > feature > should work when valid input (5ms)
✗ ComponentName > feature > should throw when invalid

FAIL  src/components/BlogCard.test.ts
  ● BlogCard › rendering › should display title

    Expected: "Blog Title"
    Received: undefined

    25 |     const { getByText } = render(<BlogCard post={post} />);
    26 |
  > 27 |     expect(getByText('Blog Title')).toBeInTheDocument();
       |                                      ^

Test Suites: 1 failed, 2 passed, 3 total
Tests:       1 failed, 12 passed, 13 total
Time:        2.156s
```

### Coverage Report
```
File                  | % Stmts | % Branch | % Funcs | % Lines |
----------------------|---------|----------|---------|---------|
src/components/       |   85.23 |    78.45 |   90.12 |   84.67 |
  BlogCard.tsx        |   92.31 |    85.71 |  100.00 |   91.67 |
  Header.tsx          |   78.26 |    71.43 |   80.00 |   77.78 |
src/utils/            |   95.45 |    92.31 |   96.67 |   95.12 |
----------------------|---------|----------|---------|---------|
All files             |   89.12 |    83.21 |   92.45 |   88.78 |
```

## Failure Analysis

### Common Failure Patterns

**1. Assertion Failures**
```
Expected: { id: 1, title: "Post" }
Received: undefined

→ Likely cause: Function not returning expected value
→ Check: Implementation logic, async handling
```

**2. Type Errors**
```
TypeError: Cannot read property 'title' of undefined

→ Likely cause: Missing null check
→ Check: Defensive programming, optional chaining
```

**3. Timeout Errors**
```
Test timeout of 5000ms exceeded

→ Likely cause: Unresolved promise, infinite loop
→ Check: Async operations, missing await
```

**4. Mock Issues**
```
Expected mock function to be called but it wasn't

→ Likely cause: Mock not properly configured
→ Check: Mock setup, function actually called
```

## Watch Mode (TDD Workflow)

### Recommended for Development
```bash
npm run test  # Starts in watch mode
```

**Benefits:**
- Instant feedback on code changes
- Only reruns affected tests
- Continuous red-green-refactor cycle
- Catches regressions immediately

### Watch Mode Commands
```
Press a to run all tests
Press f to run only failed tests
Press p to filter by filename
Press t to filter by test name
Press q to quit watch mode
Press Enter to trigger a test run
```

## Coverage Gaps

### Identifying Uncovered Code
```bash
npm run test:coverage
open coverage/index.html  # View detailed report
```

**Coverage Report Shows:**
- Uncovered lines (highlighted in red)
- Partially covered branches
- Untested functions
- Files with < 80% coverage

### Coverage Improvement Strategy
1. Identify files below threshold
2. Write tests for uncovered lines
3. Focus on branches (if/else, try/catch)
4. Add error case tests
5. Verify coverage increases

## CI/CD Integration

### GitHub Actions Example
```yaml
- name: Run tests
  run: npm run test:run

- name: Check coverage
  run: npm run test:coverage

- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
    fail_ci_if_error: true
```

### Coverage Enforcement
- Block PRs if coverage drops
- Require 80% minimum
- Track coverage trends
- Badge in README

## Performance Monitoring

### Slow Tests
```bash
npm run test -- --reporter=verbose

  ✓ fast test (2ms)
  ✓ another fast test (5ms)
  ⚠ slow test (1523ms)  ← Flag for optimization
```

**Optimization Tips:**
- Reduce test data size
- Mock expensive operations
- Use in-memory databases
- Parallelize independent tests

## Test Organization

### Running by Type
```bash
# Unit tests only
npm run test -- src/**/*.test.ts

# Integration tests
npm run test -- src/**/*.integration.test.ts

# E2E tests
npm run test -- e2e/**/*.spec.ts
```

### Running Changed Tests
```bash
# Vitest automatically runs affected tests
npm run test

# pytest with git integration
uv run pytest --picked
```

## Debugging Failed Tests

### Step-by-Step Process
1. **Read the error message carefully**
   - What was expected vs received?
   - Which assertion failed?

2. **Check the stack trace**
   - Where did the failure occur?
   - What line number?

3. **Inspect test setup**
   - Is mock data correct?
   - Are dependencies properly mocked?

4. **Run test in isolation**
   ```bash
   npm run test -- -t "specific test name"
   ```

5. **Add debug output**
   ```typescript
   console.log('Value before:', value);
   const result = functionUnderTest(value);
   console.log('Result:', result);
   ```

6. **Use debugger**
   ```typescript
   it('should work', () => {
     debugger;  // Breakpoint in Node
     expect(result).toBe(expected);
   });
   ```

## Reporting

### Generate HTML Report
```bash
npm run test:coverage
# Open coverage/index.html in browser
```

### Summary Statistics
```
Test Suites: 15 passed, 15 total
Tests:       127 passed, 127 total
Snapshots:   0 total
Time:        8.234s
Coverage:    89.23%
```

### Failed Test Report
```
FAILED TESTS:
  BlogCard › should render title
    Expected: "My Title"
    Received: undefined
    File: src/components/BlogCard.test.ts:27

  Header › should toggle menu
    Expected mock to be called
    Received 0 calls
    File: src/components/Header.test.ts:45
```

## Integration with Other Skills

- **After `/test_writer`:** Run tests to verify they fail (red)
- **After `/code_writer`:** Run tests to verify they pass (green)
- **Before refactoring:** Ensure all tests green
- **Before commit:** Run full test suite

## Best Practices

1. **Run tests frequently** - Every code change
2. **Watch mode for TDD** - Instant feedback
3. **Full suite before commit** - Catch regressions
4. **Coverage on PRs** - Maintain quality standards
5. **Fix failures immediately** - Don't accumulate debt

## Success Metrics

- All tests pass (100% green)
- Coverage meets thresholds (80%+)
- Tests run fast (< 10s for unit tests)
- Clear failure diagnostics
- No flaky tests
