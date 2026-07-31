# F6 - Track Daily Appointments

**Source:** Functional Requirements > Appointment Management | Functional

**Description:** The doctor can view daily appointments and update appointment status.

## Scenarios

### Scenario 1: View daily list
Given appointments exist for the selected day  
When the daily appointments view is opened  
Then all appointments for that day are listed

### Scenario 2: Update appointment status
Given an appointment is Scheduled  
When status is changed to Completed, Cancelled, or No-show  
Then the new status is saved and displayed

### Scenario 3: Invalid transition blocked
Given an appointment is in a terminal state  
When an invalid status transition is attempted  
Then the transition is rejected with an error message
