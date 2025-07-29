const LICENSE_FIRST_PART = `/**
 *  Copyright (C) `;

const YEAR = new Date().getFullYear();

const LICENSE_SECOND_PART = ` 3D Repo Ltd
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
 */`;

function gotLicenseHeader(str) {
	const licenseFirstPartLength = LICENSE_FIRST_PART.length;
	const hasFirstPart = str.indexOf(LICENSE_FIRST_PART) === 0;
	const hasYear = hasFirstPart && /[0-9]{4}/.test(str.slice(licenseFirstPartLength, licenseFirstPartLength + 4));
	const hasSecondPart = hasYear && str.slice(licenseFirstPartLength + 4).indexOf(LICENSE_SECOND_PART) === 0;

	return hasFirstPart && hasYear && hasSecondPart;
}

const rule = {
	meta: {
		type: 'layout',
		docs: {
			description: 'Ensures the file starts with a license copy.',
		},
		fixable: 'code',
		schema: [],
		messages: {
			missing: 'License header required at start of file but not found.',
		},
	},
	create(context) {
		return {
			Program(node) {
				const sourceCode = context.getSourceCode();
				const src = sourceCode.getText();
				const startsWithHeader = gotLicenseHeader(src);

				if (startsWithHeader) return;

				context.report({
					node,
					loc: { line: 0, column: 1 },
					messageId: 'missing',
					fix(fixer) {
						return fixer.insertTextBeforeRange(
							[0, 1],
							`${LICENSE_FIRST_PART}${YEAR}${LICENSE_SECOND_PART}\n\n`
						);
					},
				});
			},
		};
	},
};

export default {
	rules: {
		'license-header': rule,
	},
};
