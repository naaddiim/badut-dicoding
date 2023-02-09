class Reply {
    constructor(payload) {
        this._verifyPayload(payload);
        const { id, username, content, date, likeCount, is_deleted } = payload;
        this.id = id
        this.username = username
        this.content = is_deleted ? "**balasan telah dihapus**" : content
        this.date = date
        this.likeCount = likeCount
        this.is_deleted = is_deleted
    }
    _verifyPayload({ id, username, content, date, likeCount }) {
        if (!id || !username || !content || !date || likeCount === undefined) {
            throw new Error('REPLY_ENTITY.NOT_CONTAIN_NEEDED_PROPERTY');
        }

        if (typeof id !== 'string' || typeof username !== 'string' || typeof content !== 'string' || typeof date !== 'object' || typeof likeCount !== 'number' ) {
            throw new Error('REPLY_ENTITY.NOT_MEET_DATA_TYPE_SPECIFICATION');
        }
    }
}

module.exports = Reply;