/**
 * invertObj - should swap object keys and values
 * @param {object} obj - the initial object
 * @returns {object | undefined} - returns new object or undefined if nothing did't pass
 */
export function invertObj(obj) {
	if (!arguments.length) return;

	const invertedObject = {};

	for (const [key, prop] of Object.entries(obj)) {
		invertedObject[prop] = key;
	}

	return invertedObject;
}
