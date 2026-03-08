# Database ER Diagrams

This document shows the entity-relationship structure of the platform database.

Notation used:

- **1** → one entity  
- **M** → many entities  
- **total** → total participation  
- **partial** → partial participation  

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

roles -- "1" --> assigns
assigns -- "M total" --> user_roles

users -- "1" --> maps
maps -- "M total" --> user_roles

users -- "1 partial" --> is_student
is_student -- "1 total" --> students

users -- "1 partial" --> is_staff
is_staff -- "1 total" --> staff

users -- "1 total" --> owns_account
owns_account -- "1 total" --> accounts

users -- "1 partial" --> logs_action
logs_action -- "M total" --> audit_logs

staff -- "1" --> mentors
students -- "M" --> mentors
mentors --> instructor_student_mapping
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

users -- "1" --> owns_position
instruments -- "M" --> owns_position
owns_position --> portfolio

users -- "1" --> places_order
places_order -- "M total" --> orders

orders -- "1" --> generates_trade
generates_trade -- "M total" --> trades

users -- "1" --> records_transaction
records_transaction -- "M total" --> transactions

users -- "1" --> creates_watchlist
creates_watchlist -- "M total" --> watchlists

watchlists -- "1" --> contains_item
instruments -- "M" --> contains_item
contains_item --> watchlist_items
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

instruments -- "1" --> updates_price
updates_price -- "1 total" --> market_prices

instruments -- "1" --> records_history
records_history -- "M total" --> price_history

instruments -- "1" --> order_book
order_book -- "M total" --> market_depth

indices -- "1" --> contains_instrument
instruments -- "M" --> contains_instrument
contains_instrument --> index_constituents

instruments -- "1" --> publishes_reports
publishes_reports -- "M total" --> financial_reports
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

staff -- "1" --> creates_course
creates_course -- "M total" --> courses

courses -- "1" --> contains_modules
contains_modules -- "M total" --> course_modules

course_modules -- "1" --> contains_materials
contains_materials -- "M total" --> learning_materials

users -- "1" --> tracks_progress
courses -- "1" --> tracks_progress
tracks_progress -- "M total" --> learning_progress
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

staff -- "1" --> conducts_class
conducts_class -- "M total" --> live_classes

users -- "1" --> sends_notification
sends_notification -- "M total" --> notifications
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

challenges -- "1" --> contains_questions
contains_questions -- "M total" --> questions

questions -- "1" --> has_options
has_options -- "M total" --> options

questions -- "1" --> records_answer
records_answer -- "M total" --> user_answers

users -- "1" --> submits_answer
submits_answer -- "M total" --> user_answers
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

users -- "1" --> controls_feature
controls_feature -- "M total" --> feature_management

system_rules -- "1" --> defines_rules
defines_rules -- "M total" --> feature_management
```

---

# Full System ER Diagram

Notation:

- `1` → one  
- `M` → many  
- `==>` → total participation  
- `-->` → partial participation  

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
is_student{is_student}
is_staff{is_staff}
owns_account{owns_account}
logs_action{logs_action}
mentors{mentors}

owns_position{owns_position}
places_order{places_order}
references_instrument{references_instrument}
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
users -->|"1"| assigns

users -->|"1 partial"| is_student
is_student ==>|"1 total"| students

users -->|"1 partial"| is_staff
is_staff ==>|"1 total"| staff

users ==>|"1 total"| owns_account
owns_account ==>|"1 total"| accounts

users -->|"1 partial"| logs_action
logs_action ==>|"M total"| audit_logs

staff -->|"1"| mentors
students -->|"M"| mentors
mentors ==>|"M total"| instructor_student_mapping


users -->|"1"| owns_position
instruments -->|"M"| owns_position
owns_position ==>|"M total"| portfolio

users -->|"1"| places_order
places_order ==>|"M total"| orders

orders -->|"1"| generates_trade
generates_trade ==>|"M total"| trades

users -->|"1"| records_transaction
records_transaction ==>|"M total"| transactions

users -->|"1"| creates_watchlist
creates_watchlist ==>|"M total"| watchlists

watchlists -->|"1"| contains_item
instruments -->|"M"| contains_item
contains_item ==>|"M total"| watchlist_items


trades -->|"1"| updates_price
updates_price ==>|"1 total"| market_prices

instruments -->|"1"| records_history
records_history ==>|"M total"| price_history

instruments -->|"1"| order_book
order_book ==>|"M total"| market_depth

indices -->|"1"| contains_instrument
instruments -->|"M"| contains_instrument
contains_instrument ==>|"M total"| index_constituents

instruments -->|"1"| publishes_reports
publishes_reports ==>|"M total"| financial_reports


staff -->|"1"| creates_course
creates_course ==>|"M total"| courses

courses -->|"1"| contains_modules
contains_modules ==>|"M total"| course_modules

course_modules -->|"1"| contains_materials
contains_materials ==>|"M total"| learning_materials

users -->|"1"| tracks_progress
courses -->|"1"| tracks_progress
tracks_progress ==>|"M total"| learning_progress


staff -->|"1"| conducts_class
conducts_class ==>|"M total"| live_classes

users -->|"1"| sends_notification
sends_notification ==>|"M total"| notifications


challenges -->|"1"| contains_questions
contains_questions ==>|"M total"| questions

questions -->|"1"| has_options
has_options ==>|"M total"| options

questions -->|"1"| records_answer
records_answer ==>|"M total"| user_answers

users -->|"1"| submits_answer
submits_answer ==>|"M total"| user_answers


users -->|"1"| controls_feature
controls_feature ==>|"M total"| feature_management

system_rules -->|"1"| defines_rules
defines_rules ==>|"M total"| feature_management
```

# ER Concepts Demonstrated

This schema includes several core ER-model concepts:

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
