const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const ReplyRepository = require('../../Domains/replies/ReplyRepository');

class ReplyRepositoryPostgres extends ReplyRepository {
    constructor(pool, idGenerator) {
        super();
        this._pool = pool;
        this._idGenerator = idGenerator;
    }

    async addReply({ user_id, thread_id, comment_id, content }) {
        const id = `reply-${this._idGenerator()}`;
        const date = new Date();

        const query = {
            text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id, content, owner',
            values: [id, date, content, thread_id, user_id, false, comment_id],
        };

        const result = await this._pool.query(query);
        return result.rows[0];
    }
    async isReplyExist({ reply_id }) {
        const query = {
            text: `SELECT id FROM comments t WHERE t.id = $1`,
            values: [reply_id],
        };
        const result = await this._pool.query(query);
        if (!result.rowCount) {
            throw new NotFoundError("Reply tidak ditemukan");
        }
    }

    async isTheRightOwner({ reply_id, user_id }) {
        const query = {
            text: `SELECT id FROM comments c WHERE c.id = $1 AND c.owner = $2`,
            values: [reply_id, user_id],
        };
        const result = await this._pool.query(query);
        if (!result.rowCount) {
            throw new AuthorizationError("bukan replies punya kamu !");
        }
    }

    async deleteReply({ user_id, thread_id, comment_id, reply_id }) {
        const query = {
            text: `UPDATE comments 
      SET is_delete = $1
      WHERE id = $2 AND thread_id = $3 AND owner = $4 AND reply_on_comment = $5`,
            values: [true, reply_id, thread_id, user_id, comment_id],
        };
        const result = await this._pool.query(query);
        if (!result.rowCount) {
            throw new NotFoundError("Reply tidak ditemukan");
        }
    }
}

module.exports = ReplyRepositoryPostgres;
