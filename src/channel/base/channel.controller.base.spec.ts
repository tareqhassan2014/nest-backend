import { Test } from "@nestjs/testing";
import {
  INestApplication,
  HttpStatus,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import request from "supertest";
import { ACGuard } from "nest-access-control";
import { DefaultAuthGuard } from "../../auth/defaultAuth.guard";
import { ACLModule } from "../../auth/acl.module";
import { AclFilterResponseInterceptor } from "../../interceptors/aclFilterResponse.interceptor";
import { AclValidateRequestInterceptor } from "../../interceptors/aclValidateRequest.interceptor";
import { map } from "rxjs";
import { ChannelController } from "../channel.controller";
import { ChannelService } from "../channel.service";

const nonExistingId = "nonExistingId";
const existingId = "existingId";
const CREATE_INPUT = {
  avgVideoRevenue: 42.42,
  avgViewCount: 42,
  channelCategory: "exampleChannelCategory",
  channelCreationDate: new Date(),
  createdAt: new Date(),
  description: "exampleDescription",
  id: "exampleId",
  isMonetizationEnabled: "true",
  location: "exampleLocation",
  playlistId: "examplePlaylistId",
  rpm: 42.42,
  title: "exampleTitle",
  totalViewCount: 42242424,
  updatedAt: new Date(),
  username: "exampleUsername",
  videoCount: 42,
  ytChannelId: "exampleYtChannelId",
};
const CREATE_RESULT = {
  avgVideoRevenue: 42.42,
  avgViewCount: 42,
  channelCategory: "exampleChannelCategory",
  channelCreationDate: new Date(),
  createdAt: new Date(),
  description: "exampleDescription",
  id: "exampleId",
  isMonetizationEnabled: "true",
  location: "exampleLocation",
  playlistId: "examplePlaylistId",
  rpm: 42.42,
  title: "exampleTitle",
  totalViewCount: 42242424,
  updatedAt: new Date(),
  username: "exampleUsername",
  videoCount: 42,
  ytChannelId: "exampleYtChannelId",
};
const FIND_MANY_RESULT = [
  {
    avgVideoRevenue: 42.42,
    avgViewCount: 42,
    channelCategory: "exampleChannelCategory",
    channelCreationDate: new Date(),
    createdAt: new Date(),
    description: "exampleDescription",
    id: "exampleId",
    isMonetizationEnabled: "true",
    location: "exampleLocation",
    playlistId: "examplePlaylistId",
    rpm: 42.42,
    title: "exampleTitle",
    totalViewCount: 42242424,
    updatedAt: new Date(),
    username: "exampleUsername",
    videoCount: 42,
    ytChannelId: "exampleYtChannelId",
  },
];
const FIND_ONE_RESULT = {
  avgVideoRevenue: 42.42,
  avgViewCount: 42,
  channelCategory: "exampleChannelCategory",
  channelCreationDate: new Date(),
  createdAt: new Date(),
  description: "exampleDescription",
  id: "exampleId",
  isMonetizationEnabled: "true",
  location: "exampleLocation",
  playlistId: "examplePlaylistId",
  rpm: 42.42,
  title: "exampleTitle",
  totalViewCount: 42242424,
  updatedAt: new Date(),
  username: "exampleUsername",
  videoCount: 42,
  ytChannelId: "exampleYtChannelId",
};

const service = {
  createChannel() {
    return CREATE_RESULT;
  },
  channels: () => FIND_MANY_RESULT,
  channel: ({ where }: { where: { id: string } }) => {
    switch (where.id) {
      case existingId:
        return FIND_ONE_RESULT;
      case nonExistingId:
        return null;
    }
  },
};

const basicAuthGuard = {
  canActivate: (context: ExecutionContext) => {
    const argumentHost = context.switchToHttp();
    const request = argumentHost.getRequest();
    request.user = {
      roles: ["user"],
    };
    return true;
  },
};

const acGuard = {
  canActivate: () => {
    return true;
  },
};

const aclFilterResponseInterceptor = {
  intercept: (context: ExecutionContext, next: CallHandler) => {
    return next.handle().pipe(
      map((data) => {
        return data;
      })
    );
  },
};
const aclValidateRequestInterceptor = {
  intercept: (context: ExecutionContext, next: CallHandler) => {
    return next.handle();
  },
};

describe("Channel", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: ChannelService,
          useValue: service,
        },
      ],
      controllers: [ChannelController],
      imports: [ACLModule],
    })
      .overrideGuard(DefaultAuthGuard)
      .useValue(basicAuthGuard)
      .overrideGuard(ACGuard)
      .useValue(acGuard)
      .overrideInterceptor(AclFilterResponseInterceptor)
      .useValue(aclFilterResponseInterceptor)
      .overrideInterceptor(AclValidateRequestInterceptor)
      .useValue(aclValidateRequestInterceptor)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  test("POST /channels", async () => {
    await request(app.getHttpServer())
      .post("/channels")
      .send(CREATE_INPUT)
      .expect(HttpStatus.CREATED)
      .expect({
        ...CREATE_RESULT,
        channelCreationDate: CREATE_RESULT.channelCreationDate.toISOString(),
        createdAt: CREATE_RESULT.createdAt.toISOString(),
        updatedAt: CREATE_RESULT.updatedAt.toISOString(),
      });
  });

  test("GET /channels", async () => {
    await request(app.getHttpServer())
      .get("/channels")
      .expect(HttpStatus.OK)
      .expect([
        {
          ...FIND_MANY_RESULT[0],
          channelCreationDate:
            FIND_MANY_RESULT[0].channelCreationDate.toISOString(),
          createdAt: FIND_MANY_RESULT[0].createdAt.toISOString(),
          updatedAt: FIND_MANY_RESULT[0].updatedAt.toISOString(),
        },
      ]);
  });

  test("GET /channels/:id non existing", async () => {
    await request(app.getHttpServer())
      .get(`${"/channels"}/${nonExistingId}`)
      .expect(HttpStatus.NOT_FOUND)
      .expect({
        statusCode: HttpStatus.NOT_FOUND,
        message: `No resource was found for {"${"id"}":"${nonExistingId}"}`,
        error: "Not Found",
      });
  });

  test("GET /channels/:id existing", async () => {
    await request(app.getHttpServer())
      .get(`${"/channels"}/${existingId}`)
      .expect(HttpStatus.OK)
      .expect({
        ...FIND_ONE_RESULT,
        channelCreationDate: FIND_ONE_RESULT.channelCreationDate.toISOString(),
        createdAt: FIND_ONE_RESULT.createdAt.toISOString(),
        updatedAt: FIND_ONE_RESULT.updatedAt.toISOString(),
      });
  });

  test("POST /channels existing resource", async () => {
    const agent = request(app.getHttpServer());
    await agent
      .post("/channels")
      .send(CREATE_INPUT)
      .expect(HttpStatus.CREATED)
      .expect({
        ...CREATE_RESULT,
        channelCreationDate: CREATE_RESULT.channelCreationDate.toISOString(),
        createdAt: CREATE_RESULT.createdAt.toISOString(),
        updatedAt: CREATE_RESULT.updatedAt.toISOString(),
      })
      .then(function () {
        agent
          .post("/channels")
          .send(CREATE_INPUT)
          .expect(HttpStatus.CONFLICT)
          .expect({
            statusCode: HttpStatus.CONFLICT,
          });
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
