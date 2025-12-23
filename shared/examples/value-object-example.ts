/**
 * Value Object Examples
 *
 * A value object has:
 * - No unique identity
 * - Immutable (cannot change)
 * - Attribute-based equality
 * - Replaceable (create new instead of modifying)
 * - Self-validating
 */

// Example 1: Email Address

export class EmailAddress {
  private constructor(private readonly value: string) {
    this.validate(value);
  }

  // Factory method (private constructor pattern)
  static create(email: string): EmailAddress {
    return new EmailAddress(email);
  }

  private validate(email: string): void {
    if (!email || typeof email !== 'string') {
      throw new ValueError('Email is required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValueError('Invalid email format');
    }
  }

  getValue(): string {
    return this.value;
  }

  // Equality based on value, not identity
  equals(other: EmailAddress): boolean {
    if (!other) return false;
    return this.value === other.value;
  }

  // Helper methods
  getDomain(): string {
    return this.value.split('@')[1];
  }

  getLocalPart(): string {
    return this.value.split('@')[0];
  }

  toString(): string {
    return this.value;
  }
}

// Example 2: Money

export class Money {
  private constructor(
    private readonly amount: number,
    private readonly currency: string
  ) {
    this.validate(amount, currency);
  }

  static create(amount: number, currency: string): Money {
    return new Money(amount, currency);
  }

  static zero(currency: string): Money {
    return new Money(0, currency);
  }

  private validate(amount: number, currency: string): void {
    if (typeof amount !== 'number' || isNaN(amount)) {
      throw new ValueError('Amount must be a number');
    }

    if (amount < 0) {
      throw new ValueError('Amount cannot be negative');
    }

    if (!currency || currency.length !== 3) {
      throw new ValueError('Currency must be 3-letter ISO code');
    }
  }

  // Operations return NEW money objects (immutable)

  add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.amount + other.amount, this.currency);
  }

  subtract(other: Money): Money {
    this.assertSameCurrency(other);
    const newAmount = this.amount - other.amount;

    if (newAmount < 0) {
      throw new ValueError('Resulting amount cannot be negative');
    }

    return new Money(newAmount, this.currency);
  }

  multiply(factor: number): Money {
    if (factor < 0) {
      throw new ValueError('Factor cannot be negative');
    }
    return new Money(this.amount * factor, this.currency);
  }

  divide(divisor: number): Money {
    if (divisor <= 0) {
      throw new ValueError('Divisor must be positive');
    }
    return new Money(this.amount / divisor, this.currency);
  }

  // Comparison methods

  equals(other: Money): boolean {
    if (!other) return false;
    return (
      this.amount === other.amount &&
      this.currency === other.currency
    );
  }

  isGreaterThan(other: Money): boolean {
    this.assertSameCurrency(other);
    return this.amount > other.amount;
  }

  isLessThan(other: Money): boolean {
    this.assertSameCurrency(other);
    return this.amount < other.amount;
  }

  isZero(): boolean {
    return this.amount === 0;
  }

  // Getters

  getAmount(): number {
    return this.amount;
  }

  getCurrency(): string {
    return this.currency;
  }

  // Formatting

  toString(): string {
    return `${this.amount.toFixed(2)} ${this.currency}`;
  }

  format(locale: string = 'en-US'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: this.currency,
    }).format(this.amount);
  }

  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new ValueError(
        `Cannot operate on different currencies: ${this.currency} and ${other.currency}`
      );
    }
  }
}

// Example 3: Date Range

export class DateRange {
  private constructor(
    private readonly start: Date,
    private readonly end: Date
  ) {
    this.validate(start, end);
  }

  static create(start: Date, end: Date): DateRange {
    return new DateRange(start, end);
  }

  static createFromDays(start: Date, days: number): DateRange {
    const end = new Date(start);
    end.setDate(end.getDate() + days);
    return new DateRange(start, end);
  }

