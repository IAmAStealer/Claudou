"""python3 tools/import_bashou.py [~/Bashou]: copies Bashou's pixel art into plugin/pets/bashou.json.

Bashou (github.com/IAmAStealer/Bashou, MIT, same author) draws its pets in the same 17x12 format as Claudou's
crabs. Claudou keeps a copy: its starters other than the crab are Bashou's starter lines, and a player who also
plays Bashou can show the Bashou pets they unlocked. Rerun after Bashou gains or changes a sprite, then
tools/sprites_ts.py.
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "plugin/pets/bashou.json"


def export(bashou_root):
    sys.path.insert(0, str(bashou_root))
    from bashou import creatures                                                # noqa: E402 (Bashou's own code)
    french = json.loads((bashou_root / "bashou/locales/fr.json").read_text())
    both = lambda text: {"en": text, "fr": french.get(text, text)}             # noqa: E731
    pets = {}
    for pet_id, pet in sorted(creatures.PETS.items()):
        raw = json.loads((bashou_root / f"bashou/pets/{pet_id}.json").read_text())
        pets[pet_id] = {"name": both(pet.name), "palette": raw["palette"], "base": raw["base"], "poses": raw["poses"]}
    families = {}
    for family in sorted(creatures.FAMILIES.values(), key=lambda f: f.order):
        families[family.id] = {"forms": list(creatures.chain(family.first)), "starter": bool(family.starter),
                               "blurb": both(family.blurb)}
    return {"_source": "Bashou (MIT), tools/import_bashou.py", "pets": pets, "families": families}


if __name__ == "__main__":
    source = Path(sys.argv[1] if len(sys.argv) > 1 else Path.home() / "Bashou").expanduser().resolve()
    OUT.write_text(json.dumps(export(source), ensure_ascii=False, indent=1) + "\n")
    print(f"{OUT.relative_to(ROOT)}: from {source}")
