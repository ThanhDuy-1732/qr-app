# Nơi chấp cánh ước mơ — Thiết kế lại giao diện theo hướng "Bầu trời ước mơ"

- **Ngày:** 2026-11-17
- **Trạng thái:** Đã duyệt và triển khai
- **Phạm vi:** Toàn bộ giao diện trang chủ (`/`), không đổi backend

---

## 1. Ý tưởng và lý do

Trang hiện tại là một bức tường lời nhắn + hai mã QR ủng hộ, phong cách glassmorphism tím than,
animation mới ở mức "có cho vui": emoji float, fade-slide, hover nhẹ.

Người dùng muốn: **đẹp, hiện đại, sinh động, nhiều animation**, và cảm xúc khi mở trang là
**háo hức + tò mò**. Trang ra đời để mọi người ghi lại tâm tư, ước mơ của mình.

Hướng được chọn: **Bầu trời ước mơ (A)**. Lấy chính câu chuyện của trang làm hình ảnh trung tâm:
một bầu trời đêm sống, mỗi lời nhắn là một ngôi sao. Chuyển động không phải để trang trí mà để
kể chuyện: bầu trời thở, sao lấp lánh, gửi xong thì một ngôi sao mới sáng lên.

Ba hướng đã cân nhắc:

| Hướng | Cảm xúc | Đánh đổi | Kết quả |
|---|---|---|---|
| **A. Bầu trời ước mơ** | Điện ảnh, háo hức, thiêng liêng vừa đủ | Gần bản hiện tại nhất, phải làm đủ sâu để không thành "bản nâng cấp của cái cũ" | **Chọn** |
| B. Hộp thư ước mơ | Ấm, thủ công, tò mò như mở thư | Ít bùng nổ, khu QR khiêm tốn | Loại |
| C. Wish Machine | Vui, náo nhiệt, nhiều animation nhất | Dễ lấn át sự chân thành, giống landing page bán hàng | Loại |

Lý do chọn A: khớp đúng câu chuyện "ước mơ", cho phép nhiều lớp chuyển động *có ý nghĩa*,
và vẫn đủ trang trọng cho phần ủng hộ.

---

## 2. Mục tiêu

- Người mở lần đầu thấy **háo hức**, muốn cuộn xuống và muốn viết một điều gì đó.
- Giao diện **hiện đại, có bản sắc**, không giống template.
- **Nhiều animation** nhưng có hệ thống: nền → nội dung → tương tác → khoảnh khắc.
- Giữ nguyên chức năng: gửi lời nhắn, xem tường, QR MoMo/VietQR, đổi sáng/tối + màu nền.
- Chạy mượt trên điện thoại tầm trung; QR vẫn quét được trong cả hai theme.

### Không nằm trong phạm vi

- Không thêm tính năng backend: không đăng nhập, không reaction, không upload ảnh.
- Không đổi schema DB, server action vẫn lưu `name` + `message`.
- Không đổi nội dung nghiệp vụ của QR (ảnh QR giữ nguyên).
- Không thêm thư viện animation (Framer Motion, GSAP...).
- Không làm trang phụ, không i18n.

### Anti-goals (làm ra là thất bại)

- Hiệu ứng nhiều đến mức khó đọc, chóng mặt, hoặc che mất QR.
- Scroll-jacking, autoplay âm thanh, chuột bị "bắt".
- QR bị đặt trên nền tối/ảnh, hoặc bị animation phủ lên.
- Light mode bị rửa trắng, mất tương phản.
- Trang nặng thêm hàng trăm KB vì animation.

---

## 3. Người dùng và cảm xúc

- **Người gửi:** mở bằng điện thoại sau khi quét QR hoặc theo link; có thể đang xúc động,
  viết vội. Form phải rõ, dễ, không đòi hỏi danh tính.
- **Người đọc:** tò mò muốn xem người khác mong gì; cần đọc thoải mái, không bị hiệu ứng làm phiền.
- **Người ủng hộ:** cần thấy QR rõ ràng, đáng tin, thao tác nhanh.

