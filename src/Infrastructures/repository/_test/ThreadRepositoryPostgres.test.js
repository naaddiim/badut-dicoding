const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const RegisterUser = require('../../../Domains/users/entities/RegisterUser');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const UserRepositoryPostgres = require('../UserRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('ThreadRepositoryPostgres', () => {
    afterEach(async () => {
        await ThreadsTableTestHelper.cleanTable();
    });

    beforeAll(async () => {
        //Register new User
        const registerUser = new RegisterUser({
            username: "dicoding",
            password: "secret_password",
            fullname: "Dicoding Indonesia",
        });
        const fakeIdGenerator = () => "12345";
        const userRepositoryPostgres = new UserRepositoryPostgres(
            pool,
            fakeIdGenerator
        );

        await userRepositoryPostgres.addUser(registerUser);
    });

    afterAll(async () => {
        await UsersTableTestHelper.cleanTable();
        await pool.end();
    });


    describe('addThread function', () => {
        it('should persist add thread and return added thread correctly', async () => {
            // Arrange
            const addThread = {
                user_id: 'user-12345',
                title: 'A New Thread',
                body: 'A New Body of Thread',
            };
            const fakeIdGenerator = () => '456789'; // stub!
            const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

            // Action
            const addedThread = await threadRepositoryPostgres.addThread(addThread);

            // Assert
            const threads = await ThreadsTableTestHelper.findThreadsById('thread-456789');
            expect(threads).toHaveLength(1);
            expect(addedThread).toStrictEqual({
                id: "thread-456789",
                owner: addThread.user_id,
                title: addThread.title,
            });
        });
    });

    describe('DetailThread function', () => {
        it('should get the right query and return its value correctly', async () => {
            // Arrange
            const fakeIdGenerator = () => "12345";
            const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
            const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);
            const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

            const addThread = {
                user_id: "user-12345",
                title: "judul thread",
                body: "body thread",
            };
            const addedThread = await threadRepositoryPostgres.addThread(addThread);

            const addComment = {
                user_id: "user-12345",
                thread_id: "thread-12345",
                content: "Komen Pertama",
            };
            const addedComment = await commentRepositoryPostgres.addComment(addComment);

            const addReply = {
                user_id: "user-12345",
                thread_id: "thread-12345",
                comment_id: "comment-12345",
                content: "Reply Pertama",
            };
            const addedReply = await replyRepositoryPostgres.addReply(addReply);


            const [getThread] = await ThreadsTableTestHelper.findThreadsById(addedThread.id);
            const [getComment] = await ThreadsTableTestHelper.findCommentsById(addedComment.id);
            const [getReply] = await ThreadsTableTestHelper.findCommentsById(addedReply.id);

            const expectedThreadDetailQuery = [
                {
                    t_id: 'thread-12345',
                    t_title: 'judul thread',
                    t_body: 'body thread',
                    t_date: getThread.date,
                    t_u_username: 'dicoding',
                    c_id: 'comment-12345',
                    c_content: 'Komen Pertama',
                    c_date: getComment.date,
                    c_is_delete: false,
                    c_reply_comment_id: null,
                    c_username: 'dicoding'
                },
                {
                    t_id: 'thread-12345',
                    t_title: 'judul thread',
                    t_body: 'body thread',
                    t_date: getThread.date,
                    t_u_username: 'dicoding',
                    c_id: 'reply-12345',
                    c_content: 'Reply Pertama',
                    c_date: getReply.date,
                    c_is_delete: false,
                    c_reply_comment_id: 'comment-12345',
                    c_username: 'dicoding'
                }
            ];
            // Action
            const { t_id: thread_id } = expectedThreadDetailQuery[0];
            const query = await threadRepositoryPostgres.getDetailThread({ thread_id });
            // Assert
            expect(query).toHaveLength(2);
            expect(query).toBeInstanceOf(Object);
            expect(query).toStrictEqual(expectedThreadDetailQuery);
        });
        it('should throw Not FOund Error when thread_id is not correct', async () => {
            // Arrange
            const fakeIdGenerator = () => "12345";
            const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
            const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);
            const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

            const addThread = {
                user_id: "user-12345",
                title: "judul thread",
                body: "body thread",
            };
            const addedThread = await threadRepositoryPostgres.addThread(addThread);

            const addComment = {
                user_id: "user-12345",
                thread_id: "thread-12345",
                content: "Komen Pertama",
            };
            const addedComment = await commentRepositoryPostgres.addComment(addComment);

            const addReply = {
                user_id: "user-12345",
                thread_id: "thread-12345",
                comment_id: "comment-12345",
                content: "Reply Pertama",
            };
            const addedReply = await replyRepositoryPostgres.addReply(addReply);

            // Action - Assert
            const thread_id = 'thread-12346'
            await expect(() => threadRepositoryPostgres.getDetailThread({ thread_id })).rejects.toThrow(NotFoundError);
        });
    });
    describe('isThreadExist function', () => {
        it('should confirm thread does exist', async () => {
            // Arrange
            const fakeIdGenerator = () => "12345";
            const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

            const addThread = {
                user_id: "user-12345",
                title: "judul thread",
                body: "body thread",
            };

            await threadRepositoryPostgres.addThread(addThread);

            await expect(
                threadRepositoryPostgres.isThreadExist({
                    thread_id: "thread-12345",
                })
            ).resolves.not.toThrow(NotFoundError);
        });
        it('should throw Not FOund Error when thread_id is not correct', async () => {
            // Arrange
            const fakeIdGenerator = () => "12345";
            const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

            const addThread = {
                user_id: "user-12345",
                title: "judul thread",
                body: "body thread",
            };
            await threadRepositoryPostgres.addThread(addThread);
            await expect(
                threadRepositoryPostgres.isThreadExist({
                    thread_id: "thread-12346",
                })
            ).rejects.toThrow(NotFoundError);

        });
    });
});
