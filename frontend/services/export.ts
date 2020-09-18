import * as API from '../services/api';

export const exportBCF = (teamspace, model, issueNumbers) => {
	const exportUrl = API.getAPIUrl(`${teamspace}/${model}/issues.bcfzip?numbers=${issueNumbers}`);
	window.open(exportUrl, '_blank', 'noopener');
};

const handlePrint = (dataType) => (teamspace, model, dataNumbers) => {
	const printUrl = API.getAPIUrl(`${teamspace}/${model}/${dataType}.html?numbers=${dataNumbers}`);
	window.open(printUrl, '_blank', 'noopener');
};

export const printIssues = handlePrint('issues');

export const printRisks = handlePrint('risks');

const handleExportToJSON = (dataType) => (teamspace, model, dataNumbers) => {
	const endpoint = `${teamspace}/${model}/${dataType}?numbers=${dataNumbers}&convertCoords=1`;
	return API.downloadJSON(dataType, model, endpoint);
};

export const exportIssuesToJSON = handleExportToJSON('issues');

export const exportRisksToJSON = handleExportToJSON('risks');
