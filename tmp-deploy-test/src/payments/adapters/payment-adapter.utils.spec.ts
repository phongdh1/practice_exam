import { parseWebhookBody } from "./payment-adapter.utils";

describe("parseWebhookBody", () => {
  it("requires explicit payment status", () => {
    expect(() => parseWebhookBody({ paymentId: "pay-1" })).toThrow(
      "Missing or invalid webhook payment status",
    );
  });

  it("rejects invalid status values", () => {
    expect(() =>
      parseWebhookBody({ paymentId: "pay-1", status: "pending" }),
    ).toThrow("Missing or invalid webhook payment status");
  });

  it("requires paymentId", () => {
    expect(() => parseWebhookBody({ status: "paid" })).toThrow(
      "Missing paymentId in webhook payload",
    );
  });

  it("parses valid webhook payloads", () => {
    expect(
      parseWebhookBody({
        paymentId: "pay-1",
        externalEventId: "evt-1",
        status: "paid",
      }),
    ).toEqual({
      paymentId: "pay-1",
      externalEventId: "evt-1",
      status: "paid",
    });
  });
});