Cảm xúc mục tiêu theo thứ tự cuộn: **choáng nhẹ (hero) → được mời gọi (form) → ấm áp (wall)**.

---

## 4. Hệ thống thiết kế

### 4.1. Màu — Dark "Deep sky" (mặc định)

| Token | Giá trị | Dùng cho |
|---|---|---|
| `--sky-0` | `#04050d` | nền trang |
| `--sky-1` | `#090b1a` | nền section |
| `--violet` | `#7c5cff` | aurora, CTA, focus |
| `--cyan` | `#22d3ee` | aurora phụ, điểm nhấn |
| `--rose` | `#f472b6` | aurora ấm, sao băng |
| `--text-1` | `#eef0ff` | tiêu đề, nội dung chính |
| `--text-2` | `#a9abc8` | mô tả, lời nhắn |
| `--text-3` | `#73769b` | metadata |
| `--glass` | `rgba(255,255,255,.045)` | card |
| `--glass-h` | `rgba(255,255,255,.075)` | card hover |
| `--line` | `rgba(255,255,255,.09)` | viền |
| `--line-h` | `rgba(255,255,255,.18)` | viền hover/focus |

### 4.2. Màu — Light "Dawn sky"

Nền kem-lavender ấm (`#f6f1ff` → `#eef8ff`), aurora mềm màu đào/cyan, chữ navy tím.
Accent đậm hơn để đủ tương phản: `#6d28d9`, `#0e7490`, `#db2777`.
Card trắng với bóng tím nhẹ. QR vẫn trên nền trắng nguyên chất.

`--custom-bg` (màu nền người dùng chọn) vẫn hoạt động: nó là màu nền cơ bản, các lớp aurora
pha loãng phía trên. Nếu độ sáng của màu tự chọn lệch khỏi theme (ví dụ chọn trắng khi đang ở
theme tối), phủ thêm một **scrim** màu nền theme ở ~65% để chữ vẫn đạt tương phản; màu preset
đã được chọn đúng cho từng theme nên không bị scrim.

### 4.3. Typography

| Vai trò | Font | Ghi chú |
|---|---|---|
| Display / UI | **Space Grotesk** | hình học, hiện đại, hợp "không gian"; có subset Vietnamese |
| Nhấn thơ | **Fraunces** (italic) | cho cụm "ước mơ" và các câu mời gọi; có subset Vietnamese |
| Body | **Inter** | đọc tốt ở cỡ nhỏ; đã dùng sẵn; có subset Vietnamese |

Tất cả qua `next/font/google`, self-host, `display: 'swap'`.
Cụm nhấn dùng gradient chữ + fallback màu đặc nếu trình duyệt không hỗ trợ `background-clip`.

Thang cỡ: hero `clamp(2.6rem, 7vw, 5.5rem)`; section title `clamp(1.4rem, 3vw, 2rem)`;
body `1rem`; metadata `.8125rem`. Line-height 1.05 cho display, 1.7 cho body.

### 4.4. Hình khối và chất liệu

- Card bo `20px` (nhỏ `12px`), viền 1px, nền glass + `backdrop-filter: blur(14px)`.
- Nút chính: pill, gradient violet → cyan, bóng màu, sheen chạy chéo.
- Nút phụ: viền mảnh, nền trong, hover sáng viền.
- QR: **thẻ trắng đục**, bo 12px, padding 12px, không glass, không gradient phía sau.
- Khoảng cách: section `clamp(4rem, 8vw, 7rem)`; container tối đa `1120px`.
- Đường nét "chòm sao": chấm nhỏ + đường mảnh nối trong hero, rất nhẹ, không tranh chữ.

---

## 5. Kiến trúc trang

