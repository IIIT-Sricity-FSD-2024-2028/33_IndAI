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
# Database ER Diagrams

This document shows the entity-relationship structure of the platform database.

Notation used:

| Symbol | Meaning |
|------|------|
1 | one |
M | many |
==> | total participation |
--> | partial participation |

---

# 1️⃣ User Management Module

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

roles -->|"1"| assigns
assigns ==>|"M"| user_roles

users -->|"1"| maps
maps ==>|"M"| user_roles

users -->|"1"| is_student
is_student ==>|"1"| students

users -->|"1"| is_staff
is_staff ==>|"1"| staff

users ==>|"1"| owns_account
owns_account ==>|"1"| accounts

users -->|"1"| logs_action
logs_action ==>|"M"| audit_logs

staff -->|"1"| mentors
students -->|"M"| mentors
mentors ==>|"M"| instructor_student_mapping
```

---

# 2️⃣ Trading Module

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
instruments -->|"M"| owns_position
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
instruments -->|"M"| contains_item
contains_item ==>|"M"| watchlist_items
```

---

# 3️⃣ Market Data Module

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
instruments -->|"M"| contains_instrument
contains_instrument ==>|"M"| index_constituents

instruments -->|"1"| publishes_reports
publishes_reports ==>|"M"| financial_reports
```

---

# 4️⃣ Learning Module

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
courses -->|"1"| tracks_progress
tracks_progress ==>|"M"| learning_progress
```

---

# 5️⃣ Live Education Module

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

# 6️⃣ Challenge Module

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

# 7️⃣ Platform Management Module

```mermaid
flowchart LR

users[users]

feature_management[feature_management]
system_rules[system_rules]

controls_feature{controls_feature}
defines_rules{defines_rules}

users -->|"1"| controls_feature
controls_feature ==>|"M"| feature_management

system_rules -->|"1"| defines_rules
defines_rules ==>|"M"| feature_management
```

---

# Full System ER Diagram

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
maps{maps}
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


roles -->|"1"| assigns
assigns ==>|"M"| user_roles
users -->|"1"| maps
maps ==>|"M"| user_roles

users -->|"1"| is_student
is_student ==>|"1"| students

users -->|"1"| is_staff
is_staff ==>|"1"| staff

users ==>|"1"| owns_account
owns_account ==>|"1"| accounts

users -->|"1"| logs_action
logs_action ==>|"M"| audit_logs

staff -->|"1"| mentors
students -->|"M"| mentors
mentors ==>|"M"| instructor_student_mapping


users -->|"1"| owns_position
instruments -->|"M"| owns_position
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
instruments -->|"M"| contains_item
contains_item ==>|"M"| watchlist_items


trades -->|"1"| updates_price
updates_price ==>|"1"| market_prices

instruments -->|"1"| records_history
records_history ==>|"M"| price_history

instruments -->|"1"| order_book
order_book ==>|"M"| market_depth

indices -->|"1"| contains_instrument
instruments -->|"M"| contains_instrument
contains_instrument ==>|"M"| index_constituents

instruments -->|"1"| publishes_reports
publishes_reports ==>|"M"| financial_reports


staff -->|"1"| creates_course
creates_course ==>|"M"| courses

courses -->|"1"| contains_modules
contains_modules ==>|"M"| course_modules

course_modules -->|"1"| contains_materials
contains_materials ==>|"M"| learning_materials

users -->|"1"| tracks_progress
courses -->|"1"| tracks_progress
tracks_progress ==>|"M"| learning_progress


staff -->|"1"| conducts_class
conducts_class ==>|"M"| live_classes

users -->|"1"| sends_notification
sends_notification ==>|"M"| notifications


challenges -->|"1"| contains_questions
contains_questions ==>|"M"| questions

questions -->|"1"| has_options
has_options ==>|"M"| options

questions -->|"1"| records_answer
records_answer ==>|"M"| user_answers

users -->|"1"| submits_answer
submits_answer ==>|"M"| user_answers


users -->|"1"| controls_feature
controls_feature ==>|"M"| feature_management

system_rules -->|"1"| defines_rules
defines_rules ==>|"M"| feature_management
```
# Full System ER Diagram (Improved Layout)

```mermaid
flowchart TB

roles[roles]
users[users]
user_roles[user_roles]
students[students]
staff[staff]
accounts[accounts]
audit_logs[audit_logs]
instructor_student_mapping[instructor_student_mapping]

portfolio[portfolio]
orders[orders]
trades[trades]
transactions[transactions]
watchlists[watchlists]
watchlist_items[watchlist_items]

instruments[instruments]
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
maps{maps}
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


roles -->|"1"| assigns
assigns ==>|"M"| user_roles
users -->|"1"| maps
maps ==>|"M"| user_roles

users -->|"1"| is_student
is_student ==>|"1"| students

users -->|"1"| is_staff
is_staff ==>|"1"| staff

users ==>|"1"| owns_account
owns_account ==>|"1"| accounts

users -->|"1"| logs_action
logs_action ==>|"M"| audit_logs

staff -->|"1"| mentors
students -->|"M"| mentors
mentors ==>|"M"| instructor_student_mapping


users -->|"1"| owns_position
instruments -->|"M"| owns_position
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
instruments -->|"M"| contains_item
contains_item ==>|"M"| watchlist_items


trades -->|"1"| updates_price
updates_price ==>|"1"| market_prices

instruments -->|"1"| records_history
records_history ==>|"M"| price_history

instruments -->|"1"| order_book
order_book ==>|"M"| market_depth

indices -->|"1"| contains_instrument
instruments -->|"M"| contains_instrument
contains_instrument ==>|"M"| index_constituents

instruments -->|"1"| publishes_reports
publishes_reports ==>|"M"| financial_reports


staff -->|"1"| creates_course
creates_course ==>|"M"| courses

courses -->|"1"| contains_modules
contains_modules ==>|"M"| course_modules

course_modules -->|"1"| contains_materials
contains_materials ==>|"M"| learning_materials

users -->|"1"| tracks_progress
courses -->|"1"| tracks_progress
tracks_progress ==>|"M"| learning_progress


staff -->|"1"| conducts_class
conducts_class ==>|"M"| live_classes

users -->|"1"| sends_notification
sends_notification ==>|"M"| notifications


challenges -->|"1"| contains_questions
contains_questions ==>|"M"| questions

questions -->|"1"| has_options
has_options ==>|"M"| options

questions -->|"1"| records_answer
records_answer ==>|"M"| user_answers

users -->|"1"| submits_answer
submits_answer ==>|"M"| user_answers


users -->|"1"| controls_feature
controls_feature ==>|"M"| feature_management

system_rules -->|"1"| defines_rules
defines_rules ==>|"M"| feature_management
```
---

# ER Concepts Demonstrated

| Concept | Example |
|------|------|
1:1 relationship | users ↔ accounts |
1:M relationship | users → orders |
M:N relationship | users ↔ roles |
Weak entities | students, staff |
Associative entities | user_roles, portfolio |
Specialization | users → students/staff |
Composite keys | portfolio, watchlist_items |
Polymorphic relation | learning_progress |
