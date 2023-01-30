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
                // t = threads, u = users, c = comments
                t_id: "thread-12345",
                t_title: "judul thread",
                t_body: "body thread",
                t_date: "2023-25-1",
                t_u_username: "dicoding",
                c_id: "comment-12345",
                c_u_username: "badutKelas",
                c_date: "2023-25-1",
                c_content: "Komen Pertama",
                c_is_delete: false,
            },
            {
                // t = threads, u = users, c = comments
                t_id: "thread-12345",
                t_title: "judul thread",
                t_body: "body thread",
                t_date: "2023-25-1",
                t_u_username: "dicoding",
                c_id: "comment-456789",
                c_u_username: "dicoding",
                c_date: "2023-29-1",
                c_content: "Komen Kedua",
                c_is_delete: true,
            },
        ];
        const expectedThreadDetail = {
            id: "thread-12345",
            title: "judul thread",
            body: "body thread",
            date: "2023-25-1",
            username: "dicoding",
            comments: [
                {
                    id: "comment-12345",
                    username: "badutKelas",
                    date: "2023-25-1",
                    content: "Komen Pertama",
                },
                {
                    id: "comment-456789",
                    username: "dicoding",
                    date: "2023-29-1",
                    content: "**komentar telah dihapus**",
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
