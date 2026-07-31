# F16 - Encrypt Clinical Data

**Source:** Non-Functional Requirements > Security | Inferred from NFR

**Description:** The system enforces encryption for patient data at rest and in transit.

## Scenarios

### Scenario 1: Encryption in transit
Given patient data is exchanged between client and server  
When requests are processed  
Then transport encryption is enforced

### Scenario 2: Encryption at rest
Given patient records are written to persistent storage  
When save operations complete  
Then stored data is encrypted according to policy
