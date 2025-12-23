/**
 * Aggregate Example: Order Aggregate
 *
 * An aggregate has:
 * - One root entity (Order)
 * - Child entities (OrderLine)
 * - Value objects (Money)
 * - Business invariants enforced by root
 * - External access only through root
 * - Transaction boundary
 */

// Value Object
class Money {
  private constructor(
    private readonly amount: number,
    private readonly currency: string
  ) {}

  static create(amount: number, currency: string): Money {
    if (amount < 0) throw new DomainError('Amount cannot be negative');
    return new Money(amount, currency);
  }

  static zero(currency: string): Money {
    return new Money(0, currency);
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new DomainError('Cannot add different currencies');
    }
    return new Money(this.amount + other.amount, this.currency);
  }

  multiply(factor: number): Money {
    return new Money(this.amount * factor, this.currency);
  }

  getAmount(): number {
    return this.amount;
  }

  getCurrency(): string {
    return this.currency;
  }

  equals(other: Money): boolean {
    return (
      this.amount === other.amount &&
      this.currency === other.currency
    );
  }
}

// Child Entity (not accessible outside aggregate)
class OrderLine {
  constructor(
    public readonly id: string,
    private readonly productId: string,
    private quantity: number,
    private readonly unitPrice: Money
  ) {
    if (quantity <= 0) {
      throw new DomainError('Quantity must be positive');
    }
  }

  getProductId(): string {
    return this.productId;
  }

  getQuantity(): number {
    return this.quantity;
  }

  getUnitPrice(): Money {
    return this.unitPrice;
  }

  getSubtotal(): Money {
    return this.unitPrice.multiply(this.quantity);
  }

  changeQuantity(newQuantity: number): void {
    if (newQuantity <= 0) {
      throw new DomainError('Quantity must be positive');
    }
    this.quantity = newQuantity;
  }
}

// Domain Events
class OrderPlaced {
  constructor(
    public readonly orderId: string,
    public readonly customerId: string,
    public readonly total: Money,
    public readonly occurredAt: Date
  ) {}
}

class OrderCancelled {
  constructor(
    public readonly orderId: string,
    public readonly reason: string,
    public readonly occurredAt: Date
  ) {}
}

type OrderStatus = 'draft' | 'placed' | 'paid' | 'shipped' | 'delivered' | 'cancelled';

// Aggregate Root
export class Order {
  private _items: OrderLine[] = [];
  private _status: OrderStatus = 'draft';
  private _placedAt?: Date;
  private _cancelledAt?: Date;
  private _cancellationReason?: string;
  private _events: any[] = [];

  private constructor(
    public readonly id: string,
    private readonly customerId: string,
    private readonly currency: string,
    private readonly createdAt: Date
  ) {}

  // Factory method for creating new orders
  static create(customerId: string, currency: string): Order {
    if (!customerId) {
      throw new DomainError('Customer ID is required');
    }

    const id = generateId();
    return new Order(id, customerId, currency, new Date());
  }

  // Factory method for reconstituting from database
  static reconstitute(
    id: string,
    customerId: string,
    currency: string,
    items: OrderLine[],
    status: OrderStatus,
    createdAt: Date,
    placedAt?: Date,
    cancelledAt?: Date,
    cancellationReason?: string
  ): Order {
    const order = new Order(id, customerId, currency, createdAt);
    order._items = items;
    order._status = status;
    order._placedAt = placedAt;
    order._cancelledAt = cancelledAt;
    order._cancellationReason = cancellationReason;
    return order;
  }

  // Business methods - All access to items goes through root

  addItem(productId: string, quantity: number, unitPrice: Money): void {
    // Business rule: Cannot modify placed order
    if (this._status !== 'draft') {
      throw new DomainError('Cannot modify order after it has been placed');
    }

    // Business rule: Max 10 items per order
    if (this._items.length >= 10) {
      throw new DomainError('Maximum 10 items per order');
    }

    // Business rule: Currency must match
    if (unitPrice.getCurrency() !== this.currency) {
      throw new DomainError(`All items must be in ${this.currency}`);
    }

    // Check if product already in order
    const existingItem = this._items.find(
      item => item.getProductId() === productId
    );

    if (existingItem) {
      // Update quantity of existing item
      existingItem.changeQuantity(existingItem.getQuantity() + quantity);
    } else {
      // Add new item
      const lineId = generateId();
      const line = new OrderLine(lineId, productId, quantity, unitPrice);
      this._items.push(line);
    }
  }

  removeItem(productId: string): void {
    // Business rule: Cannot modify placed order
    if (this._status !== 'draft') {
      throw new DomainError('Cannot modify order after it has been placed');
    }

    const index = this._items.findIndex(
      item => item.getProductId() === productId
    );

    if (index === -1) {
      throw new DomainError('Item not found in order');
    }

    this._items.splice(index, 1);
  }

