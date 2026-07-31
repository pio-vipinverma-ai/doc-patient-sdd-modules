# F1 - Secure Doctor Login

**Source:** Non-Functional Requirements > Security | Inferred from NFR

**Description:** The doctor can authenticate and access protected workflows securely.

## Scenarios

### Scenario 1: Valid login
Given a registered doctor account exists  
When valid credentials are submitted  
Then access is granted and the dashboard is displayed

### Scenario 2: Invalid credentials blocked
Given the login screen is open  
When invalid credentials are submitted  
Then access is denied and an authentication error is shown

### Scenario 3: Protected route enforcement
Given the user is not authenticated  
When a protected URL is opened directly  
Then the user is redirected to login
