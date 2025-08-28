import { type } from "arktype";

export const Photo = type("File").narrow((file, ctx) => {
	if (!file.type.startsWith("image/")) {
		return ctx.mustBe("an image");
	}

	if (file.size > 10 * 1024 * 1024) {
		return ctx.reject({
			expected: "an image less than 10MB",
			actual: `${(file.size / (1024 * 1024)).toFixed(2)}MB`,
		});
	}

	return true;
});
