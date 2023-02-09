const AddCommentUseCase = require('../../../../Applications/use_case/comments/AddCommentUseCase');
const DeleteCommentUseCase = require('../../../../Applications/use_case/comments/DeleteCommentUseCase');
const LikeCommentUseCase = require('../../../../Applications/use_case/comments/LikeCommentUseCase');
class CommentsHandler {
  constructor(container) {
    this._container = container;
    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
    this.likeCommentHandler = this.likeCommentHandler.bind(this);
  }
  async postCommentHandler(request, h) {
    const addCommentUseCase = this._container.getInstance(AddCommentUseCase.name);
    const { id: user_id } = request.auth.credentials;
    const { threadId } = request.params;
    const addedComment = await addCommentUseCase.execute(user_id, threadId, request.payload);
    const response = h.response({
      status: 'success',
      data: {
        addedComment,
      },
    });
    response.code(201);
    return response;
  }
  async deleteCommentHandler(request, h) {
    const deleteCommentUseCase = this._container.getInstance(DeleteCommentUseCase.name);
    const { id: user_id } = request.auth.credentials;
    const { threadId, commentId } = request.params;
    await deleteCommentUseCase.execute(user_id, threadId, commentId);
    const response = h.response({
      status: 'success'
    });
    response.code(200);
    return response;
  }
  async likeCommentHandler(request, h) {
    const likeCommentUseCase = this._container.getInstance(LikeCommentUseCase.name);
    const { id: user_id } = request.auth.credentials;
    const { threadId, commentId } = request.params;
    await likeCommentUseCase.execute(user_id, threadId, commentId);
    const response = h.response({
      status: 'success'
    });
    response.code(200);
    return response;
  }
}

module.exports = CommentsHandler;
