# F12 - View Visit History

**Source:** Functional Requirements > Patient History | Functional

**Description:** The doctor can review previous visits and open complete historical records.

## Scenarios

### Scenario 1: List previous visits
Given a patient has prior visits  
When patient history is opened  
Then visits are listed in chronological order

### Scenario 2: Open visit details
Given a visit is selected from history  
When visit details are opened  
Then vitals, complaints, diagnosis, and prescriptions are displayed

### Scenario 3: No history empty state
Given a patient has no prior visits  
When patient history is opened  
Then a no history state is shown
