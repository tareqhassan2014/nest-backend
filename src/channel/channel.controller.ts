import * as common from "@nestjs/common";
import * as swagger from "@nestjs/swagger";
import * as nestAccessControl from "nest-access-control";
import { ChannelService } from "./channel.service";
import { ChannelControllerBase } from "./base/channel.controller.base";

@swagger.ApiTags("channels")
@common.Controller("channels")
export class ChannelController extends ChannelControllerBase {
  constructor(
    protected readonly service: ChannelService,
    @nestAccessControl.InjectRolesBuilder()
    protected readonly rolesBuilder: nestAccessControl.RolesBuilder
  ) {
    super(service, rolesBuilder);
  }
}
