# Database Tables Documentation

This document provides example records for each table in the database to illustrate how data is stored in the system.

---

# 1. User Management Module

## roles

Purpose: Defines system roles such as student, instructor, or administrator.

| role_id | role_name |
|------|------|
| 1 | student |
| 2 | instructor |
| 3 | admin |

---

## users

Purpose: Stores user identity and login information.

| user_id | email | first_name | last_name | phone_number | dob |
|------|------|------|------|------|------|
| 1 | rahul@gmail.com | Rahul | Sharma | 9876543210 | 2002-05-10 |
| 2 | priya@gmail.com | Priya | Nair | 9123456780 | 1990-03-15 |

---

## user_roles

Purpose: Maps users to system roles.

| user_id | role_id |
|------|------|
| 1 | 1 |
| 2 | 2 |

---

## students

Purpose: Stores additional information about student users.

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
| 1 | 100000 | 2024-01-01 |
| 2 | 150000 | 2024-02-01 |

---

## audit_logs

Purpose: Records important actions performed by users.

| log_id | user_id | action_type | entity_type | entity_id |
|------|------|------|------|------|
| 1 | 1 | LOGIN | user | 1 |
| 2 | 2 | CREATE_COURSE | course | 1 |

---

## instructor_student_mapping

Purpose: Maps instructors to students they mentor.

| instructor_id | student_id |
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
| 1 | 2450.50 | 2024-03-01 |
| 2 | 1500.00 | 2024-03-01 |

---

## price_history

Purpose: Stores historical price data.

| history_id | instrument_id | open_price | close_price | volume |
|------|------|------|------|------|
| 1 | 1 | 2400 | 2450 | 1000000 |
| 2 | 2 | 1480 | 1500 | 850000 |

---

## market_depth

Purpose: Stores aggregated order book levels.

| depth_id | instrument_id | side | price | total_quantity |
|------|------|------|------|------|
| 1 | 1 | buy | 2448 | 500 |
| 2 | 1 | sell | 2452 | 600 |

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

| order_id | user_id | instrument_id | order_type | quantity | status |
|------|------|------|------|------|------|
| 1 | 1 | 1 | buy | 10 | pending |
| 2 | 1 | 2 | sell | 5 | executed |

---

## trades

Purpose: Stores executed trades.

| trade_id | order_id | execution_price | quantity |
|------|------|------|------|
| 1 | 1 | 2445 | 10 |
| 2 | 2 | 1505 | 5 |

---

## transactions

Purpose: Records deposits, withdrawals, and trade settlements.

| transaction_id | user_id | amount | transaction_type |
|------|------|------|------|
| 1 | 1 | 50000 | deposit |
| 2 | 1 | -15000 | trade |

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

| index_id | instrument_id | weightage |
|------|------|------|
| 1 | 1 | 9.5 |
| 1 | 2 | 7.2 |

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

| course_id | title | difficulty | duration |
|------|------|------|------|
| 1 | Basics of Stock Market | beginner | 10 |
| 2 | Technical Analysis | intermediate | 15 |

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

| material_id | module_id | material_type | content_url |
|------|------|------|------|
| 1 | 1 | video | youtube.com/intro-market |
| 2 | 2 | pdf | example.com/stocks.pdf |

---

## learning_progress

Purpose: Tracks progress of users in courses and challenges.

| user_id | entity_id | entity_type | progress_percentage |
|------|------|------|------|
| 1 | 1 | course | 60 |
| 1 | 3 | challenge | 100 |

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

| live_class_id | class_title | schedule_datetime | duration_expected |
|------|------|------|------|
| 1 | Options Trading Workshop | 2024-05-10 18:00 | 90 |

---

## notifications

Purpose: Sends alerts and announcements to users.

| notification_id | user_id | description | time_stamp |
|------|------|------|------|
| 1 | 1 | New challenge available | 2024-05-01 |
| 2 | 2 | Live class reminder | 2024-05-09 |

---

# 7. Platform Management Module

## feature_management

Purpose: Controls which trading features are enabled for users.

| user_id | margin_trading | crypto_trading | forex_trading |
|------|------|------|------|
| 1 | TRUE | FALSE | FALSE |
| 2 | TRUE | TRUE | TRUE |

---

## system_rules

Purpose: Defines global rules for platform operations.

| max_trading_limit | max_skill_points_per_challenge | min_skill_points_for_margin_trading | max_daily_trades |
|------|------|------|------|
| 100000 | 100 | 200 | 50 |

---
