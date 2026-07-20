import { toast } from "@practice-exam/ui";
import { ApiClientError } from "@practice-exam/api-client";

export function toastApiSuccess(title: string, description?: string) {
  toast({ title, description });
}

export function toastApiError(error: unknown, fallback = "Thao tác thất bại") {
  let description: string | undefined;
  if (error instanceof ApiClientError) {
    description = error.message;
  } else if (error instanceof Error) {
    description = error.message;
  } else if (error && typeof error === "object" && "message" in error) {
    description = String((error as { message: unknown }).message);
  }
  toast({ title: fallback, description, variant: "destructive" });
}
