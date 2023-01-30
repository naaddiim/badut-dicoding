const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');
const DetailThread = require('../../Domains/threads/entities/DetailThread');

class ThreadRepositoryPostgres extends ThreadRepository {
    constructor(pool, idGenerator) {
        super();
        this._pool = pool;
        this._idGenerator = idGenerator;
    }

    async addThread({ user_id, title, body }) {
        const id = `thread-${this._idGenerator()}`;
        const date = new Date();

        const query = {
            text: 'INSERT INTO threads VALUES($1, $2, $3, $4, $5) RETURNING id, title, owner',
            values: [id, title, body, date, user_id],
        };

        const result = await this._pool.query(query);
        return result.rows[0];
    }

    async getDetailThread({ thread_id }) {
        const query = {
            text: `SELECT
                    t.id AS t_id,
                    t.title AS t_title,
                    t.body AS t_body,
                    t.date AS t_date,
                    u.username AS t_u_username,
                    c.id AS c_id,
                    c.content AS c_content,
                    c.date AS c_date,
                    c.is_delete AS c_is_delete,
                    c.reply_on_comment AS c_reply_comment_id,
                    uc.username AS c_username
                  FROM threads t
                  JOIN users u ON t.owner = u.id
                  JOIN comments c ON t.id = c.thread_id
                  JOIN users uc ON c.owner = uc.id
                  WHERE t.id = $1
                  ORDER BY c.date ASC`,
            values: [thread_id],
        };
        const result = await this._pool.query(query);
        if (!result.rowCount) {
            throw new NotFoundError("Thread nya gak ada ya kak");
        }
        return new DetailThread(result.rows);
    }
}

module.exports = ThreadRepositoryPostgres;
