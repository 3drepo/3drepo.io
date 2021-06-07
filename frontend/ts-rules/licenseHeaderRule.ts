import * as Lint from 'tslint';
import * as TS from 'typescript';

const LICENSE_FIRST_PART = `/**
 *  Copyright (C) `;

const YEAR = new Date().getFullYear();

const LICENSE_SECOND_TWO = ` 3D Repo Ltd
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

const gotLicenseHeader = (str: string) => {
	const licenseFirstPartLength = LICENSE_FIRST_PART.length;
	const hasFirstPart = str.indexOf(LICENSE_FIRST_PART) === 0;
	const hasYear = hasFirstPart && /[0-9]{4}/.test(str.slice(licenseFirstPartLength, licenseFirstPartLength + 4));
	const hasSecondPart = hasYear && str.slice(licenseFirstPartLength + 4).indexOf(LICENSE_SECOND_TWO) === 0;

	return hasFirstPart && hasYear && hasSecondPart;
};

export class Rule extends Lint.Rules.AbstractRule {
	public static metadata: Lint.IRuleMetadata = {
		ruleName: 'license-header',
		description: 'Ensures the file starts with a license copy.',
		optionsDescription: 'Not configurable.',
		options: null,
		hasFix: true,
		type: 'formatting',
		typescriptOnly: false,
	};

	public static FAILURE_MESSAGE = 'License header is missing';

	public apply(sourceFile: TS.SourceFile): Lint.RuleFailure[] {
		if (gotLicenseHeader(sourceFile.text)) {
			return [];
		}

		const fix: Lint.Fix | undefined = Lint.Replacement.appendText(
				0,
				`${LICENSE_FIRST_PART}${YEAR}${LICENSE_SECOND_TWO}\n\n`,
		);

		return [
			new Lint.RuleFailure(
					sourceFile,
					0,
					1,
					Rule.FAILURE_MESSAGE,
					this.ruleName,
					fix,
			),
		];
	}
}
