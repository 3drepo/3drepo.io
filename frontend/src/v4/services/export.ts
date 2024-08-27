/**
 *  Copyright (C) 2021 3D Repo Ltd
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

import { downloadFile } from "@components/authenticatedResource/authenticatedResource.hooks";
import { downloadJSON } from "./api";
import { getAPIUrl } from "./api/default";

export const exportBCF = async (teamspace, model, issueNumbers) => {
	await downloadFile(getAPIUrl(`${teamspace}/${model}/issues.bcfzip?numbers=${issueNumbers}`));
};

const handlePrint = (dataType) => (teamspace, model, dataNumbers) => {
	const printUrl = getAPIUrl(`${teamspace}/${model}/${dataType}.html?numbers=${dataNumbers}`);
	window.open(printUrl, '_blank', 'noopener');
};

export const printIssues = handlePrint('issues');

export const printRisks = handlePrint('risks');

const handleExportToJSON = (dataType) => (teamspace, model, dataNumbers) => {
	const endpoint = `${teamspace}/${model}/${dataType}?numbers=${dataNumbers}&convertCoords=1`;
	return downloadJSON(dataType, model, endpoint);
};

export const exportIssuesToJSON = handleExportToJSON('issues');

export const exportRisksToJSON = handleExportToJSON('risks');
