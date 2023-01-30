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

    async isThreadExist({ thread_id }) {
        const query = {
            text: `SELECT id FROM threads t WHERE t.id = $1`,
            values: [thread_id],
        };
        const result = await this._pool.query(query);
        if (!result.rowCount) {
            throw new NotFoundError("Thread tidak ditemukan");
        }
    }

    async isCommentExist({ comment_id }) {
        const query = {
            text: `SELECT id FROM comments t WHERE t.id = $1`,
            values: [comment_id],
        };
        const result = await this._pool.query(query);
        if (!result.rowCount) {
            throw new NotFoundError("Komen tidak ditemukan");
        }
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
        const date = new Date();
        const query = {
            text: `UPDATE comments 
      SET is_delete = $1, date = $2 
      WHERE id = $3 AND thread_id = $4 AND owner = $5 AND reply_on_comment = $6`,
            values: [true, date, reply_id, thread_id, user_id, comment_id],
        };
        const result = await this._pool.query(query);
        if (!result.rowCount) {
            throw new NotFoundError("Reply tidak ditemukan");
        }
    }
}

module.exports = ReplyRepositoryPostgres;
