# IndAI — Actor Demo Accounts and Linked Workflows

## Scope

The expanded course project has **15 public sample accounts across six actor portals**. The identities, institutions and initial business records are demonstration data. Authentication, forms, permissions and saved changes use the real application backend. No real exchange order or payment is implied by a demo record.

The expanded dataset is created only for a **fresh demo store** (`DEMO_MODE=true`). Existing saved stores and changed passwords are preserved. These new credentials will not appear automatically in an older working directory: use a fresh extraction of the linked-demo ZIP, run setup/build/start, and keep older data backed up separately. Production bootstrap does not create these sample accounts.

## Credentials grouped by actor

Passwords are case-sensitive. The login page determines the dashboard from the account role; no manual role selection is needed.

| Actor | Account | Email | Password | Role / division |
| --- | --- | --- | --- | --- |
| Super Admin | Original owner | `superadmin@indai.com` | `Admin@1234` | `superuser` |
| Super Admin | Kiran Owner | `superadmin.demo@indai.com` | `Admin@1234` | `superuser` |
| User Admin | Priya Sharma | `admin@indai.com` | `Admin@1234` | `admin` / `USER_ADMIN` |
| User Admin | Ananya Users | `useradmin.demo@indai.com` | `Admin@1234` | `admin` / `USER_ADMIN` |
| Payment Admin | Meera Payments | `paymentadmin@indai.com` | `Pay@1234` | `admin` / `PAYMENT_ADMIN` |
| Payment Admin | Dev Payments | `paymentadmin.demo@indai.com` | `Pay@1234` | `admin` / `PAYMENT_ADMIN` |
| Instructor | Dr. Amit Singh | `instructor@indai.com` | `Inst@1234` | `instructor` |
| Instructor | Kavya Rao | `instructor.demo@indai.com` | `Inst@1234` | `instructor` |
| Course Provider | Platform provider | `provider@indai.com` | `Prov@1234` | `provider` |
| Course Provider | IIIT Academy | `iiitprovider@iiits.in` | `Prov@1234` | `provider` |
| Course Provider | Arjun Academy | `provider.demo@indai.com` | `Prov@1234` | `provider` |
| Learner | Rahul Sharma | `learner@indai.com` | `Learn@1234` | `learner` |
| Learner | Asha Nair | `asha.demo@indai.com` | `Learn@1234` | `learner` |
| Learner | Neha Reddy | `neha.demo@indai.com` | `Learn@1234` | `learner` |
| Learner | Vikram Shah | `vikram.demo@indai.com` | `Learn@1234` | `learner` |

## Relationships

| Group | Instructor | Assigned learners | Workshop provider | Workshop |
| --- | --- | --- | --- | --- |
| IIIT Sri City | Dr. Amit Singh | Rahul and Asha | Platform provider (`provider@indai.com`) | Paper Trading Risk Workshop — platform-wide Free course |
| IndAI Demo College | Kavya Rao | Neha and Vikram | Arjun Academy (`provider.demo@indai.com`) | Demo College Risk Lab — private institution Free course |

IIIT Academy remains a separate provider in IIIT Sri City and owns the existing private Financial Markets Lab course. Both groups contain four institution-mapped users each (instructor, institution provider and two learners). The platform provider has no institution mapping.

Each workshop includes two enrolled learners, a local 8-second educational video, a one-page risk workbook and a two-question quiz. Each group has its own instructor assignment and review session. The new assignment due dates are seven days after first creation; new sessions are three days after creation at 14:00. Their dates persist after restart rather than moving forward every day.

Neha has no initial submission, so she can submit live. Vikram has a sample risk-plan submission awaiting Kavya's approval; it has not earned points yet. Approval awards the assignment's 30 skill points once. These are shared assignment records, not independent copies in each dashboard.

## Start and optionally prepare trading records

From the extracted `IndAI_React` directory, with Node.js 24:

```powershell
npm run setup
npm run build
npm start
```

Open `http://localhost:3000`. For development, use the README's `npm run dev` flow and open port 5173.

To add sample portfolio holdings while the backend is running, open a **second terminal** in the same project root:

```powershell
npm run demo:prepare
```

This optional command authenticates Asha, Neha and Vikram and places one virtual TCS order and one virtual RELIANCE order for each through the real paper-trading API. Repeating it preserves existing orders/positions instead of adding duplicate samples. It also preserves a partially prepared account if interrupted; use that account's trading UI to complete any missing order. It does not reset an account. The original Rahul account stays available for a clean live trading demonstration.

