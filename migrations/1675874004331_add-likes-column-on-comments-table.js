/* eslint-disable camelcase */
exports.up = (pgm) => {
    pgm.addColumns(
        "comments",
        {
            likes: {
                type: "INT",
                default: 0,
                notNull: true,
            },
        },
        {
            ifExist: true,
        }
    );
};

exports.down = (pgm) => {};
