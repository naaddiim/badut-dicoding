const AddReply = require('../../../Domains/replies/entities/AddReply');

class AddReplyUseCase {
    constructor({ threadRepository, commentRepository, replyRepository }) {
        this._threadRepository = threadRepository;
        this._commentRepository = commentRepository;
        this._replyRepository = replyRepository;
    }
    async execute(user_id, thread_id, comment_id, replyPayload) {
        const { content } = new AddReply(replyPayload);
        await this._threadRepository.isThreadExist({ thread_id });
        await this._commentRepository.isCommentExist({ comment_id });
        return await this._replyRepository.addReply({
            user_id,
            thread_id,
            comment_id,
            content,
        });
    }
}

module.exports = AddReplyUseCase;
