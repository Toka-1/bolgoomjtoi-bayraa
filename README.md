# Болгоомжтой Баяраа

Normal rounds start immediately without written instructions or an intro screen.
The important object or safe action has a bright gold-and-white outline, without
directional arrows or moving trails. Red lights and electrical hazards use a stop
hand pictogram. Reduced-motion mode keeps the highlights static.
The separate ДАДЛАГА button on the title opens
a picture menu for all 16 games. Choose any round to practise without losing
lives, gaining points or unlocking cards. A win returns to the practice menu;
after a failure explanation, Continue retries the same practice round.

After a mistake, replay the animated safety demonstration with the circular
arrow or continue with the forward arrow after it finishes. Lessons stay on screen
until continued. The collection cards show the same picture lessons; text remains
as support for an adult. Reduced-motion mode shows the completed safe action.

Read-aloud starts automatically when the device provides a Mongolian speech voice
and sound is enabled. Picture lessons also work without speech or sound.
The default children's game skips the reading quiz. Starting through teacher mode
retains the text questions for adult-led play.

## Controls

Touch: tap the door to leave the room in the smoke level, tap the side opposite Bayraa's lean to keep balance on ice,
drag the hat/baby into place, hold to brake for cattle, and tap only when the
pedestrian light turns green. In the socket game, leave objects out of the socket.
Picking up or moving the fork/key away is safe; inserting its tip causes a shock.
The 🏠
button in the HUD returns to the title screen.

Keyboard: Enter or Space starts/restarts the game, selects a practice round and continues
a failure screen. Leave the room by clicking or tapping its door; use Left/Right to keep
balance on ice. For the hat and baby, right-click the object to pick up, move the mouse,
then right-click again to drop. Touch and left-button dragging also work. Hold Space or
Down to brake. At the crossing, press Space/Up/Enter on green. The socket game also
supports touch dragging and right-click pickup/drop; Enter/Space do not insert anything.
Escape cancels a held gesture; with nothing held it returns
to the title screen.

At the river, tap the dry bank or press Left to lead the child away from the water.
Entering the river loses; there is no swimming or repeated-tap rescue mechanic.
Use the separate practice menu to learn the updated smoke and river games.

Only one pointer controls a gesture. Losing focus, hiding the tab, or cancelling
a touch clears held controls without submitting a drop.

Run `npm test` for gameplay/result separation and input regression checks
(Node.js 24+). Run `npm run build` for type checking and the production build.

Монгол амьдралын аюулгүй байдлын тухай утсан дээр тоглох жижиг тоглоомууд.

## Ажиллуулах

```sh
npm install
npm run dev        # http://localhost:5173 (утаснаасаа Network хаягаар нь нээж болно)
npm run build      # dist/ хавтас руу статик хувилбар гаргана
npm run preview    # build хийсэн хувилбарыг шалгах
```

Dev горимд `?g=0` … `?g=15` гэж нэмбэл тухайн мини тоглоом руу шууд орно.

## Онцлог

- **16 мини тоглоом**: Гэрт, Хотод, Хөдөө, Зун гэсэн 4 сэдэвтэй. Дадлагыг нүүр хуудасны тусдаа товчоор сонгоно.
- **Аюулгүй байдлын карт**: үе бүрийг анх давахад карт нээгдэнэ (нүүр хуудас → КАРТУУД). Карт цуглуулж Баяраагийн дээлийг сольдог (3, 6, 10 карт).
- **Тоглолтын төгсгөлийн асуулт**: амь дуусахад тоглосон үеүдээс 3 асуулт; зөв хариулт бүр +1 оноо.
- **Багшийн горим**: нүүр хуудас → БАГШ, тоглуулах сэдвээ сонгоно. Сонголт хадгалагдана.
- **Дуу**: Web Audio-оор үүсгэсэн хөгжим, дуу (файлгүй). 🔊 товчоор унтраана. Төхөөрөмжид монгол дуу хоолой байвал зөвлөгөөг уншиж өгнө.
- **PWA**: `npm run build`-ийн дараа утасны нүүр дэлгэцэнд суулгаж, интернетгүй тоглох боломжтой (service worker зөвхөн production дээр).

Dev горимд: `?g=N` (N-р тоглоом), `&t=секунд` (урагш гүйлгэх), `&perf` (кадрын хугацаа), `?screen=cards|topics|quiz`.

## Бүтэц

- `src/core/`: canvas, зурах туслахууд, дуу, санамсаргүй тоо
- `src/art/`: Баяраа, гэр, үхэр, машин, зуух, байгалийн зураг
- `src/games/`: мини тоглоом бүр тусдаа файлд (`types.ts` дахь `Micro` интерфэйсийг хэрэгжүүлнэ)
- `src/ui/screens.ts`: эхлэл, HUD, үр дүн, дууссан дэлгэц
- `src/flow.ts`: тоглоомын урсгал (оноо, амь, хурд, асуулт)
- `src/meta/`: карт, сэдэв, асуултын өгөгдөл (`content.ts`) ба хадгалалт (`progress.ts`)
- `src/ui/meta.ts`: картууд, багшийн горим, асуултын дэлгэц
- `public/`: PWA manifest, service worker, дүрсүүд

Шинэ мини тоглоом нэмэх: `src/games/` дотор `Micro`-г хэрэгжүүлсэн класс бичээд `src/games/index.ts`-д нэм.
