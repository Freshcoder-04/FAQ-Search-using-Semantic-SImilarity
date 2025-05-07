# FAQ-Search-using-Semantic-SImilarity

A full-stack demo that lets users browse and search FAQs in five languages (English, German, Spanish, French, Italian) using a two-stage semantic retrieval pipeline:

1. **Bi-encoder stage**  
   - Uses [paraphrase-multilingual-mpnet-base-v2](https://www.sbert.net/) to embed all FAQ questions into a vector index.  
   - At query-time, computes cosine similarity and retrieves the top _K_ candidates.

2. **Cross-encoder stage**  
   - Computes score between the input and 

---

## Key Components

- **`client/`**:  
  React + Vite + Tailwind UI components  
  - `LanguageSelector`, `SearchBar`, `SearchResults`, `FaqItem`  

- **`server/`**:  
  Node/Express proxy & CSV loader  
  - `routes/search.ts`  
  - `faqService.ts` (parses `server/data/mfaq_<lang>_test.csv`)  

- **`semantic_engine.py`**:  
  FastAPI microservice  
  - Builds in-memory index of 1,000 FAQs  
  - Two-stage retrieval (bi-encoder ➔ cross-encoder)  
  - Configurable `top_k`

- **`xlmroberta_sts_finetuned/`**:  
  Your fine-tuned cross-encoder model artifacts

---

## Quickstart
1. Download the fine-tuned XLM_Roberta model from this [link](https://drive.google.com/file/d/1jgYp5hCQ7n3-bJAXdHpxjlPiIqWF3T7U/view?usp=drive_link). Then unzip the folder and place it in the root directory.
2. **Install dependencies**  
    * Install the following python dependencies:
        ```
        fastapi>=0.95.0,<1.0.0
        uvicorn[standard]>=0.25.0,<1.0.0
        pandas>=2.0.0,<3.0.0
        torch>=2.0.0,<3.0.0
        sentence-transformers>=2.2.2,<3.0.0
        ```
    * Install Node dependencies:
        ```
        npm install
        npm install axios
        ```

3. **Run the FastAPI engine** (1st terminal)

    ```
    cd server
    python3 semantic_engine.py
    ```

4. **Run the Express API + React frontend** (2nd terminal)

    In the root directory:
    ```
    npm run dev
    ```

5. **Open**

   Visit `http://localhost:8080`
   – select a language, type your query, and see the top *K* semantically ranked FAQs along with similarity scores!

---

## Further details

See additional details in the [Report](Report.pdf).