const CommentRepository = require('../../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../../Domains/threads/ThreadRepository');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');

describe('DeleteCommentUseCase', () => {
    /**
     * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
     */
    it('should orchestrating the delete comment action correctly', async () => {
        // Arrange
        const useCasePayload = {
            user_id: "somerandomCredentialId",
            thread_id: "somerandomThreadId",
            comment_id: "somerandomCommentId",
        };
        const expectedDeletedComment = {
            user_id: useCasePayload.user_id,
            thread_id: useCasePayload.thread_id,
            comment_id: useCasePayload.comment_id,
        };

        /** creating dependency of use case */
        const mockCommentsRepository = new CommentRepository();
        const mockThreadsRepository = new ThreadRepository();

        /** mocking needed function */
        mockThreadsRepository.isThreadExist = jest.fn().mockImplementation(() => Promise.resolve());
        mockCommentsRepository.isCommentExist = jest.fn().mockImplementation(() => Promise.resolve());
        mockCommentsRepository.isTheRightOwner = jest.fn().mockImplementation(() => Promise.resolve());
        mockCommentsRepository.deleteComment = jest.fn()
            .mockImplementation(() => Promise.resolve(expectedDeletedComment));

        /** creating use case instance */
        const deleteCommentUseCase = new DeleteCommentUseCase({
            threadRepository: mockThreadsRepository,
            commentRepository: mockCommentsRepository,
        });

        // Action
        const { user_id, thread_id, comment_id } = useCasePayload;
        const deletedComment = await deleteCommentUseCase.execute(user_id, thread_id, comment_id);

        // Assert
        expect(deletedComment).toStrictEqual(expectedDeletedComment);
        expect(mockCommentsRepository.deleteComment).toHaveBeenCalledWith({
            user_id: useCasePayload.user_id,
            thread_id: useCasePayload.thread_id,
            comment_id: useCasePayload.comment_id
        });
    });
});
