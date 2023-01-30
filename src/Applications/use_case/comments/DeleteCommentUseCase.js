class DeleteCommentUseCase {
    constructor({ commentRepository }) {
        this._commentRepository = commentRepository;
    }
    async execute(user_id, thread_id, comment_id) {
        await this._commentRepository.isThreadExist({ thread_id });
        await this._commentRepository.isCommentExist({ comment_id });
        await this._commentRepository.isTheRightOwner({ comment_id, user_id });
        return await this._commentRepository.deleteComment({ user_id, thread_id, comment_id });
    }
}

module.exports = DeleteCommentUseCase;