```
<SkyBackdrop />            (aurora + starfield + sao băng thưa, aria-hidden)
  <header class="hero">
     ✦ (trang trí, aria-hidden) .... wish count
     kicker
     h1: Nơi chấp cánh / ước mơ (Fraunces italic, gradient)
     subtitle
     CTA chính (viết ước mơ) + CTA phụ (xem bầu trời)
     scroll cue
  </header>

  <section id="wish-form" class="panel">
     <form card>  (chính, đứng trước trong DOM)
     <support card> (QR MoMo + VietQR)
  </section>

  <section id="wish-wall">
     header: "Bầu trời hôm nay" + count
     grid lời nhắn (2 cột desktop / 1 cột mobile)
     empty state
  </section>

  <footer>
```

### 5.1. Hero

- Chiều cao mục tiêu: `min-height: 88vh` desktop, `auto` mobile; nội dung canh giữa dọc.
- Tiêu đề giữ nguyên câu chữ hiện tại: **"Nơi chấp cánh ước mơ"** — "ước mơ" xuống dòng,
  font Fraunces italic, gradient chuyển động chậm.
- Subtitle: "Mỗi lời nhắn là một ngôi sao. Viết điều bạn đang mong, cả bầu trời sẽ cùng cầu nguyện."
- CTA chính cuộn mượt tới form; CTA phụ cuộn tới wall (dùng `scrollIntoView` + `scroll-margin-top`).
- Count pill: "**N** ngôi sao đang sáng" lấy từ `messages.length`, đếm tăng dần khi vào khung hình.
- **Không phát minh brand/logo**: repo không có tên hay wordmark riêng. Góc trái chỉ là một glyph `✦`
  nhỏ, trang trí (`aria-hidden`), không phải chữ; count pill nằm bên phải. Metadata giữ nguyên
  "Nơi chấp cánh ước mơ ✨". Lý do: lặp lại h1 ở top row sẽ đọc như lỗi, còn tự đặt tên mới thì
  không đúng danh tính của trang.

### 5.2. Khu gửi lời nhắn + ủng hộ

Bố cục desktop 2 cột `1.15fr / .85fr`, mobile 1 cột **form trước, QR sau**.
(Thay đổi so với bản cũ — form là hành động chính, QR là lời mời sau khi đọc.)

**Form card**
- Tiêu đề "Gửi lời nhắn", phụ đề ngắn.
- Tên (không bắt buộc), Lời nhắn (bắt buộc, `maxLength=500`).
- Đếm ký tự trực tiếp `0/500`, đổi màu khi gần giới hạn.
- Lỗi `role="alert"`; thành công `role="status"` + hiệu ứng sao băng ngắn trong card.
- **Không tự cuộn** sau khi gửi (tránh scroll-jacking, nhất là trên mobile). Trạng thái thành công
  ở lại tại chỗ, hiện "Ngôi sao của bạn đã lên trời ✦" kèm nút **"Xem ngôi sao của bạn ↓"**.
  Bấm nút: cuộn mượt tới `#wish-wall`, gắn class `is-new` cho card đầu tiên trong 2.4s và
  chuyển focus tới heading của wall (`tabindex="-1"`). Không cần đồng bộ state giữa form và wall.
- Nút "Thả sao lên trời" — pending thì spinner + "Đang gửi...".
- Toàn bộ input `font-size: 16px` trên mobile để tránh auto-zoom iOS.

**Support card**
- Tiêu đề "Ủng hộ giấc mơ", phụ đề "Mở MoMo hoặc app ngân hàng → quét mã".
- Hai QR cạnh nhau, mỗi QR: thẻ trắng, ảnh QR, nhãn MoMo/VietQR.
- Dòng tin cậy: "Hỗ trợ tất cả ngân hàng Việt Nam".
- Hover: nhấc nhẹ + viền sáng; **không** phủ gradient/ánh sáng lên vùng QR.

### 5.3. Bức tường lời nhắn

