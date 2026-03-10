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

%% ======================
%% ENTITIES WITH COLUMNS
%% ======================

roles["roles<br>---<br>role_id PK<br>role_name"]

users["users<br>---<br>user_id PK<br>role_id FK<br>email<br>first_name<br>last_name<br>phone_number<br>dob<br>password_hash<br>created_at"]

learners["learners<br>---<br>user_id PK FK<br>institution_name<br>grade<br>major<br>institute_roll_number<br>skill_points"]

staff["staff<br>---<br>user_id PK FK<br>organisation_name<br>department<br>designation<br>experience_years"]

accounts["accounts<br>---<br>user_id FK<br>virtual_balance<br>created_at"]

audit_logs["audit_logs<br>---<br>log_id PK<br>user_id FK<br>action_type<br>entity_type<br>entity_id<br>description<br>created_at"]

instructor_learner_mapping["instructor_learner_mapping<br>---<br>instructor_id FK<br>learner_id FK"]

instruments["instruments<br>---<br>instrument_id PK<br>symbol<br>name<br>sector<br>exchange"]

market_prices["market_prices<br>---<br>instrument_id FK<br>recent_price<br>updated_at"]

market_depth["market_depth<br>---<br>depth_id PK<br>instrument_id FK<br>side<br>price<br>total_quantity<br>orders_count<br>updated_at"]

price_history["price_history<br>---<br>history_id PK<br>instrument_id FK<br>open_price<br>close_price<br>high_price<br>low_price<br>volume<br>recorded_at"]

portfolio["portfolio<br>---<br>user_id FK<br>instrument_id FK<br>quantity<br>avg_price<br>updated_at"]

orders["orders<br>---<br>order_id PK<br>user_id FK<br>instrument_id FK<br>order_type<br>order_category<br>quantity<br>filled_quantity<br>limit_price<br>status<br>created_at"]

trades["trades<br>---<br>trade_id PK<br>order_id FK<br>execution_price<br>quantity<br>executed_at"]

transactions["transactions<br>---<br>transaction_id PK<br>user_id FK<br>amount<br>transaction_type<br>created_at"]

watchlists["watchlists<br>---<br>watchlist_id PK<br>user_id FK<br>name"]

watchlist_items["watchlist_items<br>---<br>watchlist_id FK<br>instrument_id FK"]

indices["indices<br>---<br>index_id PK<br>index_name<br>description<br>created_at"]

index_constituents["index_constituents<br>---<br>index_id FK<br>instrument_id FK<br>weightage<br>added_date"]

financial_reports["financial_reports<br>---<br>report_id PK<br>instrument_id FK<br>report_type<br>revenue<br>profit_loss<br>market_cap<br>total_debt<br>total_assets<br>total_liabilities<br>r_and_d_investment<br>dividends<br>report_date"]

courses["courses<br>---<br>course_id PK<br>provider_id FK<br>title<br>description<br>duration<br>difficulty<br>created_at"]

course_modules["course_modules<br>---<br>module_id PK<br>course_id FK<br>title<br>description<br>module_order<br>updated_at"]

learning_materials["learning_materials<br>---<br>material_id PK<br>module_id FK<br>material_type<br>content_url<br>duration"]

learning_progress["learning_progress<br>---<br>user_id FK<br>entity_id<br>entity_type<br>progress_percentage<br>enrolled_at<br>rating_out_of_5"]

live_classes["live_classes<br>---<br>live_class_id PK<br>instructor_id FK<br>class_title<br>description<br>schedule_datetime<br>duration_expected"]

notifications["notifications<br>---<br>notification_id PK<br>user_id FK<br>description<br>created_at"]

challenges["challenges<br>---<br>challenge_id PK<br>level<br>skill_points_reward<br>title<br>start_datetime<br>end_datetime<br>description"]

questions["questions<br>---<br>question_id PK<br>challenge_id FK<br>question_text<br>question_type"]

options["options<br>---<br>option_id PK<br>question_id FK<br>option_text<br>is_correct"]

user_answers["user_answers<br>---<br>user_id FK<br>question_id FK<br>selected_option<br>submitted_at"]

