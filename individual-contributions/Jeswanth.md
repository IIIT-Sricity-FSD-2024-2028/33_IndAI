# Individual contribution — Jeswanth

| Field | Value |
|---|---|
| Name | Jeswanth |
| Roll number | S20240010202 |
| Project | IndAI — Financial Literacy and Paper Trading |
| Primary actor(s) | Learner |
| Additional integration | Learner-facing trading and learning integration |

## Responsibility

Learner portal, virtual trading and progress. This record defines the member's technical responsibility within the integrated application.

### Virtual trading

Instrument search, quotes/history, market/limit/stop order entry, pending-order cancellation and holdings.

### Portfolio and watchlist

Cash/marked-value totals, recorded portfolio growth, holdings/order tables, adjacent Buy/Sell shortcuts and saved watchlist membership.

### Learning consumption

Published course enrollment, lesson access/completion, quiz attempts, assignment submissions and learner-visible sessions/notifications.

## Frontend implementation scope

| Exact source path | Components/functions | Responsibility boundary |
|---|---|---|
| `frontend/src/layouts/LearnerDashboard.jsx` | `LearnerDashboard` | Learner portal navigation and presentation. |
| `frontend/src/components/Common.jsx` | `Holdings` | Shared holdings rows with grouped Buy/Sell controls and the onTrade callback. |
| `frontend/src/components/TradingWorkspace.jsx` | `TradingWorkspace`, `PriceChart` | Controlled trading form, market history and inline SVG price chart. |
| `frontend/src/pages/Dashboard.jsx` | `Portfolio`, `PortfolioChart`, `Watchlist`, `TradeRows` | Portfolio/watchlist composition and recorded-value display. |
| `frontend/src/components/Learning.jsx` | `Courses`, `Modules`, `Quizzes` | Learner enrollment, completion and quiz-taking branches of shared learning components. |
| `frontend/src/components/Management.jsx` | `Assignments` | Learner submission controls in the shared assignment component. |
| `frontend/src/components/Commerce.jsx` | `Subscription` | Learner subscription presentation and payment integration boundary. |

## Backend integration scope

| Exact source path | Component/service | Role in the workflow |
|---|---|---|
| `back-end/src/modules/algo/algo.module.ts` | `AlgoController` | Authenticated virtual-account routing. |
| `back-end/algo/server.mjs` | `routes` | Manual order/search/history/portfolio request dispatch. |
| `back-end/algo/store.mjs` | `markPortfolio` | Per-user account persistence and recorded valuations. |
| `back-end/src/modules/watchlists/watchlists.controller.ts` | `WatchlistsController` | Saved symbol membership routes. |
| `back-end/src/modules/enrollments/enrollments.controller.ts` | `EnrollmentsController` | Enrollment access and saved lesson progress. |

## React implementation

- **State and controlled inputs:** TradingWorkspace owns query/search, selected instrument, side, quantity, order type, trigger price and chart period.
- **Components and callbacks:** PriceChart receives candles; Watchlist reports the chosen symbol with onTrade; Holdings receives positions/onTrade/busy and calls onTrade(position, side). Dashboard.openTrade passes the exact instrument, symbol and side into TradingWorkspace through initialInstrument, initialSymbol and initialSide. The workspace uses tradeHolding for its own holdings table.
- **Validation and events:** Order submission checks quote availability, positive whole-share quantity, virtual balance and owned shares before the backend checks the request.
- **Side effects:** An effect selects an initial instrument after search data loads. Resource hooks poll quotes/account data and ignore obsolete results after cleanup.
- **Conditional lists:** Limit/Stop price fields and pending-order cancellation appear only when applicable. Portfolio/watchlist/order records use map and lookup/filter operations.

## API interfaces

All endpoints use the backend /api prefix. Identifier segments are route parameters. The server applies authentication, role/division, ownership and business validation.

| Method and route | Handler |
|---|---|
| `POST /api/algo/orders` | `AlgoController.route` |
| `GET /api/algo/portfolio` | `AlgoController.route` |
| `POST /api/watchlists/:userId/items` | `WatchlistsController.addItem` |
| `POST /api/enrollments` | `EnrollmentsController.create` |
| `PATCH /api/enrollments/:id/progress` | `EnrollmentsController.update` |

## Integrated behavior

TradingWorkspace sends a virtual order through api. AlgoController binds the request to the authenticated account before the engine validates and persists it. Holdings shortcuts prepare the existing form; they do not place an order automatically. Buy/Sell stay side by side, and the normal order button waits for account and quote data. The saved result drives the notice and portfolio reload. Learning mutations similarly update the backend before progress is refreshed.

## Team coordination

Coordinates provider content/access interfaces with Purvaj, instructor assignment/session interfaces with Praneeth, and shared subscription verification with Gurwinder. This scope focuses on learner-facing behavior, leaving content authoring and payment administration with their actor leads.

Shared application data is read through `frontend/src/hooks/useResource.js` and mutations use `frontend/src/services/api.js`. Form/dialog primitives in `frontend/src/components/Common.jsx` provide common value/callback/error behavior. Successful mutations refresh real backend records; UI visibility alone is not authorization.

[Project overview](../README.md) · [Team responsibilities](../docs/TEAM.md) · [Architecture](../docs/ARCHITECTURE.md)
