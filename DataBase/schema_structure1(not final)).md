# Database Schema Structure

The database is divided into five modules to keep the design modular and easy to understand.

```mermaid
%%{init: {'flowchart': {'nodeSpacing': 80, 'rankSpacing': 90}} }%%
flowchart TB
classDef invisible stroke-width:0px,fill:none;

subgraph USER_LAYER["User Layer"]
A[User Management Module]
end

subgraph CORE_LAYER["Core Application"]
B[Trading Engine]
end

subgraph PLATFORM_FEATURES["Platform Features"]
direction LR
C[Market Data]
D[Learning System]
E[Live Education]
F[Challenges]
G[Platform Management]
end

A --- B
B --- E

linkStyle 0 stroke-width:0px
linkStyle 1 stroke-width:0px
```


# System Modules Schema

## 1️⃣ User Module

**Description:**  
Handles authentication, user roles, and profile management. It also maintains account information and audit logs for security and traceability.

```mermaid
flowchart LR

roles[roles]
users[users]
user_roles{user_roles}

students[students]
staff[staff]

accounts[accounts]
audit_logs[audit_logs]

roles --> user_roles
users --> user_roles

users --> students
users --> staff

users --> accounts
accounts --> audit_logs
```

---

## 2️⃣ Trading Module

**Description:**  
Manages trading activities including instruments, price tracking, portfolios, and execution of orders and trades.

```mermaid
flowchart LR

instruments[instruments]

market_prices[market_prices]
price_history[price_history]
index_constituents[index_constituents]

portfolio[portfolio]
orders[orders]
trades[trades]

has{has}
records{records}
part_of{part_of}
affects{affects}
generates{generates}
executes{executes}

instruments --> has --> market_prices
instruments --> records --> price_history
instruments --> part_of --> index_constituents

price_history --> affects --> portfolio
portfolio --> generates --> orders
orders --> executes --> trades
```

---

## 3️⃣ Market Data Module

**Description:**  
Stores financial market reference data such as indices, instrument composition, and company financial reports used for analysis and trading.

```mermaid
flowchart LR

indices[indices]
index_constituents[index_constituents]
instruments[instruments]
financial_reports[financial_reports]

contains{contains}
references{references}
publishes{publishes}

indices --> contains --> index_constituents
index_constituents --> references --> instruments
instruments --> publishes --> financial_reports
```

---

## 4️⃣ Learning Module

**Description:**  
Provides educational resources and tracks user learning progress through courses managed by staff.

```mermaid
flowchart LR

staff[staff]
courses[courses]
learning_progress[learning_progress]
users[users]

creates{creates}
tracks{tracks}
participates{participates}

staff --> creates --> courses
courses --> tracks --> learning_progress
users --> participates --> learning_progress
```

---

## 5️⃣ Challenge Module

**Description:**  
Implements practice challenges and quizzes to test users’ knowledge, storing questions, options, and submitted answers.

```mermaid
flowchart LR

challenges[challenges]
questions[questions]
options[options]
user_answers[user_answers]
users[users]

contains{contains}
has{has}
receives{receives}
submits{submits}

challenges --> contains --> questions
questions --> has --> options
questions --> receives --> user_answers
users --> submits --> user_answers
```
---

