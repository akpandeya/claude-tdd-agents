# Agentic Workflows

Comprehensive collection of specialized agents for software development, documentation, DevOps, data science, and planning workflows. Built for Claude Code with strict Test-Driven Development and Domain-Driven Design principles.

## What are Agents?

Agents are explicitly-invokable assistants with specialized knowledge and isolated contexts. Unlike auto-discovered skills, agents provide complex multi-step workflows with restricted tool access, perfect for disciplined development practices.

## Agent Categories

### Development Agents

#### Test-Driven Development (TDD)
Strict red-green-refactor cycle with 80% coverage requirements.

**Language-Specific Test Writers:**
- `/test_writer_ts` - TypeScript/JavaScript test writing (Vitest, React Testing Library)
- `/test_writer_py` - Python test writing (pytest, pytest-asyncio)

**Language-Specific Code Writers:**
- `/code_writer_ts` - TypeScript/JavaScript implementation with DDD patterns
- `/code_writer_py` - Python implementation with DDD patterns

**Language-Agnostic:**
- `/test_runner` - Execute tests and analyze results (Vitest or pytest)
- `/ddd_architect` - Domain modeling and architecture guidance

#### Architecture & Design
- `/ddd_architect` - Domain-Driven Design patterns and bounded contexts

#### Coming Soon
- Refactoring agents (code improvement, pattern application)
- Debugging agents (bug investigation, performance profiling)
- Code review agents (quality analysis, best practices)

### Documentation Agents (Coming Soon)
- README writers
- API documentation generators
- Technical writing assistants
- Blog post creators

### DevOps Agents (Coming Soon)
- Docker and containerization helpers
- Kubernetes configuration
- CI/CD pipeline designers
- Infrastructure as Code assistants

### Data Science Agents (Coming Soon)
- Data analysis and visualization
- ML pipeline builders
- Model training workflows
- Experiment tracking

### Planning Agents (Coming Soon)
- Project planning and breakdown
- Sprint planning
- Architecture decision records

## Quick Start

### TypeScript/JavaScript Project

```bash
# Create agents directory
mkdir -p .claude/agents

# Link TypeScript TDD agents
cd .claude/agents
ln -s /path/to/agentic-workflows/development/tdd/test-writer-ts.md test-writer-ts.md
ln -s /path/to/agentic-workflows/development/tdd/code-writer-ts.md code-writer-ts.md
ln -s /path/to/agentic-workflows/development/tdd/test-runner.md test-runner.md
ln -s /path/to/agentic-workflows/development/architecture/ddd-architect.md ddd-architect.md
```

Invoke agents:
```bash
/test_writer_ts   # Write Vitest tests
/code_writer_ts   # Implement TypeScript code
/test_runner      # Run tests with coverage
/ddd_architect    # Get domain modeling advice
```

### Python Project

```bash
# Create agents directory
mkdir -p .claude/agents

# Link Python TDD agents
cd .claude/agents
ln -s /path/to/agentic-workflows/development/tdd/test-writer-py.md test-writer-py.md
ln -s /path/to/agentic-workflows/development/tdd/code-writer-py.md code-writer-py.md
ln -s /path/to/agentic-workflows/development/tdd/test-runner.md test-runner.md
ln -s /path/to/agentic-workflows/development/architecture/ddd-architect.md ddd-architect.md
```

Invoke agents:
```bash
/test_writer_py   # Write pytest tests
/code_writer_py   # Implement Python code
/test_runner      # Run tests with coverage
/ddd_architect    # Get domain modeling advice
```

### Monorepo (Both Languages)

```bash
# Link both TypeScript and Python agents
cd .claude/agents
ln -s /path/to/agentic-workflows/development/tdd/test-writer-ts.md test-writer-ts.md
ln -s /path/to/agentic-workflows/development/tdd/test-writer-py.md test-writer-py.md
ln -s /path/to/agentic-workflows/development/tdd/code-writer-ts.md code-writer-ts.md
ln -s /path/to/agentic-workflows/development/tdd/code-writer-py.md code-writer-py.md
ln -s /path/to/agentic-workflows/development/tdd/test-runner.md test-runner.md
ln -s /path/to/agentic-workflows/development/architecture/ddd-architect.md ddd-architect.md
```

## TDD Workflow

Strict Test-Driven Development with 80% minimum coverage:

1. **RED Phase** - Write failing tests first
   ```bash
   /test_writer_ts "Test user authentication with JWT"
   # Agent writes comprehensive Vitest tests
   # Tests fail (no implementation yet)
   ```

2. **GREEN Phase** - Implement minimal code
   ```bash
   /code_writer_ts "Implement JWT authentication"
   # Agent writes minimal code to pass tests
   # Follows DDD patterns
   ```

3. **VERIFY Phase** - Run tests and check coverage
   ```bash
   /test_runner
   # Agent runs tests, reports coverage
   # Ensures 80% threshold met
   ```

4. **REFACTOR Phase** - Improve code quality
   ```bash
   /code_writer_ts "Refactor auth logic for clarity"
   # Agent improves code while tests stay green
   ```

## Domain-Driven Design

All agents follow DDD principles:

**Entities** - Objects with unique identity:
```typescript
class User {
  constructor(
    public readonly id: string,
    private _email: string
  ) {}
}
```

**Value Objects** - Immutable objects defined by attributes:
```typescript
class EmailAddress {
  private constructor(private readonly value: string) {}
  static create(email: string): EmailAddress { ... }
}
```

**Aggregates** - Clusters with one root entity:
```typescript
class Order { // Root
  private _items: OrderItem[] = []; // Child entities
  addItem(item: OrderItem) { ... }
}
```

