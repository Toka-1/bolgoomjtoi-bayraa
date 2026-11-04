# Болгоомжтой Баяраа

## Controls

Touch: tap the window, tap a lane to avoid ice, drag the hat/baby into place,
and hold to brake for cattle. In the socket game, wait without touching.

Keyboard: Enter or Space starts/restarts the game and continues a failure screen.
Open the window by clicking or tapping it; use Left/Right to change lanes. For the hat
and baby, right-click the object to pick up, move the mouse, then right-click
again to drop. Touch and left-button dragging also work. Hold Space or Down to brake. In the socket game,
wait without pressing Enter/Space. Escape cancels a held gesture.

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

## Бүтэц

- `src/core/`: canvas, зурах туслахууд, дуу, санамсаргүй тоо
- `src/art/`: Баяраа, гэр, үхэр, машин, зуух, байгалийн зураг
- `src/games/`: мини тоглоом бүр тусдаа файлд (`types.ts` дахь `Micro` интерфэйсийг хэрэгжүүлнэ)
- `src/ui/screens.ts`: эхлэл, HUD, үр дүн, дууссан дэлгэц
- `src/flow.ts`: тоглоомын урсгал (оноо, амь, хурд)

Шинэ мини тоглоом нэмэх: `src/games/` дотор `Micro`-г хэрэгжүүлсэн класс бичээд `src/games/index.ts`-д нэм.
