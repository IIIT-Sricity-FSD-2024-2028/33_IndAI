CREATE DATABASE trading_learning_platform;
USE trading_learning_platform;

CREATE TABLE roles (
    role_id INT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(50) NOT NULL
);

CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    role_id INT,
    email VARCHAR(255) UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone_number VARCHAR(15),
    dob DATE,
    password_hash VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(role_id) REFERENCES roles(role_id)
);

CREATE TABLE learners (
    user_id INT PRIMARY KEY,
    institution_name VARCHAR(255),
    grade VARCHAR(50),
    major VARCHAR(100),
    institute_roll_no VARCHAR(50),
    skill_points INT DEFAULT 0,
    FOREIGN KEY(user_id) REFERENCES users(user_id)
);

CREATE TABLE instructor (
    user_id INT PRIMARY KEY,
    specialization VARCHAR(100),
    mentor_capacity INT,
    qualification VARCHAR(100),
    experience INT,
    FOREIGN KEY(user_id) REFERENCES users(user_id)
);

CREATE TABLE course_provider (
    user_id INT PRIMARY KEY,
    organisation_name VARCHAR(255),
    department VARCHAR(100),
    designation VARCHAR(100),
    experience INT,
    FOREIGN KEY(user_id) REFERENCES users(user_id)
);

CREATE TABLE admin (
    user_id INT PRIMARY KEY,
    permissions VARCHAR(255),
    department VARCHAR(100),
    last_login TIMESTAMP,
    account_status VARCHAR(50),
    FOREIGN KEY(user_id) REFERENCES users(user_id)
);

CREATE TABLE accounts (
    user_id INT ,
    virtual_balance DECIMAL(12,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(user_id)
);

CREATE TABLE transactions (
    transaction_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    amount DECIMAL(12,2),
    transaction_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(user_id)
);

CREATE TABLE notifications (
    notification_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(user_id)
);

CREATE TABLE audit_logs (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action_type VARCHAR(100),
    entity_type VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(user_id)
);

CREATE TABLE instruments (
    instrument_id INT PRIMARY KEY AUTO_INCREMENT,
    symbol VARCHAR(20),
    name VARCHAR(100),
    sector VARCHAR(100),
    exchange VARCHAR(50)
);

CREATE TABLE market_price (
    instrument_id INT ,
    recent_price DECIMAL(12,2),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(instrument_id) REFERENCES instruments(instrument_id)
);

CREATE TABLE price_history (
    history_id INT PRIMARY KEY AUTO_INCREMENT,
    instrument_id INT,
    open_price DECIMAL(12,2),
    close_price DECIMAL(12,2),
    high_price DECIMAL(12,2),
    low_price DECIMAL(12,2),
    volume BIGINT,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(instrument_id) REFERENCES instruments(instrument_id)
);

CREATE TABLE market_depth (
    depth_id INT PRIMARY KEY AUTO_INCREMENT,
    instrument_id INT,
    side ENUM('buy','sell'),
    price DECIMAL(12,2),
    total_quantity INT,
    orders_count INT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(instrument_id) REFERENCES instruments(instrument_id)
);

CREATE TABLE portfolio (
    portfolio_id INT PRIMARY KEY AUTO_INCREMENT,
    instrument_id INT,
    user_id INT,
    quantity INT,
    avg_price DECIMAL(12,2),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(instrument_id) REFERENCES instruments(instrument_id),
    FOREIGN KEY(user_id) REFERENCES users(user_id)
);

CREATE TABLE watchlists (
    watchlist_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    name VARCHAR(100),
    FOREIGN KEY(user_id) REFERENCES users(user_id)
);

CREATE TABLE indices (
    index_id INT PRIMARY KEY AUTO_INCREMENT,
    index_name VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    instrument_id INT,
    user_id INT,
    order_type VARCHAR(50),
    order_category VARCHAR(50),
    quantity INT,
    filled_quantity INT,
    limit_price DECIMAL(12,2),
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(instrument_id) REFERENCES instruments(instrument_id),
    FOREIGN KEY(user_id) REFERENCES users(user_id)
);

CREATE TABLE trades (
    trade_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT,
    execution_price DECIMAL(12,2),
    quantity INT,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(order_id) REFERENCES orders(order_id)
);

CREATE TABLE courses (
    course_id INT PRIMARY KEY AUTO_INCREMENT,
    provider_id INT,
    title VARCHAR(255),
    description TEXT,
    duration INT,
    difficulty VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(provider_id) REFERENCES course_provider(user_id)
);

CREATE TABLE challenges (
    challenge_id INT PRIMARY KEY AUTO_INCREMENT,
    level VARCHAR(50),
    skill_points_reward INT,
    title VARCHAR(255),
    start_datetime TIMESTAMP,
    end_datetime TIMESTAMP,
    description TEXT
);

CREATE TABLE learning_progress (
    user_id INT,
    entity_id INT,
    entity_type ENUM('course','challenge'),
    progress_percentage INT,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(user_id, entity_id, entity_type),
    FOREIGN KEY(user_id) REFERENCES users(user_id)
);
