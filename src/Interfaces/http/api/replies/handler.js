const AddReplyUseCase = require('../../../../Applications/use_case/replies/AddReplyUseCase');
const DeleteReplyUseCase = require('../../../../Applications/use_case/replies/DeleteReplyUseCase');
class CommentsHandler {
  constructor(container) {
    this._container = container;
    this.postReplyHandler = this.postReplyHandler.bind(this);
    // this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
  }
  async postReplyHandler(request, h) {
    const addReplyUseCase = this._container.getInstance(AddReplyUseCase.name);
    const { id: user_id } = request.auth.credentials;
    const { threadId, commentId } = request.params;
    const addedReply = await addReplyUseCase.execute(user_id, threadId, commentId, request.payload);
    const response = h.response({
      status: 'success',
      data: {
        addedReply,
      },
    });
    response.code(201);
    return response;
  }
  // async deleteCommentHandler(request, h) {
  //   const deleteCommentUseCase = this._container.getInstance(DeleteCommentUseCase.name);
  //   const { id: user_id } = request.auth.credentials;
  //   const { threadId, commentId } = request.params;
  //   await deleteCommentUseCase.execute(user_id, threadId, commentId);
  //   const response = h.response({
  //     status: 'success'
  //   });
  //   response.code(200);
  //   return response;
  // }
}

module.exports = CommentsHandler;