  private validate(start: Date, end: Date): void {
    if (!(start instanceof Date) || !(end instanceof Date)) {
      throw new ValueError('Start and end must be valid dates');
    }

    if (start > end) {
      throw new ValueError('Start date must be before or equal to end date');
    }
  }

  contains(date: Date): boolean {
    return date >= this.start && date <= this.end;
  }

  overlaps(other: DateRange): boolean {
    return (
      this.start <= other.end &&
      this.end >= other.start
    );
  }

  getDurationInDays(): number {
    const diffInMs = this.end.getTime() - this.start.getTime();
    return Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  }

  getStart(): Date {
    return new Date(this.start); // Return copy for immutability
  }

  getEnd(): Date {
    return new Date(this.end); // Return copy for immutability
  }

  equals(other: DateRange): boolean {
    if (!other) return false;
    return (
      this.start.getTime() === other.start.getTime() &&
      this.end.getTime() === other.end.getTime()
    );
  }

  toString(): string {
    return `${this.start.toISOString()} - ${this.end.toISOString()}`;
  }
}

// Example 4: Address

export class Address {
  private constructor(
    private readonly street: string,
    private readonly city: string,
    private readonly state: string,
    private readonly zipCode: string,
    private readonly country: string
  ) {
    this.validate();
  }

  static create(
    street: string,
    city: string,
    state: string,
    zipCode: string,
    country: string
  ): Address {
    return new Address(street, city, state, zipCode, country);
  }

  private validate(): void {
    if (!this.street || this.street.trim().length === 0) {
      throw new ValueError('Street is required');
    }

    if (!this.city || this.city.trim().length === 0) {
      throw new ValueError('City is required');
    }

    if (!this.zipCode || !/^\d{5}(-\d{4})?$/.test(this.zipCode)) {
      throw new ValueError('Invalid zip code format');
    }
  }

  getStreet(): string {
    return this.street;
  }

  getCity(): string {
    return this.city;
  }

  getState(): string {
    return this.state;
  }

  getZipCode(): string {
    return this.zipCode;
  }

  getCountry(): string {
    return this.country;
  }

  equals(other: Address): boolean {
    if (!other) return false;
    return (
      this.street === other.street &&
      this.city === other.city &&
      this.state === other.state &&
      this.zipCode === other.zipCode &&
      this.country === other.country
    );
  }

  toString(): string {
    return `${this.street}, ${this.city}, ${this.state} ${this.zipCode}, ${this.country}`;
  }
}

// Value error class
class ValueError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValueError';
  }
}

// Usage examples:
/*
// Email
const email1 = EmailAddress.create('john@example.com');
const email2 = EmailAddress.create('john@example.com');
console.log(email1.equals(email2)); // true (same value)
console.log(email1.getDomain()); // 'example.com'

// Money
const price = Money.create(100, 'USD');
const tax = Money.create(10, 'USD');
const total = price.add(tax);
console.log(total.toString()); // '110.00 USD'

const doubled = price.multiply(2);
console.log(doubled.toString()); // '200.00 USD'

// Original price is unchanged (immutable)
console.log(price.toString()); // '100.00 USD'

// Cannot mix currencies
try {
  const usd = Money.create(100, 'USD');
  const eur = Money.create(100, 'EUR');
  usd.add(eur); // Throws error!
} catch (e) {
  console.log(e.message); // 'Cannot operate on different currencies...'
}

// Date Range
const range = DateRange.createFromDays(new Date('2024-01-01'), 7);
console.log(range.getDurationInDays()); // 7
console.log(range.contains(new Date('2024-01-05'))); // true

// Address
const address = Address.create(
  '123 Main St',
  'Springfield',
  'IL',
  '62701',
  'USA'
);
console.log(address.toString());
// '123 Main St, Springfield, IL 62701, USA'

// Two addresses with same values are equal
const sameAddress = Address.create(
  '123 Main St',
  'Springfield',
  'IL',
  '62701',
  'USA'
);
console.log(address.equals(sameAddress)); // true
*/
