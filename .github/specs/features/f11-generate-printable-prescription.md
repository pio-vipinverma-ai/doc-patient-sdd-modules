# F11 - Generate Printable Prescription

**Source:** Functional Requirements > Consultation Workflow > Medication and Prescription | Functional

**Description:** The doctor can generate a print ready prescription containing all required clinical sections.

## Scenarios

### Scenario 1: Generate complete prescription
Given consultation data includes patient details, vitals, diagnosis, and medications  
When prescription generation is requested  
Then a printable prescription is generated with header, body, and footer

### Scenario 2: Missing required section blocked
Given one or more required sections are missing  
When prescription generation is requested  
Then generation is blocked and missing sections are listed

### Scenario 3: Print preview output
Given a printable prescription has been generated  
When print preview is opened  
Then all required sections are visible in print layout
