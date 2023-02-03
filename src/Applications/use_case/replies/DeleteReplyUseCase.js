class DeleteReplyUseCase {
    constructor({ threadRepository, commentRepository, replyRepository }) {
        this._threadRepository = threadRepository;
        this._commentRepository = commentRepository;
        this._replyRepository = replyRepository;
    }
    async execute(user_id, thread_id, comment_id, reply_id) {
        await this._threadRepository.isThreadExist({ thread_id });
        await this._commentRepository.isCommentExist({ comment_id });
        await this._replyRepository.isReplyExist({ reply_id });
        await this._replyRepository.isTheRightOwner({ reply_id, user_id });
        return await this._replyRepository.deleteReply({ user_id, thread_id, comment_id, reply_id });
    }
}

module.exports = DeleteReplyUseCase;
