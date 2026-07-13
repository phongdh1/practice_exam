import { Body, Controller, Post, ValidationPipe } from "@nestjs/common";
import { AdminAuthService } from "./admin-auth.service";
import { AdminLoginDto } from "./dto/admin-login.dto";

@Controller("admin/auth")
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Post("login")
  login(@Body(new ValidationPipe({ whitelist: true })) dto: AdminLoginDto) {
    return this.adminAuthService.login(dto.username, dto.password);
  }
}
