const Comment = require('../Comment');

describe('a Comment entities', () => {
    it('should throw error when payload did not contain needed property', () => {
        // Arrange
        const payload = {
            username: 'user-123',
            content: 'a new comment',
            date: new Date(),
            is_deleted: true,
            replies: [{}],
        };

        // Action and Assert
        expect(() => new Comment(payload)).toThrowError('COMMENT_ENTITY.NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when payload did not meet data type specification', () => {
        // Arrange
        const payload = {
            id: 123,
            username: 'user-123',
            content: 'a new comment',
            date: new Date(),
            is_deleted: true,
            replies: [{}],
        };

        // Action and Assert
        expect(() => new Comment(payload)).toThrowError('COMMENT_ENTITY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should create thread object correctly', () => {
        // Arrange
        const payload = {
            id: 'comment-123',
            username: 'user-123',
            content: 'a new comment',
            date: new Date(),
            is_deleted: true,
            replies: [{}],
        };

        // Action
        const comment = new Comment(payload);

        // Assert
        expect(comment.id).toEqual(payload.id);
        expect(comment.username).toEqual(payload.username);
        expect(comment.content).toEqual("**komentar telah dihapus**");
        expect(comment.date).toEqual(payload.date);
        expect(comment.replies).toEqual(payload.replies);
    });
});
