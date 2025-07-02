import { defineConfig } from "rolldown";

export default defineConfig({
	input: "src/app.js",
	output: {
		dir: "../public/js",
	},
});
