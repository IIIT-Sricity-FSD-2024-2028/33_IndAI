CREATE DATABASE trading_platform;
USE trading_platform;

CREATE TABLE roles (
    role_id INT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    role_id INT NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    phone_number VARCHAR(20) UNIQUE,
    dob DATE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(role_id) REFERENCES roles(role_id)
);


CREATE TABLE learners (
    user_id INT PRIMARY KEY,
    institution_name VARCHAR(200),
    grade VARCHAR(50),
    major VARCHAR(100),
    institute_roll_number VARCHAR(50) UNIQUE,
    skill_points INT DEFAULT 0 CHECK(skill_points >= 0),
    FOREIGN KEY(user_id) REFERENCES users(user_id)
);

CREATE TABLE staff (
    user_id INT PRIMARY KEY,
    organisation_name VARCHAR(200),
    department VARCHAR(100),
    designation VARCHAR(100),
    experience_years INT CHECK(experience_years >= 0),
    FOREIGN KEY(user_id) REFERENCES users(user_id)
);


CREATE TABLE accounts (
    user_id INT,
    virtual_balance DECIMAL(15,2) DEFAULT 100000 CHECK(virtual_balance >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(user_id)
);

CREATE TABLE audit_logs (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action_type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(user_id)
);

CREATE TABLE instruments (
    instrument_id INT PRIMARY KEY AUTO_INCREMENT,
    symbol VARCHAR(20) NOT NULL,
    name VARCHAR(120) NOT NULL,
    sector VARCHAR(120),
    exchange ENUM('NSE','BSE') NOT NULL,
    UNIQUE(symbol, exchange)
);

CREATE TABLE market_prices (
    instrument_id INT,
    recent_price DECIMAL(12,2) NOT NULL CHECK(recent_price >= 0),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(instrument_id) REFERENCES instruments(instrument_id)
);

CREATE TABLE market_depth (
    depth_id INT PRIMARY KEY AUTO_INCREMENT,
    instrument_id INT NOT NULL,
    side ENUM('buy','sell') NOT NULL,
    price DECIMAL(12,2) NOT NULL CHECK(price >= 0),
    total_quantity INT NOT NULL CHECK(total_quantity >= 0),
    orders_count INT DEFAULT 0 CHECK(orders_count >= 0),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(instrument_id) REFERENCES instruments(instrument_id)
);

CREATE TABLE price_history (
    history_id INT PRIMARY KEY AUTO_INCREMENT,
    instrument_id INT NOT NULL,
    open_price DECIMAL(12,2),
    close_price DECIMAL(12,2),
    high_price DECIMAL(12,2),
    low_price DECIMAL(12,2),
    volume BIGINT CHECK(volume >= 0),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(instrument_id) REFERENCES instruments(instrument_id)
);

CREATE TABLE portfolio (
    user_id INT NOT NULL,
    instrument_id INT NOT NULL,
    quantity INT NOT NULL CHECK(quantity >= 0),
    avg_price DECIMAL(12,2) CHECK(avg_price >= 0),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(user_id),
    FOREIGN KEY(instrument_id) REFERENCES instruments(instrument_id)
);

CREATE TABLE orders (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    instrument_id INT NOT NULL,
    order_type ENUM('buy','sell') NOT NULL,
    order_category ENUM('market','limit') NOT NULL,
    quantity INT NOT NULL CHECK(quantity > 0),
    filled_quantity INT DEFAULT 0 CHECK(filled_quantity >= 0),
    limit_price DECIMAL(12,2),
    status ENUM('pending','partial','executed','cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(user_id),
    FOREIGN KEY(instrument_id) REFERENCES instruments(instrument_id)
);

CREATE TABLE trades (
    trade_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    execution_price DECIMAL(12,2) NOT NULL CHECK(execution_price >= 0),
    quantity INT NOT NULL CHECK(quantity > 0),
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(order_id) REFERENCES orders(order_id)
);

CREATE TABLE transactions (
    transaction_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    transaction_type ENUM('deposit','withdrawal','trade') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(user_id)
);

CREATE TABLE watchlists (
    watchlist_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(user_id)
);

CREATE TABLE watchlist_items (
    watchlist_id INT NOT NULL,
    instrument_id INT NOT NULL,
    FOREIGN KEY(watchlist_id) REFERENCES watchlists(watchlist_id),
    FOREIGN KEY(instrument_id) REFERENCES instruments(instrument_id)
);

CREATE TABLE indices (
    index_id INT PRIMARY KEY AUTO_INCREMENT,
    index_name VARCHAR(120) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE index_constituents (
    index_id INT NOT NULL,
    instrument_id INT NOT NULL,
    weightage DECIMAL(5,2),
    added_date DATE,
    FOREIGN KEY(index_id) REFERENCES indices(index_id),
    FOREIGN KEY(instrument_id) REFERENCES instruments(instrument_id)
);

CREATE TABLE financial_reports (
    report_id INT PRIMARY KEY AUTO_INCREMENT,
    instrument_id INT NOT NULL,
    report_type ENUM('quarterly','yearly') NOT NULL,
    revenue DECIMAL(15,2),
    profit_loss DECIMAL(15,2),
    market_cap DECIMAL(15,2),
    total_debt DECIMAL(15,2),
    total_assets DECIMAL(15,2),
    total_liabilities DECIMAL(15,2),
    r_and_d_investment DECIMAL(15,2),
    dividends DECIMAL(15,2),
    report_date DATE NOT NULL,
    FOREIGN KEY(instrument_id) REFERENCES instruments(instrument_id)
);

CREATE TABLE courses (
    course_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    duration INT CHECK(duration >= 0),
    provider_id INT,
    difficulty ENUM('beginner','intermediate','advanced'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(provider_id) REFERENCES staff(user_id)
);

CREATE TABLE course_modules (
    module_id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    title VARCHAR(200),
    description TEXT,
    module_order INT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(course_id) REFERENCES courses(course_id)
);

CREATE TABLE learning_materials (
    material_id INT PRIMARY KEY AUTO_INCREMENT,
    module_id INT NOT NULL,
    material_type ENUM('video','pdf','article'),
    content_url TEXT,
    duration INT,
    FOREIGN KEY(module_id) REFERENCES course_modules(module_id)
);

CREATE TABLE learning_progress (
    user_id INT NOT NULL,
    entity_id INT NOT NULL,
    entity_type ENUM('course','challenge') NOT NULL,
    progress_percentage INT DEFAULT 0,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    rating_out_of_5 INT,
    PRIMARY KEY (user_id, entity_id, entity_type),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE live_classes (
    live_class_id INT PRIMARY KEY AUTO_INCREMENT,
    class_title VARCHAR(200),
    description TEXT,
    schedule_datetime TIMESTAMP,
    duration_expected INT,
    instructor_id INT,
    FOREIGN KEY(instructor_id) REFERENCES staff(user_id)
);

CREATE TABLE notifications (
    notification_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(user_id)
);

CREATE TABLE challenges (
    challenge_id INT PRIMARY KEY AUTO_INCREMENT,
    level ENUM('beginner','easy','medium','hard'),
    skill_points_reward INT,
    title VARCHAR(200),
    start_datetime TIMESTAMP,
    end_datetime TIMESTAMP,
    description TEXT
);

CREATE TABLE questions (
    question_id INT PRIMARY KEY AUTO_INCREMENT,
    challenge_id INT NOT NULL,
    question_text TEXT,
    question_type ENUM('mcq','true_false','numerical'),
    FOREIGN KEY(challenge_id) REFERENCES challenges(challenge_id)
);

CREATE TABLE options (
    option_id INT PRIMARY KEY AUTO_INCREMENT,
    question_id INT NOT NULL,
    option_text TEXT,
    is_correct BOOLEAN,
    FOREIGN KEY(question_id) REFERENCES questions(question_id)
);

CREATE TABLE user_answers (
    user_id INT NOT NULL,
    question_id INT NOT NULL,
    selected_option INT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(user_id),
    FOREIGN KEY(question_id) REFERENCES questions(question_id),
    FOREIGN KEY(selected_option) REFERENCES options(option_id)
);

CREATE TABLE feature_management (
    user_id INT,
    feature_name VARCHAR(50),
    is_enabled BOOLEAN DEFAULT FALSE,
    PRIMARY KEY(user_id, feature_name),
    FOREIGN KEY(user_id) REFERENCES users(user_id)
);

CREATE TABLE system_rules (
    rule_id INT PRIMARY KEY AUTO_INCREMENT,
    rule_name VARCHAR(100) NOT NULL UNIQUE,
    rule_value VARCHAR(100) NOT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);

CREATE TABLE instructor_learner_mapping (
    instructor_id INT NOT NULL,
    learner_id INT NOT NULL,
    FOREIGN KEY(instructor_id) REFERENCES staff(user_id),
    FOREIGN KEY(learner_id) REFERENCES learners(user_id)
);

