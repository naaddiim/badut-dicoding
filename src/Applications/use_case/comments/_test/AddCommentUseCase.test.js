const CommentRepository = require('../../../../Domains/comments/CommentRepository');
const AddCommentUseCase = require('../AddCommentUseCase');

describe('AddCommentUseCase', () => {
    /**
     * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
     */
    it('should orchestrating the add comment action correctly', async () => {
        // Arrange
        const useCasePayload = {
            user_id: "somerandomCredentialId",
            thread_id: "somerandomThreadId",
            commentPayload: {
                content: 'create new comment',
            },
        };
        const expectedAddedComment = {
            id: 'comment-123',
            content: useCasePayload.commentPayload.content,
            owner: useCasePayload.user_id,
        };

        /** creating dependency of use case */
        const mockCommentsRepository = new CommentRepository();

        /** mocking needed function */
        mockCommentsRepository.isThreadExist = jest.fn().mockImplementation(() => Promise.resolve());
        mockCommentsRepository.addComment = jest.fn()
            .mockImplementation(() => Promise.resolve(expectedAddedComment));

        /** creating use case instance */
        const addCommentUseCase = new AddCommentUseCase({
            commentRepository: mockCommentsRepository,
        });

        // Action
        const { user_id, thread_id, commentPayload } = useCasePayload;
        const addedComment = await addCommentUseCase.execute(user_id, thread_id, commentPayload);

        // Assert
        expect(addedComment).toStrictEqual(expectedAddedComment);
        expect(mockCommentsRepository.addComment).toHaveBeenCalledWith({
            user_id: useCasePayload.user_id,
            thread_id: useCasePayload.thread_id,
            content: useCasePayload.commentPayload.content,
        });
    });
});
