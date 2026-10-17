# Team responsibilities

The implementation is organized by actor with coordinated shared-component boundaries. Learner and Course Provider each form a dedicated work package because trading/charts and content/media/assessments are substantial workflows. Public onboarding balances the User Admin package; shared account UI balances Instructor; Super Admin and Payment Admin are combined into one administrative package.

| Member | Roll number | Primary actor(s) | Additional integration scope |
|---|---|---|---|
| Bharan | S20240010176 | User Admin | Public pages, authentication and registration |
| Jeswanth | S20240010202 | Learner | Learner-facing trading and learning integration |
| Purvaj | S20240010178 | Course Provider | Provider-facing content and assessment lifecycle |
| Praneeth | S20240010179 | Instructor | Shared profile, theme and interaction components |
| Gurwinder | S20240010082 | Super Admin, Payment Admin | Authorization, commercial administration and platform reporting |

## Shared boundaries

| Boundary | Coordination |
|---|---|
| Identity, onboarding and role/division permissions | Bharan and Gurwinder |
| Provider publication and learner enrollment/access | Purvaj, Gurwinder and Jeswanth |
| Instructor assignments/sessions and learner participation | Praneeth and Jeswanth |
| Provider-owned assignments and common assessment controls | Purvaj and Praneeth |
| Profile/theme/forms/dialogs used in every portal | Praneeth coordinates with all actor leads |
| Dashboard/Management/Learning/Commerce shared files | Edits are coordinated by component/function and actor branch |

Allocation reflects workflow complexity rather than equal numbers of actors or files. Shared infrastructure, API contracts and cross-actor integration are team responsibilities. Contribution records describe these module responsibilities and the actual implementation interfaces; Git history records specific committed changes.

## Individual records

- [Bharan — S20240010176](../individual-contributions/Bharan.md)
- [Jeswanth — S20240010202](../individual-contributions/Jeswanth.md)
- [Purvaj — S20240010178](../individual-contributions/Purvaj.md)
- [Praneeth — S20240010179](../individual-contributions/Praneeth.md)
- [Gurwinder — S20240010082](../individual-contributions/Gurwinder.md)

The [machine-readable scope](team-responsibilities.json) supports source-path and symbol validation.
