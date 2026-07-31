# F5 - Schedule Appointment

**Source:** Functional Requirements > Appointment Management | Functional

**Description:** The doctor can schedule appointments with date and time details.

## Scenarios

### Scenario 1: Create scheduled appointment
Given a patient is selected  
When appointment date and time are entered and saved  
Then the appointment is created with status Scheduled

### Scenario 2: Missing input validation
Given the appointment form is open  
When required fields are missing on submit  
Then appointment creation is blocked with validation errors

### Scenario 3: Time slot conflict
Given another appointment already exists in the same slot  
When the doctor attempts to book that slot  
Then creation is blocked and a conflict message is shown
