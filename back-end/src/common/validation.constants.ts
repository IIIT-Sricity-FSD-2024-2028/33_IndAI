export const NAME_REGEX = /^[A-Za-z ]+$/;
export const INDIAN_PHONE_REGEX = /^[6-9]\d{9}$/;
export const INDAI_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@(gmail\.com|(?:[a-zA-Z0-9-]+\.)+in)$/i;
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
export const SYMBOL_REGEX = /^[A-Z0-9&-]{1,20}$/;

export const USER_ROLES = ['superuser','admin','instructor','provider','learner','SUPER_USER','ADMIN','INSTRUCTOR','COURSE_PROVIDER','LEARNER'] as const;
export const USER_STATUSES = ['active','pending','suspended','disabled'] as const;
export const COURSE_STATUSES = ['draft','published','active','inactive','completed','archived'] as const;
export const DIFFICULTIES = ['Easy','Medium','Hard','BEGINNER','INTERMEDIATE','ADVANCED','Beginner','Intermediate','Advanced'] as const;
export const ASSIGNMENT_STATUSES = ['active','completed','pending','in_progress','submitted','approved'] as const;
export const SESSION_STATUSES = ['scheduled','completed','cancelled','active','pending'] as const;
export const MODULE_TYPES = ['video','document','quiz','text','article','assignment','Video Courses','Text Modules','Mixed'] as const;
export const NOTIFICATION_TYPES = ['info','success','warning','error','trade','course','assignment','session','student'] as const;
export const EXPERIENCE_LEVELS = ['Beginner','Intermediate','Advanced','BEGINNER','INTERMEDIATE','ADVANCED','0-1','1-3','3-5','5+'] as const;
export const RISK_TOLERANCES = ['Low','Medium','High','Conservative','Moderate','Aggressive','LOW','MEDIUM','HIGH'] as const;
