/**
 * Helper trích xuất thông báo lỗi chi tiết, thân thiện từ phản hồi API Backend (ABP Framework / ASP.NET Core)
 */
export function trichXuatThongBaoLoi(err: unknown, fallback: string = 'Có lỗi xảy ra, vui lòng thử lại!'): string {
  if (!err) {
    return fallback;
  }

  const httpErr = err as {
    status?: number;
    statusText?: string;
    error?: {
      error?: {
        code?: string;
        message?: string;
        details?: string;
        validationErrors?: Array<{ message?: string; members?: string[] }>;
      };
      message?: string;
    } | string;
    message?: string;
  };

  // 1. Kiểm tra lỗi mất kết nối máy chủ / Backend chưa chạy (Status = 0)
  if (httpErr.status === 0) {
    return 'Không thể kết nối đến máy chủ Backend (Port 44351). Vui lòng kiểm tra xem Backend ASP.NET Core đã được khởi chạy chưa!';
  }

  // 2. Kiểm tra lỗi 401 Unauthorized (Chưa đăng nhập / Token hết hạn)
  if (httpErr.status === 401) {
    return 'Phiên đăng nhập đã hết hạn hoặc bạn chưa đăng nhập (401 Unauthorized). Vui lòng đăng nhập lại tài khoản Admin!';
  }

  // 3. Kiểm tra lỗi 403 Forbidden (Không đủ quyền)
  if (httpErr.status === 403) {
    return 'Tài khoản của bạn không có quyền thực hiện thao tác này (403 Forbidden - Thiếu quyền hạn)!';
  }

  // 4. Lỗi từ ABP Framework
  if (typeof httpErr.error === 'object' && httpErr.error !== null) {
    const abpError = httpErr.error.error;

    // 4a. Chi tiết lỗi Validation (Từng trường bị lỗi do Form / Model DTO)
    if (abpError?.validationErrors && Array.isArray(abpError.validationErrors) && abpError.validationErrors.length > 0) {
      const danhSachLoi = abpError.validationErrors
        .map(v => v.message)
        .filter(Boolean)
        .join('; ');
      if (danhSachLoi) {
        return `Dữ liệu không hợp lệ: ${danhSachLoi}`;
      }
    }

    // 4b. Lỗi BusinessException / UserFriendlyException từ ABP
    if (abpError?.message) {
      if (abpError.details) {
        return `${abpError.message} (${abpError.details})`;
      }
      return abpError.message;
    }

    // 4c. Lỗi cấp HTTP message
    if (httpErr.error.message) {
      return httpErr.error.message;
    }
  }

  // 5. Chuỗi lỗi nguyên bản
  if (typeof httpErr.error === 'string' && httpErr.error.trim().length > 0) {
    return httpErr.error;
  }

  // 6. Lỗi JS Exception
  if (httpErr.message) {
    return httpErr.message;
  }

  return fallback;
}

