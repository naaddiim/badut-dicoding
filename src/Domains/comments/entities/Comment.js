// file comment.js
class Comment {
    constructor(payload) {
        this._verifyPayload(payload);
        const { id, username, content, date, is_deleted, likeCount, replies } = payload;
        this.id = id
        this.username = username
        this.content = is_deleted ? "**komentar telah dihapus**" : content
        this.date = date
        this.likeCount = likeCount
        this.replies = replies
    }
    _verifyPayload({ id, username, content, date, likeCount, replies }) {
        if (!id  || !username || !content || !date || likeCount === undefined || !replies) {
          throw new Error('COMMENT_ENTITY.NOT_CONTAIN_NEEDED_PROPERTY');
        }
    
        if (typeof id !== 'string' || typeof username !== 'string' || typeof content !== 'string' || typeof date !== 'object' || typeof likeCount !== 'number' || typeof replies !== 'object') {
          throw new Error('COMMENT_ENTITY.NOT_MEET_DATA_TYPE_SPECIFICATION');
        }
      }
}

module.exports = Comment;