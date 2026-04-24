# AlfaTech — Powered by Urban-Sync (The Civic Ledger)
    [View our Project Website & Demo Here]([Insert your Google Sites Link here])
    
    ## Project Description
    AlfaTech is a Hybrid Deterministic System designed to solve the 'Administrative Burden' facing CUNY students and NYC residents. By converting complex policy documents into executable eligibility logic, we bridge the gap between needing help and receiving it.
    
    ## Core Innovation: The Civic Ledger
    The Civic Ledger is a deterministic rule engine that encodes NYC policy into machine-readable Python logic. Unlike standard AI chatbots that can 'hallucinate' rules, our system ensures:
    - **Accuracy**: Decisions are based on hard-coded government thresholds.
    - **Transparency**: Every decision includes a 'Logic Trace' explaining the result.
    - **Safety**: AI is used for interpretation and data extraction, while the Ledger handles the final decision authority.
    
    ## Tech Stack
    - **Frontend**: Streamlit
    - **AI Engine**: Gemini 1.5 Flash (Parsing & RAG)
    - **Logic Engine**: Python (Deterministic Rule Processing)
    - **Data Layer**: NYC Open Data (Socrata API)
    
    ## How It Works
    1. **Ingest**: User uploads a Financial Aid Summary or Transcript.
    2. **Extract**: AI identifies variables (income, status, credits).
    3. **Validate**: The Civic Ledger runs validated rules against the variables.
    4. **Output**: Verifiable eligibility decision + personalized action roadmap.
