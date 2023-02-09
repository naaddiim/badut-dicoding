/* eslint-disable camelcase */
exports.up = (pgm) => {
    pgm.createTable("users_likes_relations", {
      id: {
        type: "SERIAL",
        notNull: true,
        primaryKey: true,
      },
      comment_id: {
        type: "VARCHAR(50)",
        notNull: true,
        references: "comments",
        onDelete: "CASCADE",
      },
      thread_id: {
        type: "VARCHAR(50)",
        notNull: true,
        references: "threads",
        onDelete: "CASCADE",
      },
      user_id: {
        type: "VARCHAR(50)",
        notNull: true,
        references: "users",
        onDelete: "CASCADE",
      },
    });
  };

exports.down = pgm => {};
