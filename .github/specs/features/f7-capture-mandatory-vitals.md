# F7 - Capture Mandatory Vitals

**Source:** Functional Requirements > Consultation Workflow > Vitals Capture | Functional

**Description:** The doctor must capture temperature, blood pressure, and pulse for every consultation.

## Scenarios

### Scenario 1: Record complete vitals
Given a consultation is in progress  
When temperature, blood pressure, and pulse are entered and saved  
Then vitals are stored in the visit record

### Scenario 2: Mandatory vitals enforcement
Given consultation completion is attempted  
When any mandatory vital is missing  
Then completion is blocked and missing fields are highlighted

### Scenario 3: Vitals format validation
Given vitals entry fields are open  
When blood pressure or pulse is entered in invalid format  
Then save is blocked with correction guidance
