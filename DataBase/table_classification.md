# Database Table Classification

This document classifies the tables in the database based on **Entity-Relationship (ER) modeling concepts**.  
The tables are categorized into:

- **Strong Entities**
- **Weak Entities**
- **Associative (Junction) Entities**
- **Configuration Tables**

This classification helps explain the **conceptual design of the database schema**.

---

# 1️⃣ Strong Entities

A **strong entity**:

- Has its **own primary key**
- **Exists independently**
- Does not rely on another table for identification

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

# 2️⃣ Weak Entities

A **weak entity**:

- Depends on another entity to exist
- Contains a **foreign key referencing a parent table**
- Sometimes uses that foreign key as its **primary key**

| Table | Depends On |
|------|------|
students | users |
staff | users |
accounts | users |
market_prices | instruments |
portfolio | users + instruments |
audit_logs | users |
price_history | instruments |
market_depth | instruments |

Total:

**8 Weak Entities**

Example:

```
students
PK → user_id
FK → users(user_id)
```

A **student cannot exist without a corresponding user**.

---

# 3️⃣ Associative (Junction) Entities

Associative entities resolve **many-to-many (M:N) relationships** between tables.

| Table | Resolves Relationship |
|------|------|
user_roles | users ↔ roles |
portfolio | users ↔ instruments |
watchlist_items | watchlists ↔ instruments |
index_constituents | indices ↔ instruments |
instructor_student_mapping | staff ↔ students |
user_answers | users ↔ questions |
learning_progress | users ↔ courses / challenges |

Total:

**7 Associative Entities**

Example:

```
user_roles
PK → (user_id, role_id)
```

Meaning:

```
Users  M ↔ N  Roles
```

---

# 4️⃣ Configuration Tables

These tables store **system configuration or platform-level settings** rather than entity relationships.

| Table | Purpose |
|------|------|
system_rules | Stores global system parameters |
feature_management | Controls feature access for users |

Example:

```
system_rules
```

Stores platform limits such as:

- max_trading_limit
- max_daily_trades
- max_skill_points_per_challenge

---

# Summary

| Category | Number of Tables |
|------|------|
Strong Entities | 17 |
Weak Entities | 8 |
Associative Entities | 7 |
Configuration Tables | 2 |

Total Tables in Database:

**33 Tables**

---