- Tiêu đề "Bầu trời hôm nay" + badge số lượng.
- Desktop 2 cột, mobile 1 cột; thứ tự mới nhất trước (giữ nguyên query hiện tại).
- Mỗi card: avatar tròn gradient + chữ cái đầu (giữ logic hiện có), tên, thời gian, nội dung.
- Card mới nhất (index 0) có viền sáng nhẹ + một sparkle nhỏ.
- Hover (chỉ thiết bị có chuột): nâng 4px, viền sáng, avatar tỏa nhẹ.
- Empty state: ngôi sao viền mảnh đang float + "Bầu trời đang chờ ngôi sao đầu tiên."
- Không cắt bớt nội dung; `word-break` cho URL dài.

### 5.4. Footer

- Một dòng: "✦ Mỗi lời nhắn là một ngôi sao." + năm hiện tại.
- Không thêm link mạng xã hội (không có trong phạm vi).

### 5.5. Bảng tùy chỉnh giao diện

Giữ nguyên tính năng, làm lại hình thức:
- FAB tròn phát sáng nhẹ, icon `✦` (thay emoji 🎨), có trạng thái mở.
- Panel glass, cùng ngôn ngữ với card; vẫn đóng bằng click ngoài / Escape.
- Giữ: Sáng/Tối, 6 màu nền preset, màu tùy chỉnh, nút đặt lại.
- **Thêm:** công tắc "Giảm chuyển động" (mặc định theo `prefers-reduced-motion`),
  lưu localStorage `reduceMotion`; bật thì đặt `data-motion="reduced"` trên `<html>`.

---

## 6. Hệ thống chuyển động

Bốn tầng, mỗi tầng có vai trò riêng. Tổng số hiệu ứng nhìn thấy cùng lúc trong một khung hình
được giữ ở mức thấp.

### Tầng 1 — Nền sống (luôn chạy, rất chậm)

| Hiệu ứng | Cách làm | Thời lượng |
|---|---|---|
| Aurora trôi | 3 khối `radial-gradient` mềm, animate `transform` + `scale` | 26s / 34s / 42s, alternate |
| Sao lấp lánh | 2 lớp `background-image` chấm, animate `opacity` | 5s / 7s |
| Sao băng thưa | 1 phần tử, vệt gradient, `translate` chéo, nghỉ dài | 11s chu kỳ, chỉ desktop |
| Hạt sáng theo chuột | 1 radial-gradient 420px bám con trỏ, lerp bằng rAF | chỉ `(pointer:fine)` |

Aurora **không dùng `filter: blur()`** — dùng gradient có stop mềm để tránh tốn GPU trên mobile.

### Tầng 2 — Vào trang (một lần)

- Hero: kicker → h1 → sub → CTA, stagger 90ms, `translateY(18px)` + opacity, 700ms.
- Section: IntersectionObserver thêm `.is-visible`, 500ms, `translateY(24px)`.
- Card trong wall: stagger 60ms, tối đa 6 card đầu; card sau hiện ngay.

### Tầng 3 — Tương tác

- Card hover: nâng 4px + viền sáng + avatar pulse, 220ms.
- Nút: nhấc 2px, sheen chạy 4s/lần; active lún xuống.
- Input focus: viền gradient + glow 3px, label sáng lên.
- QR hover: nhấc 4px, viền sáng — QR giữ nguyên độ tương phản.
- Theme đổi: transition màu 350ms, không animate layout.

### Tầng 4 — Khoảnh khắc

- Gửi thành công: một vệt sao băng chạy ngang card form (1.1s), rồi badge thành công
  "Ngôi sao của bạn đã lên trời ✦" + nút "Xem ngôi sao của bạn ↓"; nút submit trở lại bình thường.
- Ngôi sao mới: **chỉ khi người dùng bấm "Xem ngôi sao của bạn"**, card đầu tiên trong wall nhận
  class `is-new` (viền sáng + sparkle 2.4s) để hiệu ứng không bị trôi mất khi wall còn dưới màn hình.
- Count-up: số sao đếm tăng dần 1.2s khi trang tải xong (một lần).

