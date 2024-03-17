import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ChannelServiceBase } from "./base/channel.service.base";

@Injectable()
export class ChannelService extends ChannelServiceBase {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }
}
