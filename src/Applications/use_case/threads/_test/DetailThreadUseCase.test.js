const ThreadRepository = require('../../../../Domains/threads/ThreadRepository');
const DetailThread = require('../../../../Domains/threads/entities/DetailThread');
const DetailThreadUseCase = require('../DetailThreadUseCase');

describe('DetailThreadUseCase', () => {
    /**
     * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
     */
    it('should orchestrating get detail thread action correctly', async () => {
        // Arrange
        const useCasePayload = {
            thread_id: "somerandomThreadId",
        };
        const expectedQueryResult = [
            {
                t_id: "thread-12345",
                t_title: "judul thread",
                t_body: "body thread",
                t_date: "2023-25-1",
                t_u_username: "dicoding",
                c_id: "comment-45678",
                c_content: "komen pertama",
                c_date: "2023-25-1",
                c_is_delete: false,
                c_reply_comment_id: null,
                c_username: "dicoding",
            },
            {
                t_id: "thread-12345",
                t_title: "judul thread",
                t_body: "body thread",
                t_date: "2023-25-1",
                t_u_username: "dicoding",
                c_id: "reply-12345",
                c_content: "reply pertama",
                c_date: "2023-25-1",
                c_is_delete: false,
                c_reply_comment_id: "comment-45678",
                c_username: "badut kelas",
            },
        ];
        const expectedThreadDetail = {
            id: "thread-12345",
            username: "dicoding",
            title: "judul thread",
            body: "body thread",
            date: "2023-25-1",
            comments: [
                {
                    id: "comment-45678",
                    username: "dicoding",
                    content: "komen pertama",
                    date: "2023-25-1",
                    replies: [
                        {
                            id: "reply-12345",
                            username: "badut kelas",
                            content: "reply pertama",
                            date: "2023-25-1",
                        },
                    ],
                },
            ],
        };


        /** creating dependency of use case */
        const mockThreadRepository = new ThreadRepository();

        /** mocking needed function */
        mockThreadRepository.getDetailThread = jest.fn().mockImplementation(() => Promise.resolve(new DetailThread(expectedQueryResult)));

        /** creating use case instance */
        const detailThreadUseCase = new DetailThreadUseCase({
            threadRepository: mockThreadRepository,
        });

        // Action
        const { query, thread } = await detailThreadUseCase.execute(useCasePayload);

        // Assert
        expect(query).toHaveLength(2);
        expect(thread).toStrictEqual(expectedThreadDetail);
        expect(mockThreadRepository.getDetailThread).toHaveBeenCalledWith({ thread_id: useCasePayload.thread_id, });
    });
});
