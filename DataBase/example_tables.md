# Database Tables Documentation

This document provides example records for each table in the database to illustrate how data is stored in the system.

---

# 1. User Management Module

## roles

Purpose: Defines system roles such as learner, instructor, or administrator.

| role_id | role_name |
|------|------|
| 1 | learner |
| 2 | instructor |
| 3 | admin |

---

## users

Purpose: Stores user identity and login information.

| user_id | role_id | email | first_name | last_name | phone_number | dob |
|------|------|------|------|------|------|------|
| 1 | 1 | rahul@gmail.com | Rahul | Sharma | 9876543210 | 2002-05-10 |
| 2 | 2 | priya@gmail.com | Priya | Nair | 9123456780 | 1990-03-15 |
| 3 | 3 | admin@platform.com | Admin | User | 9000000000 | 1985-01-01 |

---

## learners

Purpose: Stores additional information about learner users.

| user_id | institution_name | grade | major | institute_roll_number | skill_points |
|------|------|------|------|------|------|
| 1 | IIT Delhi | 2nd Year | Computer Science | IITD2022CS01 | 150 |

---

## staff

Purpose: Stores instructors and administrators.

| user_id | organisation_name | department | designation | experience_years |
|------|------|------|------|------|
| 2 | NSE Academy | Finance | Instructor | 6 |

---

## accounts

Purpose: Stores virtual trading account balances.

| user_id | virtual_balance | created_at |
|------|------|------|
| 1 | 100000 | 2024-01-01 09:30:00 |
| 2 | 150000 | 2024-02-01 10:15:00 |

---

## audit_logs

Purpose: Records important actions performed by users.

| log_id | user_id | action_type | entity_type | entity_id | created_at |
|------|------|------|------|------|------|
| 1 | 1 | LOGIN | user | 1 | 2024-03-01 08:45:12 |
| 2 | 2 | CREATE_COURSE | course | 1 | 2024-03-02 14:20:35 |

---

## instructor_learner_mapping

Purpose: Maps instructors to learners they mentor.

| instructor_id | learner_id |
|------|------|
| 2 | 1 |

---

# 2. Trading Module

## instruments

Purpose: Stores tradable stocks available on the platform.

| instrument_id | symbol | name | sector | exchange |
|------|------|------|------|------|
| 1 | RELIANCE | Reliance Industries | Energy | NSE |
| 2 | INFY | Infosys Ltd | IT | NSE |

---

## market_prices

Purpose: Stores the latest traded price of instruments.

| instrument_id | recent_price | updated_at |
|------|------|------|
| 1 | 2450.50 | 2024-03-01 10:00:00 |
| 2 | 1500.00 | 2024-03-01 10:00:00 |

---

## price_history

Purpose: Stores historical price data.

| history_id | instrument_id | open_price | close_price | high_price | low_price | volume | recorded_at |
|------|------|------|------|------|------|------|------|
| 1 | 1 | 2400 | 2450 | 2470 | 2380 | 1000000 | 2024-03-01 15:30:00 |
| 2 | 2 | 1480 | 1500 | 1510 | 1470 | 850000 | 2024-03-01 15:30:00 |

---

## market_depth

Purpose: Stores aggregated order book levels.

| depth_id | instrument_id | side | price | total_quantity | updated_at |
|------|------|------|------|------|------|
| 1 | 1 | buy | 2448 | 500 | 2024-03-01 10:01:15 |
| 2 | 1 | sell | 2452 | 600 | 2024-03-01 10:01:15 |

---

## portfolio

Purpose: Tracks stocks owned by users.

| user_id | instrument_id | quantity | avg_price |
|------|------|------|------|
| 1 | 1 | 20 | 2400 |
| 1 | 2 | 15 | 1450 |

---

## orders

Purpose: Stores buy and sell orders placed by users.

| order_id | user_id | instrument_id | order_type | order_category | quantity | filled_quantity | limit_price | status | created_at |
|------|------|------|------|------|------|------|------|------|------|
| 1 | 1 | 1 | buy | market | 10 | 10 | NULL | executed | 2024-03-01 10:05:22 |
| 2 | 1 | 2 | sell | limit | 5 | 3 | 1500 | partial | 2024-03-01 11:12:45 |

---

## trades

Purpose: Stores executed trades.

| trade_id | order_id | execution_price | quantity | executed_at |
|------|------|------|------|------|
| 1 | 1 | 2445 | 10 | 2024-03-01 10:05:25 |
| 2 | 2 | 1505 | 3 | 2024-03-01 11:13:02 |

---

## transactions

Purpose: Records deposits, withdrawals, and trade settlements.

| transaction_id | user_id | amount | transaction_type | created_at |
|------|------|------|------|------|
| 1 | 1 | 50000 | deposit | 2024-02-20 09:00:00 |
| 2 | 1 | -15000 | trade | 2024-03-01 10:05:30 |

