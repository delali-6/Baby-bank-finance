# Security & permissions test checklist

Use one **admin**, one **active staff**, one **inactive** user and a signed-out browser.
Record Pass/Fail and the date for each.

## Unauthenticated
- [ ] Signed out, open `/dashboard`, `/record`, `/history`, `/reports`, `/settings`, `/settings/users`, `/profile` → redirected to `/login`.
- [ ] Expired session (delete the `sb-*` cookies, then click a link) → redirected to `/login`, no data shown.
- [ ] Call the Supabase REST URL for `transactions`, `profiles`, `organisation_settings` with only the anon key → no rows / denied.

## Inactive user
- [ ] Sign in → lands on `/pending-approval`; every app URL returns there.
- [ ] With the inactive user's access token, query `transactions` via REST → no rows (RLS).
- [ ] INSERT into `transactions` with that token → rejected.

## Staff restrictions
- [ ] `/settings/users` by URL → blocked (verify the page itself, not just the missing sidebar link).
- [ ] Submit the `updateUserAccess` server action as staff → "not authorised".
- [ ] `PATCH profiles?id=eq.<other>` with staff token → 0 rows / denied (RLS).
- [ ] Staff cannot set `role` to `admin` on their own profile via REST.
- [ ] `PATCH organisation_settings?id=eq.1` with staff token → denied; settings form as staff → "not authorised".
- [ ] Staff `PATCH`/`DELETE transactions` for rows they are not authorised to change → denied.
- [ ] Staff cannot INSERT a transaction with `created_by` set to another user.

## Admin
- [ ] Admin cannot deactivate self or another active admin.
- [ ] Changing settings / approving a user creates an audit log row (who, what, when, old/new values).

## Input abuse
- [ ] Amount `0`, `-5`, `1.234`, `1e3`, `abc` → rejected in the form AND by the database (check constraint).
- [ ] History search with `%`, `,`, `(`, `'` → no error, no injection.
- [ ] Report `from`/`to` with invalid values → no crash.

## Data integrity
- [ ] £0.01 and £999.99 save and display exactly; totals add correctly.
- [ ] Transactions on the week-start day and the day before land in the correct week; Report/History/Dashboard agree.
- [ ] Double-click Save quickly → one transaction only.
- [ ] Two staff save at the same time → both appear.
- [ ] Turn off Wi-Fi, press Save → error shown, nothing claimed as saved, form entries kept.

## Known gaps (need database work)
- No void/restore UI exists yet (`deleted_at` is filtered but never set).
- Void reason, voided-by/at, restored-by/at and transaction audit logging depend on DB columns/triggers not in this repo.
