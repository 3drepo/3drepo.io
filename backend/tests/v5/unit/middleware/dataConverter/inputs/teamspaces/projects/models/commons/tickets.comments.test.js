const { src, image } = require('../../../../../../../../helper/path');

const { cloneDeep } = require(`${src}/utils/helper/objects`);
const { generateRandomString, generateUUID } = require('../../../../../../../../helper/services');
const FS = require('fs');
const { UUIDToString } = require('../../../../../../../../../../src/v5/utils/helper/uuids');

jest.mock('../../../../../../../../../../src/v5/models/tickets.comments');
const TicketComments = require(`${src}/models/tickets.comments`);

jest.mock('../../../../../../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);

const Comments = require(`${src}/middleware/dataConverter/inputs/teamspaces/projects/models/commons/tickets.comments`);
const { templates } = require(`${src}/utils/responseCodes`);

const testValidateNewComment = () => {
    describe('Validate new comment', () => {
        const params = {};
        describe.each([
            [{ params, body: { comment: '' } }, false, 'with empty comment'],
            [{ params, body: { comment: generateRandomString(1201) } }, false, 'with too long comment'],
            [{ params, body: { comment: generateRandomString() } }, true, 'with valid comment'],
            [{ params, body: { images: [] } }, false, 'with invalid images'],
            [{ params, body: { images: [FS.readFileSync(image, { encoding: 'base64' })] } }, true, 'with valid image'],
            [{ params, body: {} }, false, 'with empty body'],
        ])('Check if req arguments for new comment are valid', (data, shouldPass, desc) => {
            test(`${desc} ${shouldPass ? ' should call next()' : 'should respond with invalidArguments'}`, async () => {
                const mockCB = jest.fn();
                const req = { ...cloneDeep(data) };

                await Comments.validateNewComment(req, {}, mockCB);
                if (shouldPass) {
                    expect(mockCB).toHaveBeenCalledTimes(1);
                } else {
                    expect(mockCB).not.toHaveBeenCalled();
                    expect(Responder.respond).toHaveBeenCalledTimes(1);
                    expect(Responder.respond).toHaveBeenCalledWith(req, {},
                        expect.objectContaining({ code: templates.invalidArguments.code }));
                }
            });
        });
    });
};

const testValidateUpdateComment = () => {
    describe('Validate update comment', () => {
        const req = {
            params: {
                teamspace: generateRandomString(),
                project: generateRandomString(),
                model: generateRandomString(),
                ticket: generateRandomString(),
                comment: generateRandomString(),
            },
            session: { user: { username: generateRandomString() } }
        };

        const existingRef = generateUUID();
        const existingComment = { author: req.session.user.username, images: [existingRef] };        

        describe.each([
            [{ ...req, body: { comment: generateRandomString() } }, false, 'with non authorized user', { ...existingComment, author: generateRandomString() },  templates.notAuthorized],
            [{ ...req, body: { comment: generateRandomString() } }, false, 'with deleted comment', { ...existingComment, deleted: true }],            
            [{ ...req, body: { comment: '' } }, false, 'with invalid comment'],
            [{ ...req, body: { comment: generateRandomString() } }, true, 'with valid comment'],
            [{ ...req, body: { images: [] } }, false, 'with invalid images'],
            [{ ...req, body: { images: [FS.readFileSync(image, { encoding: 'base64' })] } }, true, 'with valid base64 image'],
            [{ ...req, body: { images: [UUIDToString(existingRef)] } }, true, 'with valid image ref'],
            [{ ...req, body: {} }, false, 'with empty body'],
        ])('Check if req arguments for new comment are valid', (data, shouldPass, desc, comment = existingComment, error = templates.invalidArguments) => {
            test(`${desc} ${shouldPass ? ' should call next()' : 'should respond with invalidArguments'}`, async () => {
                const mockCB = jest.fn();
                const req = { ...cloneDeep(data) };
                TicketComments.getCommentById.mockResolvedValueOnce(comment);

                await Comments.validateUpdateComment(req, {}, mockCB);
                if (shouldPass) {
                    expect(mockCB).toHaveBeenCalledTimes(1);
                } else {
                    expect(mockCB).not.toHaveBeenCalled();
                    expect(Responder.respond).toHaveBeenCalledTimes(1);
                    expect(Responder.respond).toHaveBeenCalledWith(req, {},
                        expect.objectContaining({ code: error.code }));
                }
            });
        });
    });
};

describe('middleware/dataConverter/inputs/teamspaces/projects/models/commons/tickets.comments', () => {
    testValidateNewComment();
    testValidateUpdateComment();
});
