# src/ascii_vibe/governance.py
from dataclasses import dataclass

@dataclass
class Governors:
    mode: str = "reasoning"          # reasoning | execution
    ascii_only: bool = False         # force ASCII-safe output
    qc_footer: bool = True           # append QC footer by default
    seed: str = "auto"               # deterministic tag, surfaced in footer

    @classmethod
    def from_args(cls, args):
        return cls(
            mode=args.mode,
            ascii_only=args.ascii_only or (args.mode == "execution"),
            qc_footer=not args.no_qc,
            seed=args.seed or "auto",
        )

    def effective_style_pack(self, requested: str) -> str:
        if self.ascii_only:
            return "minimal_ascii"
        return requested