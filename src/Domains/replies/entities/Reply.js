class Reply {
    constructor(payload) {
        this._verifyPayload(payload);
        const { c_id, c_username, c_content, c_date, c_like, c_is_delete } = payload;
        this.id = c_id
        this.username = c_username
        this.content = c_is_delete ? "**balasan telah dihapus**" : c_content
        this.date = c_date
        this.likeCount = c_like
    }
    _verifyPayload({ c_id, c_username, c_content, c_date, c_like }) {
        if (!c_id || !c_username || !c_content || !c_date || c_like === undefined) {
            throw new Error('REPLY_ENTITY.NOT_CONTAIN_NEEDED_PROPERTY');
        }

        if (typeof c_id !== 'string' || typeof c_username !== 'string' || typeof c_content !== 'string' || typeof c_date !== 'object' || typeof c_like !== 'number' ) {
            throw new Error('REPLY_ENTITY.NOT_MEET_DATA_TYPE_SPECIFICATION');
        }
    }
}

module.exports = Reply;