import { Controller, Get, INestApplication, StreamableFile } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { ApiEnvelopeInterceptor } from "./api-envelope.interceptor";

@Controller("envelope-test")
class EnvelopeTestController {
  @Get("json")
  getJson() {
    return { status: "ok" };
  }

  @Get("file")
  getFile() {
    return new StreamableFile(Buffer.from([0x50, 0x4b, 0x03, 0x04]), {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      disposition: 'attachment; filename="test.xlsx"',
    });
  }
}

describe("ApiEnvelopeInterceptor", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [EnvelopeTestController],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalInterceptors(new ApiEnvelopeInterceptor());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("wraps JSON responses in { data }", async () => {
    const res = await request(app.getHttpServer()).get("/envelope-test/json");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: { status: "ok" } });
  });

  it("passes StreamableFile through without JSON envelope", async () => {
    const res = await request(app.getHttpServer())
      .get("/envelope-test/file")
      .buffer(true)
      .parse((response, callback) => {
        const chunks: Buffer[] = [];
        response.on("data", (chunk: Buffer) => chunks.push(chunk));
        response.on("end", () => callback(null, Buffer.concat(chunks)));
      });

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain(
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    const body = res.body as Buffer;
    expect(body.slice(0, 4)).toEqual(Buffer.from([0x50, 0x4b, 0x03, 0x04]));
    expect(body.toString("utf8", 0, 1)).not.toBe("{");
  });
});
