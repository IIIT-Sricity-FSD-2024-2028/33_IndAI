# Trading Platform Database ER Schema

This document describes the **complete ER structure of the Trading Learning Platform**.

The schema contains:

- **32 tables (entities)**
- **35 relationship diamonds**
- Modular system architecture

Notation used:

| Symbol | Meaning |
|------|------|
| 1 | one |
| M | many |
| ==> | total participation |
| --> | partial participation |

---

# System Architecture Overview

```mermaid
flowchart TB

subgraph USER_LAYER
A[User Management]
end

subgraph CORE
B[Trading Engine]
end

subgraph PLATFORM_FEATURES
direction LR
C[Market Data]
D[Learning]
E[Live Classes]
F[Challenges]
G[Platform Management]
end

A --- B
B --- C
A --- D
D --- E
D --- F
A --- G
```

---

# 1. User Management Module

```mermaid
flowchart LR

roles[roles]
users[users]
learners[learners]
staff[staff]
accounts[accounts]
audit_logs[audit_logs]
instructor_learner_mapping[instructor_learner_mapping]

assigns{assigns}
is_learner{is}
is_staff{is}
owns_account{owns}
records{records}
mentored_by{mentored_by}

roles -->|"1"| assigns
assigns ==>|"M"| users

users -->|"1"| is_learner
is_learner ==>|"1"| learners

users -->|"1"| is_staff
is_staff ==>|"1"| staff

users ==>|"1"| owns_account
owns_account ==>|"1"| accounts

users -->|"1"| records
records -->|"M"| audit_logs

staff -->|"1"| mentored_by
learners -->|"1"| mentored_by
mentored_by ==>|"M"| instructor_learner_mapping
```

---

# 2. Trading Module

```mermaid
flowchart LR

users[users]
instruments[instruments]

portfolio[portfolio]
orders[orders]
trades[trades]
transactions[transactions]
watchlists[watchlists]
watchlist_items[watchlist_items]

holds{holds}
places{places}
generates{generates}
records{records}
creates{creates}
contains{contains}

users ==>|"1"| holds
instruments ==>|"1"| holds
holds ==>|"M"| portfolio

users ==>|"1"| places
places ==>|"M"| orders

orders ==>|"1"| generates
generates ==>|"M"| trades

users -->|"1"| records
records -->|"M"| transactions

users ==>|"1"| creates
creates ==>|"M"| watchlists

watchlists ==>|"1"| contains
instruments ==>|"1"| contains
contains ==>|"M"| watchlist_items
```

---

# 3. Market Data Module

```mermaid
flowchart LR

instruments[instruments]

market_prices[market_prices]
market_depth[market_depth]
price_history[price_history]

indices[indices]
index_constituents[index_constituents]

financial_reports[financial_reports]

updates{updates}
records{records}
provides{provides}
contains{contains}
publishes{publishes}

instruments ==>|"1"| updates
updates ==>|"1"| market_prices

instruments ==>|"1"| records
records ==>|"M"| price_history

instruments ==>|"1"| provides
provides ==>|"M"| market_depth

indices ==>|"1"| contains
instruments ==>|"1"| contains
contains ==>|"M"| index_constituents

instruments ==>|"1"| publishes
publishes ==>|"M"| financial_reports
```

---

# 4. Learning Module

```mermaid
flowchart LR

staff[staff]
users[users]

courses[courses]
course_modules[course_modules]
learning_materials[learning_materials]
learning_progress[learning_progress]

creates{creates}
contains_modules{contains}
contains_materials{contains}
tracks{tracks}

staff ==>|"1"| creates
creates ==>|"M"| courses

courses ==>|"1"| contains_modules
contains_modules ==>|"M"| course_modules

course_modules ==>|"1"| contains_materials
contains_materials ==>|"M"| learning_materials

users -->|"1"| tracks
tracks -->|"M"| learning_progress
```

---

# 5. Live Education Module

```mermaid
flowchart LR

staff[staff]
users[users]

live_classes[live_classes]
notifications[notifications]

conducts{conducts}
notifies{notifies}

staff ==>|"1"| conducts
conducts ==>|"M"| live_classes

users ==>|"1"| notifies
notifies ==>|"M"| notifications
```

---

# 6. Challenge Module

