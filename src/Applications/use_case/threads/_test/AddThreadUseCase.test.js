const ThreadRepository = require('../../../../Domains/threads/ThreadRepository');
const AddThreadUseCase = require('../AddThreadUseCase');

describe('AddThreadUserCase', () => {
    /**
     * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
     */
    it('should orchestrating the add thread action correctly', async () => {
        // Arrange
        const useCasePayload = {
            user_id: "somerandomCredentialId",
            threadPayload: {
                title: 'create new Thread',
                body: 'content of new thread',
            },
        };
        const expectedAddedThread = {
            id: 'thread-123',
            title: useCasePayload.threadPayload.title,
            owner: useCasePayload.user_id,
        };

        /** creating dependency of use case */
        const mockThreadRepository = new ThreadRepository();

        /** mocking needed function */
        mockThreadRepository.addThread = jest.fn()
            .mockImplementation(() => Promise.resolve(expectedAddedThread));

        /** creating use case instance */
        const addThreadUseCase = new AddThreadUseCase({
            threadRepository: mockThreadRepository,
        });

        // Action
        const { user_id, threadPayload } = useCasePayload;
        const addedThread = await addThreadUseCase.execute(user_id, threadPayload);

        // Assert
        expect(addedThread).toStrictEqual(expectedAddedThread);
        expect(mockThreadRepository.addThread).toHaveBeenCalledWith({
            user_id: useCasePayload.user_id,
            title: useCasePayload.threadPayload.title,
            body: useCasePayload.threadPayload.body,
        });
    });
});
