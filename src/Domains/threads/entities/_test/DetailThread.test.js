const DetailThread = require('../DetailThread');

describe("GetThreadDetails response entities", () => {
    it("Should create the right details of thread", () => {
        // Arrange
        const queryResult = [
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
        const expectedDetailThread = {
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
            {
                t_id: "thread-12345",
                t_title: "judul thread",
                t_body: "body thread",
                t_date: "2023-25-1",
                t_u_username: "dicoding",
                c_id: "reply-45678",
                c_content: "reply kedua",
                c_date: "2023-25-1",
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
                        {
                            id: "reply-45678",
                            username: "orang Kedua",
                            content: "**balasan telah dihapus**",
                            date: "2023-25-1",
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
});
