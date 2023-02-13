const AddThreadUseCase = require('../../../../Applications/use_case/threads/AddThreadUseCase');
const DetailThreadUseCase = require('../../../../Applications/use_case/threads/DetailThreadUseCase');

class ThreadsHandler {
  constructor(container) {
    this._container = container;
    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.getDetailThread = this.getDetailThread.bind(this);
  }

  async postThreadHandler(request, h) {
    const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
    const { id: user_id } = request.auth.credentials;
    const addedThread = await addThreadUseCase.execute(user_id, request.payload);

    const response = h.response({
      status: 'success',
      data: {
        addedThread,
      },
    });
    response.code(201);
    return response;
  }
  
    async getDetailThread(request, h) {
    const detailThreadUseCase = this._container.getInstance(DetailThreadUseCase.name);
    const { threadId: thread_id } = request.params;
    const useCasePayload = {
      thread_id,
    };
    const thread = await detailThreadUseCase.execute(useCasePayload);
    // const thread = detailThreadUseCase.mapValue(query);

    const response = h.response({
      status: 'success',
      data: {
        thread,
      },
    });
    response.code(200);
    return response;
  }
}

module.exports = ThreadsHandler;
