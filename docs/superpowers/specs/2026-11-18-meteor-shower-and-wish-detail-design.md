# Mưa sao băng + không gian đọc lời nhắn

- **Ngày:** 2026-11-18
- **Trạng thái:** Đã duyệt (theo proposal trong hội thoại)
- **Mở rộng từ:** `2026-11-17-wish-sky-redesign-design.md`

## Ý tưởng

Biến hai khoảnh khắc thành trải nghiệm có chủ đích:

1. Bấm **"Xem bầu trời"** → một trận mưa sao băng ngắn phủ màn hình, rồi trang glide xuống bức tường.
2. Mỗi lời nhắn là một "lá thư từ bầu trời": card đẹp hơn, và khi chạm vào sẽ có starburst tại điểm chạm rồi mở một không gian đọc lớn.

## Hành vi

### Mưa sao băng

- Chỉ gắn với nút "Xem bầu trời" ở hero (không gắn với CTA gửi lời nhắn).
- Overlay `position: fixed; inset: 0; z-index: 60; pointer-events: none`, 26 vệt trên desktop / 14 trên mobile, mỗi vệt dài 90–200px, bay chéo 45° trong 1.3–2.2s, delay ngẫu nhiên 0–600ms, cộng một bloom tím mờ.
- Trang cuộn mượt tới `#wish-wall` ngay khi bắt đầu; focus heading của wall (`tabIndex=-1`) để screen reader biết đã tới nơi.
- Overlay tự xoá sau 2.4s; bấm lại trong lúc đang chạy sẽ reset.
- Giảm chuyển động: không render overlay; cuộn tức thời.

### Card lời nhắn

- Card là một `<button>` trong `<li>`; toàn bộ card click được, có `aria-haspopup="dialog"` và nhãn "Mở lời nhắn của …".
- Mỗi card có accent riêng lấy từ `getAvatarColor(id)`: dấu nháy kép lớn, đường gradient mảnh trên đỉnh, glow góc trên phải, ring quanh avatar.
- Nội dung clamp 4 dòng; cuối card có gợi ý "Đọc lời nhắn ↗".
- Hover (chỉ thiết bị có chuột): nhấc 4px, viền sáng theo accent, avatar glow; focus ring dùng chung.
- Stagger hiện tại chuyển từ card sang `li` để hover không bị delay.

### Modal đọc lời nhắn

- Click card → starburst 6 tia tại toạ độ chạm (bàn phím dùng tâm card), rồi modal mở qua portal tới `document.body`.
- Panel tối đa 600px, cao tối đa 82dvh, cuộn được; nền có starfield nhẹ, dấu nháy kép Fraunces, lời nhắn cỡ lớn, tác giả + thời gian, một vệt sao băng chạy qua khi mở.
- Đóng bằng nút ✕, `Escape`, hoặc click backdrop; focus trả về card đã mở; Tab bị giữ trong dialog.
- Khoá scroll trang khi mở (`html.wish-modal-open`), có `scrollbar-gutter: stable` để không giật layout.
- Footer có "Gửi ước mơ của bạn ↗": đóng modal, cuộn tới form và focus ô tên.
- `role="dialog"`, `aria-modal="true"`, `aria-labelledby` (tên tác giả), `aria-describedby` (nội dung).
- Giảm chuyển động: không starburst, không animation mở; nội dung vẫn đọc được.

## Không nằm trong phạm vi

- Không thêm like/reaction, không sửa DB, không API mới.
- Không thêm dependency animation; chỉ CSS + React state.
- Không đổi nội dung/QR/theme đã có.

## Kỹ thuật

| File | Việc |
|---|---|
| `app/components/SkyCta.tsx` | **mới** — client link cho "Xem bầu trời", meteor overlay, scroll + focus |
| `app/components/MessageList.tsx` | chuyển thành client; card button, starburst, modal, focus trap |
| `app/page.tsx` | dùng `SkyCta` cho nút ghost |
| `app/globals.css` | meteor, card mới, modal, burst; reduced-motion; scrollbar-gutter |
| `app/lib/avatar.ts` | không đổi |

- `color-mix()` cho accent-soft, luôn có `background` fallback phía trước.
- Meteor/burst chỉ render sau tương tác client → không có hydration mismatch.
- Không đổi `ActionState`, `MessageForm`, DB.

## Kiểm chứng

- `npm run build`, `npm run lint`, `npm test` (10 test hiện có).
- Browser 1440 + 390:
  - click "Xem bầu trời" → overlay có ≥14 meteor, scroll tới wall, overlay biến mất sau ~2.4s;
  - reduced-motion → không overlay, scroll tức thời;
  - click card → modal mở, focus vào nút đóng, Escape đóng và focus về card, Tab không thoát dialog, body không scroll;
  - card clamp 4 dòng, accent khác nhau, không tràn ngang ở 390;
  - không lỗi console.
