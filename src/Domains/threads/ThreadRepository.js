class ThreadRepository {
    async addThread({ user_id, title, body }) {
        throw new Error('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    }
    async isThreadExist({ thread_id }) {
        throw new Error('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    }
    async getDetailThread({ thread_id }) {
        throw new Error('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    }


}

module.exports = ThreadRepository;
