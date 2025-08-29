import { Photo } from "../utils";
import { type } from "arktype";

export const SubmitSlothSchema = type({
	latitude: "number",
	longitude: "number",
	photos: Photo.array().atLeastLength(1).atMostLength(3),
	notes: "string < 500",
	"cf-turnstile-response": "string",
});

export { default as SubmitSlothDialog } from "./dialog.svelte";
