const Reply = require('../../../Domains/replies/entities/Reply');
const Comment = require('../../../Domains/comments/entities/Comment');
const Thread = require('../../../Domains/threads/entities/Thread');
class DetailThreadUseCase {
    constructor({ threadRepository }) {
        this._threadRepository = threadRepository;
    }
    async execute(useCasePayload) {
        const { thread_id } = useCasePayload;
        return await this._threadRepository.getDetailThread({ thread_id });
    }

    mapValue = (query) => {
        const comments = this._getComments(query);
        const thread = new Thread({
            id: query[0].t_id,
            username: query[0].t_u_username,
            title: query[0].t_title,
            body: query[0].t_body,
            date: query[0].t_date,
            comments: [...comments],
        });
        return thread;
    }
    _getComments(query) {
        // filter mana yang komen dan mana yang bukan
        const comments = query.filter((comment) => !comment.c_reply_comment_id).map((comment) => {
            const replies = this._getReplies(query, comment.c_id);
            // map hasil filter
            return new Comment({
                id: comment.c_id,
                username: comment.c_username,
                content: comment.c_is_delete
                    ? "**komentar telah dihapus**"
                    : comment.c_content,
                date: comment.c_date,
                replies: [...replies],
            });
        });
        return comments;
    }

    _getReplies(query, comment_id) {
        // filter dari semua comment_id yang didapat mana yang cak cocok dengan reply_comment_id pada reply
        const replies = query.filter((reply) => { return reply.c_reply_comment_id === comment_id; }).map((reply) => {
            return new Reply({
                id: reply.c_id,
                username: reply.c_username,
                content: reply.c_is_delete
                    ? "**balasan telah dihapus**"
                    : reply.c_content,
                date: reply.c_date,
            });
        });
        return replies;
    }
}
module.exports = DetailThreadUseCase;
