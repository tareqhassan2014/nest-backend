import { Module, forwardRef } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { ChannelModuleBase } from "./base/channel.module.base";
import { ChannelService } from "./channel.service";
import { ChannelController } from "./channel.controller";

@Module({
  imports: [ChannelModuleBase, forwardRef(() => AuthModule)],
  controllers: [ChannelController],
  providers: [ChannelService],
  exports: [ChannelService],
})
export class ChannelModule {}
