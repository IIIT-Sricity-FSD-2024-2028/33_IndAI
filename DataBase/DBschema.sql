CREATE DATABASE trading_learning_platform;
USE trading_learning_platform;

CREATE TABLE users (
    user_id INT PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone_number VARCHAR(20) UNIQUE,
    dob DATE,
    password_hash VARCHAR(255) NOT NULL,
    account_status ENUM('ACTIVE','SUSPENDED','DISABLED') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE admin (
    admin_id INT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    permissions TEXT,
    department VARCHAR(100),
    last_login TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE trading_users (
    trading_user_id INT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    total_virtual_balance DECIMAL(15,2) NOT NULL CHECK(total_virtual_balance >= 0),
    risk_profile ENUM('LOW','MEDIUM','HIGH'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE instructor (
    instructor_id INT PRIMARY KEY,
    trading_user_id INT UNIQUE NOT NULL,
    specialization VARCHAR(150),
    mentor_capacity INT CHECK(mentor_capacity >= 0),
    qualification VARCHAR(150),
    experience INT CHECK(experience >= 0),
    FOREIGN KEY (trading_user_id) REFERENCES trading_users(trading_user_id)
);

CREATE TABLE learners (
    learner_id INT PRIMARY KEY,
    trading_user_id INT UNIQUE NOT NULL,
    instructor_id INT,
    experience_level ENUM('BEGINNER','INTERMEDIATE','ADVANCED') DEFAULT 'BEGINNER',
    institution_name VARCHAR(150),
    grade VARCHAR(50),
    major VARCHAR(100),
    institute_roll_no VARCHAR(50),
    skill_points INT DEFAULT 0 CHECK(skill_points >= 0),
    FOREIGN KEY (trading_user_id) REFERENCES trading_users(trading_user_id),
    FOREIGN KEY (instructor_id) REFERENCES instructor(instructor_id)
);

CREATE TABLE course_provider (
    course_provider_id INT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    organisation_name VARCHAR(150),
    department VARCHAR(100),
    designation VARCHAR(100),
    experience INT CHECK(experience >= 0),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE courses (
    course_id INT PRIMARY KEY,
    provider_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    duration INT CHECK(duration > 0),
    difficulty ENUM('BEGINNER','INTERMEDIATE','ADVANCED'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (provider_id) REFERENCES course_provider(course_provider_id)
);

CREATE TABLE challenges (
    challenge_id INT PRIMARY KEY,
    learner_id INT,
    level INT CHECK(level >= 1),
    skill_points_reward INT CHECK(skill_points_reward >= 0),
    title VARCHAR(200) NOT NULL,
    start_datetime TIMESTAMP,
    end_datetime TIMESTAMP,
    description TEXT,
    FOREIGN KEY (learner_id) REFERENCES learners(learner_id)
);

CREATE TABLE course_progress (
    learner_id INT NOT NULL,
    course_id INT NOT NULL,
    progress_percentage INT CHECK(progress_percentage BETWEEN 0 AND 100),
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (instructor_id) REFERENCES instructor(instructor_id),
    FOREIGN KEY (learner_id) REFERENCES learners(learner_id),
    FOREIGN KEY (course_id) REFERENCES courses(course_id)
);


CREATE TABLE notifications (
    notification_id INT PRIMARY KEY,
    user_id INT NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE audit_logs (
    log_id INT PRIMARY KEY,
    user_id INT NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE instruments (
    instrument_id INT PRIMARY KEY,
    symbol VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    sector VARCHAR(100),
    exchange ENUM('NSE','BSE') NOT NULL
);

CREATE TABLE market_price (
    instrument_id INT NOT NULL,
    current_price DECIMAL(12,2) NOT NULL CHECK(current_price >= 0),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (instrument_id) REFERENCES instruments(instrument_id)
);

CREATE TABLE price_history (
    history_id INT PRIMARY KEY,
    instrument_id INT NOT NULL,
    open_price DECIMAL(12,2) CHECK(open_price >= 0),
    close_price DECIMAL(12,2) CHECK(close_price >= 0),
    high_price DECIMAL(12,2) CHECK(high_price >= 0),
    low_price DECIMAL(12,2) CHECK(low_price >= 0),
    volume BIGINT CHECK(volume >= 0),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (instrument_id) REFERENCES instruments(instrument_id)
);

CREATE TABLE market_depth (
    depth_id INT PRIMARY KEY,
    instrument_id INT NOT NULL,
    side ENUM('BUY','SELL') NOT NULL,
    price DECIMAL(12,2) NOT NULL CHECK(price >= 0),
    total_quantity INT CHECK(total_quantity >= 0),
    orders_count INT CHECK(orders_count >= 0),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (instrument_id) REFERENCES instruments(instrument_id)
);

CREATE TABLE indices (
    index_id INT PRIMARY KEY,
    instrument_id INT,
    index_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (instrument_id) REFERENCES instruments(instrument_id)
);

CREATE TABLE portfolio (
    portfolio_id INT PRIMARY KEY,
    instrument_id INT NOT NULL,
    trading_user_id INT NOT NULL,
    quantity INT NOT NULL CHECK(quantity >= 0),
    avg_price DECIMAL(12,2) CHECK(avg_price >= 0),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (instrument_id) REFERENCES instruments(instrument_id),
    FOREIGN KEY (trading_user_id) REFERENCES trading_users(trading_user_id)
);

CREATE TABLE watchlists (
    watchlist_id INT PRIMARY KEY,
    instrument_id INT NOT NULL,
    trading_user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    FOREIGN KEY (instrument_id) REFERENCES instruments(instrument_id),
    FOREIGN KEY (trading_user_id) REFERENCES trading_users(trading_user_id)
);

CREATE TABLE orders (
    order_id INT PRIMARY KEY,
    instrument_id INT NOT NULL,
    trading_user_id INT NOT NULL,
    order_type ENUM('BUY','SELL') NOT NULL,
    order_category VARCHAR(50) NOT NULL,
    quantity INT NOT NULL CHECK(quantity > 0),
    filled_quantity INT DEFAULT 0 CHECK(filled_quantity >= 0),
    price DECIMAL(12,2) CHECK(price >= 0),
    status ENUM('OPEN','PARTIAL','FILLED','CANCELLED') DEFAULT 'OPEN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (instrument_id) REFERENCES instruments(instrument_id),
    FOREIGN KEY (trading_user_id) REFERENCES trading_users(trading_user_id)
);

CREATE TABLE trades (
    trade_id INT PRIMARY KEY,
    order_id INT NOT NULL,
    execution_price DECIMAL(12,2) NOT NULL CHECK(execution_price >= 0),
    quantity INT NOT NULL CHECK(quantity > 0),
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

CREATE TABLE transactions (
    transaction_id INT PRIMARY KEY,
    trading_user_id INT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    transaction_type ENUM('DEPOSIT','WITHDRAWAL','TRADE') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trading_user_id) REFERENCES trading_users(trading_user_id)
);
