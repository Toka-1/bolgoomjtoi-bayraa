---
name: game-developer
description: Build and improve playable games in existing projects, including mechanics, levels, controls, visual feedback, and game-specific testing. Use for game development requests rather than ordinary website changes.
---

# Game Developer

Work from the project's existing engine, scene structure, art style, and input model. Trace how a round starts, receives input, resolves, and resets before changing gameplay. Deliver playable changes rather than design proposals unless the user requests design only.

For each mechanic, establish the player's action, visible affordance, success condition, failure condition, and retry behavior. Keep hit areas aligned with rendered objects and account for viewport scaling. Judge avatar size, reach, ground contact, occlusion, and object placement together so interactions make spatial sense.

Keep simulation updates independent of rendering. Ensure outcomes resolve once, retries reset transient state, and canceling input or losing focus cannot leave a drag or key held. Preserve supported touch, mouse, and keyboard behavior when changing one input path.

Integrate new levels with the actual game loop and relevant practice menus, progression, lessons, and collections. Inspect for fixed counts, page limits, and labels that overflow when the roster grows. Avoid adding unrelated systems just because a new level could support them.

For child audiences, make the intended action legible through objects, animation, scale, and feedback at the intended reading ability. In safety games, reward the safe behavior and make failed attempts understandable without requiring graphic injury. Verify real-world safety advice with authoritative sources when adding or changing that advice.

Test meaningful success, failure, timeout, cancellation, and retry paths affected by the change. Use an actual rendered preview to assess visual geometry and affordances when available; distinguish automated checks from visual checks in the final report. Run the project's required build checks.

When working on Dumb Ways to Die Mongolia / Bolgoomjtoi Bayraa, read [the project preferences](references/bayraa.md). These preferences apply to that game only; current user instructions take precedence.
