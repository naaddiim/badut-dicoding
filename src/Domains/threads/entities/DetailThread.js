class DetailThread {
    constructor(query) {
        this.query = query;
        this.thread = this._getThreadDetail(query);
    }

    _getThreadDetail(query) {
        const comments = this._getComments(query);
        const thread = {
            id: query[0].t_id,
            title: query[0].t_title,
            body: query[0].t_body,
            date: query[0].t_date,
            username: query[0].t_u_username,
            comments: [...comments],
        };
        return thread;
    }

    _getComments(query) {
        const comments = query.map((comment) => {
                return {
                    id: comment.c_id,
                    username: comment.c_u_username,
                    date: comment.c_date,
                    content: comment.c_is_delete
                        ? "**komentar telah dihapus**"
                        : comment.c_content,
                };
            });
        return comments;
    }
}
module.exports = DetailThread;
