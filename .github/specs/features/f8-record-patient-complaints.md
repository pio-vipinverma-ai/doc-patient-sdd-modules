# F8 - Record Patient Complaints

**Source:** Functional Requirements > Consultation Workflow > Complaints | Functional

**Description:** The doctor can capture patient symptoms in free text during consultation.

## Scenarios

### Scenario 1: Save complaint notes
Given a consultation is open  
When symptom details are entered and saved  
Then complaints are stored with the visit

### Scenario 2: Text length validation
Given complaints input has a maximum allowed length  
When entered text exceeds the limit  
Then save is blocked and a character limit error is shown
