# Mô Phỏng Nha Khoa

Game mô phỏng phòng khám nha khoa: bạn là bác sĩ Răng Hàm Mặt vừa mở phòng khám đầu tiên. Đón bệnh nhân, hỏi bệnh, khám, lập bệnh án, điều trị đúng quy trình, kê đơn an toàn, rồi dùng tiền để nhập vật tư, mua thiết bị và mở rộng phòng khám. **Version 0.3.0**. Game là một phần của dự án [Ôn Luyện Nha Khoa](https://github.com/tunaasieunhat/on-luyen-nha-khoa).

| | Link |
| --- | --- |
| **Chơi trên web** (máy tính, iPhone, Android; chơi offline sau lần mở đầu) | https://tunaasieunhat.github.io/mo-phong-nha-khoa/ |
| **App Android** (toàn màn hình, chạy offline) | [MoPhongNhaKhoa.apk](https://github.com/tunaasieunhat/mo-phong-nha-khoa/releases/latest/download/MoPhongNhaKhoa.apk) |

Game thiết kế cho **màn hình ngang**. Phát hiện lỗi hay nội dung chuyên môn chưa đúng: liên hệ tunaasieunhat@gmail.com.

## Tính năng

- **Phòng khám nhìn từ trên xuống** kiểu game nông trại: bệnh nhân đến quầy lễ tân, ngồi chờ, lên ghế; kéo để di chuyển, chụm hoặc cuộn để phóng to.
- **5 ca bệnh** mở dần theo cấp: sâu răng (trám composite), viêm lợi (lấy cao răng), viêm tủy (điều trị tủy), răng lung lay do viêm quanh răng (nhổ răng), răng khôn mọc lệch (phẫu thuật).
- **Hỏi bệnh có giới hạn lượt:** 7 lượt (thêm 1 lượt với phụ nữ 18–45 tuổi), có câu hỏi gây nhiễu.
- **Khám bằng dụng cụ:** gương có kính lúp, thám trâm phải giữ và rê (lỗ sâu thì mắc, rãnh nhiễm màu thì trượt), thử lạnh có đồng hồ và răng đối chứng, đo túi, gõ, lung lay, X-quang, Panorama, đo huyết áp. Tự ghi **sơ đồ răng**.
- **Bệnh án** đầy đủ: lý do khám, tóm tắt bệnh sử, tiền sử, chẩn đoán, kế hoạch, gây tê, lưu ý theo bệnh toàn thân.
- **Điều trị từng bước** bằng thao tác rê, chạm, giữ, kéo; kê đơn và dặn dò; chấm điểm 7 phần (100 điểm, 1–3 sao).
- **Thư viện phác đồ:** 7 chủ đề, có hình minh họa, quy trình, bài tự kiểm tra và tài liệu tham khảo.
- **Quản lý phòng khám:** vật tư, thiết bị, ghế, bác sĩ cộng sự, trang trí, ngân hàng (vay có lãi), báo cáo lãi lỗ cuối ngày. Mỗi ca tốn thời gian ghế và vật tư.
- **Hướng dẫn tân thủ** 13 bước, thu gọn hoặc tắt được; luyện tập từng ca không tốn tiền.

## Cấu trúc thư mục

```
index.html             Bản web (trang chính GitHub Pages), được ghép từ src/
manifest.json, sw.js   Cài như ứng dụng và lưu để chơi offline
icon-*.png, og.png     Biểu tượng và ảnh chia sẻ
src/                   Mã nguồn: a_head.html (giao diện, CSS) và các file .js; chạy src/build.sh để tạo lại index.html
android/               App Android viết bằng Kotlin (gói sẵn game, không cần trình duyệt)
.github/workflows/     Tự build APK mỗi khi index.html hoặc android/ thay đổi
```

## Sửa game

1. Sửa file trong `src/`.
2. Chạy `bash src/build.sh` để tạo lại `index.html`.
3. Tăng số `CACHE` trong `sw.js` để máy người chơi tải bản mới; muốn phát hành APK mới thì tăng `VERSION_CODE` trong `android/version.properties`.

## Bật trang web miễn phí (GitHub Pages)

1. Vào **Settings → Pages**.
2. Ở **Build and deployment**, chọn **Source: Deploy from a branch**.
3. Chọn nhánh **main**, thư mục **/ (root)**, bấm **Save**.
4. Đợi 1–2 phút, game chạy ở https://tunaasieunhat.github.io/mo-phong-nha-khoa/

## App Android

- Mỗi lần đẩy thay đổi lên, GitHub Actions tự build APK. Có khóa ký thì APK được đăng lên **Releases**; app trên máy tự báo khi có bản mới.
- Khóa ký đặt trong **Settings → Secrets and variables → Actions**:
  - `ANDROID_KEYSTORE_B64`: nội dung file khóa dạng base64 (file `ANDROID_KEYSTORE_B64.txt` tạo riêng cho game này).
  - `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`: chỉ cần khi dùng khóa khác với khóa mặc định.
- Chưa có khóa thì workflow chỉ build thử; file APK tải được ở mục **Artifacts** của lần chạy đó.

## Ghi chú

- Tiến trình chơi lưu trong trình duyệt (hoặc trong app) trên từng máy.
- Nội dung chuyên môn soạn để học trong game, tham khảo Hướng dẫn chẩn đoán và điều trị một số bệnh Răng Hàm Mặt (Bộ Y tế, QĐ 3108/QĐ-BYT, 2015), Hướng dẫn quy trình kỹ thuật RHM (QĐ 3634/QĐ-BYT, 2025) và khuyến cáo quốc tế (AAE, ADA). Không thay thế giáo trình và chỉ định của bác sĩ. Bệnh nhân và tình huống đều là giả định.
