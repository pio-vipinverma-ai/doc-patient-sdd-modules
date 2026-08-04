# F1 Acceptance Criteria Test Cases

Source spec: .github/specs/specs/f1.md

## AC-1
AC statement: Given a registered doctor account, when valid credentials are submitted, then access is granted and the dashboard is displayed.

### test_AC1_valid_credentials_grants_access_and_displays_dashboard
Given:
- A registered doctor account exists with email doctor@example.com and a valid password hash.
- The auth service is available.
- The user is on the login screen.
When:
- The user submits valid email and password.
Then:
- Authentication succeeds.
- Access token/session is issued.
- User is navigated to dashboard.
- Dashboard protected content is visible.

Mocks/Fixtures needed:
- Doctor account fixture: active account with known valid password.
- Auth response fixture: success payload (token plus doctor profile).
- Dashboard fixture content.

Binary pass/fail:
- Pass: all Then assertions are true.
- Fail: any Then assertion is false.

Independence:
- Uses isolated account fixture and fresh auth state for this test only.

### test_AC1_valid_credentials_does_not_show_auth_error
Given:
- A registered active doctor account exists.
- The user is on the login screen.
When:
- The user submits valid credentials.
Then:
- No authentication error message is shown.
- Dashboard route is active.

Mocks/Fixtures needed:
- Registered doctor fixture.
- UI state fixture with no pre-existing error.

Binary pass/fail:
- Pass: no auth error is displayed and dashboard route is active.
- Fail: any auth error is shown or route is not dashboard.

Independence:
- Fresh UI and auth state before execution.

## AC-2
AC statement: Given the login screen is open, when invalid credentials are submitted, then access is denied and an authentication error is shown.

### test_AC2_invalid_password_denies_access_and_shows_auth_error
Given:
- A registered doctor account exists.
- The login screen is open.
When:
- The user submits the correct email and an incorrect password.
Then:
- Authentication is denied.
- No protected session/token is created.
- A visible authentication error is shown.
- User remains on login screen.

Mocks/Fixtures needed:
- Registered doctor fixture.
- Invalid-credentials response fixture.

Binary pass/fail:
- Pass: deny, no session/token, visible error, and login screen remains.
- Fail: any one of these conditions is not met.

Independence:
- Fresh auth state and cleared storage before execution.

### test_AC2_unknown_email_denies_access_with_generic_auth_error
Given:
- The login screen is open.
- No account exists for unknown@example.com.
When:
- The user submits unknown@example.com with any password.
Then:
- Authentication is denied.
- A generic authentication error is shown (no account-existence disclosure).
- No dashboard access is granted.

Mocks/Fixtures needed:
- Unknown user fixture.
- Generic auth error fixture aligned to security policy.

Binary pass/fail:
- Pass: access denied, generic error shown, no protected access.
- Fail: access granted or non-generic/disclosing error appears.

Independence:
- No dependency on AC-1 data; test uses its own user input and auth state.

## AC-3
AC statement: Given the user is not authenticated, when a protected URL is opened directly, then the user is redirected to login.

### test_AC3_unauthenticated_direct_protected_url_redirects_to_login
Given:
- The user has no valid auth token/session.
- A protected URL is known, for example /dashboard.
When:
- The user opens /dashboard directly.
Then:
- The user is redirected to /login.
- Protected content is not rendered.

Mocks/Fixtures needed:
- Router fixture with protected route configuration.
- Empty/expired auth storage fixture.

Binary pass/fail:
- Pass: final route is /login and protected content is absent.
- Fail: user stays on protected route or protected content appears.

Independence:
- Fresh router and cleared auth storage per test.

### test_AC3_redirect_preserves_return_url_for_post_login_navigation
Given:
- The user is unauthenticated.
- Protected URL /dashboard is opened directly.
When:
- Redirect to login occurs.
Then:
- Return URL state preserves /dashboard.
- No protected content is visible before authentication.

Mocks/Fixtures needed:
- Router state fixture with return URL capture.
- Unauthenticated state fixture.

Binary pass/fail:
- Pass: login route is shown and preserved return URL equals /dashboard.
- Fail: return URL missing/incorrect or protected content is visible.

Independence:
- Standalone route state for this test only.

## AC-4
AC statement: Failed login attempts are rate-limited or temporarily blocked according to defined security policy.

