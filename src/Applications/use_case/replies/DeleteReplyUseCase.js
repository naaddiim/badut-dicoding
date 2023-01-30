class DeleteReplyUseCase {
    constructor({ replyRepository }) {
        this.replyRepository = replyRepository;
    }
    async execute(user_id, thread_id, comment_id, reply_id) {
        await this.replyRepository.isThreadExist({ thread_id });
        await this.replyRepository.isCommentExist({ comment_id });
        await this.replyRepository.isReplyExist({ reply_id });
        await this.replyRepository.isTheRightOwner({ reply_id, user_id });
        return await this.replyRepository.deleteReply({ user_id, thread_id, comment_id, reply_id });
    }
}

module.exports = DeleteReplyUseCase;
