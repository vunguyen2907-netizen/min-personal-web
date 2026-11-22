/**
 * GOOGLE APPS SCRIPT — UPLOAD ẢNH TỪ ADMIN CMS LÊN GOOGLE DRIVE
 *
 * Cách triển khai (2 phút):
 * 1. Truy cập https://script.google.com/ -> Dự án mới (New project).
 * 2. Xóa code mặc định, dán toàn bộ file này vào và lưu lại.
 * 3. (Tùy chọn) Tạo 1 thư mục trên Google Drive (VD: "Website_Media"), copy ID thư mục
 *    trên thanh URL (sau /folders/) rồi điền vào FOLDER_ID bên dưới. Để trống sẽ lưu ở Drive gốc.
 * 4. Bấm Triển khai (Deploy) -> Tùy chọn triển khai mới (New deployment) -> Chọn loại: Ứng dụng web (Web app):
 *    - Thực thi dưới tư cách (Execute as): Tôi (Me - vunguyen2907@gmail.com)
 *    - Ai có quyền truy cập (Who has access): Bất kỳ ai (Anyone)
 * 5. Cấp quyền Google Drive -> Copy URL Web App (dạng https://script.google.com/macros/s/.../exec)
 * 6. Dán URL đó vào trang Admin CMS -> tab "Hồ sơ & Mạng xã hội" -> ô "Google Drive Upload Webhook".
 */

const FOLDER_ID = ''; // Để trống sẽ tự tạo thư mục "VuTitan_Web_Media" trong Google Drive của bạn
const DEFAULT_FOLDER_NAME = 'VuTitan_Web_Media';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    if (!data || !data.base64 || !data.fileName) {
      return jsonResponse({ error: 'Thiếu dữ liệu ảnh (base64 / fileName).' });
    }

    const mimeType = data.mimeType || 'image/jpeg';
    const bytes = Utilities.base64Decode(data.base64);
    const blob = Utilities.newBlob(bytes, mimeType, data.fileName);

    const folder = getTargetFolder();
    const file = folder.createFile(blob);

    // Bật quyền xem công khai cho ảnh để hiển thị trên website
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    const fileId = file.getId();
    const directUrl = 'https://lh3.googleusercontent.com/d/' + fileId + '=w1600';

    return jsonResponse({
      success: true,
      fileId: fileId,
      url: directUrl,
      driveLink: file.getUrl()
    });
  } catch (err) {
    return jsonResponse({ error: err.message || String(err) });
  }
}

function getTargetFolder() {
  if (FOLDER_ID) {
    return DriveApp.getFolderById(FOLDER_ID);
  }
  const folders = DriveApp.getFoldersByName(DEFAULT_FOLDER_NAME);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(DEFAULT_FOLDER_NAME);
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
