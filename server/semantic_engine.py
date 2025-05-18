#!/usr/bin/env python3
"""
semantic_engine.py
──────────────────
• Loads 5 CSV files (200 FAQ pairs each) that you created from MFAQ
  └── expected path: server/data/mfaq_<lang>_test.csv   (en, de, es, fr, it)
• Builds a fast bi-encoder index with paraphrase-multilingual-mpnet-base-v2
• Uses your fine-tuned XLM-Roberta cross-encoder (./xlmroberta_sts_finetuned)
• Exposes a FASTAPI endpoint  POST /search  ->  best FAQ answer
"""

import os, torch, pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer, CrossEncoder, util

# ------------------------------------------------------------------#
# 0. Config
# ------------------------------------------------------------------#
LANGS      = ["en", "de", "es", "fr", "it"]
CSV_DIR    = os.path.join(os.path.dirname(__file__), "data")
CROSS_PATH = os.path.join(os.path.dirname(__file__),
                          "..", "xlmroberta_sts_finetuned")
DEVICE     = "cuda" if torch.cuda.is_available() else "cpu"
TOP_K      = 20      # bi-encoder candidates sent to cross-encoder

# ------------------------------------------------------------------#
# 1. Load models
# ------------------------------------------------------------------#
print("🔧 Loading bi-encoder …")
bi_encoder = SentenceTransformer(
    "sentence-transformers/paraphrase-multilingual-mpnet-base-v2",
    device=DEVICE,
)
print("🔧 Loading cross-encoder …")
cross_encoder = CrossEncoder(CROSS_PATH, device=DEVICE)

# ------------------------------------------------------------------#
# 2. Build in-memory index  {lang: {questions, answers, embeddings}}
# ------------------------------------------------------------------#
index = {}
for lang in LANGS:
    csv_path = os.path.join(CSV_DIR, f"mfaq_{lang}_test.csv")
    if not os.path.isfile(csv_path):
        raise FileNotFoundError(f"CSV for {lang} not found: {csv_path}")
    df = pd.read_csv(csv_path).dropna()
    questions = df["question"].tolist()
    answers   = df["answer"].tolist()

    # encode once at start-up
    emb = bi_encoder.encode(
        questions,
        batch_size=32,
        convert_to_tensor=True,
        show_progress_bar=False,
    )
    emb = torch.nn.functional.normalize(emb, p=2, dim=1)  # cosine = dot
    index[lang] = {"questions": questions,
                   "answers": answers,
                   "embeddings": emb}
    print(f"✓ {lang}: {len(questions)} FAQs embedded")

# ------------------------------------------------------------------#
# 3. FastAPI micro-service
# ------------------------------------------------------------------#
app = FastAPI(title="Semantic FAQ Engine")

class Query(BaseModel):
    query: str
    lang: str = "en"  # default to English

@app.post("/search")
def search(q: Query):
    lang = q.lang.lower()
    if lang not in index:
        raise HTTPException(status_code=400,
                            detail=f"Language '{lang}' not available")

    # --- bi-encoder retrieval ------------------------------------#
    query_vec = bi_encoder.encode(q.query,
                                  convert_to_tensor=True,
                                  show_progress_bar=False)
    query_vec = torch.nn.functional.normalize(query_vec, p=2, dim=0)
    sims = util.cos_sim(query_vec, index[lang]["embeddings"])[0]
    cand_idx = torch.topk(sims, k=min(TOP_K, len(sims))).indices.tolist()

    # --- cross-encoder rerank ------------------------------------#
    pairs = [(q.query,
              index[lang]["questions"][i] + " ||| " +
              index[lang]["answers"][i]) for i in cand_idx]
    scores = cross_encoder.predict(pairs)
    best_local = int(max(range(len(scores)), key=lambda i: scores[i]))
    best_idx   = cand_idx[best_local]

    return {
        "question"      : index[lang]["questions"][best_idx],
        "answer"        : index[lang]["answers"][best_idx],
        "cross_score"   : float(scores[best_local]),
        "cosine_score"  : float(sims[best_idx]),
        "lang"          : lang,
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("semantic_engine:app", host="0.0.0.0", port=8000, reload=False)
