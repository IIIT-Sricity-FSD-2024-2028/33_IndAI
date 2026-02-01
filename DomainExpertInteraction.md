
# Summary of the Interaction

## Basic Information
- **Domain:** Financial Technology (FinTech) / Stock Market Simulation & Learning Systems  
- **Problem Statement:**  Education oriented Financial Literacy and Paper Trading Simulation Platform
- **Date of Interaction:** 31/01/2026
- **Mode of Interaction:** Video call  
- **Duration (in minutes):** ~40 + 17 minutes  
- **Publicly Accessible Video Link:** https://drive.google.com/file/d/1Z28oHjuvJYpO2MDdK5suQavLZn-ZH0Qi/view?usp=sharing

---

## Domain Expert Details
- **Role / Designation:** Backend Engineer @ Zanskar Research
- **Experience in the Domain:**  
  Has 1.5 years of experience designing and building scalable backend systems, including exposure to trading platforms, matching engines, and high-throughput systems.  
- **Nature of Work:** Software Developer

---

## Domain Context and Terminology

### Problem Statement: Education oriented Finantial Literacy and Paper Trading Simulation Platform

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
| Learner | Places orders, manages portfolio, follows learning tasks |
| Matching Engine | Matches buy and sell orders and executes trades |
| Order Book Manager | Maintains sorted buy and sell orders for each stock |
| Instructor | Evaluates user performance and assigns learning tasks |
| **Course Provider** | An internal or external entity that supplies structured financial education content, learning materials, and course modules used on the platform |
| **Platform Administrator** | Responsible for managing platform operations, user access control, course structure, system configuration, and overall performance monitoring |
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

### Workflow 2: Order Book Snapshot and Recovery
- **Trigger / Start Condition**  
  A periodic snapshot interval is reached, or the system is shutting down or restarting.

- **Steps Involved**  
  1. The system captures the current state of the in-memory order book.  
  2. User balances and open orders are included in the snapshot.  
  3. The snapshot is stored in persistent storage (database or file system).  
  4. In case of a system restart, the latest snapshot is loaded.  
  5. The order book and balances are restored in memory.

- **Outcome / End Condition**  
  The system resumes normal operation with the most recent order book state restored.

---

### Workflow 3: Learning Progression and User Grouping
- **Trigger / Start Condition:**  
  User onboarding or course enrollment.
- **Steps Involved:**  
  1. User completes a skill assessment quiz.  
  2. User is grouped based on skill level (Beginner/Intermediate/Advanced).  
  3. Trading limits and learning tasks are applied.  
  4. User performs trades under defined constraints.  
  5. The instructor evaluates student performance based on discipline, risk management, and long-term profitability, recognizing that short-term profits are often influenced by luck.
- **Outcome / End Condition:**  
  User progresses through learning stages with guided feedback.

---

  ### Workflow 4: Order Cancellation

- **Trigger / Start Condition**  
  The user chooses to cancel an open (unmatched or partially matched) order.

- **Steps Involved**  
  1. The user selects an active order from the order list.  
  2. The system checks whether the order is still open and cancellable.  
  3. The order is removed from the in-memory order book.  
  4. Any reserved funds or shares are released back to the user.  
  5. The cancellation event is saved to the database asynchronously.

- **Outcome / End Condition**  
  The order is successfully cancelled, and the user’s balance and order list are updated.

---

### Workflow 5: Portfolio Valuation Update

- **Trigger / Start Condition**  
  A market price update occurs or a trade is executed.

- **Steps Involved**  
  1. The system retrieves the latest stock prices from the in-memory cache.  
  2. The current value of each holding is recalculated using updated prices.  
  3. Unrealized profit or loss is updated for each position.  
  4. The total portfolio value is recalculated.  
  5. Updated portfolio values are displayed to the user interface.

- **Outcome / End Condition**  
  The user sees the updated portfolio value and profit/loss based on the latest market prices.


---

## Rules, Constraints, and Exceptions

### Mandatory Rules or Policies
- Orders are executed only if the user has sufficient funds or margin.
- Orders are matched first by the best available price, and if prices are equal, by the order in which they were placed.
- Portfolio and balance updates must remain consistent.
- Implement Simplified Tax and Brokerage Rules.

### Constraints or Limitations
- Low-latency market data is not mandatory.
- Market data may be delayed or replayed from historical datasets.
- System should avoid unnecessary architectural complexity.
- Limited Margin Trading (or None).
- The platform prioritizes conceptual correctness over real-time market accuracy.

### Common Exceptions or Edge Cases
- Partial order execution.
- Order rejection due to insufficient funds.
- Empty or low-liquidity order books.(Empty or low-liquidity order books are what cause partial order execution.)
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
- Fear of losing money can cause users to stop trading altogether.

---

## Assumptions & Clarifications

### Assumptions Confirmed
- Learning correctness is more important than real-time latency.
- SQL databases are better suited for transactional trading data.
- Discipline and process matter more than profit.

### Assumptions Corrected
- NoSQL databases are not ideal for financial transaction logic.
- Database should not be part of the real-time execution path.
- Advanced data structures such as Red-Black Trees are not mandatory; the order book can be maintained using simple sorted arrays in memory.

### Open Questions That Need Follow-Up
- How frequently the order book state should be saved for recovery.
- Extent of margin trading support.
- Balance between automated and instructor-driven evaluation.
- Future scaling strategy for market data ingestion.
