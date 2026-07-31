# F13 - Filter History by Date

**Source:** Functional Requirements > Patient History | Functional

**Description:** The doctor can filter patient visit history by date range.

## Scenarios

### Scenario 1: Filter by valid range
Given patient history includes visits across multiple dates  
When a valid start and end date are applied  
Then only visits within the range are listed

### Scenario 2: Invalid date range validation
Given history filter controls are available  
When end date is earlier than start date  
Then filter is not applied and validation feedback is shown
