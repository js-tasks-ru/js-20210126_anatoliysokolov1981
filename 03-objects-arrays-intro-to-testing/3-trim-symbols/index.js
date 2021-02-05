/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
	if (arguments.length === 1) return string;
	
	let editedString = '';
	let charCounter = 1;
	let previousChar = null;

	for (const char of string) {
		if (char === previousChar) {
			charCounter++;
		} else {
			charCounter = 1;
		}

		if (charCounter <= size) editedString += char;

		previousChar = char;
	}

	return editedString;
}
