# Database Schema Structure

The database is divided into seven modules to keep the design modular and easy to understand.

```mermaid
%%{init: {'flowchart': {'nodeSpacing': 80, 'rankSpacing': 90}} }%%
flowchart TB

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
B --- C
A --- D
D --- E
D --- F
A --- G
```

# Database ER Diagrams

This document shows the entity-relationship structure of the platform database.

Notation used:

| Symbol | Meaning               |
| ------ | --------------------- |
| 1      | one                   |
| M      | many                  |
| ==>    | total participation   |
| -->    | partial participation |

---

# User Management Module

```mermaid
flowchart LR

roles[roles]
users[users]
students[students]
staff[staff]
accounts[accounts]
audit_logs[audit_logs]
instructor_student_mapping[instructor_student_mapping]

assigns{assigns}
is_student{is_student}
is_staff{is_staff}
owns_account{owns_account}
logs_action{logs_action}
mentors{mentors}

roles -->|"1"| assigns
assigns ==>|"M"| users

users -->|"1"| is_student
is_student ==>|"1"| students

users -->|"1"| is_staff
is_staff ==>|"1"| staff

users ==>|"1"| owns_account
owns_account ==>|"1"| accounts

users -->|"1"| logs_action
logs_action ==>|"M"| audit_logs

staff -->|"1"| mentors
students -->|"1"| mentors
mentors ==>|"M"| instructor_student_mapping
```

---

# Trading Module

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

owns_position{owns_position}
places_order{places_order}
generates_trade{generates_trade}
records_transaction{records_transaction}
creates_watchlist{creates_watchlist}
contains_item{contains_item}

users -->|"1"| owns_position
instruments -->|"1"| owns_position
owns_position ==>|"M"| portfolio

users -->|"1"| places_order
places_order ==>|"M"| orders

orders -->|"1"| generates_trade
generates_trade ==>|"M"| trades

users -->|"1"| records_transaction
records_transaction ==>|"M"| transactions

users -->|"1"| creates_watchlist
creates_watchlist ==>|"M"| watchlists

watchlists -->|"1"| contains_item
instruments -->|"1"| contains_item
contains_item ==>|"M"| watchlist_items
```

---

# Market Data Module

```mermaid
flowchart LR

instruments[instruments]

market_prices[market_prices]
price_history[price_history]
market_depth[market_depth]

indices[indices]
index_constituents[index_constituents]

financial_reports[financial_reports]

updates_price{updates_price}
records_history{records_history}
order_book{order_book}

contains_instrument{contains_instrument}
publishes_reports{publishes_reports}

instruments -->|"1"| updates_price
updates_price ==>|"1"| market_prices

instruments -->|"1"| records_history
records_history ==>|"M"| price_history

instruments -->|"1"| order_book
order_book ==>|"M"| market_depth

indices -->|"1"| contains_instrument
instruments -->|"1"| contains_instrument
contains_instrument ==>|"M"| index_constituents

instruments -->|"1"| publishes_reports
publishes_reports ==>|"M"| financial_reports
```

---

# Learning Module

```mermaid
flowchart LR

staff[staff]

courses[courses]
course_modules[course_modules]
learning_materials[learning_materials]

learning_progress[learning_progress]
users[users]

creates_course{creates_course}
contains_modules{contains_modules}
contains_materials{contains_materials}
tracks_progress{tracks_progress}

staff -->|"1"| creates_course
creates_course ==>|"M"| courses

courses -->|"1"| contains_modules
contains_modules ==>|"M"| course_modules

course_modules -->|"1"| contains_materials
contains_materials ==>|"M"| learning_materials

users -->|"1"| tracks_progress
tracks_progress ==>|"M"| learning_progress
```

---

# Live Education Module

```mermaid
flowchart LR

staff[staff]
users[users]

live_classes[live_classes]
notifications[notifications]

conducts_class{conducts_class}
sends_notification{sends_notification}

staff -->|"1"| conducts_class
conducts_class ==>|"M"| live_classes

users -->|"1"| sends_notification
sends_notification ==>|"M"| notifications
```

---

# Challenge Module

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

challenges -->|"1"| contains_questions
contains_questions ==>|"M"| questions

questions -->|"1"| has_options
has_options ==>|"M"| options

questions -->|"1"| records_answer
records_answer ==>|"M"| user_answers

users -->|"1"| submits_answer
submits_answer ==>|"M"| user_answers
```

