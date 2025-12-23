# Claude TDD Skills

Reusable Claude Code skills for strict Test-Driven Development (TDD) and Domain-Driven Design (DDD) workflows.

## Skills Included

### 1. test_writer
Write comprehensive tests BEFORE implementation

- **Enforces:** Strict TDD (tests first, always)
- **Coverage:** Minimum 80% required
- **Patterns:** AAA (Arrange, Act, Assert)
- **Frameworks:** Vitest, pytest

### 2. code_writer
Implement code following TDD red-green-refactor cycle

- **Enforces:** Tests must exist and fail first
- **Patterns:** DDD (entities, value objects, aggregates)
- **Architecture:** Clean architecture layers
- **Quality:** SOLID principles, no extra features

### 3. test_runner
Execute tests and provide detailed feedback

- **Runs:** Vitest, pytest with coverage
- **Reports:** Pass/fail, coverage metrics
- **Analyzes:** Failures with suggestions
- **Modes:** Watch mode for TDD workflow

### 4. ci_cd_manager
Manage GitHub Actions workflows with testing gates

- **Creates:** CI/CD workflows
- **Enforces:** Tests must pass before deployment
- **Monitors:** Coverage thresholds
- **Deploys:** Only green builds

### 5. ddd_architect
Guide domain modeling and architecture decisions

- **Designs:** Bounded contexts, aggregates
- **Patterns:** Entities, value objects, repositories
- **Architecture:** Layered architecture
- **Events:** Domain events and CQRS

## Installation

### Option 1: Symlink to Projects (Recommended)

```bash
# In your project directory
mkdir -p .claude/skills

# Create symlinks
cd .claude/skills
ln -s path/to/claude-tdd-skills/skills/test_writer test_writer
ln -s path/to/claude-tdd-skills/skills/code_writer code_writer
ln -s path/to/claude-tdd-skills/skills/test_runner test_runner
ln -s path/to/claude-tdd-skills/skills/ci_cd_manager ci_cd_manager
ln -s path/to/claude-tdd-skills/skills/ddd_architect ddd_architect
```

### Option 2: Copy Skills

```bash
# Copy entire skills directory
cp -r path/to/claude-tdd-skills/skills .claude/
```

## Usage

### In Claude Code

Once installed, skills are available as slash commands:

```bash
/test_writer     # Write tests for new feature
/code_writer     # Implement code (after tests exist)
/test_runner     # Run tests and show coverage
/ci_cd_manager   # Manage GitHub Actions workflows
/ddd_architect   # Get domain modeling guidance
```

### TDD Workflow

1. **Red:** Use `/test_writer` to create failing tests
2. **Green:** Use `/code_writer` to implement minimal code
3. **Verify:** Use `/test_runner` to confirm tests pass
4. **Refactor:** Use `/code_writer` to improve code quality

## Configuration

### Vitest Projects

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:run": "vitest run"
  },
  "devDependencies": {
    "vitest": "^1.2.2",
    "@vitest/ui": "^1.2.2",
    "@vitest/coverage-v8": "^1.2.2"
  }
}
```

### pytest Projects

```bash
# Install pytest with coverage
uv add --dev pytest pytest-cov

# Run tests
uv run pytest --cov
```

## Requirements

- **Testing Framework:** Vitest (TypeScript) or pytest (Python)
- **Coverage Tool:** @vitest/coverage-v8 or pytest-cov
- **Minimum Coverage:** 80% (configurable)
- **CI/CD:** GitHub Actions

## Best Practices

1. **Always write tests first** - Let `/test_writer` create them
2. **Never skip TDD** - Skills enforce this strictly
3. **Follow DDD patterns** - Use `/ddd_architect` for guidance
4. **Run tests frequently** - Use `/test_runner` in watch mode
5. **Maintain green builds** - Fix failures immediately

## Project Structure

```
claude-tdd-skills/
├── skills/
│   ├── test_writer/
│   │   ├── skill.md          # Skill definition
│   │   └── templates/        # Test templates
│   ├── code_writer/
│   │   ├── skill.md
│   │   └── templates/        # Code templates
│   ├── test_runner/
│   │   ├── skill.md
│   │   └── scripts/          # Helper scripts
│   ├── ci_cd_manager/
│   │   ├── skill.md
│   │   └── templates/        # Workflow templates
│   └── ddd_architect/
│       ├── skill.md
│       ├── patterns/         # DDD patterns
│       └── examples/         # Example code
├── shared/
│   ├── tdd-rules.md         # TDD principles
│   ├── ddd-patterns.md      # DDD reference
│   └── coverage-requirements.md
└── README.md
```

## Examples

See `/examples` in each skill directory for usage examples.

## Contributing

Skills are designed to be strict and opinionated to enforce best practices. Changes should maintain TDD/DDD rigor.

## License

MIT - Use freely in your projects

## Support

For issues or questions:
1. Check skill documentation in `skills/*/skill.md`
2. Review templates in `skills/*/templates/`
3. See examples in `skills/*/examples/`
