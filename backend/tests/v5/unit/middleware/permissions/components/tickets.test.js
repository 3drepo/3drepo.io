const { src } = require('../../../../helper/path');

jest.mock('../../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);

jest.mock('../../../../../../src/v5/models/tickets');
const TicketsModel = require(`${src}/models/tickets`);

jest.mock('../../../../../../src/v5/models/tickets.comments');
const CommentsModel = require(`${src}/models/tickets.comments`);


const { generateRandomString } = require(`../../../../helper/services`);
const { templates } = require(`${src}/utils/responseCodes`);
const TicketsMiddleware = require(`${src}/middleware/permissions/components/tickets`);

const testCanEditComment = () => {
    describe('Can edit comment', () => {
        const getRequest = () => ({
            params: {
                teamspace: generateRandomString(),
                project: generateRandomString(),
                model: generateRandomString(),
                ticket: generateRandomString(),
            },
            session: {
                user: { username: generateRandomString()}
            }
        });

        test(`should respond with ${templates.ticketNotFound.code} if the ticket does not exist`, async () => {
            const mockCB = jest.fn(() => { });
            const req = getRequest();
            TicketsModel.getTicketById.mockRejectedValueOnce(templates.ticketNotFound);

            await TicketsMiddleware.canEditComment(req, {}, mockCB);
            expect(mockCB).not.toHaveBeenCalled();
            expect(Responder.respond).toHaveBeenCalledTimes(1);
            expect(Responder.respond).toHaveBeenCalledWith(req, {}, templates.ticketNotFound);
        });

        test(`should respond with ${templates.commentNotFound.code} if the comment does not exist`, async () => {
            const mockCB = jest.fn(() => { });
            const req = getRequest();
            CommentsModel.getCommentById.mockRejectedValueOnce(templates.commentNotFound);

            await TicketsMiddleware.canEditComment(req, {}, mockCB);
            expect(mockCB).not.toHaveBeenCalled();
            expect(Responder.respond).toHaveBeenCalledTimes(1);
            expect(Responder.respond).toHaveBeenCalledWith(req, {}, templates.commentNotFound);
        });

        test(`should respond with ${templates.notAuthorized.code} if the user is not allowed to edit the comment`, async () => {
            const mockCB = jest.fn(() => { });
            const req = getRequest();
            const commentData = { _id: generateRandomString(), author: generateRandomString()};
            CommentsModel.getCommentById.mockResolvedValueOnce(commentData);

            await TicketsMiddleware.canEditComment(req, {}, mockCB);
            expect(mockCB).not.toHaveBeenCalled();
            expect(Responder.respond).toHaveBeenCalledTimes(1);
            expect(Responder.respond).toHaveBeenCalledWith(req, {}, templates.notAuthorized);
        });

        test(`should call next() if the user is allowed to edit the comment`, async () => {
            const mockCB = jest.fn(() => { });
            const req = getRequest();
            const commentData = { _id: generateRandomString(), author: req.session.user.username};
            CommentsModel.getCommentById.mockResolvedValueOnce(commentData);

            await TicketsMiddleware.canEditComment(req, {}, mockCB);
            expect(mockCB).toHaveBeenCalledTimes(1);
            expect(Responder.respond).not.toHaveBeenCalled();  
            expect(req.commentData).toEqual(commentData);
        });
    });
};

describe('middleware/permissions/components/tickets', () => {
    testCanEditComment();
});
