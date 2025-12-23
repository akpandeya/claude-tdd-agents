# Domain-Driven Design Patterns Reference

## Strategic Design

### Ubiquitous Language

Use consistent terminology across code, tests, documentation, and conversations.

**Example: E-commerce Domain**
```
Terms to use everywhere:
- "Order" not "purchase" or "transaction"
- "Cart" not "basket" or "shopping bag"
- "Product" not "item" or "good"
- "Checkout" not "finalize" or "complete"
```

### Bounded Contexts

Divide large domains into smaller, well-defined contexts.

**Example: LingoDrift Language Learning Platform**
```
┌──────────────────┐
│ Exam Management  │  Terms: Exam, Section, Question, Difficulty
└──────────────────┘

┌──────────────────┐
│ User Management  │  Terms: User, Profile, Subscription, Role
└──────────────────┘

┌──────────────────┐
│ Attempt Tracking │  Terms: Attempt, Score, Progress, Result
└──────────────────┘
```

Note: "User" means different things in each context!
- Exam Management: "User" = exam creator
- User Management: "User" = person with login credentials
- Attempt Tracking: "User" = test taker

## Tactical Design Patterns

### Entity

Has unique identity that persists across state changes.

**Characteristics:**
- Unique ID
- Mutable
- Identity-based equality
- Has lifecycle

```typescript
export class User {
  constructor(
    public readonly id: string, // Identity
    private _email: string,
    private _name: string,
    private _status: UserStatus
  ) {}

  // Business methods
  activate(): void {
    if (this._status === 'banned') {
      throw new DomainError('Cannot activate banned user');
    }
    this._status = 'active';
  }

  changeEmail(newEmail: EmailAddress): void {
    // Validation
    this._email = newEmail.getValue();
  }

  // Equality based on ID, not attributes
  equals(other: User): boolean {
    return this.id === other.id;
  }
}
```

### Value Object

No unique identity, defined entirely by attributes.

**Characteristics:**
- No ID
- Immutable
- Attribute-based equality
- Replaceable

```typescript
export class EmailAddress {
  private constructor(private readonly value: string) {
    if (!this.isValid(value)) {
      throw new DomainError('Invalid email format');
    }
  }

  // Factory method
  static create(email: string): EmailAddress {
    return new EmailAddress(email);
  }

  getValue(): string {
    return this.value;
  }

  // Equality based on value
  equals(other: EmailAddress): boolean {
    return this.value === other.value;
  }

  private isValid(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
```

```typescript
export class Money {
  private constructor(
    private readonly amount: number,
    private readonly currency: string
  ) {}

  static create(amount: number, currency: string): Money {
    if (amount < 0) {
      throw new DomainError('Amount cannot be negative');
    }
    return new Money(amount, currency);
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new DomainError('Cannot add different currencies');
    }
    return new Money(this.amount + other.amount, this.currency);
  }

  getAmount(): number {
    return this.amount;
  }

  equals(other: Money): boolean {
    return this.amount === other.amount &&
           this.currency === other.currency;
  }
}
```

### Aggregate

Cluster of entities and value objects treated as a unit.

**Rules:**
1. One root entity
2. External references only to root
3. Root enforces invariants
4. Transaction boundary

```typescript
export class Order { // Aggregate Root
  private constructor(
    public readonly id: string,
    private _customerId: string,
    private _items: OrderLine[], // Child entities
    private _status: OrderStatus,
    private _total: Money
  ) {}

  static create(customerId: string): Order {
    return new Order(
      generateId(),
      customerId,
      [],
      'draft',
      Money.zero('USD')
    );
  }

  // Access to items only through root
  addItem(productId: string, quantity: number, price: Money): void {
    // Business rule: Max 10 items per order
    if (this._items.length >= 10) {
      throw new DomainError('Maximum 10 items per order');
    }

    // Business rule: Cannot modify placed order
    if (this._status !== 'draft') {
      throw new DomainError('Cannot modify placed order');
    }

    const line = new OrderLine(generateId(), productId, quantity, price);
    this._items.push(line);
    this.recalculateTotal();
  }

  place(): void {
    // Business rule: Cannot place empty order
    if (this._items.length === 0) {
      throw new DomainError('Cannot place empty order');
    }

    this._status = 'placed';
    this._placedAt = new Date();

    // Raise domain event
    this.addEvent(new OrderPlaced(this.id, this._customerId, this._total));
  }

  // Read-only access
  getItems(): readonly OrderLine[] {
    return this._items;
  }

  private recalculateTotal(): void {
    this._total = this._items.reduce(
      (sum, line) => sum.add(line.getSubtotal()),
      Money.zero('USD')
    );
  }
}

// Child entity - not accessible outside aggregate
class OrderLine {
  constructor(
    public readonly id: string,
    private productId: string,
    private quantity: number,
    private price: Money
  ) {}

  getSubtotal(): Money {
    return Money.create(
      this.price.getAmount() * this.quantity,
      this.price.getCurrency()
    );
  }
}
```

