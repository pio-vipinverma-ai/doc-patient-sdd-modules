# F3 - View and Edit Patient

**Source:** Functional Requirements > Patient Management | Functional

**Description:** The doctor can view and update patient profile information.

## Scenarios

### Scenario 1: View patient profile
Given an existing patient is selected  
When the profile page is opened  
Then current demographic and contact details are shown

### Scenario 2: Edit profile successfully
Given the patient profile edit mode is open  
When valid updates are submitted  
Then profile changes are saved

### Scenario 3: Invalid contact format blocked
Given profile edit mode is open  
When an invalid phone format is submitted  
Then update is blocked with field level validation