**Repositories** - Domain interface + infrastructure implementation:
```typescript
interface UserRepository {
  findById(id: string): Promise<User>;
}
```

See `shared/examples/` for complete examples.

## Why Language-Specific Agents?

**Smaller Context** - TypeScript agent: ~250 lines vs combined ~450 lines

**Focused Knowledge** - Vitest-specific patterns vs mixing pytest/Vitest

**Faster Responses** - Less content to process

**Better Recommendations** - Language-specific best practices

## Repository Structure

```
agentic-workflows/
├── development/
│   ├── tdd/
│   │   ├── test-writer-ts.md      # TypeScript test writer
│   │   ├── test-writer-py.md      # Python test writer
│   │   ├── code-writer-ts.md      # TypeScript implementation
│   │   ├── code-writer-py.md      # Python implementation
│   │   ├── test-runner.md         # Language-agnostic test runner
│   │   └── README.md              # TDD workflow guide
│   ├── architecture/
│   │   └── ddd-architect.md       # Domain-Driven Design
│   ├── refactoring/               # Future: refactoring agents
│   └── debugging/                 # Future: debugging agents
├── documentation/                  # Future: documentation agents
├── devops/                        # Future: DevOps agents
├── data-science/                  # Future: data science agents
├── planning/                      # Future: planning agents
├── shared/
│   ├── tdd/
│   │   ├── tdd-principles.md     # Red-Green-Refactor cycle
│   │   ├── ddd-patterns.md       # DDD reference
│   │   └── test-templates/       # Test templates
│   └── examples/
│       ├── entity-example.ts
│       ├── value-object-example.ts
│       └── aggregate-example.ts
└── README.md                      # This file
```

## Agent Principles

All agents follow these principles:

1. **Tests First** - No code without failing tests
2. **80% Coverage** - Minimum threshold for all code
3. **Self-Documenting** - Clear names over comments
4. **Domain-Driven** - Use DDD patterns
5. **Clean Architecture** - Separate concerns into layers
6. **SOLID** - Single Responsibility, Open/Closed, etc.

## Coverage Requirements

**Minimum Thresholds (ALL must pass):**
- Lines: 80%
- Branches: 80%
- Functions: 80%
- Statements: 80%

**Test Organization:**
```
TypeScript:
src/components/
├── BlogCard.tsx
└── __tests__/
    └── BlogCard.test.tsx

Python:
backend/
├── domain/
│   └── user.py
└── tests/
    └── domain/
        └── test_user.py
```

## Configuration

### Vitest Projects (TypeScript/JavaScript)

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:run": "vitest run"
  },
  "devDependencies": {
    "vitest": "^4.0.0",
    "@vitest/ui": "^4.0.0",
    "@vitest/coverage-v8": "^4.0.0",
    "jsdom": "^27.0.0"
  }
}
```

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
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

### pytest Projects (Python)

```bash
# Install pytest with coverage
uv add --dev pytest pytest-cov pytest-asyncio

# Run tests
uv run pytest --cov --cov-report=html
```

```ini
# pyproject.toml or setup.cfg
[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = ["test_*.py"]
python_classes = ["Test*"]
python_functions = ["test_*"]

[tool.coverage.run]
source = ["src"]
omit = ["*/tests/*", "*/test_*.py"]

[tool.coverage.report]
fail_under = 80
show_missing = true
```

## Project Integration

### Create Project Guide

Document agent usage in your project:

```markdown
# claude.md

## TDD Workflow

- `/test_writer_ts` - Write Vitest tests
- `/code_writer_ts` - Implement TypeScript
- `/test_runner` - Run tests
- `/ddd_architect` - Domain modeling

## Domain Model

**Bounded Contexts:**
- User Management
- Content Publishing

**Aggregates:**
- User (root: User, entities: Profile)
- BlogPost (root: Post, entities: Comment)
```

### CI/CD Integration

```yaml
name: TDD Pipeline

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run test:run
      - run: npm run test:coverage

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - run: echo "Deploy only after tests pass"
```

## Future Expansion

### Planned Agent Categories

**Development:**
- Refactoring (extract functions, apply patterns)
- Debugging (analyze errors, profile performance)
- Code Review (quality analysis, security checks)

**Documentation:**
- README generation
- API docs (OpenAPI, JSDoc, Sphinx)
- Technical writing

**DevOps:**
- Docker (Dockerfile optimization, compose)
- Kubernetes (manifests, Helm charts)
- CI/CD (GitHub Actions, GitLab CI)

**Data Science:**
- Data analysis and visualization
- ML pipeline builders
- Experiment tracking

**Planning:**
- Project breakdown
- Architecture decision records
- Sprint planning

## Contributing

Agents are opinionated to enforce best practices. Changes should maintain rigor while improving usability.

### Agent Creation Template

```yaml
---
name: agent-name
description: Brief description. When to use. Target use case.
tools: Read, Edit, Write, Bash, Glob, Grep
model: sonnet
---

# Agent Name

You are a specialist in [domain].

## Core Capabilities
[What this agent does]

## When to Use
[Specific use cases]

## Workflow
[Step-by-step process]
```

## Resources

- **TDD Principles:** `shared/tdd/tdd-principles.md`
- **DDD Patterns:** `shared/tdd/ddd-patterns.md`
- **Examples:** `shared/examples/`
- **Test Templates:** `shared/tdd/test-templates/`

## License

MIT - Use freely in your projects

## Support

For help:
1. Read agent documentation in `.md` files
2. Check `shared/` for reference materials
3. See `shared/examples/` for DDD patterns
4. Report issues at https://github.com/akpandeya/agentic-workflows/issues
