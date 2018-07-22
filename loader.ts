import {loader} from "webpack";
import {getOptions} from "loader-utils";

import * as postcss from "postcss";

import postcssExports from "postcss-exports";
import {NameGenerator, Scope} from "postcss-exports";

import * as packageJson from "./package.json";

import {MODULE_NAME} from ".";

const PLUGIN_NAME: string = packageJson.name;

const HEADER_PART = `import getClass from "${MODULE_NAME}";`;

export interface Preprocessor {
	(source: string): string | Promise<string>;
}

export interface LoaderOptions {
	preprocess?: Preprocessor;
	generateName?: NameGenerator;
}

const getExportPart = (scope: Scope) => {
	const classes = Object.entries(scope).map(([className, classData]) => {
		return `${className}: getClass(${JSON.stringify(classData)})`;
	}).join(",");

	return `export default {${classes}};`;
};

// tslint:disable-next-line
const stylesLoader: loader.Loader = function (source: string) {
	this.async();

	const loaderOptions: LoaderOptions = getOptions(this) || {};

	const preprocess = (source: string) => Promise.resolve((typeof loaderOptions.preprocess === "function") ? loaderOptions.preprocess(source) : source);
	const generateName = loaderOptions.generateName;

	let scope: Scope;

	const processor = postcss(postcssExports({
		generateName,

		takeScope(result) {
			scope = result;
		},
	}));

	preprocess(source).then((preprocessed) => processor.process(preprocessed, {from: this.resourcePath})).then((processed) => {
		(this as any)[PLUGIN_NAME].saveResult(processed);

		this.callback(null, [HEADER_PART, getExportPart(scope)].join("\n"));
	}).catch((reason) => {
		this.callback(reason);
	});
};

export default stylesLoader;
