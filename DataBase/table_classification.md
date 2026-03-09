# Database Table Classification

The tables are categorized into the following ER modeling groups:

- Strong Entities
- Weak Entities
- Associative (Junction) Entities
- Configuration Tables

This classification helps explain the **conceptual design of the database schema**.

---

# **1. Strong Entities**

A **strong entity**:

- Has its **own independent primary key**
- Can **exist independently**
- Does **not rely on another table for identification**

| Table |
|------|
roles |
users |
instruments |
orders |
trades |
transactions |
watchlists |
indices |
financial_reports |
courses |
course_modules |
learning_materials |
challenges |
questions |
options |
live_classes |
notifications |

Total:

**17 Strong Entities**

Example:

```
users
Primary Key → user_id
```

Users exist **independently in the system**.

---

# **2. Weak Entities**

A **weak entity**:

- Depends on another entity to exist
- Cannot exist without a parent entity
- Contains a **foreign key referencing a parent table**

| Table | Depends On |
|------|------|
students | users |
staff | users |
accounts | users |
market_prices | instruments |
audit_logs | users |
price_history | instruments |
market_depth | instruments |

Total:

**7 Weak Entities**

Example:

```
students
PK → user_id
FK → users(user_id)
```

A **student cannot exist without a corresponding user record**.

Another example:

```
market_prices
PK → instrument_id
FK → instruments(instrument_id)
```

A market price **only exists for a valid instrument**.

---

# **3. Associative (Junction) Entities**

Associative entities resolve **many-to-many (M:N) relationships** between entities.

These tables typically use **composite primary keys**.

| Table | Resolves Relationship |
|------|------|
portfolio | users ↔ instruments |
watchlist_items | watchlists ↔ instruments |
index_constituents | indices ↔ instruments |
instructor_student_mapping | staff ↔ students |
user_answers | users ↔ questions |
learning_progress | users ↔ courses / challenges |

Total:

**6 Associative Entities**

Example:

```
portfolio
PK → (user_id, instrument_id)
```

Meaning:

```
Users  M ↔ N  Instruments
```

A user can hold **multiple instruments**, and an instrument can be owned by **multiple users**.

Another example:

```
watchlist_items
PK → (watchlist_id, instrument_id)
```

Meaning:

```
Watchlists  M ↔ N  Instruments
```

---

# **4. Configuration Tables**

Configuration tables store **system-level parameters or feature controls** rather than modeling real-world entities.

| Table | Purpose |
|------|------|
system_rules | Stores global system parameters |
feature_management | Controls feature access for users |

Example:

```
system_rules
```

Stores platform configuration such as:

- trading limits
- reward configurations
- platform rules

Another example:

```
feature_management
```

Used for **feature flag management**, including:

- enabling beta features
- restricting features for certain users
- controlling platform modules.

---

# Summary

| Category | Number of Tables |
|------|------|
Strong Entities | 17 |
Weak Entities | 7 |
Associative Entities | 6 |
Configuration Tables | 2 |

Total Tables in Database:

**32 Tables**

---

# Conceptual Insights from the ER Model

Based on the **ER diagram containing 35 relationship diamonds**, the schema demonstrates several key database design concepts.

---

## Specialization / Generalization

```
users
   ├── students
   └── staff
```

Meaning:

A **user entity specializes into either a student or staff member**.

---

## Many-to-Many Relationships

Examples:

```
users ↔ instruments   (portfolio)
watchlists ↔ instruments  (watchlist_items)
indices ↔ instruments  (index_constituents)
staff ↔ students  (instructor_student_mapping)
users ↔ questions (user_answers)
```

These relationships are resolved using **junction tables**.

---

## Hierarchical Learning Structure

```
courses
   → course_modules
      → learning_materials
```

This models the **hierarchical structure of the learning content system**.

---

## Trading System Workflow

```
users
  → orders
     → trades
```

Meaning:

1. Users **place orders**
2. Orders **generate trades**

---

## Market Data Relationships

```
instruments
   → market_prices
   → price_history
   → market_depth
   → financial_reports
```

This represents the **financial data ecosystem associated with each instrument**.

---


This schema design ensures:

- modular platform architecture
- scalable trading functionality
- structured learning system
- flexible platform configuration
- normalized relational design
