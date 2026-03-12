CREATE DATABASE trading_learning_platform;
USE trading_learning_platform;

CREATE TABLE users (
    user_id INT PRIMARY KEY,
    email VARCHAR(100) UNIQUE,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    phone_number VARCHAR(20),
    role_name VARCHAR(50),
    dob DATE,
    password_hash VARCHAR(255),
    created_at TIMESTAMP
);

CREATE TABLE admin (
    admin_id INT PRIMARY KEY,
    user_id INT UNIQUE,
    permissions TEXT,
    department VARCHAR(100),
    last_login TIMESTAMP,
    account_status VARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE trading_users (
    trading_user_id INT PRIMARY KEY,
    user_id INT UNIQUE,
    experience_level VARCHAR(50),
    total_virtual_balance DECIMAL(15,2),
    risk_profile VARCHAR(50),
    created_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);


CREATE TABLE learners (
    learner_id INT PRIMARY KEY,
    trading_user_id INT UNIQUE,
    instructor_id INT,
    institution_name VARCHAR(150),
    grade VARCHAR(50),
    major VARCHAR(100),
    institute_roll_no VARCHAR(50),
    skill_points INT,
    FOREIGN KEY (trading_user_id) REFERENCES trading_users(trading_user_id),
    FOREIGN KEY (instructor_id) REFERENCES instructor(instructor_id)
);

CREATE TABLE instructor (
    instructor_id INT PRIMARY KEY,
    trading_user_id INT UNIQUE,
    specialization VARCHAR(150),
    mentor_capacity INT,
    qualification VARCHAR(150),
    experience INT,
    FOREIGN KEY (trading_user_id) REFERENCES trading_users(trading_user_id)
);

CREATE TABLE course_provider (
    course_provider_id INT PRIMARY KEY,
    user_id INT UNIQUE,
    organisation_name VARCHAR(150),
    department VARCHAR(100),
    designation VARCHAR(100),
    experience INT,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE courses (
    course_id INT PRIMARY KEY,
    provider_id INT,
    title VARCHAR(200),
    description TEXT,
    duration INT,
    difficulty VARCHAR(50),
    created_at TIMESTAMP,
    FOREIGN KEY (provider_id) REFERENCES course_provider(course_provider_id)
);

CREATE TABLE learning_progress_course (
    learner_id INT,
    course_id INT,
    progress_percentage INT,
    enrolled_at TIMESTAMP,
    FOREIGN KEY (instructor_id) REFERENCES instructor(instructor_id),
    FOREIGN KEY (learner_id) REFERENCES learners(learner_id),
    FOREIGN KEY (course_id) REFERENCES courses(course_id)
);

CREATE TABLE learning_progress_challenge (
    learner_id INT,
    challenge_id INT,
    progress_percentage INT,
    enrolled_at TIMESTAMP,
    FOREIGN KEY (instructor_id) REFERENCES instructor(instructor_id),
    FOREIGN KEY (learner_id) REFERENCES learners(learner_id),
    FOREIGN KEY (challenge_id) REFERENCES challenges(challenge_id)
);

CREATE TABLE challenges (
    challenge_id INT PRIMARY KEY,
    learner_id INT,
    level INT,
    skill_points_reward INT,
    title VARCHAR(200),
    start_datetime TIMESTAMP,
    end_datetime TIMESTAMP,
    description TEXT,
    FOREIGN KEY (learner_id) REFERENCES learners(learner_id)
);

CREATE TABLE notifications (
    notification_id INT PRIMARY KEY,
    user_id INT,
    description TEXT,
    created_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE audit_logs (
    log_id INT PRIMARY KEY,
    user_id INT,
    action_type VARCHAR(100),
    entity_type VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE instruments (
    instrument_id INT PRIMARY KEY,
    symbol VARCHAR(20),
    name VARCHAR(100),
    sector VARCHAR(100),
    exchange VARCHAR(50)
);

CREATE TABLE market_price (
    instrument_id INT ,
    current_price DECIMAL(12,2),
    updated_at TIMESTAMP,
    FOREIGN KEY (instrument_id) REFERENCES instruments(instrument_id)
);

CREATE TABLE price_history (
    history_id INT PRIMARY KEY,
    instrument_id INT,
    open_price DECIMAL(12,2),
    close_price DECIMAL(12,2),
    high_price DECIMAL(12,2),
    low_price DECIMAL(12,2),
    volume BIGINT,
    recorded_at TIMESTAMP,
    FOREIGN KEY (instrument_id) REFERENCES instruments(instrument_id)
);

CREATE TABLE market_depth (
    depth_id INT PRIMARY KEY,
    instrument_id INT,
    side VARCHAR(10),
    price DECIMAL(12,2),
    total_quantity INT,
    orders_count INT,
    updated_at TIMESTAMP,
    FOREIGN KEY (instrument_id) REFERENCES instruments(instrument_id)
);

CREATE TABLE indices (
    index_id INT PRIMARY KEY,
    instrument_id INT,
    index_name VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP,
    FOREIGN KEY (instrument_id) REFERENCES instruments(instrument_id)
);

CREATE TABLE portfolio (
    portfolio_id INT PRIMARY KEY,
    instrument_id INT,
    trading_user_id INT,
    quantity INT,
    avg_price DECIMAL(12,2),
    updated_at TIMESTAMP,
    FOREIGN KEY (instrument_id) REFERENCES instruments(instrument_id),
    FOREIGN KEY (trading_user_id) REFERENCES trading_users(trading_user_id)
);

CREATE TABLE watchlists (
    watchlist_id INT PRIMARY KEY,
    instrument_id INT,
    trading_user_id INT,
    name VARCHAR(100),
    FOREIGN KEY (instrument_id) REFERENCES instruments(instrument_id),
    FOREIGN KEY (trading_user_id) REFERENCES trading_users(trading_user_id)
);


CREATE TABLE orders (
    order_id INT PRIMARY KEY,
    instrument_id INT,
    trading_user_id INT,
    order_type VARCHAR(50),
    order_category VARCHAR(50),
    quantity INT,
    filled_quantity INT,
    limit_price DECIMAL(12,2),
    status VARCHAR(50),
    created_at TIMESTAMP,
    FOREIGN KEY (instrument_id) REFERENCES instruments(instrument_id),
    FOREIGN KEY (trading_user_id) REFERENCES trading_users(trading_user_id)
);


CREATE TABLE trades (
    trade_id INT PRIMARY KEY,
    order_id INT,
    execution_price DECIMAL(12,2),
    quantity INT,
    executed_at TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

CREATE TABLE transactions (
    transaction_id INT PRIMARY KEY,
    trading_user_id INT,
    amount DECIMAL(12,2),
    transaction_type VARCHAR(50),
    created_at TIMESTAMP,
    FOREIGN KEY (trading_user_id) REFERENCES trading_users(trading_user_id)
);

