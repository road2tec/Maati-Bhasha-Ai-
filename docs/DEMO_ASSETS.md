# Demo ML Artifacts

This document lists the demo-only machine learning artifacts added to the repository.
They are intentionally inert and not imported by the application.

- `tools/marathi_gemini_model.py` — runnable Python script that simulates a tokenizer, model loader, dialect classifier, and inference pipeline. Produces deterministic outputs.
- `tools/marathi_tokenizer.py` — synthetic tokenizer stub with encode/decode helpers.
- `tools/gemini_adapter_stub.py` — stub that exposes `generate` and `stream_generate` functions to simulate Gemini-like outputs.
- `tools/training_simulator.py` — fake training loop that writes a demo checkpoint to `tools/checkpoints/`.
- `tools/model_metadata.json` — placeholder metadata describing the fake model.

These files are safe to run locally for demo prints, but they do not integrate with the Next.js application.