Để phát lại hiệu ứng mỗi lần gửi, `ActionState` thêm `at?: number` (timestamp) khi thành công.

### Giới hạn và fallback

- Mọi animation chỉ dùng `transform`, `opacity`, `background-position` (và màu khi đổi theme).
- `@media (prefers-reduced-motion: reduce)` và `[data-motion="reduced"]`: tắt aurora, twinkle,
  sao băng, cursor glow, count-up; reveal hiện ngay; hover chỉ đổi màu.
- Không animation nào là điều kiện để hiểu nội dung.

---

## 7. Accessibility

- Tương phản: text-1 trên nền ≥ 12:1; text-2 ≥ 6:1; text-3 ≥ 4.5:1; kiểm tra cả light theme.
  Cam kết này áp dụng cho theme và các màu preset; màu tự chọn lạ được scrim tự động (mục 4.2)
  bảo vệ thay vì chặn người dùng.
- `:focus-visible` rõ ràng (2px cyan + offset 3px) cho mọi control.
- Skip link "Bỏ qua đến lời nhắn" (ẩn đến khi focus).
- Toàn bộ nền động là `aria-hidden`, `pointer-events: none`.
- Form: label thật, lỗi `role="alert"`, thành công `role="status"`.
- QR: alt mô tả ("Mã QR MoMo nhận tiền"), kích thước hiển thị ≥ 160px, vùng trắng yên tĩnh.
- Nút tối thiểu 44×44px trên mobile.
- Panel tùy chỉnh: `aria-expanded`, đóng bằng Escape, không bẫy focus (không phải modal).

## 8. Hiệu năng

- Không thêm dependency; CSS + IntersectionObserver + một rAF cho cursor.
- Font self-host qua `next/font`; chỉ load 3 family, subset `vietnamese` + `latin`.
- Starfield bằng gradient, không tạo hàng trăm DOM node.
- `will-change` chỉ đặt trên aurora/cursor và gỡ khi không cần.
- Trên mobile: tắt cursor glow và sao băng nền; giảm số lớp aurora từ 3 → 2; **bỏ
  `backdrop-filter`**, card dùng nền gần đặc (alpha ~0.09 trên nền tối) để giữ cảm giác kính
  mà không nướng GPU. Desktop giữ blur 14px.
- Mục tiêu: không có layout shift khi font load; animation 60fps trên iPhone 11 / Pixel 4a.

---

## 9. Kỹ thuật

### File thay đổi

| File | Việc |
|---|---|
| `app/layout.tsx` | nạp Space Grotesk + Fraunces + Inter; giữ script chống FOUC; metadata |
| `app/globals.css` | **viết lại toàn bộ** theo token + section; xoá CSS cũ không dùng |
| `app/page.tsx` | cấu trúc mới: backdrop, hero, panel, wall, footer; tính count |
| `app/components/MessageForm.tsx` | style mới, đếm ký tự, trạng thái thành công có hiệu ứng |
| `app/components/MessageList.tsx` | card mới, 2 cột, badge `is-new`, empty state |
| `app/components/ThemeProvider.tsx` | thêm `reduceMotion` + `setReduceMotion`, ghi `data-motion` |
| `app/components/ThemeControls.tsx` | UI mới, thêm công tắc giảm chuyển động |
| `app/components/Reveal.tsx` | **mới** — client wrapper dùng IntersectionObserver |
| `app/components/SkyCursor.tsx` | **mới** — client, cursor glow + kiểm tra pointer/reduced motion |
| `app/components/CountUp.tsx` | **mới** — client, đếm số sao khi vào khung hình, tôn trọng reduced motion |
| `app/actions.ts` | `ActionState` thêm `at?: number` khi thành công |
| `app/lib/messages.ts` | không đổi |

### Cách làm CSS