  changeItemQuantity(productId: string, newQuantity: number): void {
    // Business rule: Cannot modify placed order
    if (this._status !== 'draft') {
      throw new DomainError('Cannot modify order after it has been placed');
    }

    const item = this._items.find(
      item => item.getProductId() === productId
    );

    if (!item) {
      throw new DomainError('Item not found in order');
    }

    item.changeQuantity(newQuantity);
  }

  place(): void {
    // Business rule: Cannot place empty order
    if (this._items.length === 0) {
      throw new DomainError('Cannot place empty order');
    }

    // Business rule: Order must be in draft status
    if (this._status !== 'draft') {
      throw new DomainError('Order has already been placed');
    }

    // Business rule: Minimum order value
    const total = this.calculateTotal();
    const minimumOrderValue = Money.create(10, this.currency);
    if (total.getAmount() < minimumOrderValue.getAmount()) {
      throw new DomainError(
        `Order total must be at least ${minimumOrderValue.getAmount()} ${this.currency}`
      );
    }

    this._status = 'placed';
    this._placedAt = new Date();

    // Raise domain event
    this._events.push(new OrderPlaced(
      this.id,
      this.customerId,
      total,
      this._placedAt
    ));
  }

  markAsPaid(): void {
    if (this._status !== 'placed') {
      throw new DomainError('Only placed orders can be marked as paid');
    }

    this._status = 'paid';
  }

  ship(): void {
    if (this._status !== 'paid') {
      throw new DomainError('Only paid orders can be shipped');
    }

    this._status = 'shipped';
  }

  deliver(): void {
    if (this._status !== 'shipped') {
      throw new DomainError('Only shipped orders can be delivered');
    }

    this._status = 'delivered';
  }

  cancel(reason: string): void {
    // Business rule: Cannot cancel delivered orders
    if (this._status === 'delivered') {
      throw new DomainError('Cannot cancel delivered order');
    }

    // Business rule: Cannot cancel already cancelled orders
    if (this._status === 'cancelled') {
      throw new DomainError('Order is already cancelled');
    }

    if (!reason || reason.trim().length === 0) {
      throw new DomainError('Cancellation reason is required');
    }

    this._status = 'cancelled';
    this._cancelledAt = new Date();
    this._cancellationReason = reason;

    // Raise domain event
    this._events.push(new OrderCancelled(
      this.id,
      reason,
      this._cancelledAt
    ));
  }

  // Query methods

  calculateTotal(): Money {
    if (this._items.length === 0) {
      return Money.zero(this.currency);
    }

    return this._items.reduce(
      (sum, item) => sum.add(item.getSubtotal()),
      Money.zero(this.currency)
    );
  }

  getItemCount(): number {
    return this._items.length;
  }

  getTotalQuantity(): number {
    return this._items.reduce(
      (sum, item) => sum + item.getQuantity(),
      0
    );
  }

  hasItem(productId: string): boolean {
    return this._items.some(item => item.getProductId() === productId);
  }

  canBePlaced(): boolean {
    return this._status === 'draft' && this._items.length > 0;
  }

  canBeCancelled(): boolean {
    return this._status !== 'delivered' && this._status !== 'cancelled';
  }

  // Getters - Read-only access

  get customerId(): string {
    return this.customerId;
  }

  get status(): OrderStatus {
    return this._status;
  }

  get placedAt(): Date | undefined {
    return this._placedAt;
  }

  get cancelledAt(): Date | undefined {
    return this._cancelledAt;
  }

  get createdAt(): Date {
    return this.createdAt;
  }

  // Read-only access to items (defensive copy)
  getItems(): readonly OrderLine[] {
    return [...this._items];
  }

  // Event management
  getEvents(): any[] {
    return [...this._events];
  }

  clearEvents(): void {
    this._events = [];
  }
}

// Domain error
class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
  }
}

// Helper
function generateId(): string {
  return crypto.randomUUID();
}

// Usage example:
/*
// Create new order
const order = Order.create('customer-123', 'USD');

// Add items
order.addItem(
  'product-1',
  2,
  Money.create(50, 'USD')
);

order.addItem(
  'product-2',
  1,
  Money.create(30, 'USD')
);

console.log(order.calculateTotal().getAmount()); // 130
console.log(order.getItemCount()); // 2
console.log(order.getTotalQuantity()); // 3

// Place order
order.place();
console.log(order.status); // 'placed'
console.log(order.getEvents().length); // 1 (OrderPlaced event)

// Try to modify placed order (will throw error)
try {
  order.addItem('product-3', 1, Money.create(10, 'USD'));
} catch (e) {
  console.log(e.message); // 'Cannot modify order after it has been placed'
}

// Continue order lifecycle
order.markAsPaid();
order.ship();
order.deliver();

// Cannot cancel delivered order
try {
  order.cancel('Changed mind');
} catch (e) {
  console.log(e.message); // 'Cannot cancel delivered order'
}

// Business rules enforced:
// - Cannot modify order after placement
// - Cannot place empty order
// - Max 10 items per order
// - Minimum order value
// - Currency consistency
// - Status transitions
// - Cannot cancel delivered orders
*/
