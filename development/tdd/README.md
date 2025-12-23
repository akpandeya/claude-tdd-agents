# Test-Driven Development (TDD) Agents

Language-specific agents for strict TDD workflows with 80% minimum coverage.

## Available Agents

### Language-Specific Test Writers

**TypeScript/JavaScript:**
- **Name:** `/test_writer_ts`
- **File:** `test-writer-ts.md`
- **Frameworks:** Vitest, React Testing Library, Playwright
- **Output:** `*.test.ts`, `*.test.tsx` files
- **Use When:** Writing tests for TypeScript/JavaScript code

**Python:**
- **Name:** `/test_writer_py`
- **File:** `test-writer-py.md`
- **Frameworks:** pytest, pytest-asyncio, pytest-mock
- **Output:** `test_*.py` files
- **Use When:** Writing tests for Python code

### Language-Specific Code Writers

**TypeScript/JavaScript:**
- **Name:** `/code_writer_ts`
- **File:** `code-writer-ts.md`
- **Implements:** Minimal code to pass Vitest tests
- **Patterns:** DDD entities, value objects, aggregates
- **Use When:** Implementing TypeScript/JavaScript features

**Python:**
- **Name:** `/code_writer_py`
- **File:** `code-writer-py.md`
- **Implements:** Minimal code to pass pytest tests
- **Patterns:** DDD entities, value objects, aggregates
- **Use When:** Implementing Python features

### Language-Agnostic Agents

**Test Runner:**
- **Name:** `/test_runner`
- **File:** `test-runner.md`
- **Runs:** Both Vitest and pytest
- **Reports:** Coverage metrics, failures, suggestions
- **Use When:** Verifying tests pass and coverage meets threshold

**DDD Architect:**
- **Name:** `/ddd_architect`
- **File:** `../architecture/ddd-architect.md`
- **Designs:** Domain models, bounded contexts
- **Guides:** Entity vs value object decisions
- **Use When:** Planning domain modeling before implementation

## Red-Green-Refactor Cycle

### 1. RED Phase - Write Failing Tests

Use language-specific test writer:

**TypeScript:**
```bash
/test_writer_ts "Test user login with email and password"
```

Agent creates:
- `src/auth/__tests__/login.test.ts`
- Comprehensive Vitest tests
- Tests FAIL (no implementation)

**Python:**
```bash
/test_writer_py "Test user login with email and password"
```

Agent creates:
- `tests/auth/test_login.py`
- Comprehensive pytest tests
- Tests FAIL (no implementation)

### 2. GREEN Phase - Implement Minimal Code

Use language-specific code writer:

**TypeScript:**
```bash
/code_writer_ts "Implement user login functionality"
```

Agent:
- Reads failing tests
- Implements MINIMAL code to pass
- Follows DDD patterns
- Tests PASS

**Python:**
```bash
/code_writer_py "Implement user login functionality"
```

Agent:
- Reads failing tests
- Implements MINIMAL code to pass
- Follows DDD patterns
- Tests PASS

### 3. VERIFY Phase - Check Coverage

Use test runner:

```bash
/test_runner
```

Agent:
- Runs Vitest or pytest (auto-detects)
- Reports pass/fail status
- Shows coverage metrics
- MUST be 80%+ for all metrics

### 4. REFACTOR Phase - Improve Quality

Use language-specific code writer:

**TypeScript:**
```bash
/code_writer_ts "Refactor login logic to use repository pattern"
```

**Python:**
```bash
/code_writer_py "Refactor login logic to use repository pattern"
```

Agent:
- Improves code quality
- Extracts functions/classes
- Applies DDD patterns
- Tests STAY GREEN

## Why Language-Specific Agents?

### Smaller Context
- **Combined:** 400+ lines covering both languages
- **TypeScript:** ~250 lines, Vitest-focused
- **Python:** ~250 lines, pytest-focused

### Focused Knowledge
- TypeScript agent knows Vitest, React Testing Library
- Python agent knows pytest, pytest-asyncio
- No confusion between frameworks

### Better Recommendations
- TypeScript: JSDoc, strict mode, React patterns
- Python: Type hints, Pydantic, FastAPI patterns

### Faster Responses
- Less content to process
- More targeted suggestions
- Clearer examples

## Coverage Requirements

ALL agents enforce 80% minimum:

- Lines: 80%
- Branches: 80%
- Functions: 80%
- Statements: 80%

## Strict TDD Enforcement

Agents REFUSE to:
- Write implementation without tests
- Write tests after implementation
- Skip coverage requirements
- Allow refactoring with failing tests

Agents REQUIRE:
- Tests written first (RED phase)
- Tests failing before implementation
- 80% minimum coverage
- Tests passing before refactoring

