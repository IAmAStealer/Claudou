---
name: pet-preview
description: Show a Claudou pet sprite (or a new draft) to the owner before committing it - a PNG sheet of every pose on a dark and a light background, and its rows as text. Use whenever a crab is drawn or changed.
---

The owner reviews every new or changed sprite before it's committed, and usually asks for tweaks or sends a
reference image. Never commit a sprite they haven't seen.

Style the owner validated (check every draft against it before showing it):
- Exaggerate the 1-2 signature features, even if unrealistic (a giant claw, big eyes, horns); shrink the rest.
- Simple shapes, no noise: 2 legs per side, clean diagonals or arches, no checkerboards. A prop can carry the
  idea when the shape can't (the coconut crab holds a coconut).
- Not flat: 3 shades per main color (lit top, base, shadowed edges), a few speckles, a shine on hard parts, a
  glint in the eyes.
- Colors from the owner's reference photos: ask for photos before drawing.
- Eyes greyish (#3a3f44, #c8cdd0), framed by the body; no other marks that read as eyes or a face.
- Readable on dark and light screens: light parts get a darker edge, dark parts a lighter rim.

1. Sprites are JSON like Bashou's (`palette`, `base` rows of letters, `poses` that paint over `base` with `-`
   meaning "keep"). Draw the draft in the scratchpad first, not in `plugin/pets/`.
2. Render the sheet: `python3 tools/sprite_sheet.py <out.png> <sprite.json> [more.json…]`. It draws base,
   inhale, closed, left, right and fidget, on a dark and a light background.
3. Look at the PNG yourself (Read it) before showing it: readable on both backgrounds, no lone stray pixels,
   the pose changes visible, the crab recognisable from its real look (check Wikipedia facts for its family:
   claw sizes, eye stalks, legs, colors).
4. Give the owner the PNG path, and say in one line per pose what changes. Ask for references when the
   shape isn't right after one round.
5. Once validated: copy it to `plugin/pets/`, run the tests, commit (subject: "The <Crab> has a new look, …").
