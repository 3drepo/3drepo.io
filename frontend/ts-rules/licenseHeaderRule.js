"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rule = void 0;
var Lint = require("tslint");
var LICENSE_FIRST_PART = "/**\n *  Copyright (C) ";
var YEAR = new Date().getFullYear();
var LICENSE_SECOND_TWO = " 3D Repo Ltd\n *\n *  This program is free software: you can redistribute it and/or modify\n *  it under the terms of the GNU Affero General Public License as\n *  published by the Free Software Foundation, either version 3 of the\n *  License, or (at your option) any later version.\n *\n *  This program is distributed in the hope that it will be useful,\n *  but WITHOUT ANY WARRANTY; without even the implied warranty of\n *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the\n *  GNU Affero General Public License for more details.\n *\n *  You should have received a copy of the GNU Affero General Public License\n *  along with this program.  If not, see <http://www.gnu.org/licenses/>.\n */";
var gotLicenseHeader = function (str) {
    var licenseFirstPartLength = LICENSE_FIRST_PART.length;
    var hasFirstPart = str.indexOf(LICENSE_FIRST_PART) === 0;
    var hasYear = hasFirstPart && /[0-9]{4}/.test(str.slice(licenseFirstPartLength, licenseFirstPartLength + 4));
    var hasSecondPart = hasYear && str.slice(licenseFirstPartLength + 4).indexOf(LICENSE_SECOND_TWO) === 0;
    return hasFirstPart && hasYear && hasSecondPart;
};
var Rule = /** @class */ (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rule.prototype.apply = function (sourceFile) {
        if (gotLicenseHeader(sourceFile.text)) {
            return [];
        }
        var fix = Lint.Replacement.appendText(0, "" + LICENSE_FIRST_PART + YEAR + LICENSE_SECOND_TWO + "\n\n");
        return [
            new Lint.RuleFailure(sourceFile, 0, 1, Rule.FAILURE_MESSAGE, this.ruleName, fix),
        ];
    };
    Rule.metadata = {
        ruleName: 'license-header',
        description: 'Ensures the file starts with a license copy.',
        optionsDescription: 'Not configurable.',
        options: null,
        hasFix: true,
        type: 'formatting',
        typescriptOnly: false,
    };
    Rule.FAILURE_MESSAGE = 'License header is missing';
    return Rule;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
