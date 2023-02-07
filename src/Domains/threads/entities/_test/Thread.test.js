const Thread = require('../Thread');

describe('a Thread entities', () => {
    it('should throw error when payload did not contain needed property', () => {
        // Arrange
        const payload = {
            username: 'user-123',
            title: 'a new thread',
            body: 'body of a new thread',
            date: new Date(),
            comments: [{}],
        };

        // Action and Assert
        expect(() => new Thread(payload)).toThrowError('THREAD_ENTITY.NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when payload did not meet data type specification', () => {
        // Arrange
        const payload = {
            id: 123,
            username: 'user-123',
            title: 'a new thread',
            body: 'body of a new thread',
            date: new Date(),
            comments: [{}],
        };

        // Action and Assert
        expect(() => new Thread(payload)).toThrowError('THREAD_ENTITY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should create thread object correctly', () => {
        // Arrange
        const payload = {
            id: 'thread-123',
            username: 'user-123',
            title: 'a new thread',
            body: 'body of a new thread',
            date: new Date(),
            comments: [{}],
        };

        // Action
        const thread = new Thread(payload);

        // Assert
        expect(thread.id).toEqual(payload.id);
        expect(thread.username).toEqual(payload.username);
        expect(thread.title).toEqual(payload.title);
        expect(thread.body).toEqual(payload.body);
        expect(thread.date).toEqual(payload.date);
        expect(thread.comments).toEqual(payload.comments);
    });
});
