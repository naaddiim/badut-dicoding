const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const RegisterUser = require('../../../Domains/users/entities/RegisterUser');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
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
        it('should get the detail of a thread and return its value correctly', async () => {
            // Arrange
            const fakeIdGenerator = () => "12345";
            const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
            const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

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

            // Get Thread, comment, and reply date
            const [getThread] = await ThreadsTableTestHelper.findThreadsById(addedThread.id);
            const [getComment] = await ThreadsTableTestHelper.findCommentsById(addedComment.id);

            const expectedThreadDetailsObject = {
                id: "thread-12345",
                username: "dicoding",
                title: "judul thread",
                body: "body thread",
                date: getThread.date,
                comments: [
                    {
                        id: "comment-12345",
                        username: "dicoding",
                        content: "Komen Pertama",
                        date: getComment.date,
                    },
                ],
            };
            // Action
            const { id: thread_id } = expectedThreadDetailsObject;
            const { query, thread } = await threadRepositoryPostgres.getDetailThread({ thread_id });

            // Assert
            expect(query).toHaveLength(1);
            console.log(query.length);
            expect(thread).toBeInstanceOf(Object);
            expect(thread.comments).toHaveLength(1);
            expect(thread).toStrictEqual(expectedThreadDetailsObject);
        });
        it('should throw Not FOund Error when thread_id is not correct', async () => {
            // Arrange
            const fakeIdGenerator = () => "12345";
            const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
            const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

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

            // Get Thread, comment, and reply date
            const [getThread] = await ThreadsTableTestHelper.findThreadsById(addedThread.id);
            const [getComment] = await ThreadsTableTestHelper.findCommentsById(addedComment.id);

            const expectedThreadDetailsObject = {
                id: "thread-456789",
                username: "dicoding",
                title: "judul thread",
                body: "body thread",
                date: getThread.date,
                comments: [
                    {
                        id: "comment-12345",
                        username: "dicoding",
                        content: "Komen Pertama",
                        date: getComment.date,
                    },
                ],
            };
            // Action - Assert
            const { id: thread_id } = expectedThreadDetailsObject;
            await expect(() => threadRepositoryPostgres.getDetailThread({ thread_id })).rejects.toThrow(NotFoundError);
        });
    });
});
