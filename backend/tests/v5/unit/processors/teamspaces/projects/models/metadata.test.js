const { src } = require('../../../../../helper/path');
const { generateRandomString } = require('../../../../../helper/services');

const Metadata = require(`${src}/processors/teamspaces/projects/models/metadata`);

jest.mock('../../../../../../../src/v5/models/metadata');
const MetadataModel = require(`${src}/models/metadata`);

const testUpdateMetadata = () => {
    describe('Update metadata', () => {
        test('should update the metadata of a container', async () => {
            const teamspace = generateRandomString();
            const project = generateRandomString();
            const container = generateRandomString();
            const updatedMetadata = [{ key: generateRandomString(), value: generateRandomString() }]

            await expect(Metadata.updateMetadata(teamspace, project, container, updatedMetadata));
            expect(MetadataModel.updateMetadata).toHaveBeenCalledTimes(1);
            expect(MetadataModel.updateMetadata).toHaveBeenCalledWith(teamspace, project, container, updatedMetadata);
        });
    });
};

describe('processors/teamspaces/projects/models/metadata', () => {
    testUpdateMetadata();
});
