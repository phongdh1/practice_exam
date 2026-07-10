import { maskSecret, mergeSecretField } from "./integration-secrets.util";

describe("integration-secrets.util", () => {
  it("masks short and long secrets", () => {
    expect(maskSecret("ab")).toBe("****");
    expect(maskSecret("abcdefghij")).toBe("****ghij");
    expect(maskSecret(undefined)).toBeNull();
  });

  it("preserves existing secret when masked placeholder submitted", () => {
    expect(mergeSecretField("****ghij", "real-secret")).toBe("real-secret");
    expect(mergeSecretField("new-secret", "old-secret")).toBe("new-secret");
  });
});
