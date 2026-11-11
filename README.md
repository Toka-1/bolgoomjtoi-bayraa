# Болгоомжтой Баяраа

The game has **30 playable levels**: the original 19 plus 11 new activities.

The new levels cover a bicycle helmet, stair handrails, sidewalk walking, knives,
irons, hot kettles, broken glass, button batteries, plastic bags, medicine and
ovens. Helmet and sidewalk levels use dragging; stairs use a sustained hold;
household hazards reward asking the adult for help. Each has its own scene,
safety card, teacher question, failure vignette and animated safe-action lesson.

Scored rounds begin immediately at 1.35× speed (about 3.7 seconds), with stronger
mechanics from the first round. Speed increases every three wins, capped at 2.3×.
After a failure and its animated lesson, Continue advances to another available
level while lives remain. Three lost lives end the run. The shuffled bag visits
all eligible levels before refilling and avoids immediate repeats when possible.

Practice uses portrait previews of the actual gameplay scenes, not lesson art.
Its in-level scene, hearts, timer, level number, difficulty dots and hazard cues
share the scored-play layout. A small Mongolian badge identifies practice.
Each level has its own focused camera and panel height. Object tasks use close
views with less empty scenery; traffic and route levels retain the context they
need. The timer follows the panel, and short-level titles sit above it. Practice
previews use the same camera. Pointer coordinates are transformed back to scene
coordinates, preserving touch dragging and right-click pickup/drop after zooming.
Outdoor scenes have matching city, courtyard, park, steppe, snowy or riverbank
backgrounds in play, practice previews, lessons and failure animations. Distant
buildings, hills, trees, fences and pavement stay behind the interactive objects.
Practice has five-second rounds at normal movement speed, no lost lives, no score
or card rewards, and retries the selected activity after a failure explanation.
A practice win returns to the level selection. Neither mode overlays gold
answer highlights; the safe-action lessons remain available after mistakes.

The card collection contains all 30 safety cards. Saved progress
ignores retired cards in current totals. Outfit thresholds are 0, 3, 6, 10, 20 and 30
cards, so every outfit is reachable. Locked outfit swatches preview their appearance
and requirement without changing the selected outfit. Teacher mode filters only
the home, street, countryside and summer topics and can enable reading quizzes.

After a mistake, replay the animated safe action with the circular arrow or
continue with the forward arrow after the demonstration finishes. Lessons wait
until continued. They work without reading; Mongolian narration is available
when the device provides a suitable voice. Reduced-motion mode shows static
celebrations and completed safety demonstrations.
Before the lesson, a 3.4-second consequence shows the mistake, physical reaction
and aftermath. Falls finish, the river avatar sinks beneath the water with bubbles,
burns cause a protected hand or foot, glass causes a limp, smoke causes coughing,
and ingestion hazards cause sickness or breathing distress. Electrical reactions
are reserved for electrical hazards. The eleven added levels have their own
failure choreography; none uses the generic worried-character fallback. All
consequences remain non-graphic, and reduced motion shows the final outcome.

## Controls

Touch or mouse: tap on green at the crossing, drag the hat onto the head, and tap
the opposite half of the screen to balance on ice. Right-click picks up/drops the
hat; held arrow keys can move a selected hat. Enter and Space do not select it.
Cross with Space, Up or Enter. Balance with Left/Right. Escape cancels a held
gesture, or returns home when nothing is held. Losing focus clears held input.

## Development

Use Node.js 24 or newer.

```sh
npm install
npm run dev
npm test
npm run build
npm run preview
```

Development links: `?g=0` through `?g=29` select a level.
The practice menu has ten pages of three portrait gameplay previews; the
card collection has four pages. Touch and keyboard can reach every level.
`?screen=cards|topics|quiz` opens the corresponding review screen.

Scene proportions keep characters, vehicles, furniture and backgrounds at
consistent relative scales. All 30 levels are included in the run, practice selection and collections.
The eleven newest scenes use quieter scenery, clearer hazard silhouettes and a
single compact stop cue beside each danger. Hot objects show heat; the sidewalk
has a distinct curb and vehicle. Stair holds must touch the visible handrail.
Tests cover input ownership, outcomes, failure progression, lessons, proportions,
thirty-level roster, saved progress, reward reachability and preview isolation.

Safety references for the new lessons: [CDC bicycle helmets](https://www.cdc.gov/heads-up/safety/), [AAP home safety](https://www.healthychildren.org/English/safety-prevention/at-home/Pages/Home-Safety-Heres-How.aspx), [Nationwide Children?s stair safety](https://www.nationwidechildrens.org/research/areas-of-research/center-for-injury-research-and-policy/injury-topics/home-safety/stair-safety), [NHTSA pedestrian safety](https://www.nhtsa.gov/road-safety/pedestrian-safety), [NFPA hot objects](https://www.nfpa.org/downloadable-resources/lesson-plans/stay-away-from-hot-things-lesson-plan), and [children?s kitchen safety](https://www.nationwidechildrens.org/family-resources-education/700childrens/2018/04/kitchen-readiness-tips-to-keep-your-child-safe).
