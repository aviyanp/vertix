import { defineConfig } from "rolldown";

export default defineConfig({
	input: "./core/src/app.js",
	output: {
		dir: "./public/js",
	},
});
