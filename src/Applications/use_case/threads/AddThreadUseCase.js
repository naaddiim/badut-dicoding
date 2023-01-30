const AddThread = require('../../../Domains/threads/entities/AddThread');

class AddThreadUseCase {
    constructor({ threadRepository }) {
        this._threadRepository = threadRepository;
    }
    async execute(user_id, useCasePayload) {
        const { title, body } = new AddThread(useCasePayload);
        return this._threadRepository.addThread({ 
            user_id, 
            title, 
            body, 
        });
    }
}

module.exports = AddThreadUseCase;