feature_management["feature_management<br>---<br>user_id PK FK<br>feature_name PK<br>is_enabled"]

system_rules["system_rules<br>---<br>rule_id PK<br>created_by FK<br>rule_name<br>rule_value<br>created_at"]

%% ======================
%% RELATIONSHIPS
%% ======================

assigns{assigns}
is_learner{is}
is_staff{is}
owns_account{owns}
logs_action{records}
mentors{mentors}

holds{holds}
places{places}
generates{generates}
records_transaction{records}
creates_watchlist{creates}
contains_item{contains}

updates_price{updates}
records_history{records}
provides_depth{provides}
contains_instrument{contains}
publishes_reports{publishes}

creates_course{creates}
contains_modules{contains}
contains_materials{contains}
tracks_progress{tracks}

conducts_class{conducts}
sends_notification{sends}

contains_questions{contains}
has_options{has}
records_answer{records}
submits_answer{submits}

controls_feature{controls}
defines_rules{defines}

%% ======================
%% CARDINALITY + PARTICIPATION
%% ======================

roles -->|"1"| assigns
assigns ==>|"M"| users

users -->|"1"| is_learner
is_learner ==>|"1"| learners

users -->|"1"| is_staff
is_staff ==>|"1"| staff

users ==>|"1"| owns_account
owns_account ==>|"1"| accounts

users -->|"1"| logs_action
logs_action -->|"M"| audit_logs

staff -->|"1"| mentors
learners -->|"1"| mentors
mentors ==>|"M"| instructor_learner_mapping

users ==>|"1"| holds
instruments ==>|"1"| holds
holds ==>|"M"| portfolio

users ==>|"1"| places
places ==>|"M"| orders

orders ==>|"1"| generates
generates ==>|"M"| trades

users -->|"1"| records_transaction
records_transaction -->|"M"| transactions

users ==>|"1"| creates_watchlist
creates_watchlist ==>|"M"| watchlists

watchlists ==>|"1"| contains_item
instruments ==>|"1"| contains_item
contains_item ==>|"M"| watchlist_items

instruments ==>|"1"| updates_price
updates_price ==>|"1"| market_prices

instruments ==>|"1"| records_history
records_history ==>|"M"| price_history

instruments ==>|"1"| provides_depth
provides_depth ==>|"M"| market_depth

indices -->|"1"| contains_instrument
instruments -->|"1"| contains_instrument
contains_instrument ==>|"M"| index_constituents

instruments ==>|"1"| publishes_reports
publishes_reports ==>|"M"| financial_reports

staff ==>|"1"| creates_course
creates_course ==>|"M"| courses

courses ==>|"1"| contains_modules
contains_modules ==>|"M"| course_modules

course_modules ==>|"1"| contains_materials
contains_materials ==>|"M"| learning_materials

users -->|"1"| tracks_progress
tracks_progress -->|"M"| learning_progress

staff ==>|"1"| conducts_class
conducts_class ==>|"M"| live_classes

users ==>|"1"| sends_notification
sends_notification ==>|"M"| notifications

challenges ==>|"1"| contains_questions
contains_questions ==>|"M"| questions

questions ==>|"1"| has_options
has_options ==>|"M"| options

questions ==>|"1"| records_answer
records_answer ==>|"M"| user_answers

users ==>|"1"| submits_answer
submits_answer ==>|"M"| user_answers

users -->|"1"| controls_feature
controls_feature -->|"M"| feature_management

users ==>|"1"| defines_rules
defines_rules ==>|"M"| system_rules

%% ======================
%% WEAK ENTITY STYLING
%% ======================

classDef weakEntity stroke-width:4px;
classDef weakRel stroke-width:4px;

class accounts weakEntity
class market_prices weakEntity
class portfolio weakEntity
class watchlist_items weakEntity
class index_constituents weakEntity
class user_answers weakEntity
class instructor_learner_mapping weakEntity

class owns_account weakRel
class updates_price weakRel
class holds weakRel
class contains_item weakRel
class contains_instrument weakRel
class records_answer weakRel
class mentors weakRel
```
