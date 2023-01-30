const ReplyRepository = require('../../../../Domains/replies/ReplyRepository');
const AddReplyUseCase = require('../AddReplyUseCase');

describe('AddReplyUseCase', () => {
    /**
     * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
     */
    it('should orchestrating the add reply action correctly', async () => {
        // Arrange
        const useCasePayload = {
            user_id: "somerandomCredentialId",
            thread_id: "somerandomThreadId",
            comment_id: "somerandomCommentId",
            replyPayload: {
                content: 'create new reply',
            },
        };
        const expectedAddedReply = {
            id: 'reply-123',
            content: useCasePayload.replyPayload.content,
            owner: useCasePayload.user_id,
        };

        /** creating dependency of use case */
        const mockRepliesRepository = new ReplyRepository();

        /** mocking needed function */
        mockRepliesRepository.isThreadExist = jest.fn().mockImplementation(() => Promise.resolve());
        mockRepliesRepository.isCommentExist = jest.fn().mockImplementation(() => Promise.resolve());
        mockRepliesRepository.addReply = jest.fn()
            .mockImplementation(() => Promise.resolve(expectedAddedReply));

        /** creating use case instance */
        const addReplyUseCase = new AddReplyUseCase({
            replyRepository: mockRepliesRepository,
        });

        // Action
        const { user_id, thread_id, comment_id, replyPayload } = useCasePayload;
        const addedReply = await addReplyUseCase.execute(user_id, thread_id, comment_id, replyPayload);

        // Assert
        expect(addedReply).toStrictEqual(expectedAddedReply);
        expect(mockRepliesRepository.addReply).toHaveBeenCalledWith({
            user_id: useCasePayload.user_id,
            thread_id: useCasePayload.thread_id,
            comment_id: useCasePayload.comment_id,
            content: useCasePayload.replyPayload.content,
        });
    });
});