If the backend uses another port:

```powershell
$env:INDAI_DEMO_URL = "http://localhost:3001"
npm run demo:prepare
```

Do not run this against a private deployment. It requires demo mode and the documented public sample accounts. Startup/setup needs npm registry access; these local demonstration workflows need no payment, mail or market-data API key after installation.

## Cross-actor actions to demonstrate

### Instructor notification to related learners

1. Sign in as Kavya (`instructor.demo@indai.com`). Open **Send Notification**.
2. Select Neha only and send a message such as `Please submit your risk workbook today.`
3. Sign in as Neha in a separate browser profile, or log out before switching. Open Notifications; refresh if already open.
4. Neha receives the message; Vikram does not receive a selected-Neha message. Sending to **all assigned active students (2)** reaches both Neha and Vikram.
5. Dr. Amit's group is separate. Kavya cannot send through the instructor notification composer to Rahul or Asha.

The notification screen polls; a refresh retrieves changes immediately. The project does not promise instantaneous WebSocket delivery or email delivery.

### Learner submission and instructor approval

1. Sign in as Neha and open Trading Challenges, then **Demo College Risk Plan**.
2. Choose **Submit work** and enter `Capital 100000; risk budget 1000; entry 200; stop 190; quantity 100.` Save.
3. Sign in as Kavya and refresh Assignments. The same assignment now contains Neha's submission.
4. Choose **Approve completion** beside Neha's submission.
5. Refresh Neha's account/dashboard. Her skill points increase by 30. Repeated approval does not add the points again.
6. Vikram's initial sample submission can also be reviewed and approved. Asha is outside this assignment's class.

### Provider material and enrolled learner

1. Sign in as Arjun (`provider.demo@indai.com`). Open Videos, choose **Demo College Risk Lab** in the Course dropdown, and edit the Risk Budget in Paper Trading module title.
2. Sign in as Neha or Vikram and refresh their learning screen. Their private Demo College Risk Lab uses the updated module.
3. Open the lesson/workbook from the course. Media is served locally through signed URLs; reopen the course to obtain a fresh link if it expires.
4. Complete a lesson or submit the Risk Budget Check quiz using the learner account. Progress/attempt records are stored by the backend.
5. The institution course cannot be accessed by Asha from IIIT Sri City. Arjun cannot edit the platform provider's workshop.

The quizzes use the same underlying course IDs as enrollments and modules. Correct sample quiz answers are a 1000 risk budget and **No** real exchange execution.

### Trading and shared administration

Use a new learner's prepared portfolio or place an additional virtual order through the trading UI. Portfolio cash, holdings, orders and valuation history derive from the actual virtual account. Administrators read shared user, enrollment and commercial records, with their existing division permissions. Refresh/polling may be required to see changes made in another browser session.

## What is simulated and what requires configuration

- Account names, initial courses, assignments, notifications and financial history are sample records; later edits persist normally.
- Paper trading uses virtual money. Bundled CSV replay and synthetic DEMO instruments are not a live exchange connection. Optional external market services require their own configuration.
- The short clip is an educational sample, not a full lecture. The PDF workbook is a real bundled document. Existing older module records may still lack uploaded media.
- Existing paid license/provider/instructor settlement rows are sample accounting history. They do not prove real money transfer.
- IndAI Demo College receives an explicit zero-cost `DEMO_GRANT` license. No successful Razorpay payment is invented for it.
- Actual Razorpay checkout needs configured keys, internet and normal verification. No bank/payment-gateway login is seeded.
- Sessions are scheduling records; creating a session does not establish a video-call service.
- Organization contact addresses are not login accounts. New onboarding users receive generated credentials through that process.

## Source and verification boundaries

Account extensions and linked records live in `back-end/src/store/demo.seed.ts`; original accounts remain in `back-end/src/store/data.store.ts`. Fresh-store initialization is gated in DataStore. Bundled lesson assets live in `back-end/data/demo/`. The optional portfolio command is `scripts/prepare-demo.mjs`.

Automated relationship/API checks are in `tests/demo-data.test.mjs`, and React interaction checks are in `tests/browser-demo.cjs`. See `docs/DEMO_DATA_TEST_REPORT.md` in the ZIP for actual results and verification limits. This guide does not claim a verified GitHub Download ZIP or native Windows execution.
