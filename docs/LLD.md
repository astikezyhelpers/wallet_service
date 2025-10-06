# Wallet Service - Low Level Design (LLD)

## 1. Service Overview

### Service Details
- **Service Name**: Wallet & Budget Service
- **Port**: 3003
- **Database**: PostgreSQL
- **Service Type**: Core Financial Service
- **Communication**: REST API + Event-Driven

### Business Responsibilities
- Wallet creation and management
- Budget allocation and tracking
- Transaction processing and history
- Balance management and validation
- Financial reporting and analytics

## 2. Detailed System Architecture

### 2.1 Component Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            WALLET SERVICE                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐          │
│  │   API Layer     │    │  Business Logic │    │   Data Access   │          │
│  │                 │    │     Layer       │    │     Layer       │          │
│  │ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │          │
│  │ │   Wallet    │ │    │ │   Wallet    │ │    │ │   Wallet    │ │          │
│  │ │ Controller  │ │◄───┤ │  Service    │ │◄───┤ │ Repository  │ │          │
│  │ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │          │
│  │                 │    │                 │    │                 │          │
│  │ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │          │
│  │ │  Budget     │ │    │ │  Budget     │ │    │ │  Budget     │ │          │
│  │ │ Controller  │ │◄───┤ │  Service    │ │◄───┤ │ Repository  │ │          │
│  │ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │          │
│  │                 │    │                 │    │                 │          │
│  │ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │          │
│  │ │Transaction  │ │    │ │Transaction  │ │    │ │Transaction  │ │          │
│  │ │ Controller  │ │◄───┤ │  Service    │ │◄───┤ │ Repository  │ │          │
│  │ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │          │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘          │
│           │                       │                       │                   │
│           │                       │                       │                   │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐          │
│  │  Middleware     │    │ Event Handler   │    │   Database      │          │
│  │                 │    │     Layer       │    │   Connection    │          │
│  │ ┌─────────────┐ │    │ ┌─────────────┐ │    │     Pool        │          │
│  │ │ Auth Guard  │ │    │ │  Event      │ │    │                 │          │
│  │ └─────────────┘ │    │ │ Publisher   │ │    │  PostgreSQL     │          │
│  │ ┌─────────────┐ │    │ └─────────────┘ │    │                 │          │
│  │ │ Rate Limit  │ │    │ ┌─────────────┐ │    │                 │          │
│  │ └─────────────┘ │    │ │  Event      │ │    │                 │          │
│  │ ┌─────────────┐ │    │ │ Subscriber  │ │    │                 │          │
│  │ │ Validation  │ │    │ └─────────────┘ │    │                 │          │
│  │ └─────────────┘ │    └─────────────────┘    └─────────────────┘          │
│  └─────────────────┘                                                         │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        EXTERNAL INTEGRATIONS                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐          │
│  │ Message Queue   │    │  User Mgmt      │    │  Notification   │          │
│  │ (RabbitMQ)      │    │  Service        │    │  Service        │          │
│  │                 │    │                 │    │                 │          │
│  │ • Events        │    │ • User Info     │    │ • Alerts        │          │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘          │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Service Interaction Flow

```
┌─────────────┐    HTTP Request     ┌─────────────────┐
│   Client    │────────────────────▶│   API Gateway   │
│ (Web/Mobile)│                     │                 │
└─────────────┘                     └─────────────────┘
                                             │
                                             ▼
                                    ┌─────────────────┐
                                    │  Wallet Service │
                                    │                 │
                                    │ ┌─────────────┐ │
                                    │ │ Controller  │ │
                                    │ └─────────────┘ │
                                    │         │       │
                                    │         ▼       │
                                    │ ┌─────────────┐ │
                                    │ │ Service     │ │
                                    │ │ Layer       │ │
                                    │ └─────────────┘ │
                                    │         │       │
                                    │         ▼       │
                                    │ ┌─────────────┐ │
                                    │ │ Repository  │ │
                                    │ └─────────────┘ │
                                    └─────────────────┘
                                             │
                                             ▼
                                    ┌─────────────────┐
                                    │   PostgreSQL    │
                                    │    Database     │
                                    └─────────────────┘
```

## 3. Database Schema Design

