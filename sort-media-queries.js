// MIT License

// Copyright (c) 2017 Oleg Dutchenko <dutchenko.o.dev@gmail.com>

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

// see : https://github.com/dutchenkoOleg/sort-css-media-queries/issues/10

// ----------------------------------------
// Private
// ----------------------------------------

const minMaxWidth = /(!?\(\s*min(-device-)?-width)(.|\n)+\(\s*max(-device)?-width/i;
const minWidth = /\(\s*min(-device)?-width/i;
const maxMinWidth = /(!?\(\s*max(-device)?-width)(.|\n)+\(\s*min(-device)?-width/i;
const maxWidth = /\(\s*max(-device)?-width/i;

const isMinWidth = _testQuery(minMaxWidth, maxMinWidth, minWidth);
const isMaxWidth = _testQuery(maxMinWidth, minMaxWidth, maxWidth);

const minMaxHeight = /(!?\(\s*min(-device)?-height)(.|\n)+\(\s*max(-device)?-height/i;
const minHeight = /\(\s*min(-device)?-height/i;
const maxMinHeight = /(!?\(\s*max(-device)?-height)(.|\n)+\(\s*min(-device)?-height/i;
const maxHeight = /\(\s*max(-device)?-height/i;

const isMinHeight = _testQuery(minMaxHeight, maxMinHeight, minHeight);
const isMaxHeight = _testQuery(maxMinHeight, minMaxHeight, maxHeight);

const isPrint = /print/i;
const isPrintOnly = /^print$/i;

const maxValue = Number.MAX_VALUE;

/**
 * Obtain the length of the media request in pixels.
 * Copy from original source `function inspectLength (length)`
 * {@link https://github.com/hail2u/node-css-mqpacker/blob/master/index.js#L58}
 * @private
 * @param {string} length
 * @return {number}
 */
function _getQueryLength(length) {
	length = /(-?\d*\.?\d+)(ch|em|ex|px|rem)/.exec(length);

	if (length === null) {
		return maxValue;
	}

	let number = length[1];
	const unit = length[2];

	switch (unit) {
		case 'ch':
			number = parseFloat(number) * 8.8984375;
			break;

		case 'em':
		case 'rem':
			number = parseFloat(number) * 16;
			break;

		case 'ex':
			number = parseFloat(number) * 8.296875;
			break;

		case 'px':
			number = parseFloat(number);
			break;
	}

	return +number;
}

/**
 * Wrapper for creating test functions
 * @private
 * @param {RegExp} doubleTestTrue
 * @param {RegExp} doubleTestFalse
 * @param {RegExp} singleTest
 * @return {Function}
 */
function _testQuery(doubleTestTrue, doubleTestFalse, singleTest) {
	/**
	 * @param {string} query
	 * @return {boolean}
	 */
	return function (query) {
		if (doubleTestTrue.test(query)) {
			return true;
		} else if (doubleTestFalse.test(query)) {
			return false;
		}
		return singleTest.test(query);
	};
}

/**
 * @private
 * @param {string} a
 * @param {string} b
 * @return {number|null}
 */
function _testIsPrint(a, b) {
	const isPrintA = isPrint.test(a);
	const isPrintOnlyA = isPrintOnly.test(a);

	const isPrintB = isPrint.test(b);
	const isPrintOnlyB = isPrintOnly.test(b);

	if (isPrintA && isPrintB) {
		if (!isPrintOnlyA && isPrintOnlyB) {
			return 1;
		}
		if (isPrintOnlyA && !isPrintOnlyB) {
			return -1;
		}
		return a.localeCompare(b);
	}
	if (isPrintA) {
		return 1;
	}
	if (isPrintB) {
		return -1;
	}

	return null;
}

// ----------------------------------------
// Public
// ----------------------------------------

/**
 * @returns {(function(string, string): number)|*}
 */
module.exports = function createSort() {
	/**
	 * Sorting an array with media queries
	 * according to the mobile-first methodology.
	 * @param {string} a
	 * @param {string} b
	 * @return {number} 1 / 0 / -1
	 */
	function sortCSSmq(a, b) {
		const testIsPrint = _testIsPrint(a, b);
		if (testIsPrint !== null) {
			return testIsPrint;
		}

		const minA = isMinWidth(a) || isMinHeight(a);
		const maxA = isMaxWidth(a) || isMaxHeight(a);

		const minB = isMinWidth(b) || isMinHeight(b);
		const maxB = isMaxWidth(b) || isMaxHeight(b);

		if (minA && maxB) {
			return -1;
		}
		if (maxA && minB) {
			return 1;
		}

		const lengthA = _getQueryLength(a);
		const lengthB = _getQueryLength(b);

		if (lengthA === maxValue && lengthB === maxValue) {
			return a.localeCompare(b);
		} else if (lengthA === maxValue) {
			return 1;
		} else if (lengthB === maxValue) {
			return -1;
		}

		if (lengthA > lengthB) {
			if (maxA) {
				return -1;
			}
			return 1;
		}

		if (lengthA < lengthB) {
			if (maxA) {
				return 1;
			}
			return -1;
		}

		return a.localeCompare(b);
	}

	return sortCSSmq;
};
