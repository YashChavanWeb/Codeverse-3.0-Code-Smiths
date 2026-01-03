# Coderverse-3.0-Code-Smiths

## Project Setup

node src/scripts/seedProducts.js

### Frontend

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

### Backend

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

### Python Environment

1. Install `uv`:

   ```bash
   pip install uv
   ```

2. Create a virtual environment:

   ```bash
   uv venv
   ```

3. Activate the virtual environment:

   - On Windows:

     ```bash
     .venv\Scripts\activate
     ```

   - On macOS/Linux:

     ```bash
     source .venv/bin/activate
     ```

4. Add dependencies from `requirements.txt`:

   ```bash
   uv add -r requirements.txt
   ```

5. Run the FastAPI app with Uvicorn:

   ```bash
   uvicorn app.main:app --reload
   ```
