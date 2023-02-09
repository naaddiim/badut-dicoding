const Thread = require('../../../../Domains/threads/entities/Thread');
const Comment = require('../../../../Domains/comments/entities/Comment');
const Reply = require('../../../../Domains/replies/entities/Reply');
const ThreadRepository = require('../../../../Domains/threads/ThreadRepository');
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
        const threadDate = new Date();
        const commentDate = new Date();
        const replyDate = new Date();
        const queryResult = [
            {
                t_id: "thread-12345",
                t_title: "judul thread",
                t_body: "body thread",
                t_date: threadDate,
                t_u_username: "dicoding",
                c_id: "comment-45678",
                c_content: "komen pertama",
                c_date: commentDate,
                c_is_delete: false,
                c_reply_comment_id: null,
                c_username: "dicoding",
                c_like: 3,
            },
            {
                t_id: "thread-12345",
                t_title: "judul thread",
                t_body: "body thread",
                t_date: threadDate,
                t_u_username: "dicoding",
                c_id: "comment-99999",
                c_content: "komen kedua",
                c_date: commentDate,
                c_is_delete: true,
                c_reply_comment_id: null,
                c_username: "badut kelas",
                c_like: 0,
            },
            {
                t_id: "thread-12345",
                t_title: "judul thread",
                t_body: "body thread",
                t_date: threadDate,
                t_u_username: "dicoding",
                c_id: "reply-12345",
                c_content: "reply pertama",
                c_date: replyDate,
                c_is_delete: false,
                c_reply_comment_id: "comment-45678",
                c_username: "badut kelas",
                c_like: 7,
            },
            {
                t_id: "thread-12345",
                t_title: "judul thread",
                t_body: "body thread",
                t_date: threadDate,
                t_u_username: "dicoding",
                c_id: "reply-45678",
                c_content: "reply kedua",
                c_date: replyDate,
                c_is_delete: true,
                c_reply_comment_id: "comment-45678",
                c_username: "orang Kedua",
                c_like: 0,
            },
        ];
        const expectedDetailThread = new Thread({
            id: "thread-12345",
            username: "dicoding",
            title: "judul thread",
            body: "body thread",
            date: threadDate,
            comments: [
                new Comment({
                    id: "comment-45678",
                    username: "dicoding",
                    content: "komen pertama",
                    date: commentDate,
                    likeCount: 3,
                    replies: [
                        new Reply({
                            id: "reply-12345",
                            username: "badut kelas",
                            content: "reply pertama",
                            date: replyDate,
                            likeCount: 7,
                        }),
                        new Reply({
                            id: "reply-45678",
                            username: "orang Kedua",
                            content: "**balasan telah dihapus**",
                            date: replyDate,
                            likeCount: 0,
                        }),
                    ],
                }),
                new Comment({
                    id: "comment-99999",
                    username: "badut kelas",
                    content: "**komentar telah dihapus**",
                    date: commentDate,
                    likeCount: 0,
                    replies: [],
                }),
            ],
        });

        /** creating dependency of use case */
        const mockThreadRepository = new ThreadRepository();

        /** mocking needed function */
        mockThreadRepository.getDetailThread = jest.fn().mockImplementation(() => Promise.resolve(queryResult));

        /** creating use case instance */
        const detailThreadUseCase = new DetailThreadUseCase({
            threadRepository: mockThreadRepository,
        });

        // Action
        const query = await detailThreadUseCase.execute(useCasePayload);
        const result = detailThreadUseCase.mapValue(query);

        // Assert
        expect(query).toHaveLength(4);
        expect(result).toStrictEqual(expectedDetailThread);
        expect(mockThreadRepository.getDetailThread).toHaveBeenCalledWith({ thread_id: useCasePayload.thread_id, });
    });
});
