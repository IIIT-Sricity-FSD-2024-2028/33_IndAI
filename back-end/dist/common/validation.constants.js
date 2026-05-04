"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RISK_TOLERANCES = exports.EXPERIENCE_LEVELS = exports.NOTIFICATION_TYPES = exports.MODULE_TYPES = exports.SESSION_STATUSES = exports.ASSIGNMENT_STATUSES = exports.DIFFICULTIES = exports.COURSE_STATUSES = exports.USER_STATUSES = exports.USER_ROLES = exports.SYMBOL_REGEX = exports.PASSWORD_REGEX = exports.INDAI_EMAIL_REGEX = exports.INDIAN_PHONE_REGEX = exports.NAME_REGEX = void 0;
exports.NAME_REGEX = /^[A-Za-z ]+$/;
exports.INDIAN_PHONE_REGEX = /^[6-9]\d{9}$/;
exports.INDAI_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@(gmail\.com|(?:[a-zA-Z0-9-]+\.)+in)$/i;
exports.PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
exports.SYMBOL_REGEX = /^[A-Z0-9&-]{1,20}$/;
exports.USER_ROLES = ['superuser', 'admin', 'instructor', 'provider', 'learner', 'SUPER_USER', 'ADMIN', 'INSTRUCTOR', 'COURSE_PROVIDER', 'LEARNER'];
exports.USER_STATUSES = ['active', 'pending', 'suspended', 'disabled'];
exports.COURSE_STATUSES = ['draft', 'published', 'active', 'inactive', 'completed', 'archived'];
exports.DIFFICULTIES = ['Easy', 'Medium', 'Hard', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'Beginner', 'Intermediate', 'Advanced'];
exports.ASSIGNMENT_STATUSES = ['active', 'completed', 'pending', 'in_progress', 'submitted', 'approved'];
exports.SESSION_STATUSES = ['scheduled', 'completed', 'cancelled', 'active', 'pending'];
exports.MODULE_TYPES = ['video', 'document', 'quiz', 'text', 'article', 'assignment', 'Video Courses', 'Text Modules', 'Mixed'];
exports.NOTIFICATION_TYPES = ['info', 'success', 'warning', 'error', 'trade', 'course', 'assignment', 'session', 'student'];
exports.EXPERIENCE_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED', '0-1', '1-3', '3-5', '5+'];
exports.RISK_TOLERANCES = ['Low', 'Medium', 'High', 'Conservative', 'Moderate', 'Aggressive', 'LOW', 'MEDIUM', 'HIGH'];
//# sourceMappingURL=validation.constants.js.map