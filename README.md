# BetweenUs

Web app kỷ niệm cho đúng hai người. Tagline: *Những gì chỉ có giữa chúng mình.*

Chi tiết product, route, và quy ước nằm trong [CLAUDE.md](./CLAUDE.md).

## Chạy local

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000).

1. **Tạo chỗ** (`/login?mode=create`) — người thứ nhất.
2. Copy mã / link từ onboarding hoặc **Us → Just us**.
3. Cửa sổ ẩn danh: `/join/MA` — người thứ hai.
4. Đăng ảnh, nhật ký hai phía, thư, mood, date idea.

## Stack

Next.js, TypeScript, Tailwind, Prisma, SQLite. Ảnh lưu `data/uploads`, chỉ tải khi đã login cùng space.
