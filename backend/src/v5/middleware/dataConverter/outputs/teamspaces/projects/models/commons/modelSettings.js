const { respond } = require('../../../../../../../utils/responder');
const { templates } = require('../../../../../../../utils/responseCodes');
const ModelSettings = {};

ModelSettings.formatModelSettings = (req, res) => {
	const settings = req.outputData;
    const formattedSettings = {
        ...settings,
        timestamp: settings.timestamp ? settings.timestamp.getTime(): undefined,
        code: settings.properties.code,
        unit: settings.properties.unit
    }

    delete formattedSettings.properties;
    
	respond(req, res, templates.ok, { ...formattedSettings });
};


module.exports = ModelSettings;
