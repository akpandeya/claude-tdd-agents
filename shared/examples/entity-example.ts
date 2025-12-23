/**
 * Entity Example: User
 *
 * An entity has:
 * - Unique identity (ID)
 * - Mutable state
 * - Identity-based equality
 * - Lifecycle management
 * - Business logic
 */

export type UserStatus = 'pending' | 'active' | 'suspended' | 'banned';

export class User {
  private _email: string;
  private _name: string;
  private _status: UserStatus;
  private _lastLoginAt?: Date;
  private _createdAt: Date;

  constructor(
    public readonly id: string, // Identity - never changes
    email: string,
    name: string,
    status: UserStatus = 'pending',
    createdAt?: Date
  ) {
    this._email = email;
    this._name = name;
    this._status = status;
    this._createdAt = createdAt || new Date();
  }

  // Factory method for creating new users
  static create(email: string, name: string): User {
    // Domain validation
    if (!email || !email.includes('@')) {
      throw new DomainError('Valid email required');
    }

    if (!name || name.trim().length < 2) {
      throw new DomainError('Name must be at least 2 characters');
    }

    const id = generateId(); // Generate unique ID
    return new User(id, email, name, 'pending');
  }

  // Factory method for reconstituting from database
  static reconstitute(
    id: string,
    email: string,
    name: string,
    status: UserStatus,
    createdAt: Date,
    lastLoginAt?: Date
  ): User {
    const user = new User(id, email, name, status, createdAt);
    user._lastLoginAt = lastLoginAt;
    return user;
  }

  // Business methods (domain logic)

  activate(): void {
    if (this._status === 'banned') {
      throw new DomainError('Cannot activate banned user');
    }

    this._status = 'active';
  }

  suspend(reason: string): void {
    if (this._status === 'banned') {
      throw new DomainError('User is already banned');
    }

    this._status = 'suspended';
    // Could raise domain event here
    // this.addEvent(new UserSuspended(this.id, reason));
  }

  ban(): void {
    this._status = 'banned';
    // this.addEvent(new UserBanned(this.id));
  }

  changeEmail(newEmail: string): void {
    // Business rule: email must be valid
    if (!newEmail || !newEmail.includes('@')) {
      throw new DomainError('Valid email required');
    }

    // Business rule: cannot change email if banned
    if (this._status === 'banned') {
      throw new DomainError('Cannot change email for banned user');
    }

    const oldEmail = this._email;
    this._email = newEmail;

    // Raise domain event
    // this.addEvent(new UserEmailChanged(this.id, oldEmail, newEmail));
  }

  changeName(newName: string): void {
    if (!newName || newName.trim().length < 2) {
      throw new DomainError('Name must be at least 2 characters');
    }

    this._name = newName;
  }

  recordLogin(): void {
    this._lastLoginAt = new Date();
  }

  // Getters (read-only access)

  get email(): string {
    return this._email;
  }

  get name(): string {
    return this._name;
  }

  get status(): UserStatus {
    return this._status;
  }

  get lastLoginAt(): Date | undefined {
    return this._lastLoginAt;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  // Query methods

  isActive(): boolean {
    return this._status === 'active';
  }

  isBanned(): boolean {
    return this._status === 'banned';
  }

  canLogin(): boolean {
    return this._status === 'active' || this._status === 'pending';
  }

  // Equality based on identity, NOT attributes
  equals(other: User): boolean {
    if (!other) return false;
    return this.id === other.id;
  }
}

// Domain error
class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
  }
}

// Helper (would be in infrastructure layer)
function generateId(): string {
  return crypto.randomUUID();
}

// Usage example:
/*
const user = User.create('john@example.com', 'John Doe');
console.log(user.id); // unique ID
console.log(user.status); // 'pending'

user.activate();
console.log(user.status); // 'active'

user.recordLogin();
console.log(user.lastLoginAt); // current date

// Two users with same attributes but different IDs are NOT equal
const user1 = User.create('john@example.com', 'John Doe');
const user2 = User.create('john@example.com', 'John Doe');
console.log(user1.equals(user2)); // false (different IDs)

// Same user is equal to itself
const sameUser = User.reconstitute(
  user1.id,
  user1.email,
  user1.name,
  user1.status,
  user1.createdAt
);
console.log(user1.equals(sameUser)); // true (same ID)
*/
