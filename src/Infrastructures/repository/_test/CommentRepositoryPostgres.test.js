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
            const addComment = {
                user_id: 'user-12345',
                thread_id: 'thread-456789',
                content: 'A new Comment of this thread'
            }
            const fakeCommentIdGenerator = () => '54321'; // stub!
            const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeCommentIdGenerator);

            // Action
            await ThreadsTableTestHelper.addThread({
                user_id: 'user-12345',
                title: 'A New Thread',
                body: 'A New Body of Thread',
            })
            const addedComment = await commentRepositoryPostgres.addComment(addComment);

            // Assert
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
    });
    describe('isCommentExist function', () => {
        it("should confirm comment existense correctly", async () => {
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

            // Action
            await expect(
                commentsRepositoryPostgres.isCommentExist({
                    comment_id: "comment-12345",
                })
            ).resolves.not.toThrow(NotFoundError);
        });
        it("should throw Not Found Error when comment_id is not exist", async () => {
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

            // Action
            await expect(
                commentsRepositoryPostgres.isCommentExist({
                    comment_id: "comment-12346",
                })
            ).rejects.toThrow(NotFoundError);
        });
    });
    describe('isTheRightOwner function', () => {
        it("should confirm if its the right owner", async () => {
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

            // Action
            await expect(
                commentsRepositoryPostgres.isTheRightOwner({
                    comment_id: "comment-12345",
                    user_id: "user-12345",
                })
            ).resolves.not.toThrow(AuthorizationError);
        });
        it("should throw Authorization Error when is not the right owner", async () => {
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

            // Action
            await expect(
                commentsRepositoryPostgres.isTheRightOwner({
                    comment_id: "comment-12345",
                    user_id: "user-12346",
                })
            ).rejects.toThrow(AuthorizationError);
        });
    });
    describe("updateLike function", () => {
        it("Should increment likeCount correctly", async () => {
            // Arrange
            const fakeIdGenerator = () => "56789";
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
                title: "a new thread",
                body: "body of a new thread",
            };
            await threadRepositoryPostgres.addThread(addThread);
            // add comment
            const addComment = {
                user_id: "user-12345",
                thread_id: "thread-56789",
                content: "a new comment",
            };
            await commentsRepositoryPostgres.addComment(addComment);
            const oldCommentLike = await ThreadsTableTestHelper.findCommentsById("comment-56789");
            // Action
            // add likes to comment
            const addCommentLikes = {
                user_id: "user-12345",
                thread_id: "thread-56789",
                comment_id: "comment-56789",
            };
            await commentsRepositoryPostgres.updateLike(addCommentLikes);
            const newCommentLike = await ThreadsTableTestHelper.findCommentsById("comment-56789");

            // Assert
            expect(oldCommentLike).toHaveLength(1);
            expect(oldCommentLike[0].likes).toEqual(0);
            expect(newCommentLike).toHaveLength(1);
            expect(newCommentLike[0].likes).toEqual(1);
        });
        it("Should decrement likeCount correctly", async () => {
            // Arrange
            const fakeIdGenerator = () => "56789";
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
                title: "a new thread",
                body: "body of a new thread",
            };
            await threadRepositoryPostgres.addThread(addThread);
            // add comment
            const addComment = {
                user_id: "user-12345",
                thread_id: "thread-56789",
                content: "a new comment",
            };
            await commentsRepositoryPostgres.addComment(addComment);
            const oldCommentLike = await ThreadsTableTestHelper.findCommentsById("comment-56789");
            // Action
            // add likes to comment
            const addCommentLikes = {
                user_id: "user-12345",
                thread_id: "thread-56789",
                comment_id: "comment-56789",
            };
            await commentsRepositoryPostgres.updateLike(addCommentLikes);
            const newCommentLike = await ThreadsTableTestHelper.findCommentsById("comment-56789");

            // unlikes the comment
            const removeCommentLikes = {
                user_id: "user-12345",
                thread_id: "thread-56789",
                comment_id: "comment-56789",
            };
            await commentsRepositoryPostgres.updateLike(removeCommentLikes);
            const afterUnlike = await ThreadsTableTestHelper.findCommentsById("comment-56789");

            // Assert
            expect(oldCommentLike).toHaveLength(1);
            expect(oldCommentLike[0].likes).toEqual(0);
            expect(newCommentLike).toHaveLength(1);
            expect(newCommentLike[0].likes).toEqual(1);
            expect(afterUnlike).toHaveLength(1);
            expect(afterUnlike[0].likes).toEqual(0);
        });
    });
});
