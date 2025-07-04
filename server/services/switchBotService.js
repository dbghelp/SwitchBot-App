const { SwitchBotOpenAPI } = require('node-switchbot');
const { setKeyValue, getValueByKey, getAllVariables, deleteVariable } = require('./localVariablesService');

function init() {
    const appToken = getValueByKey('appToken');
    const secretKey = getValueByKey('secretKey');
    
    return new SwitchBotOpenAPI(appToken, secretKey);
}

module.exports = { init };