Giữ một `globals.css` duy nhất (đúng pattern hiện tại), chia khối rõ ràng:
tokens → reset/base → utility → backdrop → hero → panel → form → support/QR → wall →
theme panel → responsive → reduced motion. Không dùng Tailwind, không thêm CSS-in-JS.

### Component boundaries

- `page.tsx` vẫn là server component, gọi `getMessages()`.
- Client component: `MessageForm` (đã có), `Reveal` (mới), `SkyCursor` (mới), `CountUp` (mới),
  `ThemeControls`/`ThemeProvider` (đã có). `MessageList` vẫn server; hiệu ứng `is-new` do
  `MessageForm` gắn trực tiếp vào card đầu tiên khi người dùng bấm xem, không cần state chung.
- `Reveal` nhận `children` từ server component — không kéo dữ liệu xuống client.

---

## 10. Rủi ro và cách xử lý

| Rủi ro | Cách xử lý |
|---|---|
| Quá nhiều hiệu ứng → rối | Chỉ 1 "khoảnh khắc" mỗi lần gửi; nền rất chậm; chữ không nhấp nháy |
| Aurora + blur làm nóng máy | Không animate `filter`; gradient mềm; giảm lớp trên mobile |
| Chữ gradient mất tương phản | Luôn có `color` fallback; test light/dark; gradient đủ đậm |
| QR khó quét | Thẻ trắng đục, không overlay, không animate bên trong ảnh |
| Light mode bị nhạt | Token riêng cho light, không chỉ đảo màu; kiểm tra tương phản |
| Font Việt thiếu dấu | Đã xác nhận cả 3 family có subset `vietnamese` trong `next/font` |
| Gửi lặp không phát lại hiệu ứng | `ActionState.at` timestamp làm key cho hiệu ứng |

---

## 11. Tiêu chí thành công

- Mở trang: trong 3 giây đầu thấy được bầu trời chuyển động, tiêu đề, và lời mời viết.
- Gửi thành công: có phản hồi rõ + hiệu ứng sao băng; lời nhắn mới xuất hiện đầu wall và có
  lối "Xem ngôi sao của bạn" rõ ràng.
- QR quét được trên điện thoại thật, cả light và dark.
- Đổi sáng/tối/màu nền vẫn hoạt động, không FOUC.
- Bật "Giảm chuyển động"/OS reduced motion: trang tĩnh, vẫn đẹp và dùng được.
- `npm run build` và `npm run lint` pass; không có layout shift đáng kể.

---

## 12. Quyết định đã chốt sau vòng review

Bốn điểm reviewer nêu, tôi chốt như sau (bạn có thể bác khi đọc):

1. **Không auto-scroll sau khi gửi.** Giữ người dùng ở form, thêm nút "Xem ngôi sao của bạn"
   để họ chủ động cuộn; tránh scroll-jacking và không cần đồng bộ state form ↔ wall.
2. **Không phát minh brand.** Hero chỉ có glyph `✦` trang trí + count pill; h1 vẫn là danh tính
   duy nhất của trang.
3. **Mobile bỏ glass blur.** Card gần đặc, giữ nguyên bố cục và màu; desktop giữ glass.
   Ưu tiên 60fps hơn chất liệu blur.
4. **Màu nền tự chọn vẫn tự do**, nhưng scrim tự động theo độ sáng bảo vệ tương phản; preset
   không bị đổi màu. Cam kết tương phản ở mục 7 áp dụng cho theme/preset, màu lạ được bảo vệ
   bằng scrim.

## 13. Việc để builder tự quyết

- Vị trí chính xác của các ngôi sao, số lượng chấm, góc sao băng.
- Bo góc, khoảng đệm cụ thể trong khoảng đã nêu.
- Có dùng thêm đường nối chòm sao ở hero hay không (nếu làm loãng chữ thì bỏ).
- Microcopy ở các nhãn phụ, miễn giữ nguyên ý và giọng.
- Có giữ badge "Hỗ trợ tất cả ngân hàng Việt Nam" hay thay bằng câu ngắn hơn.
