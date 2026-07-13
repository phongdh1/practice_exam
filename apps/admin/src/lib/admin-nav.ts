import type { AdminNavItem, AdminSettingsSubNav, AdminSidebarProps } from "@practice-exam/ui";

export function resolveAdminSidebar(pathname: string): Pick<
  AdminSidebarProps,
  "active" | "settingsSubActive" | "paymentsHref" | "contentHref"
> {
  if (pathname.startsWith("/settings/admin-users")) {
    return { active: "settings", settingsSubActive: "admin-users" as AdminSettingsSubNav };
  }
  if (pathname.startsWith("/settings/system")) {
    return { active: "settings", settingsSubActive: "system" as AdminSettingsSubNav };
  }
  if (pathname.startsWith("/settings")) {
    return { active: "settings", settingsSubActive: "rbac" as AdminSettingsSubNav };
  }
  if (pathname.startsWith("/integrations")) {
    return { active: "payments", paymentsHref: "/integrations/payments" };
  }
  if (pathname.startsWith("/payments")) {
    return { active: "payments" };
  }
  if (pathname.startsWith("/users")) {
    return { active: "users" };
  }
  if (
    pathname.startsWith("/questions") ||
    pathname.startsWith("/review") ||
    pathname.startsWith("/flags")
  ) {
    return { active: "content", contentHref: "/questions" };
  }
  if (pathname.startsWith("/subjects") || pathname.startsWith("/courses")) {
    return { active: "catalog" };
  }

  return { active: "dashboard" as AdminNavItem };
}

export type AdminTopHeader = {
  title: string;
  subtitle?: string;
};

/** Resolve sticky top-bar page title/subtitle from the current pathname. */
export function resolveAdminTopHeader(pathname: string): AdminTopHeader | null {
  if (pathname === "/") {
    return {
      title: "Tổng quan hệ thống (A-10)",
      subtitle: "Chào mừng trở lại. Đây là tình trạng vận hành hiện tại.",
    };
  }

  if (pathname === "/questions/new") {
    return {
      title: "Tạo câu hỏi",
      subtitle: "A-31 — Biên tập nội dung câu hỏi cho ngân hàng đề.",
    };
  }
  if (pathname === "/questions/import") {
    return {
      title: "Import hàng loạt",
      subtitle: "A-33 — Tải lên Excel (.xlsx), tối đa 500 dòng mỗi batch.",
    };
  }
  if (/^\/questions\/[^/]+\/edit$/.test(pathname)) {
    return {
      title: "Sửa câu hỏi",
      subtitle: "A-31 — Biên tập nội dung câu hỏi.",
    };
  }
  if (/^\/questions\/[^/]+\/preview$/.test(pathname)) {
    return {
      title: "Xem trước câu hỏi",
      subtitle: "A-32 — Hiển thị giống Practice Mode cho thí sinh.",
    };
  }
  if (pathname === "/questions") {
    return {
      title: "Ngân hàng câu hỏi",
      subtitle: "Quản lý và biên tập nội dung các câu hỏi chứng chỉ (A-30).",
    };
  }

  if (/^\/review\/[^/]+$/.test(pathname)) {
    return {
      title: "Chi tiết duyệt",
      subtitle: "A-41 — Phê duyệt hoặc từ chối câu hỏi.",
    };
  }
  if (pathname === "/review") {
    return {
      title: "Hàng đợi biên tập",
      subtitle: "A-40 — Câu hỏi chờ duyệt.",
    };
  }

  if (pathname === "/flags") {
    return {
      title: "Báo cáo từ thí sinh",
      subtitle: "A-42 — Hàng đợi câu hỏi bị gắn cờ.",
    };
  }

  if (pathname === "/subjects/new") {
    return {
      title: "Tạo môn học",
      subtitle: "Course là bắt buộc; pricing vẫn ở cấp môn học.",
    };
  }
  if (/^\/subjects\/[^/]+$/.test(pathname)) {
    return {
      title: "Sửa môn học",
      subtitle: "Course bắt buộc; go-live gate vẫn tính trên môn học.",
    };
  }
  if (pathname === "/subjects") {
    return {
      title: "Môn học",
      subtitle: "Mỗi môn thuộc đúng một Course; giá, free tier và go-live gate vẫn ở cấp môn.",
    };
  }

  if (pathname === "/courses/new") {
    return {
      title: "Tạo khóa học",
      subtitle: "Course chỉ dùng để nhóm catalog, không có giá bán.",
    };
  }
  if (/^\/courses\/[^/]+$/.test(pathname)) {
    return {
      title: "Sửa khóa học",
      subtitle: "Course là lớp nhóm catalog phía trên môn học.",
    };
  }
  if (pathname === "/courses") {
    return {
      title: "Khóa học",
      subtitle: "Nhóm danh mục cấp Course; thanh toán và quyền truy cập vẫn ở cấp môn học.",
    };
  }

  if (/^\/users\/[^/]+$/.test(pathname)) {
    return {
      title: "Hồ sơ người dùng",
      subtitle: "A-61",
    };
  }
  if (pathname === "/users") {
    return {
      title: "Tìm kiếm người dùng",
      subtitle: "Tìm theo email, SĐT (externalId), Zalo ID hoặc User ID (A-60).",
    };
  }

  if (pathname === "/payments/reconciliation") {
    return {
      title: "Đối soát provider",
      subtitle: "A-71 — Tổng hợp theo ngày (ICT), mặc định 7 ngày gần nhất.",
    };
  }
  if (pathname === "/payments/revenue") {
    return {
      title: "Báo cáo doanh thu",
      subtitle: "A-73 — Theo môn học và kênh (web/Zalo), chỉ giao dịch đã thanh toán (đã trừ hoàn tiền).",
    };
  }
  if (pathname === "/payments/promo-codes") {
    return {
      title: "Mã khuyến mãi",
      subtitle: "A-74 — Tạo và quản lý mã giảm giá tại checkout.",
    };
  }
  if (pathname === "/payments") {
    return {
      title: "Nhật ký giao dịch",
      subtitle: "A-70 — Theo dõi thanh toán PayOS/SePay và liên kết gói đăng ký.",
    };
  }

  if (pathname === "/integrations/webhooks") {
    return {
      title: "A-83 — Webhook event log",
      subtitle: "Zalo OAuth và payment webhooks — lưu 90 ngày, retry thủ công khi thất bại.",
    };
  }
  if (pathname === "/integrations/payments") {
    return {
      title: "A-81 — Payment providers",
      subtitle: "Cấu hình PayOS / SePay merchant và test webhook (Super Admin).",
    };
  }
  if (pathname === "/integrations/zalo") {
    return {
      title: "A-80 — Zalo Mini App",
      subtitle: "Cấu hình App ID, secret và trạng thái triển khai (Super Admin).",
    };
  }

  if (pathname === "/settings/admin-users") {
    return {
      title: "Quản lý admin (A-91)",
      subtitle: "Tạo, vô hiệu hóa và gán vai trò cho tài khoản back-office.",
    };
  }
  if (pathname === "/settings/system") {
    return {
      title: "Cài đặt hệ thống (A-90)",
      subtitle: "Disclaimer, chế độ bảo trì, mẫu email và nội dung trang chủ.",
    };
  }
  if (pathname === "/settings/rbac" || pathname === "/settings") {
    return {
      title: "Ma trận phân quyền (A-92)",
      subtitle: "Tham chiếu read-only theo PRD — API thực thi RBAC trên mọi endpoint.",
    };
  }

  return null;
}