---

## watchlists

Purpose: Allows users to organize stocks they want to monitor.

| watchlist_id | user_id | name |
|------|------|------|
| 1 | 1 | Tech Stocks |
| 2 | 1 | Long Term |

---

## watchlist_items

Purpose: Stores instruments added to watchlists.

| watchlist_id | instrument_id |
|------|------|
| 1 | 2 |
| 1 | 1 |

---

# 3. Market Data Module

## indices

Purpose: Stores stock market indices.

| index_id | index_name | description |
|------|------|------|
| 1 | NIFTY 50 | Top 50 NSE companies |

---

## index_constituents

Purpose: Maps instruments belonging to each index.

| index_id | instrument_id | weightage | added_date |
|------|------|------|------|
| 1 | 1 | 9.5 | 2023-01-01 |
| 1 | 2 | 7.2 | 2023-01-01 |

---

## financial_reports

Purpose: Stores company financial reports.

| report_id | instrument_id | report_type | revenue | profit_loss |
|------|------|------|------|------|
| 1 | 1 | quarterly | 200000 | 50000 |
| 2 | 2 | yearly | 350000 | 90000 |

---

# 4. Learning Module

## courses

Purpose: Stores educational courses.

| course_id | title | duration | difficulty | provider_id |
|------|------|------|------|------|
| 1 | Basics of Stock Market | 10 | beginner | 2 |
| 2 | Technical Analysis | 15 | intermediate | 2 |

---

## course_modules

Purpose: Divides courses into structured learning modules.

| module_id | course_id | title | module_order |
|------|------|------|------|
| 1 | 1 | Introduction to Markets | 1 |
| 2 | 1 | Types of Stocks | 2 |

---

## learning_materials

Purpose: Stores videos, articles, and documents for modules.

| material_id | module_id | material_type | content_url | duration |
|------|------|------|------|------|
| 1 | 1 | video | youtube.com/intro-market | 15 |
| 2 | 2 | pdf | example.com/stocks.pdf | NULL |

---

## learning_progress

Purpose: Tracks progress of users in courses and challenges.

| user_id | entity_id | entity_type | progress_percentage | rating_out_of_5 | enrolled_at |
|------|------|------|------|------|------|
| 1 | 1 | course | 60 | 4 | 2024-02-01 12:00:00 |
| 1 | 1 | challenge | 100 | 5 | 2024-02-15 16:30:00 |

---

# 5. Challenge Module

## challenges

Purpose: Stores trading and finance quizzes.

| challenge_id | title | level | skill_points_reward |
|------|------|------|------|
| 1 | Basic Market Quiz | beginner | 20 |
| 2 | Advanced Options Quiz | hard | 50 |

---

## questions

Purpose: Stores questions belonging to challenges.

| question_id | challenge_id | question_text |
|------|------|------|
| 1 | 1 | What is a stock? |
| 2 | 1 | What is market capitalization? |

---

## options

Purpose: Stores answer options for questions.

| option_id | question_id | option_text | is_correct |
|------|------|------|------|
| 1 | 1 | Ownership in a company | TRUE |
| 2 | 1 | Loan from bank | FALSE |

---

## user_answers

Purpose: Stores answers submitted by users.

| user_id | question_id | selected_option |
|------|------|------|
| 1 | 1 | 1 |
| 1 | 2 | 3 |

---

# 6. Live Education Module

## live_classes

Purpose: Stores scheduled live classes conducted by instructors.

| live_class_id | class_title | schedule_datetime | duration_expected | instructor_id |
|------|------|------|------|------|
| 1 | Options Trading Workshop | 2024-05-10 18:00:00 | 90 | 2 |

---

## notifications

Purpose: Sends alerts and announcements to users.

| notification_id | user_id | description | created_at |
|------|------|------|------|
| 1 | 1 | New challenge available | 2024-05-01 09:15:00 |
| 2 | 2 | Live class reminder | 2024-05-09 17:45:00 |

---

# 7. Platform Management Module

## feature_management

Purpose: Controls which trading features are enabled for users.

| user_id | feature_name | is_enabled |
|------|------|------|
| 1 | margin_trading | TRUE |
| 1 | crypto_trading | FALSE |
| 2 | forex_trading | TRUE |

---

## system_rules

Purpose: Defines configurable platform rules that control trading limits and platform behavior.

| rule_id | rule_name | rule_value | created_by | created_at |
|------|------|------|------|------|
| 1 | max_trading_limit | 100000 | 3 | 2024-01-01 00:00:00 |
| 2 | max_daily_trades | 50 | 3 | 2024-01-01 00:00:00 |
| 3 | max_skill_points_per_challenge | 100 | 3 | 2024-01-01 00:00:00 |
| 4 | min_skill_points_for_margin_trading | 200 | 3 | 2024-01-01 00:00:00 |
