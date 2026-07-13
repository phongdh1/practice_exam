import { Module, forwardRef } from "@nestjs/common";
import { AdminAuthModule } from "../admin-auth/admin-auth.module";
import { AuthModule } from "../auth/auth.module";
import {
  PaymentsAdminController,
  PromoCodesAdminController,
} from "./payments-admin.controller";
import { PaymentsAdminService } from "./payments-admin.service";

@Module({
  imports: [AdminAuthModule, forwardRef(() => AuthModule)],
  controllers: [PaymentsAdminController, PromoCodesAdminController],
  providers: [PaymentsAdminService],
  exports: [PaymentsAdminService],
})
export class PaymentsAdminModule {}