### Repository

Persistence abstraction that works with aggregates.

**Rules:**
- One repository per aggregate root
- Collection-like interface
- Hides database details
- Returns domain objects

```typescript
// Domain layer - Interface
export interface OrderRepository {
  findById(id: string): Promise<Order | null>;
  findByCustomer(customerId: string): Promise<Order[]>;
  save(order: Order): Promise<void>;
  delete(id: string): Promise<void>;
}

// Infrastructure layer - Implementation
export class PostgresOrderRepository implements OrderRepository {
  constructor(
    private db: Database,
    private eventBus: EventBus
  ) {}

  async findById(id: string): Promise<Order | null> {
    const row = await this.db.query(
      `SELECT o.*, array_agg(ol.*) as items
       FROM orders o
       LEFT JOIN order_lines ol ON ol.order_id = o.id
       WHERE o.id = $1
       GROUP BY o.id`,
      [id]
    );

    if (!row) return null;

    return this.toDomain(row);
  }

  async save(order: Order): Promise<void> {
    await this.db.transaction(async (tx) => {
      // Save aggregate root
      await tx.query(
        `INSERT INTO orders (id, customer_id, status, total)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (id) DO UPDATE
         SET status = $3, total = $4`,
        [order.id, order.customerId, order.status, order.total]
      );

      // Save child entities
      await tx.query('DELETE FROM order_lines WHERE order_id = $1', [order.id]);

      for (const item of order.getItems()) {
        await tx.query(
          'INSERT INTO order_lines (id, order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4, $5)',
          [item.id, order.id, item.productId, item.quantity, item.price]
        );
      }
    });

    // Publish events after successful save
    for (const event of order.getEvents()) {
      await this.eventBus.publish(event);
    }

    order.clearEvents();
  }

  private toDomain(row: any): Order {
    // Map database row to domain aggregate
    return Order.reconstitute(/* ... */);
  }
}
```

### Domain Service

Operation that doesn't naturally belong to an entity or value object.

**When to use:**
- Operation involves multiple aggregates
- Complex business logic coordination
- Stateless operation

```typescript
export class TransferMoneyService {
  constructor(
    private accountRepository: AccountRepository,
    private transactionRepository: TransactionRepository
  ) {}

  async transfer(
    fromAccountId: string,
    toAccountId: string,
    amount: Money
  ): Promise<void> {
    // Load aggregates
    const fromAccount = await this.accountRepository.findById(fromAccountId);
    const toAccount = await this.accountRepository.findById(toAccountId);

    if (!fromAccount || !toAccount) {
      throw new DomainError('Account not found');
    }

    // Business logic coordination
    fromAccount.withdraw(amount);
    toAccount.deposit(amount);

    // Create transaction record
    const transaction = Transaction.create(
      fromAccountId,
      toAccountId,
      amount
    );

    // Save all changes
    await this.accountRepository.save(fromAccount);
    await this.accountRepository.save(toAccount);
    await this.transactionRepository.save(transaction);
  }
}
```

### Domain Events

Captures that something happened in the domain.

**Characteristics:**
- Past tense naming
- Immutable
- Contains relevant data
- Published after state change

```typescript
export class OrderPlaced {
  constructor(
    public readonly orderId: string,
    public readonly customerId: string,
    public readonly total: Money,
    public readonly occurredAt: Date
  ) {}
}

export class Order {
  private events: DomainEvent[] = [];

  place(): void {
    // Change state
    this._status = 'placed';

    // Raise event
    this.addEvent(new OrderPlaced(
      this.id,
      this._customerId,
      this._total,
      new Date()
    ));
  }

  private addEvent(event: DomainEvent): void {
    this.events.push(event);
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

Encapsulates business rules for selection/validation.

```typescript
export interface Specification<T> {
  isSatisfiedBy(candidate: T): boolean;
  and(other: Specification<T>): Specification<T>;
  or(other: Specification<T>): Specification<T>;
  not(): Specification<T>;
}

export class PremiumCustomerSpecification implements Specification<Customer> {
  isSatisfiedBy(customer: Customer): boolean {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    return (
      customer.totalPurchases.getAmount() > 1000 &&
      customer.memberSince < oneYearAgo
    );
  }

