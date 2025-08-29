import { ContentTypeSchema, ReportReasonSchema } from "$lib/client/db/schema";
import { type } from "arktype";

export const ReportContentSchema = type({
	contentType: ContentTypeSchema,
	contentId: "string.uuid",
	reason: ReportReasonSchema,
	comment: "string < 500 | undefined",
	"cf-turnstile-response": "string",
});

export { default as ReportContentDialog } from "./dialog.svelte";
