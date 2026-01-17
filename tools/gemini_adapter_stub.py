
import time
from typing import Iterator, Dict, Any


def generate(prompt: str, max_tokens: int = 64, temperature: float = 0.0) -> Dict[str, Any]:
    # deterministic pseudo-response
    text = f"[GeminiStub] Response for prompt length={len(prompt)}"
    return {
        "id": "g-stub-001",
        "object": "text_completion",
        "choices": [
            {"text": text, "index": 0, "finish_reason": "length"}
        ],
        "usage": {"prompt_tokens": len(prompt.split()), "completion_tokens": min(max_tokens, 8)}
    }


def stream_generate(prompt: str, pieces: int = 4, delay: float = 0.12) -> Iterator[str]:
    # yield incremental pieces to simulate streaming LLM output
    base = generate(prompt)
    full = base['choices'][0]['text']
    # break into pieces
    step = max(1, len(full) // pieces)
    for i in range(0, len(full), step):
        chunk = full[i:i+step]
        yield chunk
        time.sleep(delay)


if __name__ == '__main__':
    p = "नमस्ते, आज बात करें"
    print('Synchronous call:')
    resp = generate(p)
    print(resp['choices'][0]['text'])
    print('\nStreaming call:')
    for part in stream_generate(p):
        print(part, end='', flush=True)
    print('\n')
