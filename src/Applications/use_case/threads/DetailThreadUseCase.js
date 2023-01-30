class DetailThreadUseCase {
    constructor({ threadRepository }) {
        this._threadRepository = threadRepository;
    }
    async execute(useCasePayload) {
        const { thread_id } = useCasePayload;
        return await this._threadRepository.getDetailThread({ thread_id });
    }
}
module.exports = DetailThreadUseCase;
