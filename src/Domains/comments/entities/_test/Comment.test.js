const Comment = require('../Comment');

describe('a Comment entities', () => {
    it('should throw error when payload did not contain needed property', () => {
        // Arrange
        const payload = {
            c_username: 'user-123',
            c_content: 'a new comment',
            c_date: new Date(),
            c_is_delete: true,
            c_like: 1,
        }
        const replies = [{}]

        // Action and Assert
        expect(() => new Comment(payload, replies)).toThrowError('COMMENT_ENTITY.NOT_CONTAIN_NEEDED_PROPERTY')
    });

    it('should throw error when payload did not meet data type specification', () => {
        // Arrange
        const payload = {
            c_id: 123,
            c_username: 'user-123',
            c_content: 'a new comment',
            c_date: new Date(),
            c_is_delete: true,
            c_like: 1,
        };
        const replies = [{}]

        // Action and Assert
        expect(() => new Comment(payload, replies)).toThrowError('COMMENT_ENTITY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should create thread object correctly when is_deleted: true ', () => {
        // Arrange
        const payload = {
            c_id: 'comment-123',
            c_username: 'user-123',
            c_content: 'a new comment',
            c_date: new Date(),
            c_is_delete: true,
            c_like: 0,
        };
        const replies = [{}]

        // Action
        const comment = new Comment(payload, replies);

        // Assert
        expect(comment.id).toEqual(payload.c_id);
        expect(comment.username).toEqual(payload.c_username);
        expect(comment.content).toEqual("**komentar telah dihapus**");
        expect(comment.date).toEqual(payload.c_date);
        expect(comment.likeCount).toEqual(payload.c_like);
        expect(comment.replies).toEqual(replies);
    });
    it('should create thread object correctly when is_deleted: false ', () => {
        // Arrange
        const payload = {
            c_id: 'comment-123',
            c_username: 'user-123',
            c_content: 'a new comment',
            c_date: new Date(),
            c_is_delete: false,
            c_like: 0,
        };
        const replies = [{}]

        // Action
        const comment = new Comment(payload, replies);

        // Assert
        expect(comment.id).toEqual(payload.c_id);
        expect(comment.username).toEqual(payload.c_username);
        expect(comment.content).toEqual(payload.c_content);
        expect(comment.date).toEqual(payload.c_date);
        expect(comment.likeCount).toEqual(payload.c_like);
        expect(comment.replies).toEqual(replies);
    });
});
