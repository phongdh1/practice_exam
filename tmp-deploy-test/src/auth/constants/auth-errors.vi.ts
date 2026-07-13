export const AUTH_ERRORS_VI = {
  INVALID_CREDENTIALS: "Email hoặc mật khẩu không đúng. Vui lòng thử lại.",
  EMAIL_ALREADY_REGISTERED: "Email này đã được đăng ký. Vui lòng đăng nhập.",
  WEAK_PASSWORD: "Mật khẩu phải có ít nhất 8 ký tự.",
  INVALID_EMAIL: "Email không hợp lệ.",
  ACCOUNT_SUSPENDED: "Tài khoản đã bị tạm khóa. Vui lòng liên hệ hỗ trợ.",
  INVALID_REFRESH_TOKEN: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
  GOOGLE_AUTH_FAILED: "Không thể đăng nhập Google. Thử lại.",
  ZALO_AUTH_FAILED: "Không thể đăng nhập Zalo. Thử lại.",
  IDENTITY_ALREADY_LINKED: "Tài khoản này đã được liên kết với người dùng khác.",
  PROVIDER_ALREADY_LINKED: "Bạn đã liên kết nhà cung cấp này rồi.",
  UNAUTHORIZED: "Bạn cần đăng nhập để thực hiện thao tác này.",
} as const;

export type AuthErrorCode = keyof typeof AUTH_ERRORS_VI;