```mermaid
flowchart LR

users[users]

challenges[challenges]
questions[questions]
options[options]
user_answers[user_answers]

contains{contains}
has{has}
answered{answered}
submits{submits}

challenges ==>|"1"| contains
contains ==>|"M"| questions

questions ==>|"1"| has
has ==>|"M"| options

questions ==>|"1"| answered
answered ==>|"M"| user_answers

users ==>|"1"| submits
submits ==>|"M"| user_answers
```

---

# 7. Platform Management Module

```mermaid
flowchart LR

users[users]

feature_management[feature_management]
system_rules[system_rules]

controls{controls}
defines{defines}

users -->|"1"| controls
controls -->|"M"| feature_management

users ==>|"1"| defines
defines ==>|"M"| system_rules
```

---

# FULL SYSTEM ER DIAGRAM

```mermaid
flowchart TB

roles[roles]
users[users]
learners[learners]
staff[staff]
accounts[accounts]
audit_logs[audit_logs]
instructor_learner_mapping[instructor_learner_mapping]

instruments[instruments]
market_prices[market_prices]
market_depth[market_depth]
price_history[price_history]

portfolio[portfolio]
orders[orders]
trades[trades]
transactions[transactions]

watchlists[watchlists]
watchlist_items[watchlist_items]

indices[indices]
index_constituents[index_constituents]

financial_reports[financial_reports]

courses[courses]
course_modules[course_modules]
learning_materials[learning_materials]
learning_progress[learning_progress]

live_classes[live_classes]
notifications[notifications]

challenges[challenges]
questions[questions]
options[options]
user_answers[user_answers]

feature_management[feature_management]
system_rules[system_rules]

roles -->|"1"| assigns{assigns}
assigns ==>|"M"| users

users -->|"1"| is_learner{is}
is_learner ==>|"1"| learners

users -->|"1"| is_staff{is}
is_staff ==>|"1"| staff

users ==>|"1"| owns_account{owns}
owns_account ==>|"1"| accounts

users -->|"1"| logs_action{records}
logs_action -->|"M"| audit_logs

staff -->|"1"| mentors{mentors}
learners -->|"1"| mentors
mentors ==>|"M"| instructor_learner_mapping

users ==>|"1"| holds{holds}
instruments ==>|"1"| holds
holds ==>|"M"| portfolio

users ==>|"1"| places{places}
places ==>|"M"| orders

orders ==>|"1"| generates{generates}
generates ==>|"M"| trades

users -->|"1"| records_transaction{records}
records_transaction -->|"M"| transactions

users ==>|"1"| creates_watchlist{creates}
creates_watchlist ==>|"M"| watchlists

watchlists ==>|"1"| contains_item{contains}
instruments ==>|"1"| contains_item
contains_item ==>|"M"| watchlist_items

instruments ==>|"1"| updates_price{updates}
updates_price ==>|"1"| market_prices

instruments ==>|"1"| records_history{records}
records_history ==>|"M"| price_history

instruments ==>|"1"| provides_depth{provides}
provides_depth ==>|"M"| market_depth

indices ==>|"1"| contains_instrument{contains}
instruments ==>|"1"| contains_instrument
contains_instrument ==>|"M"| index_constituents

instruments ==>|"1"| publishes_reports{publishes}
publishes_reports ==>|"M"| financial_reports

staff ==>|"1"| creates_course{creates}
creates_course ==>|"M"| courses

courses ==>|"1"| contains_modules{contains}
contains_modules ==>|"M"| course_modules

course_modules ==>|"1"| contains_materials{contains}
contains_materials ==>|"M"| learning_materials

users -->|"1"| tracks_progress{tracks}
tracks_progress -->|"M"| learning_progress

staff ==>|"1"| conducts_class{conducts}
conducts_class ==>|"M"| live_classes

users ==>|"1"| sends_notification{sends}
sends_notification ==>|"M"| notifications

challenges ==>|"1"| contains_questions{contains}
contains_questions ==>|"M"| questions

questions ==>|"1"| has_options{has}
has_options ==>|"M"| options

questions ==>|"1"| records_answer{records}
records_answer ==>|"M"| user_answers

users ==>|"1"| submits_answer{submits}
submits_answer ==>|"M"| user_answers

users -->|"1"| controls_feature{controls}
controls_feature -->|"M"| feature_management

users ==>|"1"| defines_rules{defines}
defines_rules ==>|"M"| system_rules
```
