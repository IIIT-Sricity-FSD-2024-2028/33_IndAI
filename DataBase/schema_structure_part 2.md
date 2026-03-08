# Database Schema Overview  
Education-Oriented Financial Literacy & Paper Trading Platform

This document describes the database schema used in the project.  
The schema is divided into logical modules so the system design is easy to understand.

Modules:

1. User Management Module  
2. Trading Module  
3. Market Data Module  
4. Learning Module  
5. Challenge Module  

At the end of the document a **full system ER diagram** is provided.

---

# 1️⃣ User Management Module

## Description
Handles authentication, authorization, and user profile management.  
This module also stores account information and audit logs to track important system actions.

## Tables

roles  
users  
user_roles  
students  
staff  
accounts  
audit_logs  
instructor_student_mapping  

---

## User Module ER Diagram

```mermaid
flowchart LR

roles[roles]
users[users]
user_roles[user_roles]

students[students]
staff[staff]
accounts[accounts]
audit_logs[audit_logs]
instructor_student_mapping[instructor_student_mapping]

assigns{assigns}
maps{maps}
is_student{is_student}
is_staff{is_staff}
owns_account{owns_account}
logs_action{logs_action}
mentors{mentors}

roles --> assigns --> user_roles
users --> maps --> user_roles

users --> is_student --> students
users --> is_staff --> staff

users --> owns_account --> accounts
users --> logs_action --> audit_logs

staff --> mentors --> instructor_student_mapping
students --> mentors --> instructor_student_mapping
```

---

# 2️⃣ Trading Module

## Description
Manages simulated stock trading operations including instruments, portfolios, order placement, trade execution, and user watchlists.

## Tables

instruments  
market_prices  
price_history  
market_depth  
portfolio  
orders  
trades  
transactions  
watchlists  
watchlist_items  

---

## Trading Module ER Diagram

```mermaid
flowchart LR

users[users]
instruments[instruments]

portfolio[portfolio]
orders[orders]
trades[trades]

market_prices[market_prices]
price_history[price_history]
market_depth[market_depth]

transactions[transactions]

watchlists[watchlists]
watchlist_items[watchlist_items]

owns_position{owns_position}
places_order{places_order}
references_instrument{references_instrument}
generates_trade{generates_trade}
updates_price{updates_price}
records_history{records_history}
order_book{order_book}
records_transaction{records_transaction}

creates_watchlist{creates_watchlist}
contains_item{contains_item}

users --> owns_position --> portfolio
instruments --> owns_position --> portfolio

users --> places_order --> orders
instruments --> references_instrument --> orders

orders --> generates_trade --> trades

trades --> updates_price --> market_prices
instruments --> records_history --> price_history
instruments --> order_book --> market_depth

users --> records_transaction --> transactions

users --> creates_watchlist --> watchlists
watchlists --> contains_item --> watchlist_items
instruments --> contains_item --> watchlist_items
```

---

# 3️⃣ Market Data Module

## Description
Stores financial reference data used for market analysis and trading decisions.

## Tables

indices  
index_constituents  
financial_reports  

---

## Market Data ER Diagram

```mermaid
flowchart LR

indices[indices]
index_constituents[index_constituents]
instruments[instruments]
financial_reports[financial_reports]

contains_instrument{contains_instrument}
references_instrument{references_instrument}
publishes_reports{publishes_reports}

indices --> contains_instrument --> index_constituents
index_constituents --> references_instrument --> instruments
instruments --> publishes_reports --> financial_reports
```

---

# 4️⃣ Learning Module

## Description
Provides financial education through courses and tracks learning progress of users across courses and challenges.

## Tables

courses  
learning_progress  

---

## Learning Module ER Diagram

