const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const CommentRepository = require('../../Domains/comments/CommentRepository');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment({ user_id, thread_id, content }) {
    const id = `comment-${this._idGenerator()}`;
    const date = new Date();

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, owner',
      values: [id, date, content, thread_id, user_id, false],
    };

    const result = await this._pool.query(query);
    return result.rows[0];
  }

  async isCommentExist({ comment_id }) {
    const query = {
      text: `SELECT id FROM comments t WHERE t.id = $1`,
      values: [comment_id],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError("Comment tidak ditemukan");
    }
  }

  async isTheRightOwner({ comment_id, user_id }) {
    const query = {
      text: `SELECT id FROM comments c WHERE c.id = $1 AND c.owner = $2`,
      values: [comment_id, user_id],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new AuthorizationError("bukan comment punya kamu !");
    }
  }

  async deleteComment({ user_id, thread_id, comment_id }) {
    const date = new Date();
    const query = {
      text: `UPDATE comments 
      SET is_delete = $1, date = $2 
      WHERE id = $3 AND thread_id = $4 AND owner = $5`,
      values: [true, date, comment_id, thread_id, user_id],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError("Comment tidak ditemukan");
    }
  }
}

module.exports = CommentRepositoryPostgres;
