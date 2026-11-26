# Local demo accounts

Demo password: `IndAI-Demo-2026`. Setup creates 300 students (200 basic/Free,
60 Pro, 40 Plus), 32 instructors, 18 providers, one Admin and one Super Admin.
Account approval states and roster sizes intentionally vary.

| Role / plan | Example email |
| --- | --- |
| Free learner | student1@indai.test |
| Pro learner | student201@indai.test |
| Plus learner | student261@indai.test |
| Instructor | instructor1@indai.test |
| Provider | provider1@indai.test |
| Admin including payment operations | users@indai.test |
| Super Admin | super@indai.test |

The active fixture loader is `back-end/seed.js`. It refuses production/demo-off
fixture loading. `npm run seed` operates on the configured local demo database
and skips the already seeded fixture set; it does not import old NestJS accounts.
Use a separate DATA_DIR for disposable tests. Production requires deliberate
staff provisioning rather than demo credentials.
