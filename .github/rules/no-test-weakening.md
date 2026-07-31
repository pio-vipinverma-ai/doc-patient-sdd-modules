---  
description: Apply to all code generation and modification 
--- 

# No Test Weakening 

NEVER modify a test file to make a failing test pass.  

NEVER skip, comment out, or remove any assertion.  

NEVER use .skip or .only to hide a real failure.  

NEVER delete a test to achieve a green build.  

If a test fails, fix the IMPLEMENTATION, not the test.  

If you believe the test is wrong, flag it as REVIEW REQUIRED  

and explain why --- do not change it unilaterally. 