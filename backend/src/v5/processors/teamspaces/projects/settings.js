const ModelSettingConstants = require('../../../models/modelSettings.constants');

const Settings = {};

Settings.getDrawingCategories = () => ModelSettingConstants.MODEL_TYPES;

module.exports = Settings;
