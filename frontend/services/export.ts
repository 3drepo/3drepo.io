import * as API from '../services/api';

export const exportBCF = (teamspace, model, issuesIds) => {
	const exportUrl = API.getAPIUrl(`${teamspace}/${model}/issues.bcfzip?ids=${issuesIds}`);
	window.open(exportUrl, '_blank');
};

const handlePrint = (dataType) => (teamspace, model, dataIds) => {
	const printUrl = API.getAPIUrl(`${teamspace}/${model}/${dataType}.html?ids=${dataIds}`);
	window.open(printUrl, '_blank');
};

export const printIssues = handlePrint('issues');

export const printRisks = handlePrint('risks');

const handleExportToJSON = (dataType) => (teamspace, model, dataIds) => {
	const endpoint = `${teamspace}/${model}/${dataType}.json?ids=${dataIds}&convertCoords=1`;
	return API.downloadJSON(dataType, model, endpoint);
};

export const exportIssuesToJSON = handleExportToJSON('issues');

export const exportRisksToJSON = handleExportToJSON('risks');
