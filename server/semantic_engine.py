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
LANGS      = ["en", "de", "es", "fr", "it", "nl", "pl", "pt", "ru"]
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
    csv_path = os.path.join(CSV_DIR, f"mfaq_{lang}.csv")
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
    top_k: int = TOP_K

@app.post("/search")
def search(q: Query):
    lang = q.lang.lower()
    if lang not in index:
        raise HTTPException(status_code=400,
                            detail=f"Language '{lang}' not available")

    # --- bi-encoder retrieval ------------------------------------#
    query_vec = bi_encoder.encode(
        q.query,
        convert_to_tensor=True,
        show_progress_bar=False
    )
    query_vec = torch.nn.functional.normalize(query_vec, p=2, dim=0)
    sims = util.cos_sim(query_vec, index[lang]["embeddings"])[0]
    k = min(q.top_k, sims.size(0))
    cand_idx = torch.topk(sims, k=k).indices.tolist()

    # --- cross-encoder rerank ------------------------------------#
    pairs = []
    for i in cand_idx:
        src = index[lang]["questions"][i]
        tgt = index[lang]["questions"][i] + " ||| " + index[lang]["answers"][i]
        pairs.append((q.query, tgt))

    scores = cross_encoder.predict(pairs)
    # sort candidate indices by cross_score descending
    scored = sorted(
        zip(cand_idx, scores.tolist()),
        key=lambda x: x[1],
        reverse=True
    )

    results = []
    for idx, score in scored:
        results.append({
            "question":   index[lang]["questions"][idx],
            "answer":     index[lang]["answers"][idx],
            "cross_score": float(score),
            "cosine_score": float(sims[idx]),
            "lang":        lang,
        })
    return {"results": results}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("semantic_engine:app",
                host="0.0.0.0", port=8000, reload=False)
