const DetailThread = require('../DetailThread');

describe("DetailThread response entities", () => {
    it("Should create correct details of thread object properly", () => {
        // Arrange
        const queryResult = [
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
        const expectedThreadObject = {
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

        // Action
        const { query, thread } = new DetailThread(queryResult);
        console.log(thread);

        // Assert
        expect(query).toStrictEqual(query);
        expect(thread).toStrictEqual(expectedThreadObject);
    });
});