## Installation

### TypeScript/JavaScript Project

```bash
cd .claude/agents
ln -s /path/to/agentic-workflows/development/tdd/test-writer-ts.md test-writer-ts.md
ln -s /path/to/agentic-workflows/development/tdd/code-writer-ts.md code-writer-ts.md
ln -s /path/to/agentic-workflows/development/tdd/test-runner.md test-runner.md
```

### Python Project

```bash
cd .claude/agents
ln -s /path/to/agentic-workflows/development/tdd/test-writer-py.md test-writer-py.md
ln -s /path/to/agentic-workflows/development/tdd/code-writer-py.md code-writer-py.md
ln -s /path/to/agentic-workflows/development/tdd/test-runner.md test-runner.md
```

### Monorepo (Both Languages)

```bash
cd .claude/agents
# TypeScript agents
ln -s /path/to/agentic-workflows/development/tdd/test-writer-ts.md test-writer-ts.md
ln -s /path/to/agentic-workflows/development/tdd/code-writer-ts.md code-writer-ts.md

# Python agents
ln -s /path/to/agentic-workflows/development/tdd/test-writer-py.md test-writer-py.md
ln -s /path/to/agentic-workflows/development/tdd/code-writer-py.md code-writer-py.md

# Shared agents
ln -s /path/to/agentic-workflows/development/tdd/test-runner.md test-runner.md
ln -s /path/to/agentic-workflows/development/architecture/ddd-architect.md ddd-architect.md
```

## Example Workflows

### TypeScript Feature Development

```bash
# 1. Domain modeling (optional)
/ddd_architect "Design user authentication aggregate"

# 2. Write tests first
/test_writer_ts "Test JWT authentication with refresh tokens"

# 3. Run tests (should fail)
/test_runner

# 4. Implement minimal code
/code_writer_ts "Implement JWT authentication"

# 5. Run tests (should pass)
/test_runner

# 6. Refactor if needed
/code_writer_ts "Extract token generation to separate service"

# 7. Verify still passing
/test_runner
```

### Python Feature Development

```bash
# 1. Domain modeling (optional)
/ddd_architect "Design exam management aggregate"

# 2. Write tests first
/test_writer_py "Test exam creation with validation"

# 3. Run tests (should fail)
/test_runner

# 4. Implement minimal code
/code_writer_py "Implement exam entity with validation"

# 5. Run tests (should pass)
/test_runner

# 6. Refactor if needed
/code_writer_py "Extract validation to value objects"

# 7. Verify still passing
/test_runner
```

## Configuration

### TypeScript/JavaScript (Vitest)

```json
{
  "scripts": {
    "test": "vitest",
    "test:coverage": "vitest --coverage"
  },
  "devDependencies": {
    "vitest": "^4.0.0",
    "@vitest/coverage-v8": "^4.0.0"
  }
}
```

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
```

### Python (pytest)

```toml
# pyproject.toml
[tool.pytest.ini_options]
testpaths = ["tests"]

[tool.coverage.run]
source = ["src"]

[tool.coverage.report]
fail_under = 80
show_missing = true
```

```bash
# Run tests with coverage
pytest --cov --cov-report=html
```

## Best Practices

1. **Tests First, Always:** Never write implementation without failing tests
2. **Small Steps:** One small feature at a time
3. **Run Often:** Execute `/test_runner` after every change
4. **Domain First:** Consult `/ddd_architect` for complex features
5. **Green Builds:** Never commit with failing tests
6. **Refactor Green:** Improve code only when tests pass
7. **Language Choice:** Use language-specific agents for smaller context

## Test Organization

### TypeScript

```
src/
├── auth/
│   ├── auth.service.ts
│   └── __tests__/
│       └── auth.service.test.ts
├── components/
│   ├── LoginForm.tsx
│   └── __tests__/
│       └── LoginForm.test.tsx
```

### Python

```
backend/
├── domain/
│   └── user.py
├── application/
│   └── auth_service.py
└── tests/
    ├── domain/
    │   └── test_user.py
    └── application/
        └── test_auth_service.py
```

## Resources

- **TDD Principles:** `../../shared/tdd/tdd-principles.md`
- **DDD Patterns:** `../../shared/tdd/ddd-patterns.md`
- **Test Templates:** `../../shared/tdd/test-templates/`
- **Examples:** `../../shared/examples/`

## Support

For help with TDD agents:
1. Read agent `.md` files in this directory
2. Check shared resources for TDD/DDD reference
3. See examples for DDD patterns
4. Report issues at https://github.com/akpandeya/agentic-workflows/issues
