// file comment.js
class Comment {
    constructor(payload) {
        this._verifyPayload(payload);
        const { id, username, content, date, is_deleted, replies } = payload;
        this.id = id
        this.username = username
        this.content = is_deleted ? "**komentar telah dihapus**" : content
        this.date = date
        this.replies = replies
    }
    _verifyPayload({ id, username, content, date, replies }) {
        if (!id  || !username || !content || !date || !replies) {
          throw new Error('COMMENT_ENTITY.NOT_CONTAIN_NEEDED_PROPERTY');
        }
    
        if (typeof id !== 'string' || typeof username !== 'string' || typeof content !== 'string' || typeof date !== 'object' || typeof replies !== 'object') {
          throw new Error('COMMENT_ENTITY.NOT_MEET_DATA_TYPE_SPECIFICATION');
        }
      }
}

module.exports = Comment;