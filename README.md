# Болгоомжтой Баяраа

## Controls

Touch: tap the window, tap the side opposite Bayraa's lean to keep balance on ice,
drag the hat/baby into place, hold to brake for cattle, and tap only when the
pedestrian light turns green. In the socket game, wait without touching. The 🏠
button in the HUD returns to the title screen.

Keyboard: Enter or Space starts/restarts the game, starts a practice round and continues
a failure screen. Open the window by clicking or tapping it; use Left/Right to keep
balance on ice. For the hat and baby, right-click the object to pick up, move the mouse,
then right-click again to drop. Touch and left-button dragging also work. Hold Space or
Down to brake. At the crossing, press Space/Up/Enter on green. In the socket game, wait
without pressing Enter/Space. Escape cancels a held gesture; with nothing held it returns
to the title screen.

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

Dev горимд `?g=0` … `?g=5` гэж нэмбэл тухайн мини тоглоом руу шууд орно.

## Онцлог

- **10 мини тоглоом**: Гэрт, Хотод, Хөдөө, Зун гэсэн 4 сэдэвтэй. Шинэ тоглоом анх гарахад дадлагын горим ажиллана.
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
