# F9 - Record Diagnosis Notes

**Source:** Functional Requirements > Consultation Workflow > Diagnosis | Functional

**Description:** The doctor can add and update diagnosis notes for each consultation.

## Scenarios

### Scenario 1: Save diagnosis notes
Given a consultation is open  
When diagnosis notes are entered and saved  
Then diagnosis is stored in the visit record

### Scenario 2: Update diagnosis notes
Given diagnosis already exists for the visit  
When diagnosis notes are edited and saved  
Then the updated diagnosis replaces the previous value
