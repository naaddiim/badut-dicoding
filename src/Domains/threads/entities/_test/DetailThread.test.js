const DetailThread = require('../DetailThread');

describe("GetThreadDetails response entities", () => {
    const threadDate = new Date();
    const commentDate = new Date();
    const replyDate = new Date();
    it("Should create the right details of thread", () => {
        // Arrange
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
            },
        ];
        const expectedDetailThread = {
            id: "thread-12345",
            username: "dicoding",
            title: "judul thread",
            body: "body thread",
            date: threadDate,
            comments: [
                {
                    id: "comment-45678",
                    username: "dicoding",
                    content: "komen pertama",
                    date: commentDate,
                    replies: [
                        {
                            id: "reply-12345",
                            username: "badut kelas",
                            content: "reply pertama",
                            date: replyDate,
                        },
                    ],
                },
            ],
        };

        // Action
        const { query, thread } = new DetailThread(queryResult);

        // Assert
        expect(query).toStrictEqual(queryResult);
        expect(thread).toStrictEqual(expectedDetailThread);
    });

    it("Should change is_delete value when its get deleted", () => {
        // Arrange
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
            },
        ];
        const expectedDetailThread = {
            id: "thread-12345",
            username: "dicoding",
            title: "judul thread",
            body: "body thread",
            date: threadDate,
            comments: [
                {
                    id: "comment-45678",
                    username: "dicoding",
                    content: "komen pertama",
                    date: commentDate,
                    replies: [
                        {
                            id: "reply-12345",
                            username: "badut kelas",
                            content: "reply pertama",
                            date: replyDate,
                        },
                        {
                            id: "reply-45678",
                            username: "orang Kedua",
                            content: "**balasan telah dihapus**",
                            date: replyDate,
                        },
                    ],
                },
                {
                    id: "comment-99999",
                    username: "badut kelas",
                    content: "**komentar telah dihapus**",
                    date: commentDate,
                    replies: [],
                },
            ],
        };

        // Action
        const { query, thread } = new DetailThread(queryResult);

        // Assert
        expect(query).toStrictEqual(queryResult);
        expect(thread).toStrictEqual(expectedDetailThread);
    });
});
