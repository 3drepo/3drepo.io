 const Legends = {};
 const db = require('../handler/db');
 const { stringToUUID } = require('../utils/helper/uuids');
 const { templates } = require('../utils/responseCodes');
 
 const colName = 'sequences.legends';
 
 const getCollectionName = (model) => `${model}.${colName}`;
 
 Legends.checkLegendExists = async (teamspace, model, legend) => {
     const foundLegend = await db.findOne(teamspace,getCollectionName(model) , { _id: stringToUUID(legend) } );
 
     if (!foundLegend) {
         throw templates.legendNotFound;
     }
 };
 
 module.exports = Legends;
 