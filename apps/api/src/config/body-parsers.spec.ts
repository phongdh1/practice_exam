import { Body, Controller, Post } from "@nestjs/common";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { configureBodyParsers } from "./body-parsers";

@Controller("subject-cover")
class SubjectCoverTestController {
  @Post()
  save(@Body() body: { coverImageUrl: string }) {
    return { length: body.coverImageUrl.length };
  }
}

describe("API body parsers", () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [SubjectCoverTestController],
    }).compile();
    app = module.createNestApplication<NestExpressApplication>({ bodyParser: false });
    configureBodyParsers(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("accepts a base64 cover from a 10 MiB image", async () => {
    const coverImageUrl = `data:image/png;base64,${Buffer.alloc(10 * 1024 * 1024).toString("base64")}`;

    await request(app.getHttpServer())
      .post("/subject-cover")
      .send({ coverImageUrl })
      .expect(201, { length: coverImageUrl.length });
  });

  it("rejects JSON beyond the bounded body limit", async () => {
    await request(app.getHttpServer())
      .post("/subject-cover")
      .send({ coverImageUrl: "A".repeat(16 * 1024 * 1024) })
      .expect(413);
  });

  it("keeps URL-encoded request parsing", async () => {
    await request(app.getHttpServer())
      .post("/subject-cover")
      .type("form")
      .send({ coverImageUrl: "https://example.com/cover.png" })
      .expect(201, { length: "https://example.com/cover.png".length });
  });
});
