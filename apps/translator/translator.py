import os
from threading import Lock

import torch
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer


MODEL_NAME = os.getenv(
    "TRANSLATION_MODEL",
    "facebook/nllb-200-distilled-600M",
)

if torch.cuda.is_available():
    DEVICE = "cuda"
elif torch.backends.mps.is_available():
    DEVICE = "mps"
else:
    DEVICE = "cpu"

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
tokenizer.src_lang = "tam_Taml"
TARGET_LANGUAGE_ID = tokenizer.convert_tokens_to_ids("eng_Latn")
model = AutoModelForSeq2SeqLM.from_pretrained(
    MODEL_NAME,
    torch_dtype=torch.float16,
).to(DEVICE)
model.eval()
inference_lock = Lock()

app = FastAPI(title="Tamil translator")


class TranslationRequest(BaseModel):
    texts: list[str]


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "device": DEVICE, "model": MODEL_NAME}


@app.post("/translate")
def translate(request: TranslationRequest) -> dict[str, list[str]]:
    texts = [text.strip() for text in request.texts]
    if not texts or any(not text for text in texts):
        raise HTTPException(status_code=400, detail="texts must contain non-empty strings")

    with inference_lock:
        inputs = tokenizer(
    texts,
    truncation=True,
    padding=True, 
    return_tensors="pt",
).to(DEVICE)

        with torch.inference_mode():
            output_tokens = model.generate(
                **inputs,
                max_new_tokens=128,
                min_length=1,
                num_beams=1,
                use_cache=True,
                forced_bos_token_id=TARGET_LANGUAGE_ID,
            )

        decoded = tokenizer.batch_decode(output_tokens, skip_special_tokens=True)
    return {"translations": decoded}