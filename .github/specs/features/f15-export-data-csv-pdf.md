# F15 - Export Data CSV PDF

**Source:** Functional Requirements > Data Export | Functional

**Description:** The doctor can export patient or visit data as CSV or PDF.

## Scenarios

### Scenario 1: Export selected data as CSV
Given patient or visit data is selected for export  
When export as CSV is requested  
Then a CSV file is generated and downloaded

### Scenario 2: Export selected data as PDF
Given patient or visit data is selected for export  
When export as PDF is requested  
Then a PDF file is generated and downloaded

### Scenario 3: No data export handling
Given no data matches the selected export scope  
When export is requested  
Then no file is generated and a no data message is shown
