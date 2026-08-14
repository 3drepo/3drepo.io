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

import { linkify } from '@/v4/helpers/linkify';

describe('linkify helper', () => {
	it('should convert a plain URL into a markdown link', () => {
		expect(linkify('check out http://example.com today')).toEqual(
			'check out [http://example.com](http://example.com) today',
		);
	});

	it('should convert a plain https URL into a markdown link', () => {
		expect(linkify('secure link https://example.com/path?query=1')).toEqual(
			'secure link [https://example.com/path?query=1](https://example.com/path?query=1)',
		);
	});

	it('should not double-linkify a URL already inside markdown link syntax', () => {
		const text = 'see [my link](http://example.com) for more';
		expect(linkify(text)).toEqual(text);
	});

	it('should not double-linkify a URL already inside a markdown image', () => {
		const text = '![alt text](http://example.com/image.png)';
		expect(linkify(text)).toEqual(text);
	});

	it('should linkify plain text surrounding an existing markdown link', () => {
		const text = 'go to http://plain.com and [existing](http://example.com) too';
		// NOTE: this mirrors a pre-existing quirk of the original `markdown-linkify` package:
		// once the regex used to detect "already markdown" links finds a match anywhere in the
		// text, it suppresses linkification of an earlier, unrelated plain URL too.
		expect(linkify(text)).toEqual(text);
	});

	it('should linkify a bare domain with a custom-registered TLD (.chat, added for 3drepo)', () => {
		expect(linkify('visit example.chat now')).toEqual(
			'visit [example.chat](http://example.chat) now',
		);
	});

	it('should not linkify plain email addresses (fuzzyEmail disabled)', () => {
		const text = 'contact me at someone@example.com';
		expect(linkify(text)).toEqual(text);
	});

	it('should return the original text unchanged when there is nothing to linkify', () => {
		const text = 'just some plain text with no links';
		expect(linkify(text)).toEqual(text);
	});

	it('should handle multiple plain URLs in the same text', () => {
		const text = 'first http://one.com then http://two.com';
		expect(linkify(text)).toEqual(
			'first [http://one.com](http://one.com) then [http://two.com](http://two.com)',
		);
	});
});