### test_AC4_failed_attempts_below_threshold_not_blocked
Given:
- Security policy fixture defines max_failed_attempts and lock_window_minutes.
- A user has failed attempts count below max_failed_attempts.
When:
- One additional invalid login is submitted and count remains below threshold.
Then:
- Request is denied as invalid credentials.
- Response is not blocked/rate-limited status.

Mocks/Fixtures needed:
- Security policy fixture with explicit threshold values.
- Login attempts store fixture seeded below threshold.
- Invalid credential request fixture.

Binary pass/fail:
- Pass: response indicates invalid credentials without block status.
- Fail: block status appears before threshold.

Independence:
- Uses isolated attempts record and policy fixture reset.

### test_AC4_failed_attempts_at_threshold_are_blocked
Given:
- Security policy fixture defines max_failed_attempts and block behavior.
- A user attempts invalid logins up to threshold within policy window.
When:
- The threshold-triggering attempt is submitted.
Then:
- Login attempt is blocked/rate-limited per policy.
- No token/session is issued.
- Policy-defined block error response is returned.

Mocks/Fixtures needed:
- Security policy fixture.
- Attempts store fixture with controllable timestamps.
- Clock/time fixture for deterministic window behavior.

Binary pass/fail:
- Pass: block behavior starts at threshold and no session is issued.
- Fail: threshold attempt is not blocked or session is issued.

Independence:
- Test controls its own attempts timeline and policy values.

### test_AC4_block_expires_after_policy_window
Given:
- User is currently blocked due to prior failed attempts.
- Policy window duration is defined.
When:
- Policy window expires and user submits valid credentials.
Then:
- Block is lifted per policy.
- Authentication succeeds and protected access is granted.

Mocks/Fixtures needed:
- Blocked-user attempts fixture.
- Time-travel/clock fixture.
- Valid credentials fixture.

Binary pass/fail:
- Pass: post-window valid login succeeds.
- Fail: user remains blocked after window or login fails incorrectly.

Independence:
- No dependency on previous AC4 tests; blocked state is seeded directly.

## AC-5
AC statement: Session timeout duration and re-authentication behavior are defined and enforced for protected routes.

### test_AC5_idle_timeout_expires_session_and_redirects_to_login
Given:
- Authenticated user with valid token/session exists.
- Security policy fixture defines idle timeout.
- User is on a protected route.
When:
- Inactivity exceeds idle timeout.
- User attempts protected interaction/navigation.
Then:
- Session is treated as expired.
- User is redirected to login.
- Protected route access is denied until re-authentication.

Mocks/Fixtures needed:
- Authenticated session fixture.
- Idle-time policy fixture.
- Clock/time fixture for deterministic timeout.

Binary pass/fail:
- Pass: expiration, redirect, and deny behavior all occur after timeout.
- Fail: protected access continues beyond idle timeout.

Independence:
- Fresh session and isolated clock per test.

### test_AC5_absolute_lifetime_expires_active_session
Given:
- Authenticated user session with defined absolute lifetime.
- User remains active to avoid idle timeout trigger.
When:
- Absolute session lifetime is exceeded.
Then:
- Session expires regardless of activity.
- Protected route requires re-authentication.

Mocks/Fixtures needed:
- Active-session fixture.
- Absolute-lifetime policy fixture.
- Clock/time fixture.

Binary pass/fail:
- Pass: session expires exactly when absolute lifetime is exceeded.
- Fail: session remains valid beyond absolute lifetime.

Independence:
- Controlled activity and time fixtures isolated per run.

### test_AC5_expired_session_redirect_preserves_return_url
Given:
- User session is expired.
- User opens protected URL /dashboard/reports.
When:
- Route guard evaluates expired auth state.
Then:
- User is redirected to /login.
- Return URL /dashboard/reports is preserved for post-login navigation.

Mocks/Fixtures needed:
- Expired-session fixture.
- Router fixture with return URL storage.

Binary pass/fail:
- Pass: redirect target is /login and preserved return URL matches source protected URL.
- Fail: no redirect or return URL not preserved.

Independence:
- Expired auth and route state are seeded directly for this test.

## Independence and Binary Rule Checklist
- Every test above has explicit pass and fail outcomes.
- Every test seeds its own auth/session/attempt data and does not depend on another test.
- Shared fixtures (doctor account, policy, clock, router) must be reset per test execution.
