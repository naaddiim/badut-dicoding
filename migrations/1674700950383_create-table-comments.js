/* eslint-disable camelcase */
exports.up = (pgm) => {
    pgm.createTable('comments', {
        id: {
            type: 'VARCHAR(50)',
            primaryKey: true,
        },
        date: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
        content: {
            type: 'TEXT',
            notNull: true,
        },
        thread_id: {
            type: 'VARCHAR(50)',
            notNull: true,
            references: '"threads"',
        },
        owner: {
            type: 'VARCHAR(50)',
            notNull: true,
            references: '"users"',
        },
        is_delete: {
            type: 'BOOLEAN',
            notNull: true,
        },
        reply_on_comment: {
            type: "VARCHAR(50)",
            default: null,
          },
    });
};

exports.down = (pgm) => {
    pgm.dropTable('comments');
};
