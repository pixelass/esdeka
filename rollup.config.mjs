import pkg from "./package.json" assert { type: "json" };
import { swc } from "rollup-plugin-swc3";

export default [
	{
		external: [
			"react/jsx-runtime",
			...Object.keys({
				...(pkg.dependencies ?? {}),
				...(pkg.peerDependencies ?? {}),
			}),
		],
		input: "src/index.ts",
		output: [
			{
				file: `dist/index.js`,
				sourcemap: true,
				format: "cjs",
			},
			{
				file: `dist/index.mjs`,
				sourcemap: true,
				format: "es",
			},
		],
		plugins: [
			swc({
				sourceMaps: true,
				jsc: {
					transform: {
						react: {
							runtime: "automatic",
						},
					},
				},
			}),
		],
	}
];
