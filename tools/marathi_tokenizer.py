
from typing import List, Dict, Tuple
import re

# Very small synthetic vocabulary with token ids to make encoded outputs look real
VOCAB: Dict[str, int] = {
    "तुम्ही": 1,
    "कसे": 2,
    "आहात": 3,
    "काय": 4,
    "आहे": 5,
    "चल": 6,
    "यार": 7,
    "पहा": 8,
    "बघ": 9,
    "माझे": 10,
    "[UNK]": 0,
}

INV_VOCAB = {v: k for k, v in VOCAB.items()}

class MarathiTokenizer:
    """Synthetic subword-like tokenizer for Marathi demo."""

    def __init__(self, vocab: Dict[str, int] = VOCAB):
        self.vocab = vocab
        self.inv_vocab = {v: k for k, v in vocab.items()}
        # fake merges to simulate BPE
        self.merges = [("क", "से"), ("आ", "हात"), ("बा", "प्पा")]

    def normalize(self, text: str) -> str:
        # simple normalization: strip, collapse spaces
        text = text.strip()
        text = re.sub(r"\s+", " ", text)
        return text

    def tokenize(self, text: str) -> List[str]:
        text = self.normalize(text)
        # naive whitespace tokenizer for demo
        tokens = text.replace('?', '').replace('.', '').split()
        # simulate subword splitting for long words
        out = []
        for t in tokens:
            if len(t) > 6:
                out.append(t[:3])
                out.append(t[3:])
            else:
                out.append(t)
        return out

    def encode(self, text: str) -> List[int]:
        tokens = self.tokenize(text)
        ids = [self.vocab.get(t, 0) for t in tokens]
        # pad/truncate to fixed demo length
        if len(ids) < 8:
            ids += [0] * (8 - len(ids))
        return ids[:8]

    def decode(self, ids: List[int]) -> str:
        words = [self.inv_vocab.get(i, "[UNK]") for i in ids if i != 0]
        return " ".join(words)


# Example usage (for demo):
if __name__ == "__main__":
    tk = MarathiTokenizer()
    examples = [
        "तुम्ही कसे आहात?",
        "काय रे यार, चला बाहेर",
        "पहा हे कसे ठेवले आहे"
    ]
    for ex in examples:
        enc = tk.encode(ex)
        dec = tk.decode(enc)
        print(f"INPUT: {ex}")
        print(f"TOKENS: {enc}")
        print(f"DECODE: {dec}")
        print('---')
