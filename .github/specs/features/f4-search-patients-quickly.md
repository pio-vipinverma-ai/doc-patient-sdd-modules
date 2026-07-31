# F4 - Search Patients Quickly

**Source:** Functional Requirements > Patient Management; Search and Navigation | Functional

**Description:** The doctor can quickly find patients by name or phone number.

## Scenarios

### Scenario 1: Search by partial name
Given multiple patient records exist  
When a partial name is entered into search  
Then matching patient records are listed

### Scenario 2: Search by phone number
Given patient records contain phone numbers  
When a full phone number is searched  
Then the matching patient record is returned

### Scenario 3: No results behavior
Given no records match the search query  
When search is executed  
Then an empty results state is displayed
