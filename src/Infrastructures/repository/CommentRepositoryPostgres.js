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
  // Update value like pada table comments
  async updateLike({ user_id, thread_id, comment_id }) {
    // cek apakah user sudah me like comment / reply ini
    const rowCount = await this.isUserLike({
      user_id,
      thread_id,
      comment_id,
    });
    // kondisi kalau user SUDAH me-like comment / reply ini
    if (rowCount) {
      // hapus record dari tabel users_likes_relations
      await this.deleteUserLike({ user_id, thread_id, comment_id });
      // kurangi jumlah like sesuai dengan comment_id dan thread_id
      await this.decrementLike({ thread_id, comment_id });
    }
    // kondisi kalau user BELUM me-like comment / reply ini
    if (!rowCount) {
      // tambah record ke tabel users_likes_relations
      await this.addUserLike({ user_id, thread_id, comment_id });
      // tambah jumlah like sesuai dengan comment_id dan thread_id
      await this.incrementLike({ thread_id, comment_id });
    }
  }

  async isUserLike({ user_id, thread_id, comment_id }) {
    const query = {
      text: `SELECT id FROM users_likes_relations 
            WHERE comment_id = $1
            AND thread_id = $2
            AND user_id = $3`,
      values: [comment_id, thread_id, user_id],
    };
    const result = await this._pool.query(query);
    return result.rowCount;
  }

  async incrementLike({ thread_id, comment_id }) {
    const query = {
      text: `UPDATE comments SET likes = likes + 1
            WHERE id = $1
            AND thread_id = $2`,
      values: [comment_id, thread_id],
    };
    await this._pool.query(query);
  }

  async decrementLike({ thread_id, comment_id }) {
    const query = {
      text: `UPDATE comments SET likes = likes - 1
            WHERE id = $1
            AND thread_id = $2`,
      values: [comment_id, thread_id],
    };
    await this._pool.query(query);
  }

  async addUserLike({ user_id, thread_id, comment_id }) {
    const query = {
      text: `INSERT INTO users_likes_relations(comment_id, thread_id, user_id)
            VALUES($1, $2, $3) 
            RETURNING id`,
      values: [comment_id, thread_id, user_id],
    };
    await this._pool.query(query);
  }

  async deleteUserLike({ user_id, thread_id, comment_id }) {
    const query = {
      text: `DELETE FROM users_likes_relations
            WHERE thread_id = $1
            AND comment_id = $2
            AND user_id = $3`,
      values: [thread_id, comment_id, user_id],
    };
    await this._pool.query(query);
  }

}

module.exports = CommentRepositoryPostgres;
