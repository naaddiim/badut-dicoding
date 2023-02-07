class Thread {
    constructor(payload) {
        this._verifyPayload(payload);
        const { id, username, title, body, date, comments } = payload;
        this.id = id
        this.username = username
        this.title = title
        this.body = body
        this.date = date
        this.comments = comments
    }
    _verifyPayload({ id, username, title, body, date, comments }) {
        if (!id || !username || !title || !body || !date || !comments) {
          throw new Error('THREAD_ENTITY.NOT_CONTAIN_NEEDED_PROPERTY');
        }
    
        if (typeof id !== 'string' || typeof username !== 'string' || typeof title !== 'string' || typeof body !== 'string' || typeof date !== 'object' || typeof comments !== 'object') {
          throw new Error('THREAD_ENTITY.NOT_MEET_DATA_TYPE_SPECIFICATION');
        }
      }
}
module.exports = Thread;