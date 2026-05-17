# MenuMind Backend

This is the backend for the MenuMind Autonomous Agent.

## Setup
1. Copy `.env.example` to `.env` and add your `GEMINI_API_KEY`.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Running the Server
You MUST run the server from within the `backend` directory so imports work correctly.

```bash
cd backend
uvicorn main:app --reload
```

## Running the Smoke Tests
To verify the agent logic and scenarios, ensure the server is running on port 8000, then run:

```bash
cd backend
python smoke_test.py
```
