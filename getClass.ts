import {ClassData} from "postcss-exports";

export default (classData: ClassData) => {
	return (...mods: string[]): string => {
		const classes = mods.reduce((result, mod) => {
			if (classData.mods && classData.mods[mod]) {
				result.push(classData.mods[mod]);
			}

			return result;
		}, classData.base ? [classData.base] : []);

		return classes.join(" ");
	};
};
