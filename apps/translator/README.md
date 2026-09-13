# Tamil translator

Run from this directory:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn translator:app --host 0.0.0.0 --port 8000
```

The default model is the public `facebook/nllb-200-distilled-600M`, which supports Tamil to English without Hugging Face authentication. The first start downloads the model. The Node server calls `POST /translate` and sends only unique Tamil text values in batches.

To use a different Hugging Face model, set `TRANSLATION_MODEL`. Private or gated models require a Hugging Face token configured in the environment.

Set `TRANSLATOR_URL` if the service is running on another host or port.
