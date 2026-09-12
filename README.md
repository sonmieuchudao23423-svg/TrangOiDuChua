# 🌕 BẠN GÓP GÌ CHO VẦNG TRĂNG?

> **Tự tay tạo một mảnh nhỏ. Cùng mọi người tạo nên một điều thật lớn.**  
> Hoạt động cộng đồng Tết Trung Thu 2026 — Bầy Tiên Sa

---

## 🌟 Ý Tưởng Cốt Lõi
Toàn bộ website xoay quanh câu hỏi: **"BẠN GÓP GÌ CHO VẦNG TRĂNG?"**
Mỗi người tham gia (các em Sói con, phụ huynh, anh chị huynh trưởng, cộng đồng) sẽ nhận một mảnh trăng còn trống, tự tay sáng tạo (vẽ tranh, dán sticker, viết lời chúc) và gửi lên để ghép vào **Vầng Trăng Chung** gồm 400 mảnh ghép, cùng nhau thắp sáng đêm hội Trung Thu viên mãn.

---

## 🚀 Cách Chạy Dự Án Cực Nhanh

### 1. Khởi động cả Frontend & Backend
Tại thư mục gốc của dự án:
```bash
npm run dev
```

- **Giao diện người dùng (Client):** [http://localhost:5173](http://localhost:5173)
- **API Máy chủ (Backend):** [http://localhost:5001](http://localhost:5001)

### 2. Các lệnh hữu ích khác
```bash
# Khởi tạo lại 400 mảnh và dữ liệu mẫu:
npm run seed

# Biên dịch kiểm tra production (cả client và server):
npm run build
```

---

## 🛠️ Công Nghệ Sử Dụng
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti.
- **Backend:** Node.js, Express, TypeScript, Prisma ORM (SQLite local / PostgreSQL ready).
- **Xử lý ảnh:** Sharp (tự động resize và tạo thumbnail WebP siêu nhẹ).
- **Concurrency & Khóa:** Atomic lock 15 phút chống xung đột mảnh ghép.

---

## 📂 Các Tính Năng Đã Hoàn Thành
1. **Trang Chủ (`/`):** Vầng trăng tròn 400 mảnh tương tác cao, thanh tiến độ cộng đồng theo thời gian thực, nút kêu gọi hành động.
2. **Vầng Trăng Toàn Cảnh (`/vang-trang`):** Công cụ phóng to, thu nhỏ, di chuột xem chi tiết từng mảnh ghép và lời chúc.
3. **Trình Sáng Tạo Mảnh Trăng (`/dong-gop`):**
   - Vẽ cọ nét mượt, tẩy, thanh chỉnh kích cỡ, bảng 12 màu Trung Thu ấm áp.
   - Bộ 12+ sticker vector độc quyền (Thỏ ngọc, Lồng đèn ông sao, Sói con Bầy Tiên Sa, Bánh trung thu, Đầu lân, Mây ngũ sắc,...).
   - Chèn lời chúc chữ nghệ thuật.
   - Chế độ **Tạo Nhanh (Quick Create)** cho các bạn nhỏ.
   - Tự động lưu nháp (`localStorage`) phòng ngừa mất nét vẽ khi tải lại trang.
4. **Trải Nghiệm Gửi & Tải Thẻ Lưu Niệm:** Pháo hoa chúc mừng, tạo thẻ lưu niệm kỹ thuật số kèm thông tin đóng góp có thể tải về máy.
5. **Phòng Trưng Bày (`/gallery`):** Triển lãm các tấm thiệp lời chúc của mọi người, có thanh tìm kiếm thông minh.
6. **Bảng Quản Trị (`/admin`):** Thống kê số mảnh, kiểm duyệt nội dung, mở khóa mảnh ghép khi cần.
