
const { src } = require('../../helper/path');

const Legend = require(`${src}/models/legends`);
const db = require(`${src}/handler/db`);
const { templates } = require(`${src}/utils/responseCodes`);

const testLegendExistsInModel = () => {
	describe('Legend Exists In Model', () => {
		test('should return error if the legend does not exist', async () => {
			jest.spyOn(db, 'findOne').mockResolvedValue(undefined);
			await expect(Legend.checkLegendExists('someTS', 'someModel', 'a'))
				.rejects.toEqual(templates.legendNotFound);
		});

		test('should succeed if legend exists', async () => {
			jest.spyOn(db, 'findOne').mockResolvedValue('legend');
			await Legend.checkLegendExists('someTS', 'someModel', 'b');
		});	
	});
};

describe('models/legends', () => {
	testLegendExistsInModel();
});