### 3.1 Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATABASE SCHEMA                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐ │
│  │     USERS       │         │     WALLETS     │         │   TRANSACTIONS  │ │
│  │                 │         │                 │         │                 │ │
│  │ • user_id (PK)  │────────▶│ • wallet_id(PK) │◄────────│ • txn_id (PK)   │ │
│  │ • email         │    1:1  │ • user_id (FK)  │    1:N  │ • wallet_id(FK) │ │
│  │ • company_id    │         │ • balance       │         │ • amount        │ │
│  │ • role          │         │ • currency      │         │ • type          │ │
│  │ • created_at    │         │ • status        │         │ • description   │ │
│  │ • updated_at    │         │ • created_at    │         │ • reference_id  │ │
│  └─────────────────┘         │ • updated_at    │         │ • status        │ │
│                               └─────────────────┘         │ • created_at    │ │
│                                        │                  │ • updated_at    │ │
│                                        │                  └─────────────────┘ │
│                                        │ 1:N                                  │
│                                        ▼                                      │
│                               ┌─────────────────┐                            │
│                               │     BUDGETS     │                            │
│                               │                 │                            │
│                               │ • budget_id(PK) │                            │
│                               │ • wallet_id(FK) │                            │
│                               │ • total_amount  │                            │
│                               │ • used_amount   │                            │
│                               │ • remaining     │                            │
│                               │ • period_type   │                            │
│                               │ • start_date    │                            │
│                               │ • end_date      │                            │
│                               │ • status        │                            │
│                               │ • created_by    │                            │
│                               │ • created_at    │                            │
│                               │ • updated_at    │                            │
│                               └─────────────────┘                            │
│                                        │                                      │
│                                        │ 1:N                                 │
│                                        ▼                                      │
│                               ┌─────────────────┐                            │
│                               │ BUDGET_HISTORY  │                            │
│                               │                 │                            │
│                               │ • history_id(PK)│                            │
│                               │ • budget_id(FK) │                            │
│                               │ • old_amount    │                            │
│                               │ • new_amount    │                            │
│                               │ • change_reason │                            │
│                               │ • changed_by    │                            │
│                               │ • created_at    │                            │
│                               └─────────────────┘                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Table Schemas

#### Wallets Table
```sql
CREATE TABLE wallets (
    wallet_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id),
    balance DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT positive_balance CHECK (balance >= 0),
    CONSTRAINT valid_status CHECK (status IN ('ACTIVE', 'FROZEN', 'CLOSED')),
    CONSTRAINT valid_currency CHECK (currency IN ('USD', 'EUR', 'INR', 'GBP'))
);

CREATE UNIQUE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_wallets_status ON wallets(status);
```

#### Transactions Table
```sql
CREATE TABLE transactions (
    txn_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL REFERENCES wallets(wallet_id),
    amount DECIMAL(15,2) NOT NULL,
    type VARCHAR(20) NOT NULL,
    description TEXT,
    reference_id VARCHAR(100),
    reference_type VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT non_zero_amount CHECK (amount != 0),
    CONSTRAINT valid_type CHECK (type IN ('CREDIT', 'DEBIT', 'TRANSFER_IN', 'TRANSFER_OUT')),
    CONSTRAINT valid_status CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'))
);

CREATE INDEX idx_transactions_wallet_id ON transactions(wallet_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_transactions_reference ON transactions(reference_id, reference_type);
```

#### Budgets Table
```sql
CREATE TABLE budgets (
    budget_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL REFERENCES wallets(wallet_id),
    total_amount DECIMAL(15,2) NOT NULL,
    used_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    remaining_amount DECIMAL(15,2) GENERATED ALWAYS AS (total_amount - used_amount) STORED,
    period_type VARCHAR(20) NOT NULL DEFAULT 'MONTHLY',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT positive_amounts CHECK (total_amount > 0 AND used_amount >= 0),
    CONSTRAINT valid_period CHECK (end_date > start_date),
    CONSTRAINT valid_period_type CHECK (period_type IN ('WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY')),
    CONSTRAINT valid_status CHECK (status IN ('ACTIVE', 'EXPIRED', 'SUSPENDED'))
);

CREATE INDEX idx_budgets_wallet_id ON budgets(wallet_id);
CREATE INDEX idx_budgets_period ON budgets(start_date, end_date);
CREATE INDEX idx_budgets_status ON budgets(status);
```