```mermaid
flowchart LR

staff[staff]
courses[courses]
learning_progress[learning_progress]
users[users]
challenges[challenges]

creates_course{creates_course}
tracks_progress{tracks_progress}
relates_course{relates_course}
relates_challenge{relates_challenge}

staff --> creates_course --> courses

users --> tracks_progress --> learning_progress
courses --> relates_course --> learning_progress
challenges --> relates_challenge --> learning_progress
```

---

# 5️⃣ Challenge Module

## Description
Provides quizzes and challenges to test users' financial knowledge.

## Tables

challenges  
questions  
options  
user_answers  

---

## Challenge Module ER Diagram

```mermaid
flowchart LR

challenges[challenges]
questions[questions]
options[options]
user_answers[user_answers]
users[users]

contains_questions{contains_questions}
has_options{has_options}
records_answer{records_answer}
submits_answer{submits_answer}

challenges --> contains_questions --> questions
questions --> has_options --> options
questions --> records_answer --> user_answers
users --> submits_answer --> user_answers
```

---

# 6️⃣ Full System ER Diagram

```mermaid
flowchart LR

roles[roles]
users[users]
user_roles[user_roles]

students[students]
staff[staff]
accounts[accounts]
audit_logs[audit_logs]

instruments[instruments]

portfolio[portfolio]
orders[orders]
trades[trades]

market_prices[market_prices]
price_history[price_history]
market_depth[market_depth]

transactions[transactions]

watchlists[watchlists]
watchlist_items[watchlist_items]

courses[courses]
learning_progress[learning_progress]

challenges[challenges]
questions[questions]
options[options]
user_answers[user_answers]

indices[indices]
index_constituents[index_constituents]
financial_reports[financial_reports]

instructor_student_mapping[instructor_student_mapping]

assigns{assigns}
maps{maps}
is_student{is_student}
is_staff{is_staff}
owns_account{owns_account}
logs_action{logs_action}
mentors{mentors}

owns_position{owns_position}
places_order{places_order}
references_instrument{references_instrument}
generates_trade{generates_trade}
updates_price{updates_price}
records_history{records_history}
order_book{order_book}
records_transaction{records_transaction}

creates_watchlist{creates_watchlist}
contains_item{contains_item}

creates_course{creates_course}
tracks_progress{tracks_progress}
relates_course{relates_course}
relates_challenge{relates_challenge}

contains_questions{contains_questions}
has_options{has_options}
records_answer{records_answer}
submits_answer{submits_answer}

contains_instrument{contains_instrument}
publishes_reports{publishes_reports}

roles --> assigns --> user_roles
users --> maps --> user_roles

users --> is_student --> students
users --> is_staff --> staff

users --> owns_account --> accounts
users --> logs_action --> audit_logs

staff --> mentors --> instructor_student_mapping
students --> mentors --> instructor_student_mapping

users --> owns_position --> portfolio
instruments --> owns_position --> portfolio

users --> places_order --> orders
instruments --> references_instrument --> orders

orders --> generates_trade --> trades

trades --> updates_price --> market_prices
instruments --> records_history --> price_history
instruments --> order_book --> market_depth

users --> records_transaction --> transactions

users --> creates_watchlist --> watchlists
watchlists --> contains_item --> watchlist_items
instruments --> contains_item --> watchlist_items

staff --> creates_course --> courses
users --> tracks_progress --> learning_progress
courses --> relates_course --> learning_progress
challenges --> relates_challenge --> learning_progress

challenges --> contains_questions --> questions
questions --> has_options --> options
questions --> records_answer --> user_answers
users --> submits_answer --> user_answers

indices --> contains_instrument --> index_constituents
index_constituents --> references_instrument --> instruments
instruments --> publishes_reports --> financial_reports
```

---

# Summary

The database schema supports:

• user management and authentication  
• simulated trading with full order lifecycle  
• watchlists for tracking instruments  
• market data storage and analysis  
• financial education through structured courses  
• knowledge testing through quizzes and challenges  

The modular structure ensures the system remains scalable, maintainable, and easy to understand.
