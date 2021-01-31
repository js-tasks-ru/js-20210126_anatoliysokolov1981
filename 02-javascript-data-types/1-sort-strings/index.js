/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  const arrCopy = [...arr];
  const sortAscending = (str1, str2) => str1.localeCompare(str2, 'ru', {caseFirst: 'upper'});
  const sortDescending = (str1, str2) => str2.localeCompare(str1, 'ru', {caseFirst: 'upper'});  
  
  if (param === 'asc') {
    arrCopy.sort(sortAscending);
  } else {
    arrCopy.sort(sortDescending);
  }

  return arrCopy;
}

