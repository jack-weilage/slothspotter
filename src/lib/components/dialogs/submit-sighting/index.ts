import { SlothStatusSchema } from "$lib/client/db/schema";
import { Photo } from "../utils";
import { type } from "arktype";

export const SubmitSightingSchema = type({
	slothStatus: SlothStatusSchema,
	photos: Photo.array().atLeastLength(0).atMostLength(3),
	notes: "string < 500 | undefined",
	"cf-turnstile-response": "string",
});

export { default as SubmitSightingDialog } from "./dialog.svelte";
