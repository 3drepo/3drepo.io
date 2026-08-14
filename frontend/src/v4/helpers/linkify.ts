/**
 *  Copyright (C) 2026 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

// Inlined replacement for the unmaintained `markdown-linkify` package, which pins
// `linkify-it@^2.0.3` (CVE: quadratic complexity DoS in LinkifyIt#match) and is
// incompatible with the fixed `linkify-it@6.x` release (its default export changed
// from a constructor to a named export). Logic below is unchanged from the original
// `markdown-linkify` implementation.
import { LinkifyIt } from 'linkify-it';

const linkifier: any = new (LinkifyIt as any)({
	fuzzyEmail: false,
	// `fuzzyLink` defaulted to `true` in linkify-it@2.x (the version this helper originally
	// ran against); linkify-it@6.x flipped the default to `false`, so it must be re-enabled
	// explicitly to keep matching bare domains (e.g. "example.com") without a URL scheme.
	fuzzyLink: true,
});

linkifier.tlds(['chat'], true);

// Don't linkify urls that are already markdown
Object.keys(linkifier.__schemas__).forEach((schema) => {
	if (linkifier.__schemas__[schema].validate) {
		const oldValidate = linkifier.__schemas__[schema].validate;

		linkifier.__schemas__[schema].validate = function (text, pos, self) {
			if (!self.re.markdownLink) {
				self.re.markdownLink = new RegExp(/[!&]?\[([!&]?\[.*?\)|[^\]]*?)]\((.*?)( .*?)?\)/);
			}

			const linkStart = pos - schema.length;
			const match = text.match(self.re.markdownLink);

			// Text is a markdown link
			if (match) {
				const matchLinkStart = match[1].length + 2 + match.index + 1;

				// The matched link is at the current position
				if (linkStart <= matchLinkStart) {
					return false;
				}
			}

			return oldValidate(text, pos, self);
		};
	}
});

// Replace URLs in text with markdown links
export const linkify = (text: string): string => {
	const matches = linkifier.match(text);
	// No match, return the text
	if (!matches) return text;

	const result = [];
	let last = 0;
	// Build up the result
	matches.forEach((match) => {
		// If there is text between the last match and this one add it to the result now
		if (last < match.index) {
			result.push(text.slice(last, match.index));
		}
		// Add the current link
		result.push(`[${match.text}](${match.url})`);
		// Set the index of this match for the next round
		last = match.lastIndex;
	});
	// If there is text after the last match add it at the end
	if (last < text.length) {
		result.push(text.slice(last));
	}
	// Turn the array into a string again
	return result.join('');
};

export default linkify;
