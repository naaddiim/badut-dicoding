// file comment.js
class Comment {
  constructor(payload, replies) {
    this._verifyPayload(payload, replies);
    const { c_id, c_username, c_content, c_date, c_is_delete, c_like } = payload;
    this.id = c_id
    this.username = c_username
    this.content = c_is_delete ? "**komentar telah dihapus**" : c_content
    this.date = c_date
    this.likeCount = c_like
    this.replies = replies
  }
  _verifyPayload({ c_id, c_username, c_content, c_date, c_like }, replies) {
    if (!c_id || !c_username || !c_content || !c_date || c_like === undefined || !replies) {
      throw new Error('COMMENT_ENTITY.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof c_id !== 'string' || typeof c_username !== 'string' || typeof c_content !== 'string' || typeof c_date !== 'object' || typeof c_like !== 'number' || typeof replies !== 'object') {
      throw new Error('COMMENT_ENTITY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = Comment;