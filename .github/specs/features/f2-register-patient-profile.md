# F2 - Register Patient Profile

**Source:** Functional Requirements > Patient Management | Functional

**Description:** The doctor can create a new patient profile with required demographic details.

## Scenarios

### Scenario 1: Create patient successfully
Given the add patient form is open  
When name, age or DOB, gender, and contact details are entered and saved  
Then a new patient record is created

### Scenario 2: Required fields validation
Given the add patient form is open  
When required fields are missing on submit  
Then save is blocked and validation messages are shown

### Scenario 3: Duplicate contact warning
Given an existing patient has the same phone number  
When a new patient is submitted with that phone number  
Then the system warns about a possible duplicate before confirmation