## 4. API Specification

### 4.1 Wallet Management APIs

#### GET /wallets/{userId}
**Description**: Get wallet details for a user
**Authentication**: Required
**Authorization**: User can access own wallet, Manager can access team wallets

**Response Schema**:
```json
{
  "wallet_id": "uuid",
  "user_id": "uuid",
  "balance": "decimal",
  "currency": "string",
  "status": "string",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

#### POST /wallets
**Description**: Create a new wallet for a user
**Authentication**: Required
**Authorization**: Admin/Manager only

**Request Schema**:
```json
{
  "user_id": "uuid",
  "initial_balance": "decimal",
  "currency": "string"
}
```

#### PUT /wallets/{walletId}/status
**Description**: Update wallet status (freeze/unfreeze/close)
**Authentication**: Required
**Authorization**: Admin/Manager only

### 4.2 Transaction APIs

#### GET /wallets/{walletId}/transactions
**Description**: Get transaction history for a wallet
**Authentication**: Required
**Query Parameters**: 
- page, limit, start_date, end_date, type, status

**Response Schema**:
```json
{
  "transactions": [
    {
      "txn_id": "uuid",
      "amount": "decimal",
      "type": "string",
      "description": "string",
      "status": "string",
      "created_at": "timestamp"
    }
  ],
  "pagination": {
    "page": "number",
    "limit": "number",
    "total": "number"
  }
}
```

#### POST /wallets/{walletId}/transactions
**Description**: Create a new transaction (credit/debit)
**Authentication**: Required
**Authorization**: System internal calls only

### 4.3 Budget APIs

#### GET /budgets/{userId}
**Description**: Get active budgets for a user
**Authentication**: Required

#### POST /budgets
**Description**: Create a new budget allocation
**Authentication**: Required
**Authorization**: Admin/Manager only

#### PUT /budgets/{budgetId}
**Description**: Update budget allocation
**Authentication**: Required
**Authorization**: Admin/Manager only

## 5. Event-Driven Architecture

### 5.1 Events Published

#### WalletCreated
```json
{
  "event_type": "WalletCreated",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "wallet_id": "uuid",
    "user_id": "uuid",
    "initial_balance": "decimal",
    "currency": "string"
  }
}
```

#### TransactionCompleted
```json
{
  "event_type": "TransactionCompleted",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "txn_id": "uuid",
    "wallet_id": "uuid",
    "amount": "decimal",
    "type": "string",
    "reference_id": "string",
    "new_balance": "decimal"
  }
}
```

#### BudgetExceeded
```json
{
  "event_type": "BudgetExceeded",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "budget_id": "uuid",
    "wallet_id": "uuid",
    "user_id": "uuid",
    "exceeded_amount": "decimal",
    "threshold_percentage": "number"
  }
}
```

### 5.2 Events Consumed

#### BookingCreated (from Booking Services)
- Triggers wallet debit transaction
- Updates budget utilization
- Publishes transaction events

#### BookingCancelled (from Booking Services)
- Triggers wallet credit transaction (refund)
- Updates budget utilization
- Publishes transaction events

#### UserCreated (from User Management Service)
- Triggers wallet creation for new user
- Sets up default budget allocations

## 6. Business Logic Flow Diagrams

### 6.1 Transaction Processing Flow

```
┌─────────────────┐
│ Transaction     │
│ Request         │
└─────────────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│ Validate        │────▶│ Insufficient    │
│ Request         │     │ Funds?          │
└─────────────────┘     └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│ Check Wallet    │     │ Return Error    │
│ Status          │     │ Response        │
└─────────────────┘     └─────────────────┘
         │
         ▼
┌─────────────────┐
│ Check Budget    │
│ Limits          │
└─────────────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│ Begin Database  │────▶│ Create Pending  │
│ Transaction     │     │ Transaction     │
└─────────────────┘     └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│ Update Wallet   │────▶│ Update Budget   │
│ Balance         │     │ Usage           │
└─────────────────┘     └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│ Mark Transaction│────▶│ Commit Database │
│ Completed       │     │ Transaction     │
└─────────────────┘     └─────────────────┘
         │
         ▼
