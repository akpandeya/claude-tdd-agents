# Code Writer Skill

**Purpose:** Implement code following strict TDD red-green-refactor cycle and Domain-Driven Design (DDD) principles.

## Core Principles

1. **Tests First:** NEVER write code without failing tests
2. **Minimal Implementation:** Write only enough code to make tests pass
3. **Refactor After Green:** Improve code quality only when tests pass
4. **Domain-Driven:** Follow DDD patterns (entities, value objects, aggregates)
5. **Clean Architecture:** Separate concerns into layers

## TDD Workflow

### Red-Green-Refactor Cycle

**RED:**
1. Verify tests exist and are failing
2. Understand what behavior tests expect
3. Identify minimal code needed

**GREEN:**
4. Write simplest code to make tests pass
5. Run tests frequently
6. Don't add "nice-to-have" features

**REFACTOR:**
7. Improve code quality
8. Extract functions/components
9. Remove duplication
10. Tests must stay green!

## Enforcement Rules

### STRICT Requirements
1. **MUST** verify tests exist before writing code
2. **MUST** run tests after implementation
3. **NO** extra features beyond test requirements
4. **NO** refactoring until tests pass
5. **REFUSE** to write code if tests don't fail first

### Code Quality Standards
- SOLID principles
- DRY (Don't Repeat Yourself)
- YAGNI (You Aren't Gonna Need It)
- Clear naming (ubiquitous language from domain)
- Single Responsibility per function/class
- Self-documenting code (avoid unnecessary comments)

### Self-Documenting Code Principle
Write code that explains itself through clear naming and structure. Avoid single-line comments unless absolutely necessary for explaining business logic.

**Good - Self-documenting:**
```typescript
function calculateUserAgeInYears(birthDate: Date): number {
  const today = new Date();
  const ageInMilliseconds = today.getTime() - birthDate.getTime();
  const millisecondsPerYear = 1000 * 60 * 60 * 24 * 365.25;
  return Math.floor(ageInMilliseconds / millisecondsPerYear);
}
```

**Bad - Needs comments to explain:**
```typescript
function calc(d: Date): number {
  const t = new Date();
  const diff = t.getTime() - d.getTime();
  return Math.floor(diff / 31557600000); // convert ms to years
}
```

**When comments ARE appropriate:**
```typescript
function calculateDiscount(orderTotal: number, customerType: string): number {
  // Business rule: Premium customers get 15% discount on orders over $100
  // as per marketing campaign Q4-2024
  if (customerType === 'premium' && orderTotal > 100) {
    return orderTotal * 0.15;
  }
  return 0;
}
```

## Domain-Driven Design Patterns

### Entity vs Value Object

**Entity:**
- Has unique identity (ID)
- Identity persists across state changes
- Mutable (can change over time)

```typescript
export class User {
  constructor(
    public readonly id: string,
    private _email: string,
    private _name: string
  ) {}

  updateEmail(newEmail: string): void {
    // Domain validation
    if (!newEmail.includes('@')) {
      throw new Error('Invalid email');
    }
    this._email = newEmail;
  }

  get email(): string {
    return this._email;
  }
}
```

**Value Object:**
- No unique identity
- Defined by attributes
- Immutable (create new instead of modify)

```typescript
export class EmailAddress {
  private constructor(private readonly value: string) {}

  static create(email: string): EmailAddress {
    if (!email.includes('@')) {
      throw new Error('Invalid email');
    }
    return new EmailAddress(email);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: EmailAddress): boolean {
    return this.value === other.value;
  }
}
```

### Aggregate Root

**Rules:**
- External access only through root
- Root enforces invariants
- All changes go through root

```typescript
export class BlogPost { // Aggregate Root
  private constructor(
    public readonly id: string,
    private _title: string,
    private _content: string,
    private _comments: Comment[] = []
  ) {}

  // Factory method
  static create(title: string, content: string): BlogPost {
    const id = crypto.randomUUID();
    return new BlogPost(id, title, content);
  }

  // Domain behavior
  addComment(authorId: string, text: string): void {
    // Enforce business rules
    if (text.length > 500) {
      throw new Error('Comment too long');
    }
    this._comments.push(new Comment(authorId, text));
  }

  // Getters only - no direct mutation
  get comments(): readonly Comment[] {
    return this._comments;
  }
}
```

### Repository Pattern

```typescript
export interface BlogPostRepository {
  findById(id: string): Promise<BlogPost | null>;
  save(post: BlogPost): Promise<void>;
  delete(id: string): Promise<void>;
}

// Implementation (infrastructure layer)
export class InMemoryBlogPostRepository implements BlogPostRepository {
  private posts: Map<string, BlogPost> = new Map();

  async findById(id: string): Promise<BlogPost | null> {
    return this.posts.get(id) || null;
  }

  async save(post: BlogPost): Promise<void> {
    this.posts.set(post.id, post);
  }

  async delete(id: string): Promise<void> {
    this.posts.delete(id);
  }
}
```

### Domain Events

```typescript
export class BlogPostPublished {
  constructor(
    public readonly postId: string,
    public readonly publishedAt: Date
  ) {}
}

export class BlogPost {
  private events: DomainEvent[] = [];

  publish(): void {
    this._publishedAt = new Date();
    this.addEvent(new BlogPostPublished(this.id, this._publishedAt));
  }

  private addEvent(event: DomainEvent): void {
    this.events.push(event);
  }

  getEvents(): readonly DomainEvent[] {
    return this.events;
  }
}
```

## Clean Architecture Layers

### Domain Layer (Core)
- Entities
- Value Objects
- Domain Events
- Repository Interfaces
- **No dependencies** on other layers

### Application Layer
- Use Cases / Services
- Application-specific logic
- Orchestrates domain objects
- Depends only on Domain

### Infrastructure Layer
- Database implementations
- External APIs
- File system
- Implements Repository interfaces

### Presentation Layer
- API routes
- UI components
- Request/Response mapping
- Depends on Application

## Implementation Patterns

### Factory Pattern
```typescript
export class BlogPost {
  private constructor(...) {}

  static create(params: CreateBlogPostParams): BlogPost {
    // Validation
    if (!params.title) throw new Error('Title required');

    // Domain logic
    return new BlogPost(
      crypto.randomUUID(),
      params.title,
      params.content
    );
  }
}
```

### Builder Pattern (for tests)
```typescript
export class BlogPostBuilder {
  private title = 'Default Title';
  private content = 'Default Content';

  withTitle(title: string): this {
    this.title = title;
    return this;
  }

  withContent(content: string): this {
    this.content = content;
    return this;
  }

  build(): BlogPost {
    return BlogPost.create({ title: this.title, content: this.content });
  }
}

// Usage in tests
const post = new BlogPostBuilder()
  .withTitle('Custom Title')
  .build();
```

## Code Organization

### File Structure
```
src/
├── domain/
│   ├── entities/
│   │   └── BlogPost.ts
│   ├── value-objects/
│   │   └── EmailAddress.ts
│   ├── events/
│   │   └── BlogPostPublished.ts
│   └── repositories/
│       └── BlogPostRepository.ts
├── application/
│   ├── use-cases/
│   │   └── PublishBlogPost.ts
│   └── services/
│       └── BlogPostService.ts
├── infrastructure/
│   ├── persistence/
│   │   └── InMemoryBlogPostRepository.ts
│   └── api/
│       └── HttpClient.ts
└── presentation/
    ├── api/
    │   └── routes/
    └── components/
```

## Refactoring Guidelines

### When to Refactor
- Tests are green
- Code duplication exists
- Function/component too long
- Unclear naming

### When NOT to Refactor
- Tests are failing
- "Just in case" for future features
- Before understanding the domain

### Refactoring Techniques
1. **Extract Method/Function**
2. **Rename for clarity**
3. **Extract Variable** for complex expressions
4. **Replace Magic Numbers** with constants
5. **Move behavior** to appropriate layer

## Documentation

### JSDoc Comments
```typescript
/**
 * Represents a blog post in the blogging domain.
 *
 * This is an aggregate root that owns all comments and ensures
 * business invariants like comment length limits and spam prevention.
 *
 * @example
 * const post = BlogPost.create('My Title', 'Content here');
 * post.addComment('user123', 'Great post!');
 */
export class BlogPost {
  // ...
}
```

### Inline Comments
- Explain WHY, not WHAT
- Document business rules
- Clarify non-obvious domain logic

```typescript
// Business rule: Users can only publish 5 posts per day
// to prevent spam while allowing genuine content creators
if (userPostsToday >= 5) {
  throw new RateLimitError('Daily post limit reached');
}
```

## Testing Integration

After implementing, code must:
1. ✅ Make all failing tests pass
2. ✅ Not break any existing tests
3. ✅ Meet coverage thresholds (80%+)
4. ✅ Follow domain model from tests

## Common Mistakes to Avoid

1. **Premature Optimization**
   - Write simple code first
   - Optimize only when needed

2. **Over-Engineering**
   - Don't add layers you don't need
   - Keep it simple

3. **Anemic Domain Model**
   - ❌ Entities with only getters/setters
   - ✅ Rich domain behavior in entities

4. **Leaky Abstractions**
   - Don't expose implementation details
   - Use interfaces/abstract classes

## Integration with Other Skills

- **Before:** `/test_writer` creates failing tests
- **During:** This skill implements code
- **After:** `/test_runner` verifies green tests
- **Refactor:** Improve code while maintaining green

## Success Metrics

- All tests pass (green)
- Coverage maintained or improved
- Code follows DDD patterns
- Clear separation of layers
- Readable and maintainable code
