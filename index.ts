import {Compiler} from "webpack";
import {Result} from "postcss";

import * as packageJson from "./package.json";

const PLUGIN_NAME: string = packageJson.name;

export const MODULE_NAME = "rollup-plugin-postcss-exports-module-name";

export interface CssTaker {
	(css: string): void;
}

export interface PluginOptions {
	output?: {
		// path?: string;
		filename?: string;
		// takeCss?: CssTaker;
	};
}

const dontTakeCss: CssTaker = (css) => {};

export default class PostcssExportsWebpackPlugin {
	private results: Result[] = [];

	constructor(private options: PluginOptions = {}) {}

	public apply(compiler: Compiler) {
		// const takeCss = (typeof this.options.takeCss === "function") ? this.options.takeCss : dontTakeCss;

		compiler.hooks.normalModuleFactory.tap(PLUGIN_NAME, (normalModuleFactory) => {
			normalModuleFactory.hooks.beforeResolve.tap(PLUGIN_NAME, (data) => {
				if (data.request === MODULE_NAME) {
					data.request = require.resolve("./getClass");
				}
			});
		});

		compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
			compilation.hooks.normalModuleLoader.tap(PLUGIN_NAME, (loaderContext, module) => {
				loaderContext[PLUGIN_NAME] = this;
			});
		});

		compiler.hooks.emit.tap(PLUGIN_NAME, (compilation) => {
			if (this.options.output && this.options.output.filename) {
				const data = new Buffer(this.results.join("\n"));

				compilation.assets[this.options.output.filename] = {
					source: () => data,
					size: () => data.length,
				};
			}
		});

		// compiler.hooks.done.tap(PLUGIN_NAME, (stats) => {
		// 	takeCss(this.results.join("\n"));
		// });
	}

	public saveResult(result: Result) {
		this.results.push(result);
	}

	public getLoader() {
		return require.resolve("./loader");
	}
}
