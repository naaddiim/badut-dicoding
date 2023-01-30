class DetailThread {
    constructor(query) {
        this.query = query;
        this.thread = this._getThread(query);
    }

    _getThread(query) {
        const comments = this._getComments(query);
        const thread = {
            id: query[0].t_id,
            username: query[0].t_u_username,
            title: query[0].t_title,
            body: query[0].t_body,
            date: query[0].t_date,
            comments: [...comments],
        };
        return thread;
    }

    _getComments(query) {
        // filter mana yang komen dan mana yang bukan
        const comments = query.filter((comment) => !comment.c_reply_comment_id).map((comment) => {
            const replies = this._getReplies(query, comment.c_id);
            // map hasil filter
            return {
                id: comment.c_id,
                username: comment.c_username,
                content: comment.c_is_delete
                    ? "**komentar telah dihapus**"
                    : comment.c_content,
                date: comment.c_date,
                replies: [...replies],
            };
        });
        return comments;
    }

    _getReplies(query, comment_id) {
        // filter dari semua comment_id yang didapat mana yang cak cocok dengan reply_comment_id pada reply
        const replies = query.filter((reply) => { return reply.c_reply_comment_id === comment_id; }).map((reply) => {
            return {
                id: reply.c_id,
                username: reply.c_username,
                content: reply.c_is_delete
                    ? "**balasan telah dihapus**"
                    : reply.c_content,
                date: reply.c_date,
            };
        });
        return replies;
    }
}
module.exports = DetailThread;
