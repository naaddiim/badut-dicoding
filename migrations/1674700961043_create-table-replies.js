/* eslint-disable camelcase */
exports.up = (pgm) => {
    pgm.createTable('replies', {
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
        comment_id: {
            type: 'VARCHAR(50)',
            notNull: true,
            references: '"comments"',
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
    });
};

exports.down = (pgm) => {
    pgm.dropTable('replies');
};
