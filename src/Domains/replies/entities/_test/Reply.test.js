const Reply = require('../Reply');

describe('a Reply entities', () => {
    it('should throw error when payload did not contain needed property', () => {
        // Arrange
        const payload = {
            username: 'user-123',
            content: 'a new reply',
            date: new Date(),
            likeCount: 3,
            is_deleted: true,
        };

        // Action and Assert
        expect(() => new Reply(payload)).toThrowError('REPLY_ENTITY.NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when payload did not meet data type specification', () => {
        // Arrange
        const payload = {
            id: 123,
            username: 'user-123',
            content: 'a new reply',
            date: new Date(),
            likeCount: 3,
            is_deleted: true,
        };

        // Action and Assert
        expect(() => new Reply(payload)).toThrowError('REPLY_ENTITY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should create thread object correctly when is_deleted: true', () => {
        // Arrange
        const payload = {
            id: 'comment-123',
            username: 'user-123',
            content: 'a new reply',
            date: new Date(),
            likeCount: 0,
            is_deleted: true,
        };

        // Action
        const reply = new Reply(payload);

        // Assert
        expect(reply.id).toEqual(payload.id);
        expect(reply.username).toEqual(payload.username);
        expect(reply.content).toEqual("**balasan telah dihapus**");
        expect(reply.date).toEqual(payload.date);
        expect(reply.likeCount).toEqual(payload.likeCount);
    });
    it('should create thread object correctly when is_deleted: false', () => {
        // Arrange
        const payload = {
            id: 'comment-123',
            username: 'user-123',
            content: 'a new reply',
            date: new Date(),
            likeCount: 0,
            is_deleted: false,
        };

        // Action
        const reply = new Reply(payload);

        // Assert
        expect(reply.id).toEqual(payload.id);
        expect(reply.username).toEqual(payload.username);
        expect(reply.content).toEqual(payload.content);
        expect(reply.date).toEqual(payload.date);
        expect(reply.likeCount).toEqual(payload.likeCount);
    });
});
