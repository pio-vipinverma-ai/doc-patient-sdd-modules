# F10 - Manage Prescription Medicines

**Source:** Functional Requirements > Consultation Workflow > Medication and Prescription | Functional

**Description:** The doctor can add structured medicine lines with dosage and instructions.

## Scenarios

### Scenario 1: Add medicine line item
Given prescription editing is open  
When medicine name, dosage, frequency, duration, and instructions are entered  
Then the medicine line item is saved

### Scenario 2: Medication field validation
Given a new medicine row is being added  
When mandatory fields are left blank on save  
Then save is blocked and missing fields are highlighted

### Scenario 3: Remove medicine line item
Given multiple medicine lines exist  
When one line is removed and changes are saved  
Then only remaining line items appear in the prescription
