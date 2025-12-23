# DDD Architect Skill

**Purpose:** Guide domain modeling and architecture decisions using Domain-Driven Design principles.

## Core Concepts

### Ubiquitous Language
- Use domain terms consistently
- Same words in code, tests, docs, conversations
- Avoid technical jargon in domain layer
- Create glossary of domain terms

### Bounded Contexts
- Define clear boundaries between subdomains
- Each context has its own model
- Explicit translation at boundaries
- Minimize coupling between contexts

## Strategic Design

### Context Mapping
```
User Management Context ←→ Exam Management Context
     ↓
Authentication Context
```

**Relationship Types:**
- **Shared Kernel:** Shared code
- **Customer/Supplier:** Upstream/downstream
- **Conformist:** Downstream conforms
- **Anti-corruption Layer:** Translator between contexts

### Example: LingoDrift
**Bounded Contexts:**
1. **Exam Management:** Create exams, sections, questions
2. **User Management:** Users, authentication, profiles
3. **Attempt Tracking:** Exam attempts, scoring
4. **Analytics:** Progress reports, statistics

## Tactical Design

### Building Blocks

**Entity:**
- Unique identity
- Mutable state
- Lifecycle management

**Value Object:**
- No identity
- Immutable
- Defined by attributes
- Replaceable

**Aggregate:**
- Cluster of entities/value objects
- One root entity
- Enforces invariants
- Transaction boundary

**Repository:**
- Persistence abstraction
- Collection-like interface
- Hides database details

**Domain Service:**
- Operation not natural to entity/value object
- Stateless
- Coordinates multiple aggregates

**Domain Event:**
- Something that happened
- Past tense naming
- Immutable
- Published after state change

### Decision Guide

**Entity or Value Object?**
```
Does it have a unique identity that persists? → Entity
Can two instances with same attributes be interchangeable? → Value Object

Example:
User → Entity (unique ID)
EmailAddress → Value Object (value matters, not identity)
```

**Aggregate Boundaries?**
```
What must be consistent together? → Same aggregate
What can be eventually consistent? → Different aggregates

Example:
Exam + ExamSection + Question → One aggregate
User + ExamAttempt → Separate aggregates (can be eventually consistent)
```

## Patterns

### Aggregate Root Pattern
```typescript
export class Exam { // Root
  private _sections: ExamSection[] = [];

  addSection(title: string, type: SectionType): void {
    // Invariant: Max 10 sections
    if (this._sections.length >= 10) {
      throw new Error('Max sections reached');
    }
    this._sections.push(new ExamSection(title, type));
  }

  // No direct access to sections - must go through root
  getSections(): readonly ExamSection[] {
    return this._sections;
  }
}
```

### Repository Pattern
```typescript
interface ExamRepository {
  find(id: ExamId): Promise<Exam | null>;
  save(exam: Exam): Promise<void>;
  // Only aggregate roots have repositories
}
```

### Domain Event Pattern
```typescript
class ExamPublished implements DomainEvent {
  constructor(
    public readonly examId: string,
    public readonly publishedAt: Date
  ) {}
}

class Exam {
  private events: DomainEvent[] = [];

  publish(): void {
    this._status = ExamStatus.Published;
    this.events.push(new ExamPublished(this.id, new Date()));
  }

  getEvents(): DomainEvent[] {
    return [...this.events];
  }

  clearEvents(): void {
    this.events = [];
  }
}
```

### Specification Pattern
```typescript
interface Specification<T> {
  isSatisfiedBy(candidate: T): boolean;
}

class PublishedExamSpecification implements Specification<Exam> {
  isSatisfiedBy(exam: Exam): boolean {
    return exam.status === ExamStatus.Published;
  }
}
```

## Layered Architecture

### Domain Layer (Core)
- Pure business logic
- No infrastructure dependencies
- Framework-agnostic

### Application Layer
- Use cases
- Orchestrates domain objects
- Transaction boundaries

### Infrastructure Layer
- Database, file system, APIs
- Implements repository interfaces
- External service integrations

### Presentation Layer
- API controllers
- UI components
- Request/response DTOs

## Anti-Patterns to Avoid

### Anemic Domain Model
**BAD:**
```typescript
class User {
  id: string;
  email: string;
  name: string;
  // Just getters/setters, no behavior
}
```

**GOOD:**
```typescript
class User {
  updateEmail(newEmail: EmailAddress): void {
    // Business rules here
    if (this.email.equals(newEmail)) return;
    this.email = newEmail;
    this.addEvent(new UserEmailChanged(this.id, newEmail));
  }
}
```

### God Object
**BAD:**
```typescript
class ExamService {
  // Does everything: create, update, delete, score, analytics
}
```

**GOOD:**
```typescript
class CreateExamUseCase { /* ... */ }
class ScoreExamAttemptUseCase { /* ... */ }
class ExamAnalyticsService { /* ... */ }
```

## Example: Blog Domain

**Bounded Context:** Blog

**Aggregates:**
- **BlogPost:** Root (Post + Comments + Tags)
- **Author:** Root (Author details)

**Entities:**
- BlogPost
- Comment
- Author

**Value Objects:**
- Title
- Content
- PublishDate
- Tag

**Events:**
- PostPublished
- CommentAdded
- PostUnpublished

**Repositories:**
- BlogPostRepository
- AuthorRepository

## Integration with Skills

- Guides `/code_writer` on structure
- Informs `/test_writer` on domain behavior
- Helps organize bounded contexts

## Success Metrics

- Clear bounded contexts
- Rich domain models
- Enforced invariants
- Explicit domain events
- Maintainable architecture