┌─────────────────┐
│ Publish         │
│ Events          │
└─────────────────┘
```

### 6.2 Budget Management Flow

```
┌─────────────────┐
│ Budget          │
│ Allocation      │
│ Request         │
└─────────────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│ Validate        │────▶│ Check Manager   │
│ Request         │     │ Authorization   │
└─────────────────┘     └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│ Check Existing  │     │ Return Auth     │
│ Budget          │     │ Error           │
└─────────────────┘     └─────────────────┘
         │
         ▼
┌─────────────────┐
│ Create/Update   │
│ Budget Record   │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ Log Budget      │
│ History         │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ Notify User     │
│ (Event)         │
└─────────────────┘
```

## 7. Security Implementation

### 7.1 Authentication & Authorization

```
┌─────────────────┐     ┌─────────────────┐
│ API Request     │────▶│ Extract JWT     │
│ with JWT Token  │     │ Token           │
└─────────────────┘     └─────────────────┘
                                │
                                ▼
                        ┌─────────────────┐
                        │ Validate Token  │
                        │ Signature       │
                        └─────────────────┘
                                │
                                ▼
                        ┌─────────────────┐
                        │ Extract User    │
                        │ Claims          │
                        └─────────────────┘
                                │
                                ▼
                        ┌─────────────────┐
                        │ Check Resource  │
                        │ Permissions     │
                        └─────────────────┘
                                │
                                ▼
                        ┌─────────────────┐
                        │ Allow/Deny      │
                        │ Request         │
                        └─────────────────┘
```

### 7.2 Data Encryption
- **At Rest**: Database-level encryption for sensitive fields
- **In Transit**: TLS 1.3 for API communications
- **Application**: Field-level encryption for PII data

### 7.3 Audit Trail
- All transactions logged with user context
- Immutable audit log for compliance
- Real-time monitoring for suspicious activities

## 8. Performance Optimization

### 8.1 Caching Strategy

```
┌─────────────────┐     ┌─────────────────┐
│ API Request     │────▶│ Check Redis     │
│                 │     │ Cache           │
└─────────────────┘     └─────────────────┘
                                │
                         Cache Hit│ Cache Miss
                                ▼
                        ┌─────────────────┐
                        │ Return Cached   │
                        │ Data            │
                        └─────────────────┘
                                │
                                ▼
                        ┌─────────────────┐
                        │ Query Database  │
                        └─────────────────┘
                                │
                                ▼
                        ┌─────────────────┐
                        │ Cache Result    │
                        │ (TTL: 5min)     │
                        └─────────────────┘
```

### 8.2 Database Optimization
- **Connection Pooling**: Maximum 20 connections per instance
- **Read Replicas**: Separate read/write operations
- **Indexing Strategy**: Optimized indexes for frequent queries
- **Partitioning**: Transaction table partitioned by date

### 8.3 Monitoring Metrics
- **Response Time**: < 200ms for wallet queries
- **Throughput**: 1000 TPS for transaction processing
- **Availability**: 99.9% uptime SLA
- **Error Rate**: < 0.1% for critical operations

## 9. Error Handling & Recovery

### 9.1 Error Categories

#### Business Logic Errors
- Insufficient funds
- Budget exceeded
- Invalid transaction type
- Wallet status restrictions

#### Technical Errors
- Database connection failures
- External service timeouts
- Network connectivity issues
- System resource constraints

### 9.2 Retry Mechanisms
- **Exponential Backoff**: For external service calls
- **Circuit Breaker**: Prevent cascade failures
- **Dead Letter Queue**: For failed event processing
- **Idempotency**: All operations are idempotent

## 10. Deployment Configuration

### 10.1 Container Configuration
```yaml
# Resource Limits
resources:
  requests:
    cpu: 500m
    memory: 512Mi
  limits:
    cpu: 1000m
    memory: 1Gi

# Health Checks
livenessProbe:
  httpGet:
    path: /health
    port: 3003
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /ready
    port: 3003
  initialDelaySeconds: 5
  periodSeconds: 5
```

### 10.2 Environment Configuration
- **Development**: Single instance, in-memory cache
- **Staging**: 2 instances, Redis cache, read replica
- **Production**: 3+ instances, Redis cluster, multiple read replicas

This comprehensive Low Level Design provides detailed technical specifications for implementing the Wallet Service while maintaining scalability, security, and performance requirements.


