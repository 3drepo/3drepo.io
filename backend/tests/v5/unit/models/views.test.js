
const { src } = require('../../helper/path');

const View = require(`${src}/models/views`);
const db = require(`${src}/handler/db`);
const { templates } = require(`${src}/utils/responseCodes`);

const testViewExistsInModel = () => {
	describe('View Exists In Model', () => {
		test('should return error if the view does not exist', async () => {
			jest.spyOn(db, 'findOne').mockResolvedValue(undefined);
			await expect(View.checkViewExists('someTS', 'someModel', 'a'))
				.rejects.toEqual(templates.viewNotFound);
		});

		test('should succeed if view exists', async () => {
			jest.spyOn(db, 'findOne').mockResolvedValue('view');
			await View.checkViewExists('someTS', 'someModel', 'b');
		});	
	});
};

describe('models/views', () => {
	testViewExistsInModel();
});