---

# Platform Management Module

```mermaid
flowchart LR

users[users]

feature_management[feature_management]
system_rules[system_rules]

controls_feature{controls_feature}
defines_rules{defines_rules}

users -->|"1"| controls_feature
controls_feature ==>|"M"| feature_management

users -->|"1"| defines_rules
defines_rules ==>|"M"| system_rules
```

---

# Full System ER Diagram

```mermaid
flowchart TB

roles[roles]
users[users]
students[students]
staff[staff]
accounts[accounts]
audit_logs[audit_logs]
instructor_student_mapping[instructor_student_mapping]

instruments[instruments]
portfolio[portfolio]
orders[orders]
trades[trades]
transactions[transactions]
watchlists[watchlists]
watchlist_items[watchlist_items]

market_prices[market_prices]
price_history[price_history]
market_depth[market_depth]
indices[indices]
index_constituents[index_constituents]
financial_reports[financial_reports]

courses[courses]
course_modules[course_modules]
learning_materials[learning_materials]
learning_progress[learning_progress]

challenges[challenges]
questions[questions]
options[options]
user_answers[user_answers]

live_classes[live_classes]
notifications[notifications]

feature_management[feature_management]
system_rules[system_rules]

assigns{assigns}
is_student{is_student}
is_staff{is_staff}
owns_account{owns_account}
logs_action{logs_action}
mentors{mentors}

owns_position{owns_position}
places_order{places_order}
generates_trade{generates_trade}
records_transaction{records_transaction}
creates_watchlist{creates_watchlist}
contains_item{contains_item}

updates_price{updates_price}
records_history{records_history}
order_book{order_book}
contains_instrument{contains_instrument}
publishes_reports{publishes_reports}

creates_course{creates_course}
contains_modules{contains_modules}
contains_materials{contains_materials}
tracks_progress{tracks_progress}

conducts_class{conducts_class}
sends_notification{sends_notification}

contains_questions{contains_questions}
has_options{has_options}
records_answer{records_answer}
submits_answer{submits_answer}

controls_feature{controls_feature}
defines_rules{defines_rules}

roles --> assigns
assigns --> users

users --> is_student
is_student --> students

users --> is_staff
is_staff --> staff

users --> owns_account
owns_account --> accounts

users --> logs_action
logs_action --> audit_logs

staff --> mentors
students --> mentors
mentors --> instructor_student_mapping

users --> owns_position
instruments --> owns_position
owns_position --> portfolio

users --> places_order
places_order --> orders

orders --> generates_trade
generates_trade --> trades

users --> records_transaction
records_transaction --> transactions

users --> creates_watchlist
creates_watchlist --> watchlists

watchlists --> contains_item
instruments --> contains_item
contains_item --> watchlist_items

instruments --> updates_price
updates_price --> market_prices

instruments --> records_history
records_history --> price_history

instruments --> order_book
order_book --> market_depth

indices --> contains_instrument
instruments --> contains_instrument
contains_instrument --> index_constituents

instruments --> publishes_reports
publishes_reports --> financial_reports

staff --> creates_course
creates_course --> courses

courses --> contains_modules
contains_modules --> course_modules

course_modules --> contains_materials
contains_materials --> learning_materials

users --> tracks_progress
tracks_progress --> learning_progress

staff --> conducts_class
conducts_class --> live_classes

users --> sends_notification
sends_notification --> notifications

challenges --> contains_questions
contains_questions --> questions

questions --> has_options
has_options --> options

questions --> records_answer
records_answer --> user_answers

users --> submits_answer
submits_answer --> user_answers

users --> controls_feature
controls_feature --> feature_management

users --> defines_rules
defines_rules --> system_rules
```

---

# ER Concepts Demonstrated

| Concept               | Example                             |
| --------------------- | ----------------------------------- |
| 1:1 relationship      | users ↔ accounts                    |
| 1:M relationship      | users → orders                      |
| M:N relationship      | users ↔ instruments (via portfolio) |
| Weak entities         | students, staff                     |
| Associative entities  | portfolio, watchlist_items          |
| Specialization        | users → students / staff            |
| Composite keys        | portfolio, watchlist_items          |
| Hierarchical learning | courses → modules → materials       |
