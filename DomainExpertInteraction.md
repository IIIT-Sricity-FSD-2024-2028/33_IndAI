
# Summary of the Interaction

## Basic Information
- **Domain:** Financial Technology (FinTech) / Stock Market Simulation & Learning Systems  
- **Problem Statement:** Design and implementation of a learning-focused paper trading simulation platform with a matching engine, order book, and realistic market constraints.  
- **Date of Interaction:** (Add actual date)  
- **Mode of Interaction:** Video call  
- **Duration (in minutes):** ~40–50 minutes  
- **Publicly Accessible Video Link:** Not available (private interaction)

---

## Domain Expert Details
- **Role / Designation:** Senior Software Engineer / System Designer (Trading Systems)  
- **Experience in the Domain:**  
  Has multiple years of experience designing and building scalable backend systems, including exposure to trading platforms, matching engines, and high-throughput systems.  
- **Nature of Work:** Developer / System Design

---

## Domain Context and Terminology

### How would you describe the overall purpose of this problem statement in your daily work?
The problem statement reflects the design of a simplified trading system that prioritizes correctness, consistency, and learning outcomes rather than ultra-low latency or production-scale optimizations. It mirrors real-world trading workflows while remaining accessible for educational use.

### What are the primary goals or outcomes of this problem statement?
- To help learners understand how stock markets operate internally.
- To simulate order placement, order matching, and portfolio updates realistically.
- To design a correct and maintainable matching engine.
- To enforce realistic constraints such as capital limits, brokerage, and taxes.
- To separate real-time execution logic from database persistence.

### Key Terms Used by the Domain Expert

| Term | Meaning as explained by the expert |
|---|---|
| Matching Engine | Core component responsible for matching buy and sell orders based on price and time priority |
| Order Book | Data structure holding all pending buy and sell orders for a stock |
| Market Order | Order that executes immediately at the best available price |
| Limit Order | Order that executes only at a specified price or better |
| Stop-Loss Order | Order triggered when the market price reaches a predefined threshold |
| Partial Fill | When only part of an order quantity is matched |
| Cash Check | Verification that a user has enough balance before placing an order |
| Margin Check | Verification that margin requirements are satisfied (if margin trading is enabled) |
| Order Book Snapshot | Periodic saved state of the order book for recovery and visualization |
| Asynchronous Database Writes | Writing trade and portfolio updates to the database in the background |
| Latency | Delay in market data updates, considered non-critical for learning systems |

---

## Actors and Responsibilities

| Actor / Role | Responsibilities |
|---|---|
| Student / Trader | Places orders, manages portfolio, follows learning tasks |
| Matching Engine | Matches buy and sell orders and executes trades |
| Order Book Manager | Maintains sorted buy and sell orders for each stock |
| Instructor / Domain Expert | Evaluates user performance and assigns learning tasks |
| Database Layer | Persists user data, trades, portfolios, and snapshots |
| Cache / In-Memory Store | Stores balances, order books, and active market data |

---

## Core Workflows

### Workflow 1: Order Placement and Matching
- **Trigger / Start Condition:**  
  User submits a buy or sell order.
- **Steps Involved:**  
  1. Perform cash check / margin check.  
  2. Validate order type (market, limit, stop-loss).  
  3. Insert order into in-memory order book.  
  4. Matching engine matches order with best available opposite orders.  
  5. Execute trades (full or partial).  
  6. Update balances and portfolios in memory.  
  7. Persist results asynchronously to database.
- **Outcome / End Condition:**  
  Order is fully executed, partially executed, or remains open.

---

### Workflow 2: Order Book Maintenance and Snapshotting
- **Trigger / Start Condition:**  
  Periodic interval or system shutdown/restart.
- **Steps Involved:**  
  1. Maintain order book in memory using sorted arrays.  
  2. Take periodic snapshots of order book and balances.  
  3. Store snapshots in database or persistent storage.  
  4. Reload snapshots during system restart.
- **Outcome / End Condition:**  
  System resumes without losing critical trading state.

---

### Workflow 3: Learning Progression and User Grouping
- **Trigger / Start Condition:**  
  User onboarding or course enrollment.
- **Steps Involved:**  
  1. User completes a skill assessment quiz.  
  2. User is grouped based on skill level (Beginner/Intermediate/Advanced).  
  3. Trading limits and learning tasks are applied.  
  4. User performs trades under defined constraints.  
  5. Instructor evaluates performance based on discipline and risk management.
- **Outcome / End Condition:**  
  User progresses through learning stages with guided feedback.

---

## Rules, Constraints, and Exceptions

### Mandatory Rules or Policies
- Orders must pass cash and margin checks before execution.
- Matching must follow price-time priority.
- Portfolio and balance updates must remain consistent.
- Fake money must follow realistic market rules.

### Constraints or Limitations
- Low-latency market data is not mandatory.
- Market data may be delayed or replayed from historical datasets.
- System should avoid unnecessary architectural complexity.

### Common Exceptions or Edge Cases
- Partial order execution.
- Order rejection due to insufficient funds.
- Empty or low-liquidity order books.
- Concurrent orders for the same stock.

### Situations Where Things Usually Go Wrong
- Overuse of database queries inside the matching engine.
- Data inconsistency due to synchronous DB writes.
- Overengineering data structures too early.
- Loss of order book state on crashes.

---

## Current Challenges and Pain Points
- Designing a correct and efficient matching engine.
- Managing high request volumes without database bottlenecks.
- Ensuring consistency while writing data asynchronously.
- Tracking order book state reliably.
- Avoiding scope creep and unnecessary optimizations.

---

## Assumptions & Clarifications

### Assumptions Confirmed
- Learning correctness is more important than real-time latency.
- SQL databases are better suited for transactional trading data.
- Simple sorted arrays are sufficient for order book implementation.
- Discipline and process matter more than profit.

### Assumptions Corrected
- NoSQL databases are not ideal for financial transaction logic.
- Advanced data structures like Red-Black Trees are not mandatory.
- Database should not be part of the real-time execution path.

### Open Questions That Need Follow-Up
- Optimal snapshot frequency for order book persistence.
- Extent of margin trading support.
- Balance between automated and instructor-driven evaluation.
- Future scaling strategy for market data ingestion.
