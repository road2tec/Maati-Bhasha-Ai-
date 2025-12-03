
import time
import random
from pathlib import Path

CHECKPOINT_DIR = Path(__file__).parent / "checkpoints"
CHECKPOINT_DIR.mkdir(exist_ok=True)


def simulate_training(epochs: int = 5, base_loss: float = 1.0):
    loss = base_loss
    for epoch in range(1, epochs + 1):
        time.sleep(0.25)
        # deterministic-ish decay
        loss *= 0.85
        print(f"Epoch {epoch}/{epochs} - loss: {loss:.4f}")
    ckpt_path = CHECKPOINT_DIR / f"demo_ckpt_{int(time.time())}.ckpt"
    ckpt_path.write_text("This is a demo checkpoint. Not a real model.")
    print(f"Wrote demo checkpoint: {ckpt_path}")
    return ckpt_path


if __name__ == '__main__':
    simulate_training(epochs=4)
