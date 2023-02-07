const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const RegisterUser = require('../../../Domains/users/entities/RegisterUser');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const UserRepositoryPostgres = require('../UserRepositoryPostgres');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
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

    describe('addReply function', () => {
        it('should persist add reply and return added reply correctly', async () => {
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

            const addReply = {
                user_id: 'user-12345',
                thread_id: 'thread-456789',
                comment_id: 'comment-54321',
                content: 'A new Reply of this comment'
            }
            const fakeThreadIdGenerator = () => '456789'; // stub!
            const fakeCommentIdGenerator = () => '54321'; // stub!
            const fakeReplyIdGenerator = () => '99999'; // stub!
            const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeThreadIdGenerator);
            const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeCommentIdGenerator);
            const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeReplyIdGenerator);

            // Action
            const addedThread = await threadRepositoryPostgres.addThread(addThread);
            const addedComment = await commentRepositoryPostgres.addComment(addComment);
            const addedReply = await replyRepositoryPostgres.addReply(addReply);

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
            const replies = await ThreadsTableTestHelper.findCommentsById('reply-99999');
            expect(replies).toHaveLength(1);
            expect(addedReply).toStrictEqual({
                id: "reply-99999",
                content: addReply.content,
                owner: addReply.user_id,
            });
        });
    });
    describe('deleteReply function', () => {
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
            const addReply = {
                user_id: 'user-12345',
                thread_id: 'thread-456789',
                comment_id: 'comment-54321',
                content: 'A new Reply of this comment'
            }
            const deleteReply = {
                user_id: 'user-12345',
                thread_id: 'thread-456789',
                comment_id: 'comment-54321',
                reply_id: 'reply-99999'
            }
            const fakeThreadIdGenerator = () => '456789'; // stub!
            const fakeCommentIdGenerator = () => '54321'; // stub!
            const fakeReplyIdGenerator = () => '99999'; // stub!
            const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeThreadIdGenerator);
            const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeCommentIdGenerator);
            const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeReplyIdGenerator);
            // Action
            await threadRepositoryPostgres.addThread(addThread);
            await commentRepositoryPostgres.addComment(addComment);
            await replyRepositoryPostgres.addReply(addReply);
            // Assert
            const oldReply = await ThreadsTableTestHelper.findCommentsById('reply-99999');
            await replyRepositoryPostgres.deleteReply(deleteReply);
            const newReply = await ThreadsTableTestHelper.findCommentsById('reply-99999');

            expect(oldReply).toHaveLength(1);
            expect(oldReply[0].is_delete).toEqual(false);
            expect(newReply).toHaveLength(1);
            expect(newReply[0].is_delete).toEqual(true);


        });
        it("should throw Not Found Error when thread id || comment id is not exist", async () => {
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
            const addReply = {
                user_id: 'user-12345',
                thread_id: 'thread-456789',
                comment_id: 'comment-54321',
                content: 'A new Reply of this comment'
            }
            const deleteReply = {
                user_id: 'user-12345',
                thread_id: 'thread-456789',
                comment_id: 'comment-35678',
                reply_id: 'reply-99999'
            }
            const fakeThreadIdGenerator = () => '456789'; // stub!
            const fakeCommentIdGenerator = () => '54321'; // stub!
            const fakeReplyIdGenerator = () => '99999'; // stub!
            const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeThreadIdGenerator);
            const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeCommentIdGenerator);
            const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeReplyIdGenerator);
            // Action
            await threadRepositoryPostgres.addThread(addThread);
            await commentRepositoryPostgres.addComment(addComment);
            await replyRepositoryPostgres.addReply(addReply);
            // Assert
            const oldReply = await ThreadsTableTestHelper.findCommentsById('reply-99999');
            expect(oldReply).toHaveLength(1);
            await expect(
                replyRepositoryPostgres.deleteReply(deleteReply)
            ).rejects.toThrow(NotFoundError);
        });
        it("should throw Not Found Error when reply id is not exist", async () => {
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
            const addReply = {
                user_id: 'user-12345',
                thread_id: 'thread-456789',
                comment_id: 'comment-54321',
                content: 'A new Reply of this comment'
            }
            const deleteReply = {
                user_id: 'user-12345',
                thread_id: 'thread-456789',
                comment_id: 'comment-54321',
                reply_id: 'reply-56789'
            }
            const fakeThreadIdGenerator = () => '456789'; // stub!
            const fakeCommentIdGenerator = () => '54321'; // stub!
            const fakeReplyIdGenerator = () => '99999'; // stub!
            const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeThreadIdGenerator);
            const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeCommentIdGenerator);
            const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeReplyIdGenerator);
            // Action
            await threadRepositoryPostgres.addThread(addThread);
            await commentRepositoryPostgres.addComment(addComment);
            await replyRepositoryPostgres.addReply(addReply);
            // Assert
            const oldReply = await ThreadsTableTestHelper.findCommentsById('reply-99999');

            expect(oldReply).toHaveLength(1);
            await expect(
                replyRepositoryPostgres.isReplyExist(deleteReply.reply_id)
            ).rejects.toThrow(NotFoundError);
        });
        it("should throw Authorization Error when user id is not correct", async () => {
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
            const addReply = {
                user_id: 'user-12345',
                thread_id: 'thread-456789',
                comment_id: 'comment-54321',
                content: 'A new Reply of this comment'
            }
            const deleteReply = {
                user_id: 'user-56789',
                thread_id: 'thread-456789',
                comment_id: 'comment-54321',
                reply_id: 'reply-56789'
            }
            const fakeThreadIdGenerator = () => '456789'; // stub!
            const fakeCommentIdGenerator = () => '54321'; // stub!
            const fakeReplyIdGenerator = () => '99999'; // stub!
            const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeThreadIdGenerator);
            const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeCommentIdGenerator);
            const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeReplyIdGenerator);
            // Action
            await threadRepositoryPostgres.addThread(addThread);
            await commentRepositoryPostgres.addComment(addComment);
            await replyRepositoryPostgres.addReply(addReply);
            // Assert
            const oldReply = await ThreadsTableTestHelper.findCommentsById('reply-99999');

            expect(oldReply).toHaveLength(1);
            await expect(
                replyRepositoryPostgres.isTheRightOwner(deleteReply.user_id)
            ).rejects.toThrow(AuthorizationError);
        });
    });
    describe('isReplyExist function', () => {
        it('should confirm reply does exist', async () => {
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
            const addReply = {
                user_id: 'user-12345',
                thread_id: 'thread-456789',
                comment_id: 'comment-54321',
                content: 'A new Reply of this comment'
            }
            const fakeThreadIdGenerator = () => '456789'; // stub!
            const fakeCommentIdGenerator = () => '54321'; // stub!
            const fakeReplyIdGenerator = () => '99999'; // stub!
            const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeThreadIdGenerator);
            const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeCommentIdGenerator);
            const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeReplyIdGenerator);
            // Action
            await threadRepositoryPostgres.addThread(addThread);
            await commentRepositoryPostgres.addComment(addComment);
            await replyRepositoryPostgres.addReply(addReply);
            //
            await expect(
                replyRepositoryPostgres.isReplyExist({
                    reply_id: "reply-99999"
                })
            ).resolves.not.toThrow(NotFoundError);
        });
        it('should throw Not Found Error when reply_id does exist', async () => {
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
            const addReply = {
                user_id: 'user-12345',
                thread_id: 'thread-456789',
                comment_id: 'comment-54321',
                content: 'A new Reply of this comment'
            }
            const fakeThreadIdGenerator = () => '456789'; // stub!
            const fakeCommentIdGenerator = () => '54321'; // stub!
            const fakeReplyIdGenerator = () => '99999'; // stub!
            const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeThreadIdGenerator);
            const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeCommentIdGenerator);
            const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeReplyIdGenerator);
            // Action
            await threadRepositoryPostgres.addThread(addThread);
            await commentRepositoryPostgres.addComment(addComment);
            await replyRepositoryPostgres.addReply(addReply);
            // 
            await expect(() =>
                replyRepositoryPostgres.isReplyExist({
                    reply_id: "reply-99998"
                })
            ).rejects.toThrow(NotFoundError);
        });
    });
    describe('isTheRightOwner function', () => {
        it('should confirm if its the right owner', async () => {
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
            const addReply = {
                user_id: 'user-12345',
                thread_id: 'thread-456789',
                comment_id: 'comment-54321',
                content: 'A new Reply of this comment'
            }
            const fakeThreadIdGenerator = () => '456789'; // stub!
            const fakeCommentIdGenerator = () => '54321'; // stub!
            const fakeReplyIdGenerator = () => '99999'; // stub!
            const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeThreadIdGenerator);
            const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeCommentIdGenerator);
            const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeReplyIdGenerator);
            // Action
            await threadRepositoryPostgres.addThread(addThread);
            await commentRepositoryPostgres.addComment(addComment);
            await replyRepositoryPostgres.addReply(addReply);
            //
            await expect(
                replyRepositoryPostgres.isTheRightOwner({
                    reply_id: "reply-99999",
                    user_id: 'user-12345'
                })
            ).resolves.not.toThrow(AuthorizationError);
        });
        it('should throw Authorization its not the right owner', async () => {
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
            const addReply = {
                user_id: 'user-12345',
                thread_id: 'thread-456789',
                comment_id: 'comment-54321',
                content: 'A new Reply of this comment'
            }
            const fakeThreadIdGenerator = () => '456789'; // stub!
            const fakeCommentIdGenerator = () => '54321'; // stub!
            const fakeReplyIdGenerator = () => '99999'; // stub!
            const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeThreadIdGenerator);
            const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeCommentIdGenerator);
            const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeReplyIdGenerator);
            // Action
            await threadRepositoryPostgres.addThread(addThread);
            await commentRepositoryPostgres.addComment(addComment);
            await replyRepositoryPostgres.addReply(addReply);
            // 
            await expect(() =>
                replyRepositoryPostgres.isTheRightOwner({
                    reply_id: "reply-99998",
                    user_id: 'user-12346',
                })
            ).rejects.toThrow(AuthorizationError);
        });
    });
});
