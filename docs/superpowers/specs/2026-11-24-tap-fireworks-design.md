# Chạm để nổ pháo hoa + sao băng

- **Ngày:** 2026-11-24
- **Trạng thái:** Đã duyệt (2026-11-24)
- **Demo đã chốt:** pháo hoa **và** sao băng, **140 tia** mỗi lần chạm

## Ý tưởng

Mỗi cú chạm/click trên trang sinh một chùm pháo hoa ngay tại điểm chạm, kèm một vệt
sao băng rơi chéo xuống. Kéo để cuộn trang thì không tính. Đây là lớp trang trí
phủ lên nội dung, không đổi bố cục, không chặn thao tác.

## Hành vi

### Pháo hoa

- **140 tia** mỗi lần chạm, giữ nguyên trên mobile (không giảm số như các hiệu ứng cũ).
- Ba nhóm tia: tia chính (70%), than hồng chậm/to (16%), tia mảnh bay xa (14%).
- Trọng lực + drag, đuôi tia dài theo vận tốc (~85ms), lõi trắng loé lên rồi tắt nhanh,
  ~7% tia có hình ngôi sao bốn cánh.
- Bảng màu theo theme tại thời điểm chạm:
  - Tối: tím / lam / hồng / vàng + trắng, blend `lighter`.
  - Sáng: tím đậm / teal / rose / amber, blend `source-over` để không chìm vào nền.

### Sao băng

- Một vệt xuất phát từ điểm chạm, chéo xuống phải 24–46°, nhanh 620–880 px/s,
  đuôi 90–175px, sống 0.72–1.0s, kèm bụi sáng rơi lại.
- Delay 60ms sau chùm pháo để hai hiệu ứng không chồng khít lên nhau.

### Nhận diện cú chạm (điểm quan trọng)

- Chỉ tính khi `pointerup` cách `pointerdown` **≤ 12px** và **≤ 800ms**.
- Huỷ khi: `pointercancel`, trang scroll, multi-touch (ngón thứ hai), kéo chuột,
  hoặc pointer không phải chuột trái / không phải touch chính.
- Giữ ngón lâu (> 800ms) coi như long-press (lưu ảnh QR), không nổ.
- Không `preventDefault` — link, nút, form, QR hoạt động y như cũ.

### Giảm chuyển động

- `[data-motion="reduced"]` → không vẽ gì, không gắn hiệu ứng.
- Nếu đang có hạt bay mà người dùng bật công tắc giảm chuyển động: xoá canvas ngay.

### Hiệu năng & an toàn

- Một `<canvas>` phủ toàn trang: `position: fixed; inset: 0; z-index: 60;
  pointer-events: none; aria-hidden="true"`.
- Canvas nằm dưới theme panel (9999) và modal (10000), trên nội dung trang.
- Trần ~1.400 hạt; chạm dồn dập thì bỏ bớt hạt mới, không xoá hạt đang bay.
- `devicePixelRatio` tối đa 2; rAF tự dừng khi không còn hạt và tự khởi động lại
  ở lần chạm sau.
- Theme đổi giữa chừng: hạt đang bay giữ màu cũ; lần chạm sau dùng bảng màu mới.

## Không nằm trong phạm vi

- Không âm thanh, không lưu lịch sử chạm, không thống kê.
- Không thay đổi mưa sao băng của "Xem bầu trời", starburst trong card lời nhắn,
  hay burst sau khi gửi lời nhắn.
- Không thêm dependency animation.
- Không hiệu ứng khi kích hoạt bằng bàn phím (Enter/Space trên nút) — hiệu ứng chỉ
  dành cho pointer.

## Cách làm

1. **CSS/DOM particle** (giống meteor hiện tại): dễ khớp codebase nhưng 140 tia ×
   nhiều lần chạm = hàng trăm node cập nhật mỗi frame, khó làm vật lý/trọng lực.
   **Loại.**
2. **Canvas 2D overlay**: một canvas, vẽ bằng rAF, tự dừng, `pointer-events: none`,
   chi phí thấp và kiểm soát chuyển động chính xác. **Chọn.**
3. **Thư viện** (`canvas-confetti`, `fireworks-js`): thêm dependency, khó chỉnh đúng
   sao băng + bảng màu + luật chạm của app. **Loại.**

## Kỹ thuật

| File | Việc |
|---|---|
| `app/components/TapFireworks.tsx` | **mới** — canvas, nhận diện chạm, palette, vòng lặp vẽ |
| `app/lib/tap-gesture.ts` | **mới** — hàm thuần `isTapGesture(...)` để test |
| `app/lib/tap-gesture.test.ts` | **mới** — test ngưỡng 12px / 800ms / multi-touch |
| `app/layout.tsx` | mount `<TapFireworks />` sau `<SkyBackdrop />` |
| `app/globals.css` | thêm `.tap-fx` cho canvas; không thêm keyframes |

- `'use client'`, particle nằm trong biến closure/ref — **không dùng React state**
  cho từng hạt để tránh re-render.
- Đọc `data-motion` và `data-theme` từ `document.documentElement` tại thời điểm chạm;
  dùng `useTheme()` để biết khi công tắc giảm chuyển động đổi.
- Cleanup: gỡ listener, `cancelAnimationFrame`, `clearRect` khi unmount.
- Không đụng `ActionState`, DB, `MessageForm`, `SkyCta`, `MessageList`.

## Kiểm chứng

- `npm test`, `npm run lint`, `npm run build`.
- Browser 1440 + 390 (dev server):
  - click vào hero, nút, chữ, tấm QR → pháo hoa + sao băng đúng điểm chạm;
  - kéo để cuộn → không nổ, trang vẫn cuộn;
  - touch tap nhanh → nổ; touch giữ lâu → không nổ;
  - bật giảm chuyển động → không nổ, hiệu ứng đang bay biến mất;
  - theme sáng → tia vẫn rõ; mở modal lời nhắn → hiệu ứng nằm dưới modal;
  - chạm liên tục 10 lần → không tụt fps rõ rệt, canvas tự dừng khi hết hạt;
  - không lỗi console, không tràn ngang ở 390.
