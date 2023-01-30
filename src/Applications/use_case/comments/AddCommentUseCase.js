const AddComment = require('../../../Domains/comments/entities/AddComment');

class AddCommentUseCase {
    constructor({ commentRepository }) {
        this._commentRepository = commentRepository;
    }
    async execute(user_id, thread_id, commentPayload) {
        const { content } = new AddComment(commentPayload);
        await this._commentRepository.isThreadExist({thread_id});
        return await this._commentRepository.addComment({
            user_id,
            thread_id,
            content,
        });
    }
}

module.exports = AddCommentUseCase;
