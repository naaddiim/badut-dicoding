const ReplyRepository = require('../../../../Domains/replies/ReplyRepository');
const CommentRepository = require('../../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../../Domains/threads/ThreadRepository');
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
        const mockThreadsRepository = new ThreadRepository();
        const mockCommentsRepository = new CommentRepository();

        /** mocking needed function */
        mockThreadsRepository.isThreadExist = jest.fn().mockImplementation(() => Promise.resolve());
        mockCommentsRepository.isCommentExist = jest.fn().mockImplementation(() => Promise.resolve());
        mockRepliesRepository.addReply = jest.fn()
            .mockImplementation(() => Promise.resolve(expectedAddedReply));

        /** creating use case instance */
        const addReplyUseCase = new AddReplyUseCase({
            threadRepository: mockThreadsRepository,
            commentRepository: mockCommentsRepository,
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
