const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const RegisterUser = require('../../../Domains/users/entities/RegisterUser');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const UserRepositoryPostgres = require('../UserRepositoryPostgres');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

describe('CommentRepositoryPostgres', () => {
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

    describe('addComment function', () => {
        it('should persist add comment and return added comment correctly', async () => {
            // Arrange
            const addThread = {
                user_id: 'user-12345',
                title: 'A New Thread',
                body: 'A New Body of Thread',
            };

            const addComment = {
                user_id: 'user-12345',
                thread_id: 'thread-456789',
                content: 'A new Comment of this thread'
            }
            const fakeThreadIdGenerator = () => '456789'; // stub!
            const fakeCommentIdGenerator = () => '54321'; // stub!
            const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeThreadIdGenerator);
            const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeCommentIdGenerator);

            // Action
            const addedThread = await threadRepositoryPostgres.addThread(addThread);
            const addedComment = await commentRepositoryPostgres.addComment(addComment);

            // Assert
            const threads = await ThreadsTableTestHelper.findThreadsById('thread-456789');
            expect(threads).toHaveLength(1);
            expect(addedThread).toStrictEqual({
                id: "thread-456789",
                owner: addThread.user_id,
                title: addThread.title,
            });

            const comments = await ThreadsTableTestHelper.findCommentsById('comment-54321');
            expect(comments).toHaveLength(1);
            expect(addedComment).toStrictEqual({
                id: "comment-54321",
                content: addComment.content,
                owner: addComment.user_id,
            });
        });
    });
    describe('deleteComment function', () => {
        it('should delete comment and return message correctly', async () => {
            // Arrange
            const addThread = {
                user_id: 'user-12345',
                title: 'A New Thread',
                body: 'A New Body of Thread',
            };

            const addComment = {
                user_id: 'user-12345',
                thread_id: 'thread-456789',
                content: 'A new Comment of this thread'
            }

            const deleteComment = {
                user_id: 'user-12345',
                thread_id: 'thread-456789',
                comment_id: 'comment-54321',
            }

            const fakeThreadIdGenerator = () => '456789'; // stub!
            const fakeCommentIdGenerator = () => '54321'; // stub!
            const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeThreadIdGenerator);
            const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeCommentIdGenerator);

            // Action
            const addedThread = await threadRepositoryPostgres.addThread(addThread);
            const addedComment = await commentRepositoryPostgres.addComment(addComment);


            // Assert
            const threads = await ThreadsTableTestHelper.findThreadsById('thread-456789');
            expect(threads).toHaveLength(1);
            expect(addedThread).toStrictEqual({
                id: "thread-456789",
                owner: addThread.user_id,
                title: addThread.title,
            });

            const oldComment = await ThreadsTableTestHelper.findCommentsById('comment-54321');
            await commentRepositoryPostgres.deleteComment(deleteComment);
            const newComment = await ThreadsTableTestHelper.findCommentsById('comment-54321');

            expect(oldComment).toHaveLength(1);
            expect(oldComment[0].is_delete).toEqual(false);
            expect(newComment).toHaveLength(1);
            expect(newComment[0].is_delete).toEqual(true);

        });
        it("should throw Not Found Error when thread_id not exist", async () => {
            // Arrange
            const fakeIdGenerator = () => "12345";
            const threadRepositoryPostgres = new ThreadRepositoryPostgres(
                pool,
                fakeIdGenerator
            );
            const commentsRepositoryPostgres = new CommentRepositoryPostgres(
                pool,
                fakeIdGenerator
            );

            // add thread
            const addThread = {
                user_id: "user-12345",
                title: "new test title",
                body: "new test body",
            };
            await threadRepositoryPostgres.addThread(addThread);

            // add comment
            const addComment = {
                user_id: "user-12345",
                thread_id: "thread-12345",
                content: "new comment on thread thread-12345 #1",
            };

            await commentsRepositoryPostgres.addComment(addComment);
            const commentsBeforeDelete = await ThreadsTableTestHelper.findCommentsById(
                "comment-12345"
            );
            // delete not exist comment
            const deleteComment = {
                user_id: 'user-12345',
                thread_id: 'thread-56789',
                comment_id: "comment-12345",
            };
            //Assert
            expect(commentsBeforeDelete).toHaveLength(1);
            await expect(
                commentsRepositoryPostgres.deleteComment(deleteComment)
            ).rejects.toThrow(NotFoundError);
        });
        it("should throw Not Found Error when comment_id not exist", async () => {
            // Arrange
            const fakeIdGenerator = () => "12345";
            const threadRepositoryPostgres = new ThreadRepositoryPostgres(
                pool,
                fakeIdGenerator
            );
            const commentsRepositoryPostgres = new CommentRepositoryPostgres(
                pool,
                fakeIdGenerator
            );

            // add thread
            const addThread = {
                user_id: "user-12345",
                title: "new test title",
                body: "new test body",
            };
            await threadRepositoryPostgres.addThread(addThread);

            // add comment
            const addComment = {
                user_id: "user-12345",
                thread_id: "thread-12345",
                content: "new comment on thread thread-12345 #1",
            };

            await commentsRepositoryPostgres.addComment(addComment);
            const commentsBeforeDelete = await ThreadsTableTestHelper.findCommentsById(
                "comment-12345"
            );
            // delete not exist comment
            const deleteComment = {
                user_id: 'user-12345',
                thread_id: 'thread-12345',
                comment_id: "comment-56789",
            };
            //Assert
            expect(commentsBeforeDelete).toHaveLength(1);
            await expect(
                commentsRepositoryPostgres.isCommentExist(deleteComment.comment_id)
            ).rejects.toThrow(NotFoundError);
        });
        it("should throw Authorization Error when user is not correct", async () => {
            // Arrange
            const fakeIdGenerator = () => "12345";
            const threadRepositoryPostgres = new ThreadRepositoryPostgres(
                pool,
                fakeIdGenerator
            );
            const commentsRepositoryPostgres = new CommentRepositoryPostgres(
                pool,
                fakeIdGenerator
            );

            // add thread
            const addThread = {
                user_id: "user-12345",
                title: "new test title",
                body: "new test body",
            };
            await threadRepositoryPostgres.addThread(addThread);

            // add comment
            const addComment = {
                user_id: "user-12345",
                thread_id: "thread-12345",
                content: "new comment on thread thread-12345 #1",
            };

            await commentsRepositoryPostgres.addComment(addComment);
            const comments = await ThreadsTableTestHelper.findCommentsById(
                "comment-12345"
            );

            // check if its the right owner
            const isTheRightOwner = {
                user_id: 'user-56789',
                comment_id: "comment-12345",
            };

            // delete not exist comment
            const deleteComment = {
                user_id: 'user-56789',
                thread_id: 'thread-12345',
                comment_id: "comment-67890",
            };

            //Assert
            expect(comments).toHaveLength(1);
            await expect(
                commentsRepositoryPostgres.isTheRightOwner(deleteComment.user_id)
            ).rejects.toThrow(AuthorizationError);
        });
    });
});
