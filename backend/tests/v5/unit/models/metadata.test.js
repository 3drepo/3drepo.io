const { src } = require('../../helper/path');

const { generateRandomString } = require('../../helper/services');
const Metadata = require(`${src}/models/metadata`);
const db = require(`${src}/handler/db`);
const { templates } = require(`${src}/utils/responseCodes`);

const testGetMetadataById = () => {
    describe('Get metadata by Id', () => {
        test('should return error if the metadata does not exist', async () => {
            const teamspace = generateRandomString();
            const model = generateRandomString();
            const metadataId = generateRandomString();
            jest.spyOn(db, 'findOne').mockResolvedValue(undefined);
            await expect(Metadata.getMetadataById(teamspace, model, metadataId))
                .rejects.toEqual(templates.metadataNotFound);
        });

        test('should return the metadata if they exists', async () => {
            const teamspace = generateRandomString();
            const model = generateRandomString();
            const metadataId = generateRandomString();
            const expectedData = [{ key: generateRandomString(), value: generateRandomString() }];
            const projection = { _id: 1 };
            const fn = jest.spyOn(db, 'findOne').mockResolvedValue(expectedData);
            const res = await Metadata.getMetadataById(teamspace, model, metadataId, { _id: 1 });
            expect(res).toEqual(expectedData);
            expect(fn).toHaveBeenCalledWith(teamspace, `${model}.scene`, { _id: metadataId }, projection);
            expect(fn).toHaveBeenCalledTimes(1);
        });
    });
};

const testUpdateMetadata = () => {
    describe('Update Metadata', () => {
        test('should return error if metadata dont not exist', async () => {
            const teamspace = generateRandomString();
            const model = generateRandomString();
            const metadataId = generateRandomString();
            const metadataToAdd = [{ key: generateRandomString(), value: generateRandomString() }];
            jest.spyOn(db, 'findOne').mockResolvedValue(undefined);            
            await expect(Metadata.updateMetadata(teamspace, model, metadataId, metadataToAdd))
                .rejects.toEqual(templates.metadataNotFound);
        });

        test('should add metadata', async () => {
            const teamspace = generateRandomString();
            const model = generateRandomString();
            const metadataId = generateRandomString();
            const metadataToAdd = [{ key: generateRandomString(), value: generateRandomString() }];
            const fn1 = jest.spyOn(db, 'findOne').mockResolvedValue({ metadata: [] });
            const fn2 = jest.spyOn(db, 'updateOne').mockImplementation(() => { });
            await Metadata.updateMetadata(teamspace, model, metadataId, metadataToAdd);

            expect(fn1).toHaveBeenCalledTimes(1);
            expect(fn1).toHaveBeenCalledWith(teamspace, `${model}.scene`, { _id: metadataId }, { metadata: 1 });
            expect(fn2).toHaveBeenCalledTimes(1);
            expect(fn2).toHaveBeenCalledWith(teamspace, `${model}.scene`, { _id: metadataId },
                { $set: { metadata: metadataToAdd.map((um) => ({ ...um, custom: true })) } });
        });

        test('should do nothing if new metadata has null value', async () => {
            const teamspace = generateRandomString();
            const model = generateRandomString();
            const metadataId = generateRandomString();
            const metadataToAdd = [{ key: generateRandomString(), value: null }];
            const fn1 = jest.spyOn(db, 'findOne').mockResolvedValue({ metadata: [] });
            const fn2 = jest.spyOn(db, 'updateOne').mockImplementation(() => { });
            await Metadata.updateMetadata(teamspace, model, metadataId, metadataToAdd);

            expect(fn1).toHaveBeenCalledTimes(1);
            expect(fn1).toHaveBeenCalledWith(teamspace, `${model}.scene`, { _id: metadataId }, { metadata: 1 });
            expect(fn2).toHaveBeenCalledTimes(1);
            expect(fn2).toHaveBeenCalledWith(teamspace, `${model}.scene`, { _id: metadataId },
                { $set: { metadata: [] } });
        });

        test('should update existing metadata', async () => {
            const teamspace = generateRandomString();
            const model = generateRandomString();
            const metadataId = generateRandomString();
            const existingMetadata = [{ key: generateRandomString(), value: generateRandomString() }];
            const updatedMetadata = existingMetadata.map((em) => ({ ...em, value: generateRandomString() }));
            const fn1 = jest.spyOn(db, 'findOne').mockResolvedValue({ metadata: existingMetadata });
            const fn2 = jest.spyOn(db, 'updateOne').mockImplementation(() => { });
            await Metadata.updateMetadata(teamspace, model, metadataId, updatedMetadata);

            expect(fn1).toHaveBeenCalledTimes(1);
            expect(fn1).toHaveBeenCalledWith(teamspace, `${model}.scene`, { _id: metadataId }, { metadata: 1 });
            expect(fn2).toHaveBeenCalledTimes(1);
            expect(fn2).toHaveBeenCalledWith(teamspace, `${model}.scene`, { _id: metadataId },
                { $set: { metadata: updatedMetadata } });
        });

        test('should remove existing', async () => {
            const teamspace = generateRandomString();
            const model = generateRandomString();
            const metadataId = generateRandomString();
            const existingMetadata = [
                { key: generateRandomString(), value: generateRandomString() }, 
                { key: generateRandomString(), value: generateRandomString() }
            ];
            const metadataToRemove = existingMetadata.map((em) => ({ ...em, value: null }));
            const fn1 = jest.spyOn(db, 'findOne').mockResolvedValue({ metadata: existingMetadata });
            const fn2 = jest.spyOn(db, 'updateOne').mockImplementation(() => { });
            await Metadata.updateMetadata(teamspace, model, metadataId, metadataToRemove);

            expect(fn1).toHaveBeenCalledTimes(1);
            expect(fn1).toHaveBeenCalledWith(teamspace, `${model}.scene`, { _id: metadataId }, { metadata: 1 });
            expect(fn2).toHaveBeenCalledTimes(1);
            expect(fn2).toHaveBeenCalledWith(teamspace, `${model}.scene`, { _id: metadataId },
                { $set: { metadata: [] } });
        });
    });
};

describe('models/metadata', () => {
    testGetMetadataById();
    testUpdateMetadata();
});
