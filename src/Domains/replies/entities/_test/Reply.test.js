const Reply = require('../Reply');

describe('a Reply entities', () => {
    it('should throw error when payload did not contain needed property', () => {
        // Arrange
        const payload = {
            c_username: 'user-123',
            c_content: 'a new reply',
            c_date: new Date(),
            c_like: 3,
            c_is_delete: true,
        };

        // Action and Assert
        expect(() => new Reply(payload)).toThrowError('REPLY_ENTITY.NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when payload did not meet data type specification', () => {
        // Arrange
        const payload = {
            c_id: 123,
            c_username: 'user-123',
            c_content: 'a new reply',
            c_date: new Date(),
            c_like: 3,
            c_is_delete: true,
        };

        // Action and Assert
        expect(() => new Reply(payload)).toThrowError('REPLY_ENTITY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should create thread object correctly when is_deleted: true', () => {
        // Arrange
        const payload = {
            c_id: 'comment-123',
            c_username: 'user-123',
            c_content: 'a new reply',
            c_date: new Date(),
            c_like: 0,
            c_is_delete: true,
        };

        // Action
        const reply = new Reply(payload);

        // Assert
        expect(reply.id).toEqual(payload.c_id);
        expect(reply.username).toEqual(payload.c_username);
        expect(reply.content).toEqual("**balasan telah dihapus**");
        expect(reply.date).toEqual(payload.c_date);
        expect(reply.likeCount).toEqual(payload.c_like);
    });
    it('should create thread object correctly when is_deleted: false', () => {
        // Arrange
        const payload = {
            c_id: 'comment-123',
            c_username: 'user-123',
            c_content: 'a new reply',
            c_date: new Date(),
            c_like: 0,
            c_is_delete: false,
        };

        // Action
        const reply = new Reply(payload);

        // Assert
        expect(reply.id).toEqual(payload.c_id);
        expect(reply.username).toEqual(payload.c_username);
        expect(reply.content).toEqual(payload.c_content);
        expect(reply.date).toEqual(payload.c_date);
        expect(reply.likeCount).toEqual(payload.c_like);
    });
});
