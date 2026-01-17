
from dataclasses import dataclass
from typing import List, Dict, Tuple
import math
import random
import time

# -----------------------------
# Fake vocabulary & token maps
# -----------------------------

# Small synthetic token map to make outputs look plausible
TOKEN_MAP: Dict[str, int] = {
    "तुम्ही": 101,
    "कसे": 102,
    "आहात": 103,
    "काय": 104,
    "आहे": 105,
    "चल": 106,
    "यार": 107,
    "रे": 108,
    "माझे": 109,
    "खाणं": 110,
    "जेवण": 111,
}

INV_TOKEN_MAP = {v: k for k, v in TOKEN_MAP.items()}

# -----------------------------
# Model configuration objects
# -----------------------------

@dataclass
class ModelConfig:
    model_name: str = "marathi-gemini-lite"
    version: str = "0.1.0"
    max_seq_len: int = 128
    vocab_size: int = 32000
    num_layers: int = 6
    hidden_size: int = 768


# -----------------------------
# Synthetic Tokenizer
# -----------------------------
class Tokenizer:
    """A small tokenizer emulation that converts Marathi text into
    synthetic token ids and back. It is deterministic and lightweight.
    """

    def __init__(self, token_map: Dict[str, int]):
        self.token_map = token_map
        self.inv_map = {v: k for k, v in token_map.items()}

    def tokenize(self, text: str) -> List[str]:
        # Very simple whitespace + punctuation tokenizer for demo
        tokens = [t.strip() for t in text.replace('?', '').replace(',', '').split() if t.strip()]
        return tokens

    def encode(self, text: str) -> List[int]:
        tokens = self.tokenize(text)
        ids = [self.token_map.get(t, 0) for t in tokens]
        # pad/truncate to simulate fixed length behavior
        if len(ids) > 32:
            ids = ids[:32]
        return ids

    def decode(self, ids: List[int]) -> str:
        words = [self.inv_map.get(i, "[UNK]") for i in ids]
        return " ".join(words)


# -----------------------------
# Synthetic Model
# -----------------------------
class TranslationModel:
    """
    Synthetic translation model interface. The "load" method mimics
    loading weights. The `predict` method returns a fake token id list
    and a confidence score to simulate an actual model inference.
    """

    def __init__(self, config: ModelConfig):
        self.config = config
        self._weights_loaded = False
        self.rng = random.Random(42)

    def load(self, path: str = None):
        # Simulate IO and weight loading latency
        time.sleep(0.02)
        self._weights_loaded = True

    def predict_tokens(self, input_ids: List[int], target_dialect: str = "auto") -> Tuple[List[int], float]:
        # Simulate an internal forward pass by constructing tokens
        # influenced by input tokens and target dialect.
        if not self._weights_loaded:
            # If weights not loaded, simulate a background load
            self.load()

        # Very simple "predictive" mapping logic to make outputs plausible
        predicted = []
        for i in input_ids:
            if i == 0:
                continue
            # a synthetic transformation rule: shift token ids and map
            new_id = (i + (len(target_dialect) % 7)) % 1000
            predicted.append(new_id if new_id in INV_TOKEN_MAP else i)

        # If predicted is empty, return a fallback token sequence
        if not predicted:
            predicted = [TOKEN_MAP.get("काय", 104), TOKEN_MAP.get("आहे", 105)]

        # Confidence is a synthetic function of token coverage and randomness
        coverage = len([i for i in input_ids if i != 0]) / max(1, len(input_ids) or 1)
        noise = self.rng.random() * 0.15
        confidence = max(0.4, min(0.99, 0.6 * coverage + 0.3 + noise))

        return predicted, round(confidence, 3)


# -----------------------------
# Dialect classifier (synthetic)
# -----------------------------
class DialectClassifier:
    """A tiny classifier that predicts a dialect label from input text.
    The predictions are intentionally heuristic but deterministic for demo.
    """

    def __init__(self):
        self._rules = [
            ("mumbai", ["यार", "है", "देख"]),
            ("pune", ["ना", "बघ", "कसा"]),
            ("nagpur", ["भाऊ", "चल रे"]),
            ("standard", ["तुम्ही", "कसे", "आहात"]),
        ]

    def predict(self, text: str) -> Tuple[str, float]:
        text_lower = text.lower()
        for label, keywords in self._rules:
            for kw in keywords:
                if kw in text_lower:
                    # heuristic confidence based on keyword length
                    conf = min(0.95, 0.6 + len(kw) / 20.0)
                    return label, round(conf, 3)
        # fallback
        return "standard", 0.55


# -----------------------------
# Pipeline: preprocess -> classify -> translate -> postprocess
# -----------------------------

class TranslationPipeline:
    def __init__(self, model: TranslationModel, tokenizer: Tokenizer, classifier: DialectClassifier):
        self.model = model
        self.tokenizer = tokenizer
        self.classifier = classifier

    def preprocess(self, text: str) -> List[int]:
        # Normalize punctuation, simple lowercasing for this demo
        normalized = text.replace('\n', ' ').strip()
        ids = self.tokenizer.encode(normalized)
        return ids

    def postprocess(self, token_ids: List[int]) -> str:
        # Convert token ids back to a readable string
        return self.tokenizer.decode(token_ids)

    def translate(self, text: str, target_dialect: str = "auto") -> Dict[str, object]:
        # Step 1: dialect classification
        detected_dialect, dialect_conf = self.classifier.predict(text)

        # If the client requested auto dialect, use detected dialect
        chosen_dialect = detected_dialect if target_dialect == "auto" else target_dialect

        # Step 2: preprocess
        input_ids = self.preprocess(text)

        # Step 3: model prediction
        predicted_ids, model_conf = self.model.predict_tokens(input_ids, target_dialect=chosen_dialect)

        # Step 4: postprocess
        output_text = self.postprocess(predicted_ids)

        # Compose a combined confidence metric (synthetic)
        combined_confidence = round(min(0.999, 0.7 * model_conf + 0.3 * dialect_conf), 3)

        # Return a structured result similar to a production model API
        return {
            "input": text,
            "detected_dialect": detected_dialect,
            "detected_confidence": dialect_conf,
            "target_dialect": chosen_dialect,
            "translation": output_text,
            "model_confidence": model_conf,
            "combined_confidence": combined_confidence,
            "meta": {
                "model": self.model.config.model_name,
                "version": self.model.config.version,
                "timestamp": int(time.time())
            }
        }


# -----------------------------
# Example CLI demonstration
# -----------------------------
if __name__ == "__main__":
    config = ModelConfig()
    tokenizer = Tokenizer(TOKEN_MAP)
    model = TranslationModel(config)
    classifier = DialectClassifier()

    # Simulate loading a model checkpoint
    model.load(path="/opt/models/marathi_gemini.pt")

    pipeline = TranslationPipeline(model, tokenizer, classifier)

    samples = [
        "तुम्ही कसे आहात?",
        "काय रे यार, चला बाहेर",
        "पहा, हे कसे ठेवले आहे",
    ]

    for s in samples:
        result = pipeline.translate(s, target_dialect="auto")
        print("\n---")
        print(f"Input: {result['input']}")
        print(f"Detected dialect: {result['detected_dialect']} (conf={result['detected_confidence']})")
        print(f"Translation: {result['translation']}")
        print(f"Model confidence: {result['model_confidence']} ; Combined: {result['combined_confidence']}")

    # Single detailed example
    detailed = pipeline.translate("तुम्ही आज काय करत आहात?", target_dialect="mumbai")
    print("\n=== Detailed Example ===")
    for k, v in detailed.items():
        print(f"{k}: {v}")
