/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');
const date = new Date();

const ThreadsTableTestHelper = {
    async addThread({ user_id = "user-12345", title = "Thread Table Helper", body = "Thread Table Helper body" }) {
        const id = "thread-456789";
        const query = {
            text: "INSERT INTO threads VALUES($1, $2, $3, $4, $5)",
            values: [id, title, body, date, user_id],
        };

        await pool.query(query);
    },
    async findThreadsById(id) {
        const query = {
            text: 'SELECT * FROM threads WHERE id = $1',
            values: [id],
        };

        const result = await pool.query(query);
        return result.rows;
    },
    async findCommentsById(id) {
        const query = {
            text: 'SELECT * FROM comments WHERE id = $1',
            values: [id],
        };

        const result = await pool.query(query);
        return result.rows;
    },
    async findReplyById(id) {
        const query = {
            text: 'SELECT * FROM replies WHERE id = $1',
            values: [id],
        };

        const result = await pool.query(query);
        return result.rows;
    },
    async cleanTable() {
        await pool.query("TRUNCATE TABLE threads CASCADE");
    },
};

module.exports = ThreadsTableTestHelper;