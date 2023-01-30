const ReplyRepository = require('../../../../Domains/replies/ReplyRepository');
const DeleteReplyUseCase = require('../DeleteReplyUseCase');

describe('DeleteReplyUseCase', () => {
    /**
     * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
     */
    it('should orchestrating the delete reply action correctly', async () => {
        // Arrange
        const useCasePayload = {
            user_id: "somerandomCredentialId",
            thread_id: "somerandomThreadId",
            comment_id: "somerandomCommentId",
            reply_id: "someRandomReplyId",
        };
        const expectedDeletedReply = {
            user_id: useCasePayload.user_id,
            thread_id: useCasePayload.thread_id,
            comment_id: useCasePayload.comment_id,
            reply_id: useCasePayload.reply_id,
        };

        /** creating dependency of use case */
        const mockRepliesRepository = new ReplyRepository();

        /** mocking needed function */
        mockRepliesRepository.isThreadExist = jest.fn().mockImplementation(() => Promise.resolve());
        mockRepliesRepository.isCommentExist = jest.fn().mockImplementation(() => Promise.resolve());
        mockRepliesRepository.isReplyExist = jest.fn().mockImplementation(() => Promise.resolve());
        mockRepliesRepository.isTheRightOwner = jest.fn().mockImplementation(() => Promise.resolve());
        mockRepliesRepository.deleteReply = jest.fn()
            .mockImplementation(() => Promise.resolve(expectedDeletedReply));

        /** creating use case instance */
        const deleteReplyUseCase = new DeleteReplyUseCase({
            replyRepository: mockRepliesRepository,
        });

        // Action
        const { user_id, thread_id, comment_id, reply_id } = useCasePayload;
        const deletedReply = await deleteReplyUseCase.execute(user_id, thread_id, comment_id, reply_id);

        // Assert
        expect(deletedReply).toStrictEqual(expectedDeletedReply);
        expect(mockRepliesRepository.deleteReply).toHaveBeenCalledWith({
            user_id: useCasePayload.user_id,
            thread_id: useCasePayload.thread_id,
            comment_id: useCasePayload.comment_id,
            reply_id: useCasePayload.reply_id,
        });
    });
});
