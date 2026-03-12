# Example Records for All Tables

This document shows example rows for all **22 tables** in the `trading_learning_platform` database.

---

# 1. roles

| role_id | role_name |
|---|---|
| 1 | learner |
| 2 | instructor |
| 3 | course_provider |
| 4 | admin |

---

# 2. users

| user_id | role_id | email | first_name | last_name | phone_number | dob |
|---|---|---|---|---|---|---|
| 1 | 1 | rahul@gmail.com | Rahul | Sharma | 9876543210 | 2002-05-10 |
| 2 | 2 | priya@gmail.com | Priya | Nair | 9123456780 | 1990-03-15 |
| 3 | 3 | arjun@academy.com | Arjun | Verma | 9988776655 | 1985-11-20 |
| 4 | 4 | admin@platform.com | System | Admin | 9000000000 | 1980-01-01 |

---

# 3. learners

| user_id | institution_name | grade | major | institute_roll_no | skill_points |
|---|---|---|---|---|---|
| 1 | IIT Delhi | 2nd Year | Computer Science | IITD2022CS01 | 150 |

---

# 4. instructor

| user_id | specialization | mentor_capacity | qualification | experience |
|---|---|---|---|---|
| 2 | Derivatives Trading | 20 | MBA Finance | 8 |

---

# 5. course_provider

| user_id | organisation_name | department | designation | experience |
|---|---|---|---|---|
| 3 | NSE Academy | Finance | Senior Trainer | 10 |

---

# 6. admin

| user_id | permissions | department | last_login | account_status |
|---|---|---|---|---|
| 4 | ALL_ACCESS | Platform Ops | 2024-05-01 10:15:00 | ACTIVE |

---

# 7. accounts

| user_id | virtual_balance | created_at |
|---|---|---|
| 1 | 100000 | 2024-01-01 09:30:00 |
| 2 | 150000 | 2024-01-05 10:00:00 |

---

# 8. transactions

| transaction_id | user_id | amount | transaction_type | created_at |
|---|---|---|---|---|
| 1 | 1 | 50000 | deposit | 2024-02-20 09:00:00 |
| 2 | 1 | -15000 | trade | 2024-03-01 10:05:30 |

---

# 9. notifications

| notification_id | user_id | description | created_at |
|---|---|---|---|
| 1 | 1 | New course available | 2024-05-01 09:15:00 |
| 2 | 2 | Live class reminder | 2024-05-09 17:45:00 |

---

# 10. audit_logs

| log_id | user_id | action_type | entity_type | description | created_at |
|---|---|---|---|---|---|
| 1 | 1 | LOGIN | user | User logged in | 2024-05-01 08:00:00 |
| 2 | 3 | CREATE_COURSE | course | Added new trading course | 2024-05-02 11:20:00 |

---

# 11. instruments

| instrument_id | symbol | name | sector | exchange |
|---|---|---|---|---|
| 1 | RELIANCE | Reliance Industries | Energy | NSE |
| 2 | INFY | Infosys Ltd | IT | NSE |
| 3 | TCS | Tata Consultancy Services | IT | NSE |

---

# 12. market_price

| instrument_id | recent_price | updated_at |
|---|---|---|
| 1 | 2450.50 | 2024-03-01 10:00:00 |
| 2 | 1500.00 | 2024-03-01 10:00:00 |

---

# 13. price_history

| history_id | instrument_id | open_price | close_price | high_price | low_price | volume | recorded_at |
|---|---|---|---|---|---|---|---|
| 1 | 1 | 2400 | 2450 | 2470 | 2380 | 1000000 | 2024-03-01 15:30:00 |
| 2 | 2 | 1480 | 1500 | 1510 | 1470 | 850000 | 2024-03-01 15:30:00 |

---

# 14. market_depth

| depth_id | instrument_id | side | price | total_quantity | orders_count | updated_at |
|---|---|---|---|---|---|---|
| 1 | 1 | buy | 2448 | 500 | 5 | 2024-03-01 10:01:15 |
| 2 | 1 | sell | 2452 | 600 | 4 | 2024-03-01 10:01:15 |

---

# 15. portfolio

| portfolio_id | instrument_id | user_id | quantity | avg_price | updated_at |
|---|---|---|---|---|---|
| 1 | 1 | 1 | 20 | 2400 | 2024-03-01 10:30:00 |
| 2 | 2 | 1 | 15 | 1450 | 2024-03-01 10:30:00 |

---

# 16. watchlists

| watchlist_id | user_id | name |
|---|---|---|
| 1 | 1 | Tech Stocks |
| 2 | 1 | Long Term Investments |

---

# 17. indices

| index_id | index_name | description | created_at |
|---|---|---|---|
| 1 | NIFTY 50 | Top 50 companies on NSE | 2024-01-01 00:00:00 |
| 2 | NIFTY IT | Major IT companies | 2024-01-01 00:00:00 |

---

# 18. orders

| order_id | instrument_id | user_id | order_type | order_category | quantity | filled_quantity | limit_price | status | created_at |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 1 | 1 | BUY | MARKET | 10 | 10 | NULL | FILLED | 2024-03-01 10:05:22 |
| 2 | 2 | 1 | SELL | LIMIT | 5 | 3 | 1500 | PARTIAL | 2024-03-01 11:12:45 |

---

# 19. trades

| trade_id | order_id | execution_price | quantity | executed_at |
|---|---|---|---|---|
| 1 | 1 | 2445 | 10 | 2024-03-01 10:05:25 |
| 2 | 2 | 1505 | 3 | 2024-03-01 11:13:02 |

---

# 20. courses

| course_id | provider_id | title | description | duration | difficulty | created_at |
|---|---|---|---|---|---|---|
| 1 | 3 | Basics of Stock Market | Introduction to trading | 10 | beginner | 2024-04-01 09:00:00 |
| 2 | 3 | Options Trading | Advanced derivatives course | 15 | advanced | 2024-04-05 09:00:00 |

---

# 21. challenges

| challenge_id | level | skill_points_reward | title | start_datetime | end_datetime | description |
|---|---|---|---|---|---|---|
| 1 | beginner | 20 | Market Basics Quiz | 2024-05-01 09:00:00 | 2024-05-07 23:59:59 | Introductory quiz |
| 2 | advanced | 50 | Options Strategy Challenge | 2024-05-10 09:00:00 | 2024-05-15 23:59:59 | Advanced challenge |

---

# 22. learning_progress

| user_id | entity_id | entity_type | progress_percentage | enrolled_at |
|---|---|---|---|---|
| 1 | 1 | course | 60 | 2024-04-02 12:00:00 |
| 1 | 1 | challenge | 100 | 2024-05-02 16:30:00 |

---
