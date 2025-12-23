# CI/CD Manager Skill

**Purpose:** Manage GitHub Actions workflows with strict testing gates and deployment automation.

## Core Principles

1. **Tests Must Pass:** No deployment without green tests
2. **Coverage Enforcement:** Block PRs if coverage drops
3. **Automated Quality Gates:** Lint, test, build before merge
4. **Fast Feedback:** Run checks on every push
5. **Secure Deployments:** Use secrets, verify artifacts

## Workflow Templates

### CI Workflow (ci.yml)
- Trigger: On push, pull_request
- Jobs: Lint → Test → Build
- Coverage: Upload to Codecov
- Status: Required for merge

### CD Workflow (deploy.yml)
- Trigger: On main branch push
- Dependencies: Requires CI to pass
- Jobs: Build → Deploy
- Environments: Staging, Production

## GitHub Actions Best Practices

### Job Dependencies
```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - run: npm run test:coverage

  build:
    needs: test  # Only runs if test passes
    runs-on: ubuntu-latest
    steps:
      - run: npm run build

  deploy:
    needs: [test, build]  # Requires both
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - run: ./deploy.sh
```

### Caching Dependencies
```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm'  # Speeds up installs

- run: npm ci  # Faster than npm install
```

### Matrix Testing
```yaml
strategy:
  matrix:
    node-version: [18, 20, 22]
    os: [ubuntu-latest, macos-latest]
runs-on: ${{ matrix.os }}
```

## Testing Gates

### Required Checks
1. **Linting:** ESLint, Prettier
2. **Type Checking:** TypeScript, mypy
3. **Unit Tests:** Vitest, pytest
4. **Integration Tests:** API, database
5. **Coverage:** 80% minimum

### Coverage Enforcement
```yaml
- name: Check coverage thresholds
  run: npm run test:coverage
  # Fails if < 80%

- name: Upload to Codecov
  uses: codecov/codecov-action@v3
  with:
    fail_ci_if_error: true
```

## Deployment Strategies

### Staging Auto-Deploy
- Push to `main` → Auto deploy to staging
- Run smoke tests
- Notify team

### Production Manual Deploy
- `workflow_dispatch` trigger
- Requires approval
- Rollback capability

## Security

### Secrets Management
```yaml
- name: Deploy
  env:
    API_KEY: ${{ secrets.API_KEY }}
    SSH_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
```

### Never Commit:
- API keys
- Passwords
- Private keys
- Connection strings

## Status Badges

### Add to README.md
```markdown
![CI](https://github.com/user/repo/workflows/CI/badge.svg)
![Coverage](https://codecov.io/gh/user/repo/branch/main/graph/badge.svg)
```

## Integration with Skills

- Uses `/test_runner` commands
- Blocks if `/test_writer` coverage not met
- Deploys `/code_writer` implementations

## Success Metrics

- All PRs have passing checks
- No deployments with failing tests
- Coverage never decreases
- Fast CI times (< 5 minutes)