  and(other: Specification<Customer>): Specification<Customer> {
    return new AndSpecification(this, other);
  }

  or(other: Specification<Customer>): Specification<Customer> {
    return new OrSpecification(this, other);
  }

  not(): Specification<Customer> {
    return new NotSpecification(this);
  }
}

// Usage
const premiumCustomer = new PremiumCustomerSpecification();
const activeCustomer = new ActiveCustomerSpecification();
const eligibleForDiscount = premiumCustomer.and(activeCustomer);

if (eligibleForDiscount.isSatisfiedBy(customer)) {
  applyDiscount(customer, 0.15);
}
```

## Layered Architecture

### Domain Layer (Core)
**Contains:**
- Entities
- Value Objects
- Aggregates
- Domain Services
- Repository Interfaces
- Domain Events
- Specifications

**Dependencies:** None (pure business logic)

### Application Layer
**Contains:**
- Use Cases (Application Services)
- DTOs (Data Transfer Objects)
- Application Events
- Query Handlers
- Command Handlers

**Dependencies:** Domain Layer only

### Infrastructure Layer
**Contains:**
- Repository Implementations
- Database Access
- External API Clients
- Email/SMS Services
- File Storage

**Dependencies:** Domain Layer, Application Layer

### Presentation Layer
**Contains:**
- REST API Routes
- GraphQL Resolvers
- Controllers
- Request/Response Schemas
- View Models

**Dependencies:** Application Layer

## Decision Guides

### Entity or Value Object?

Ask:
1. Does it need a unique identity? → Entity
2. Are two instances with same values interchangeable? → Value Object
3. Does it change over time while keeping identity? → Entity
4. Is it just a measurement or description? → Value Object

Examples:
- User, Order, Product → Entities
- Email, Money, Address → Value Objects

### Aggregate Boundaries?

Ask:
1. What must be consistent together? → Same aggregate
2. What can be eventually consistent? → Different aggregates
3. What's the transaction boundary? → Aggregate boundary

Examples:
- Order + OrderLine → One aggregate (must be consistent)
- Order + Customer → Different aggregates (eventual consistency OK)

### Domain Service or Entity Method?

Ask:
1. Does operation naturally belong to one entity? → Entity method
2. Does it coordinate multiple aggregates? → Domain Service
3. Is it stateless? → Domain Service
4. Does it involve complex calculation across entities? → Domain Service

Examples:
- user.changeEmail() → Entity method
- transferMoney(from, to, amount) → Domain Service

## Common Patterns

### Factory Pattern
```typescript
export class UserFactory {
  static createUser(email: string, name: string): User {
    // Complex creation logic
    const emailVO = EmailAddress.create(email);
    const id = generateId();
    const status = 'pending';

    return new User(id, emailVO, name, status);
  }

  static createAdminUser(email: string, name: string): User {
    const user = this.createUser(email, name);
    user.grantRole('admin');
    return user;
  }
}
```

### Builder Pattern
```typescript
export class ExamBuilder {
  private title?: string;
  private sections: ExamSection[] = [];
  private difficulty?: Difficulty;

  setTitle(title: string): this {
    this.title = title;
    return this;
  }

  addSection(section: ExamSection): this {
    this.sections.push(section);
    return this;
  }

  setDifficulty(difficulty: Difficulty): this {
    this.difficulty = difficulty;
    return this;
  }

  build(): Exam {
    if (!this.title) throw new Error('Title required');
    if (!this.difficulty) throw new Error('Difficulty required');

    return new Exam(
      generateId(),
      this.title,
      this.sections,
      this.difficulty
    );
  }
}

// Usage
const exam = new ExamBuilder()
  .setTitle('English Grammar Test')
  .setDifficulty('intermediate')
  .addSection(section1)
  .addSection(section2)
  .build();
```

## Anti-Patterns to Avoid

### Anemic Domain Model
**Problem:** Entities are just data holders, all logic in services.

```typescript
// BAD
class Order {
  items: OrderItem[];
  total: number;
  status: string;
}

class OrderService {
  calculateTotal(order: Order) { /* ... */ }
  placeOrder(order: Order) { /* ... */ }
}

// GOOD
class Order {
  private items: OrderItem[];

  addItem(item: OrderItem): void {
    // Business logic here
  }

  calculateTotal(): Money {
    // Business logic here
  }

  place(): void {
    // Business logic here
  }
}
```

### God Object
**Problem:** One object does too much.

Break into smaller aggregates with clear boundaries.

### Leaking Domain Logic
**Problem:** Business rules in presentation or infrastructure layers.

Keep business logic in domain layer only.
