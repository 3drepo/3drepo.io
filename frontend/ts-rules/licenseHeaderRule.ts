import * as Lint from 'tslint';
import * as TS from 'typescript';

const LICENSE_FIRST_PART = `/**
 *  Copyright (C) `;

const YEAR = new Date().getFullYear();

const LICENSE_SECOND_PART = `
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

export class Rule extends Lint.Rules.AbstractRule {
	public static metadata: Lint.IRuleMetadata = {
		ruleName: 'license-header',
		description: 'Ensures the file starts with a license copy.',
		optionsDescription: 'Not configurable.',
		options: {
            type: "array",
            items: { owner: "string" },
        },
		hasFix: true,
		type: 'formatting',
		typescriptOnly: false,
	};

	get owner() {
		return this.ruleArguments[0] || '';
	}

	public static FAILURE_MESSAGE = 'License header is missing';

	public gotLicenseHeader = (str: string) => {
		const licenseFirstPartLength = LICENSE_FIRST_PART.length;
		const hasFirstPart = str.indexOf(LICENSE_FIRST_PART) === 0;
		const hasYear = hasFirstPart && /[0-9]{4}/.test(str.slice(licenseFirstPartLength, licenseFirstPartLength + 4));
		const secoundPart = ` ${this.owner}${LICENSE_SECOND_PART}`;
		const hasSecondPart = hasYear && str.slice(licenseFirstPartLength + 4).indexOf(secoundPart) === 0;
	
		return hasFirstPart && hasYear && hasSecondPart;
	};

	public apply(sourceFile: TS.SourceFile): Lint.RuleFailure[] {
		if (this.gotLicenseHeader(sourceFile.text)) {
			return [];
		}

		const fix: Lint.Fix | undefined = Lint.Replacement.appendText(
				0,
				`${LICENSE_FIRST_PART}${YEAR}${this.owner}${LICENSE_SECOND_PART}\n\n`,
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
