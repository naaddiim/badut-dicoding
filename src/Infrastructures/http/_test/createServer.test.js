const createServer = require('../createServer');
const container = require('../../container');
const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');

describe("HTTP server", () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
  });

  it("should response 404 when request unregistered route", async () => {
    // Arrange
    const server = await createServer({});
    // Action
    const response = await server.inject({
      method: "GET",
      url: "/unregisteredRoute",
    });
    // Assert
    expect(response.statusCode).toEqual(404);
  });

  describe('when GET /', () => {
    it('should return 200 and welcome to forum api', async () => {
      // Arrange
      const server = await createServer({});
      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/',
      });
      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.value).toEqual('Welcome to forum api semuanya!!!');
    });
  });

  it('should handle server error correctly', async () => {
    // Arrange
    const requestPayload = {
      username: 'dicoding',
      fullname: 'Dicoding Indonesia',
      password: 'super_secret',
    };
    const server = await createServer({}); // fake injection

    // Action
    const response = await server.inject({
      method: 'POST',
      url: '/users',
      payload: requestPayload,
    });

    // Assert
    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(500);
    expect(responseJson.status).toEqual('error');
    expect(responseJson.message).toEqual('terjadi kegagalan pada server kami');
  });
  describe("/threads endpoint", () => {
    describe("When POST /threads", () => {
      it("should response success and get added thread information", async () => {
        // Arrange
        const requestPayload = {
          title: "judul thread",
          body: "body thread",
        };
        const server = await createServer(container);

        const accessToken = await ServerTestHelper.getAccessToken(server);

        // Action
        const addThreadResponse = await server.inject({
          method: "POST",
          url: "/threads",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: requestPayload,
        });

        // Assert
        const { status, data } = JSON.parse(addThreadResponse.payload);
        expect(addThreadResponse.statusCode).toEqual(201);
        expect(status).toEqual("success");
        expect(data).toBeInstanceOf(Object);
        expect(data.addedThread).toBeInstanceOf(Object);
        expect(data.addedThread.id).toBeDefined();
        expect(data.addedThread.title).toBeDefined();
        expect(data.addedThread.owner).toBeDefined();
      });
      it("should throw error when unauthenticated permission", async () => {
        // Arrange
        const requestPayload = {
          title: "judul thread",
          body: "body thread",
        };
        const server = await createServer(container);

        // Action
        const addThreadResponse = await server.inject({
          method: "POST",
          url: "/threads",
          payload: requestPayload,
        });

        // Assert
        const { message } = JSON.parse(addThreadResponse.payload);
        expect(addThreadResponse.statusCode).toEqual(401);
        expect(message).toEqual("Missing authentication");
      });
      it("should throw error when not contain needed property", async () => {
        // Arrange
        const requestPayload = {
          title: "judul thread",
        };
        const server = await createServer(container);

        const accessToken = await ServerTestHelper.getAccessToken(server);

        // Action
        const addThreadResponse = await server.inject({
          method: "POST",
          url: "/threads",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: requestPayload,
        });

        // Assert
        const { status, message } = JSON.parse(addThreadResponse.payload);
        expect(addThreadResponse.statusCode).toEqual(400);
        expect(status).toEqual("fail");
        expect(message).toEqual(
          "payload harus ada title dan body"
        );
      });
      it("should throw error when not meet data type spesifications", async () => {
        // Arrange
        const requestPayload = {
          title: "judul thread",
          body: 123456,
        };
        const server = await createServer(container);

        const accessToken = await ServerTestHelper.getAccessToken(server);

        // Action
        const addThreadResponse = await server.inject({
          method: "POST",
          url: "/threads",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: requestPayload,
        });

        // Assert
        const { status, message } = JSON.parse(addThreadResponse.payload);
        expect(addThreadResponse.statusCode).toEqual(400);
        expect(status).toEqual("fail");
        expect(message).toEqual(
          "semua payload harus bertipe string"
        );
      });
    });
    describe("when POST /threads/{threadId}/comments", () => {
      it("should add new comment to thread and returning that comment  ", async () => {
        // Arrange
        const server = await createServer(container);
        const accessToken = await ServerTestHelper.getAccessToken(server);

        // add thread
        const addThreadPayload = {
          title: "judul thread",
          body: "body thread",
        };
        const addedThreadResponse = await server.inject({
          method: "POST",
          url: "/threads",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: addThreadPayload,
        });
        const {
          status: addedThreadResponseStatus,
          data: { addedThread },
        } = JSON.parse(addedThreadResponse.payload);

        // Action
        // add comment
        const addCommentPayload = {
          content: `Komentar baru dengan thread ${addedThread.id}`,
        };
        const addedCommentResponse = await server.inject({
          method: "POST",
          url: `/threads/${addedThread.id}/comments`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: addCommentPayload,
        });
        const {
          status: addedCommentResponseStatus,
          data: { addedComment },
        } = JSON.parse(addedCommentResponse.payload);

        //Assert
        expect(addedThreadResponse.statusCode).toEqual(201);
        expect(addedThreadResponseStatus).toEqual("success");
        expect(addedCommentResponse.statusCode).toEqual(201);
        expect(addedCommentResponseStatus).toEqual("success");
        expect(addedComment).toBeInstanceOf(Object);
        expect(addedComment.id).toBeDefined();
        expect(addedComment.content).toBeDefined();
        expect(addedComment.content).toEqual(addCommentPayload.content);
        expect(addedComment.owner).toBeDefined();
      });
      it("should throw error when unauthenticated permission", async () => {
        // Arrange
        const server = await createServer(container);
        const accessToken = await ServerTestHelper.getAccessToken(server);

        // add thread
        const addThreadPayload = {
          title: "judul thread",
          body: "body thread",
        };
        const addedThreadResponse = await server.inject({
          method: "POST",
          url: "/threads",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: addThreadPayload,
        });
        const {
          status: addedThreadResponseStatus,
          data: { addedThread },
        } = JSON.parse(addedThreadResponse.payload);

        // Action
        // add comment
        const addCommentPayload = {
          content: `Komentar baru dengan thread ${addedThread.id}`,
        };
        const addedCommentResponse = await server.inject({
          method: "POST",
          url: `/threads/${addedThread.id}/comments`,
          payload: addCommentPayload,
        });
        const { message: addedCommentResponseMessage } = JSON.parse(
          addedCommentResponse.payload
        );

        // Assert
        expect(addedThreadResponse.statusCode).toEqual(201);
        expect(addedThreadResponseStatus).toEqual("success");
        expect(addedCommentResponse.statusCode).toEqual(401);
        expect(addedCommentResponseMessage).toEqual("Missing authentication");
      });
      it("should throw not found error when thread is not exist", async () => {
        // Arrange
        const server = await createServer(container);
        const accessToken = await ServerTestHelper.getAccessToken(server);

        // add thread
        const addThreadPayload = {
          title: "judul thread",
          body: "body thread",
        };
        const addedThreadResponse = await server.inject({
          method: "POST",
          url: "/threads",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: addThreadPayload,
        });
        const {
          status: addedThreadResponseStatus,
          data: { addedThread },
        } = JSON.parse(addedThreadResponse.payload);

        // Action
        // add comment
        const addCommentPayload = {
          content: `Komentar baru dengan thread ${addedThread.id}`,
        };
        const addedCommentResponse = await server.inject({
          method: "POST",
          url: `/threads/thread-12346/comments`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: addCommentPayload,
        });
        const { status, message } = JSON.parse(addedCommentResponse.payload);

        // Assert
        expect(addedThreadResponse.statusCode).toEqual(201);
        expect(addedThreadResponseStatus).toEqual("success");
        expect(addedCommentResponse.statusCode).toEqual(404);
        expect(status).toEqual("fail");
        expect(message).toEqual("Thread tidak ditemukan");
      });
      it("should throw error when not contain needed property", async () => {
        // Arrange
        const server = await createServer(container);
        const accessToken = await ServerTestHelper.getAccessToken(server);

        // add thread
        const addThreadPayload = {
          title: "judul thread",
          body: "body thread",
        };
        const addedThreadResponse = await server.inject({
          method: "POST",
          url: "/threads",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: addThreadPayload,
        });
        const {
          status: addedThreadResponseStatus,
          data: { addedThread },
        } = JSON.parse(addedThreadResponse.payload);

        // Action
        // add comment
        const addCommentPayload = {};
        const addedCommentResponse = await server.inject({
          method: "POST",
          url: `/threads/${addedThread.id}/comments`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: addCommentPayload,
        });
        const { status, message } = JSON.parse(addedCommentResponse.payload);

        // Assert
        expect(addedThreadResponse.statusCode).toEqual(201);
        expect(addedThreadResponseStatus).toEqual("success");
        expect(addedCommentResponse.statusCode).toEqual(400);
        expect(status).toEqual("fail");
        expect(message).toEqual("payload harus ada property content");
      });
      it("should throw error when not meet data type specification", async () => {
        // Arrange
        const server = await createServer(container);
        const accessToken = await ServerTestHelper.getAccessToken(server);

        // add thread
        const addThreadPayload = {
          title: "judul thread",
          body: "body thread",
        };
        const addedThreadResponse = await server.inject({
          method: "POST",
          url: "/threads",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: addThreadPayload,
        });
        const {
          status: addedThreadResponseStatus,
          data: { addedThread },
        } = JSON.parse(addedThreadResponse.payload);

        // Action
        // add comment
        const addCommentPayload = { content: 12345 };
        const addedCommentResponse = await server.inject({
          method: "POST",
          url: `/threads/${addedThread.id}/comments`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: addCommentPayload,
        });
        const { status, message } = JSON.parse(addedCommentResponse.payload);

        // Assert
        expect(addedThreadResponse.statusCode).toEqual(201);
        expect(addedThreadResponseStatus).toEqual("success");
        expect(addedCommentResponse.statusCode).toEqual(400);
        expect(status).toEqual("fail");
        expect(message).toEqual(
          "content harus bertipe string"
        );
      });
    });
  });
  describe("when GET /threads/{threadId}", () => {
    it("should show details of thread (with token)", async () => {
      // Arrange
      const server = await createServer(container);
      const accessToken = await ServerTestHelper.getAccessToken(server);

      // add thread
      const addThreadPayload = {
        title: "judul thread",
        body: "body thread",
      };
      const addedThreadResponse = await server.inject({
        method: "POST",
        url: "/threads",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: addThreadPayload,
      });
      const {
        status: addedThreadResponseStatus,
        data: { addedThread },
      } = JSON.parse(addedThreadResponse.payload);

      // add comment
      const addCommentPayload = {
        content: `Komen baru pada thread ${addedThread.id}`,
      };
      const addedCommentResponse = await server.inject({
        method: "POST",
        url: `/threads/${addedThread.id}/comments`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: addCommentPayload,
      });
      const {
        status: addedCommentResponseStatus,
        data: { addedComment },
      } = JSON.parse(addedCommentResponse.payload);

      // add reply
      const addReplyPayload = {
        content: `Balasan pada komen ${addedComment.id}`,
      };
      const addedReplyResponse = await server.inject({
        method: "POST",
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: addReplyPayload,
      });
      const {
        status: addedReplyResponseStatus,
        data: { addedReply },
      } = JSON.parse(addedReplyResponse.payload);

      const [getThread] = await ThreadsTableTestHelper.findThreadsById(
        addedThread.id
      );
      const [getComment] = await ThreadsTableTestHelper.findCommentsById(
        addedComment.id
      );
      const [getReply] = await ThreadsTableTestHelper.findCommentsById(
        addedReply.id
      );

      const expectedThreadDetails = {
        id: getThread.id,
        username: "dicoding",
        title: getThread.title,
        body: getThread.body,
        date: getThread.date.toISOString(),
        comments: [
          {
            id: getComment.id,
            username: "dicoding",
            content: getComment.content,
            date: getComment.date.toISOString(),
            likeCount: 0,
            replies: [
              {
                id: getReply.id,
                username: "dicoding",
                content: getReply.content,
                date: getReply.date.toISOString(),
                likeCount: 0,
              },
            ],
          },
        ],
      };

      // Action
      const threadDetailsResponse = await server.inject({
        method: "GET",
        url: `/threads/${addedThread.id}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const {
        status: threadDetailsResponseStatus,
        data: { thread },
      } = JSON.parse(threadDetailsResponse.payload);

      // Assert
      expect(addedThreadResponse.statusCode).toEqual(201);
      expect(addedThreadResponseStatus).toEqual("success");
      expect(addedCommentResponse.statusCode).toEqual(201);
      expect(addedCommentResponseStatus).toEqual("success");
      expect(addedReplyResponse.statusCode).toEqual(201);
      expect(addedReplyResponseStatus).toEqual("success");
      expect(threadDetailsResponse.statusCode).toEqual(200);
      expect(threadDetailsResponseStatus).toEqual("success");
      expect(thread).toStrictEqual(expectedThreadDetails);
    });
    it("should show details of thread (without token)", async () => {
      // Arrange
      const server = await createServer(container);
      const accessToken = await ServerTestHelper.getAccessToken(server);

      // add thread
      const addThreadPayload = {
        title: "judul thread",
        body: "body thread",
      };
      const addedThreadResponse = await server.inject({
        method: "POST",
        url: "/threads",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: addThreadPayload,
      });
      const {
        status: addedThreadResponseStatus,
        data: { addedThread },
      } = JSON.parse(addedThreadResponse.payload);

      // add comment
      const addCommentPayload = {
        content: `Komen baru pada thread ${addedThread.id}`,
      };
      const addedCommentResponse = await server.inject({
        method: "POST",
        url: `/threads/${addedThread.id}/comments`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: addCommentPayload,
      });
      const {
        status: addedCommentResponseStatus,
        data: { addedComment },
      } = JSON.parse(addedCommentResponse.payload);

      // add reply
      const addReplyPayload = {
        content: `Balasan pada komen ${addedComment.id}`,
      };
      const addedReplyResponse = await server.inject({
        method: "POST",
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: addReplyPayload,
      });
      const {
        status: addedReplyResponseStatus,
        data: { addedReply },
      } = JSON.parse(addedReplyResponse.payload);

      const [getThread] = await ThreadsTableTestHelper.findThreadsById(
        addedThread.id
      );
      const [getComment] = await ThreadsTableTestHelper.findCommentsById(
        addedComment.id
      );
      const [getReply] = await ThreadsTableTestHelper.findCommentsById(
        addedReply.id
      );

      const expectedThreadDetails = {
        id: getThread.id,
        username: "dicoding",
        title: getThread.title,
        body: getThread.body,
        date: getThread.date.toISOString(),
        comments: [
          {
            id: getComment.id,
            username: "dicoding",
            content: getComment.content,
            date: getComment.date.toISOString(),
            likeCount: 0,
            replies: [
              {
                id: getReply.id,
                username: "dicoding",
                content: getReply.content,
                date: getReply.date.toISOString(),
                likeCount: 0,
              },
            ],
          },
        ],
      };

      // Action
      const threadDetailsResponse = await server.inject({
        method: "GET",
        url: `/threads/${addedThread.id}`,
      });
      const {
        status: threadDetailsResponseStatus,
        data: { thread },
      } = JSON.parse(threadDetailsResponse.payload);

      // Assert
      expect(addedThreadResponse.statusCode).toEqual(201);
      expect(addedThreadResponseStatus).toEqual("success");
      expect(addedCommentResponse.statusCode).toEqual(201);
      expect(addedCommentResponseStatus).toEqual("success");
      expect(addedReplyResponse.statusCode).toEqual(201);
      expect(addedReplyResponseStatus).toEqual("success");
      expect(threadDetailsResponse.statusCode).toEqual(200);
      expect(threadDetailsResponseStatus).toEqual("success");
      expect(thread).toStrictEqual(expectedThreadDetails);
    });
    it("should throw not found error when thread is not found (with token)", async () => {
      // Arrange
      const server = await createServer(container);
      const accessToken = await ServerTestHelper.getAccessToken(server);

      // add thread
      const addThreadPayload = {
        title: "judul thread",
        body: "body thread",
      };
      const addedThreadResponse = await server.inject({
        method: "POST",
        url: "/threads",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: addThreadPayload,
      });
      const {
        status: addedThreadResponseStatus,
        data: { addedThread },
      } = JSON.parse(addedThreadResponse.payload);

      // add comment
      const addCommentPayload = {
        content: `Komen baru pada thread ${addedThread.id}`,
      };
      const addedCommentResponse = await server.inject({
        method: "POST",
        url: `/threads/${addedThread.id}/comments`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: addCommentPayload,
      });
      const {
        status: addedCommentResponseStatus,
        data: { addedComment },
      } = JSON.parse(addedCommentResponse.payload);

      // add reply
      const addReplyPayload = {
        content: `Balasan pada komen ${addedComment.id}`,
      };
      const addedReplyResponse = await server.inject({
        method: "POST",
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: addReplyPayload,
      });
      const { status: addedReplyResponseStatus } = JSON.parse(
        addedReplyResponse.payload
      );

      // Action
      const threadDetailsResponse = await server.inject({
        method: "GET",
        url: `/threads/thread-56789`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const {
        status: threadDetailsResponseStatus,
        message: threadDetailsResponseMessage,
      } = JSON.parse(threadDetailsResponse.payload);

      // Assert
      expect(addedThreadResponse.statusCode).toEqual(201);
      expect(addedThreadResponseStatus).toEqual("success");
      expect(addedCommentResponse.statusCode).toEqual(201);
      expect(addedCommentResponseStatus).toEqual("success");
      expect(addedReplyResponse.statusCode).toEqual(201);
      expect(addedReplyResponseStatus).toEqual("success");
      expect(threadDetailsResponse.statusCode).toEqual(404);
      expect(threadDetailsResponseStatus).toEqual("fail");
      expect(threadDetailsResponseMessage).toEqual(
        "Thread nya gak ada ya kak"
      );
    });
    it("should throw not found error when thread is not found (withouth token)", async () => {
      // Arrange
      const server = await createServer(container);
      const accessToken = await ServerTestHelper.getAccessToken(server);

      // add thread
      const addThreadPayload = {
        title: "judul thread",
        body: "body thread",
      };
      const addedThreadResponse = await server.inject({
        method: "POST",
        url: "/threads",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: addThreadPayload,
      });
      const {
        status: addedThreadResponseStatus,
        data: { addedThread },
      } = JSON.parse(addedThreadResponse.payload);

      // add comment
      const addCommentPayload = {
        content: `Komen baru pada thread ${addedThread.id}`,
      };
      const addedCommentResponse = await server.inject({
        method: "POST",
        url: `/threads/${addedThread.id}/comments`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: addCommentPayload,
      });
      const {
        status: addedCommentResponseStatus,
        data: { addedComment },
      } = JSON.parse(addedCommentResponse.payload);

      // add reply
      const addReplyPayload = {
        content: `Balasan pada komen ${addedComment.id}`,
      };
      const addedReplyResponse = await server.inject({
        method: "POST",
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: addReplyPayload,
      });
      const { status: addedReplyResponseStatus } = JSON.parse(
        addedReplyResponse.payload
      );

      // Action
      const threadDetailsResponse = await server.inject({
        method: "GET",
        url: `/threads/thread-56789`,
      });
      const {
        status: threadDetailsResponseStatus,
        message: threadDetailsResponseMessage,
      } = JSON.parse(threadDetailsResponse.payload);

      // Assert
      expect(addedThreadResponse.statusCode).toEqual(201);
      expect(addedThreadResponseStatus).toEqual("success");
      expect(addedCommentResponse.statusCode).toEqual(201);
      expect(addedCommentResponseStatus).toEqual("success");
      expect(addedReplyResponse.statusCode).toEqual(201);
      expect(addedReplyResponseStatus).toEqual("success");
      expect(threadDetailsResponse.statusCode).toEqual(404);
      expect(threadDetailsResponseStatus).toEqual("fail");
      expect(threadDetailsResponseMessage).toEqual(
        "Thread nya gak ada ya kak"
      );
    });
  });
  describe("when DELETE /threads/{threadId}/comments/{commentId}", () => {
    it("should success deleting comment", async () => {
      // Arrange
      const server = await createServer(container);
      const accessToken = await ServerTestHelper.getAccessToken(server);

      // add thread
      const addThreadPayload = {
        title: "judul thread",
        body: "body thread",
      };
      const addedThreadResponse = await server.inject({
        method: "POST",
        url: "/threads",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: addThreadPayload,
      });
      const {
        status: addedThreadResponseStatus,
        data: { addedThread },
      } = JSON.parse(addedThreadResponse.payload);

      // add comment
      const addCommentPayload = {
        content: `Komen baru pada thread ${addedThread.id}`,
      };
      const addedCommentResponse = await server.inject({
        method: "POST",
        url: `/threads/${addedThread.id}/comments`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: addCommentPayload,
      });
      const {
        status: addedCommentResponseStatus,
        data: { addedComment },
      } = JSON.parse(addedCommentResponse.payload);

      // Action
      const commentsBeforeDelete =
        await ThreadsTableTestHelper.findCommentsById(addedComment.id);

      // delete comment
      const deleteCommentResponse = await server.inject({
        method: "DELETE",
        url: `/threads/${addedThread.id}/comments/${addedComment.id}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const { status: deleteCommentResponseStatus } = JSON.parse(
        deleteCommentResponse.payload
      );
      const commentsAfterDelete =
        await ThreadsTableTestHelper.findCommentsById(addedComment.id);

      // Assert
      expect(addedThreadResponse.statusCode).toEqual(201);
      expect(addedThreadResponseStatus).toEqual("success");
      expect(addedCommentResponse.statusCode).toEqual(201);
      expect(addedCommentResponseStatus).toEqual("success");
      expect(deleteCommentResponse.statusCode).toEqual(200);
      expect(deleteCommentResponseStatus).toEqual("success");
      expect(commentsBeforeDelete).toHaveLength(1);
      expect(commentsBeforeDelete[0].is_delete).toEqual(false);
      expect(commentsAfterDelete).toHaveLength(1);
      expect(commentsAfterDelete[0].is_delete).toEqual(true);
    });
    it("should throw not found error when comment is not exist", async () => {
      // Arrange
      const server = await createServer(container);
      const accessToken = await ServerTestHelper.getAccessToken(server);

      // add thread
      const addThreadPayload = {
        title: "judul thread",
        body: "body thread",
      };
      const addedThreadResponse = await server.inject({
        method: "POST",
        url: "/threads",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: addThreadPayload,
      });
      const {
        status: addedThreadResponseStatus,
        data: { addedThread },
      } = JSON.parse(addedThreadResponse.payload);

      // add comment
      const addCommentPayload = {
        content: `Komen baru pada thread ${addedThread.id}`,
      };
      const addedCommentResponse = await server.inject({
        method: "POST",
        url: `/threads/${addedThread.id}/comments`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: addCommentPayload,
      });
      const {
        status: addedCommentResponseStatus,
        data: { addedComment },
      } = JSON.parse(addedCommentResponse.payload);

      // Action
      const commentsBeforeDelete =
        await ThreadsTableTestHelper.findCommentsById(addedComment.id);

      // delete comment
      const deleteCommentResponse = await server.inject({
        method: "DELETE",
        url: `/threads/${addedThread.id}/comments/xxx`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const {
        status: deleteCommentResponseStatus,
        message: deleteCommentResponseMessage,
      } = JSON.parse(deleteCommentResponse.payload);
      const commentsAfterDelete =
        await ThreadsTableTestHelper.findCommentsById(addedComment.id);

      // Assert
      expect(addedThreadResponse.statusCode).toEqual(201);
      expect(addedThreadResponseStatus).toEqual("success");
      expect(addedCommentResponse.statusCode).toEqual(201);
      expect(addedCommentResponseStatus).toEqual("success");
      expect(deleteCommentResponse.statusCode).toEqual(404);
      expect(deleteCommentResponseStatus).toEqual("fail");
      expect(deleteCommentResponseMessage).toEqual("Comment tidak ditemukan");
      expect(commentsBeforeDelete).toHaveLength(1);
      expect(commentsBeforeDelete[0].is_delete).toEqual(false);
      expect(commentsAfterDelete).toHaveLength(1);
      expect(commentsAfterDelete[0].is_delete).toEqual(false);
    });
    it("should throw authorization error when failed to verify comment owner", async () => {
      // Arrange
      const server = await createServer(container);
      const accessToken = await ServerTestHelper.getAccessToken(server);

      // add thread
      const addThreadPayload = {
        title: "judul thread",
        body: "body thread",
      };
      const addedThreadResponse = await server.inject({
        method: "POST",
        url: "/threads",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: addThreadPayload,
      });
      const {
        status: addedThreadResponseStatus,
        data: { addedThread },
      } = JSON.parse(addedThreadResponse.payload);

      // add comment
      const addCommentPayload = {
        content: `Komen baru pada thread ${addedThread.id}`,
      };
      const addedCommentResponse = await server.inject({
        method: "POST",
        url: `/threads/${addedThread.id}/comments`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: addCommentPayload,
      });
      const {
        status: addedCommentResponseStatus,
        data: { addedComment },
      } = JSON.parse(addedCommentResponse.payload);

      // Action
      const otherAccessToken = await ServerTestHelper.getAccessToken(server, {
        username: "badutKelas",
        password: "rahasiaParaBadut",
        fullname: "ketuaParaBadut",
      });
      const commentsBeforeDelete =
        await ThreadsTableTestHelper.findCommentsById(addedComment.id);

      // delete comment
      const deleteCommentResponse = await server.inject({
        method: "DELETE",
        url: `/threads/${addedThread.id}/comments/${addedComment.id}`,
        headers: {
          Authorization: `Bearer ${otherAccessToken}`,
        },
      });
      const {
        status: deleteCommentResponseStatus,
        message: deleteCommentResponseMessage,
      } = JSON.parse(deleteCommentResponse.payload);
      const commentsAfterDelete =
        await ThreadsTableTestHelper.findCommentsById(addedComment.id);

      // Assert
      expect(addedThreadResponse.statusCode).toEqual(201);
      expect(addedThreadResponseStatus).toEqual("success");
      expect(addedCommentResponse.statusCode).toEqual(201);
      expect(addedCommentResponseStatus).toEqual("success");
      expect(deleteCommentResponse.statusCode).toEqual(403);
      expect(deleteCommentResponseStatus).toEqual("fail");
      expect(deleteCommentResponseMessage).toEqual("bukan comment punya kamu !");
      expect(commentsBeforeDelete).toHaveLength(1);
      expect(commentsBeforeDelete[0].is_delete).toEqual(false);
      expect(commentsAfterDelete).toHaveLength(1);
      expect(commentsAfterDelete[0].is_delete).toEqual(false);
    });
  });

  describe("when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}", () => {
    it("should successfully delete reply on comment", async () => {
      // Arrange
      const server = await createServer(container);
      const accessToken = await ServerTestHelper.getAccessToken(server);

      // add thread
      const addThreadPayload = {
        title: "judul thread",
        body: "body thread",
      };
      const addedThreadResponse = await server.inject({
        method: "POST",
        url: "/threads",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: addThreadPayload,
      });
      const { status: addedThreadResponseStatus,
        data: { addedThread }, } = JSON.parse(addedThreadResponse.payload);

      // add comment
      const addCommentPayload = {
        content: `Komen baru pada thread ${addedThread.id}`,
      };
      const addedCommentResponse = await server.inject({
        method: "POST",
        url: `/threads/${addedThread.id}/comments`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: addCommentPayload,
      });
      const {
        status: addedCommentResponseStatus,
        data: { addedComment }, } = JSON.parse(addedCommentResponse.payload);
      // add reply
      const addReplyPayload = {
        content: `Balasan baru pada komen ${addedComment.id}`,
      };
      const addedReplyResponse = await server.inject({
        method: "POST",
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: addReplyPayload,
      });
      const { status: addedReplyResponseStatus,
        data: { addedReply }, } = JSON.parse(addedReplyResponse.payload);

      // Action
      const replyBeforeDelete = await ThreadsTableTestHelper.findCommentsById(addedReply.id);
      const deleteReplyResponse = await server.inject({
        method: "DELETE",
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies/${addedReply.id}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const { status: deleteReplyResponseStatus } = JSON.parse(deleteReplyResponse.payload);
      const replyAfterDelete = await ThreadsTableTestHelper.findCommentsById(addedReply.id);

      // Assert
      expect(addedThreadResponse.statusCode).toEqual(201);
      expect(addedThreadResponseStatus).toEqual("success");
      expect(addedCommentResponse.statusCode).toEqual(201);
      expect(addedCommentResponseStatus).toEqual("success");
      expect(addedReplyResponse.statusCode).toEqual(201);
      expect(addedReplyResponseStatus).toEqual("success");
      expect(deleteReplyResponse.statusCode).toEqual(200);
      expect(deleteReplyResponseStatus).toEqual("success");
      expect(replyBeforeDelete).toHaveLength(1);
      expect(replyBeforeDelete[0].is_delete).toEqual(false);
      expect(replyAfterDelete).toHaveLength(1);
      expect(replyAfterDelete[0].is_delete).toEqual(true);
    });
    it("should throw NotFound error when replies is not exist", async () => {
      // Arrange
      const server = await createServer(container);
      const accessToken = await ServerTestHelper.getAccessToken(server);

      // add thread
      const addThreadPayload = {
        title: "judul thread",
        body: "body thread",
      };
      const addedThreadResponse = await server.inject({
        method: "POST",
        url: "/threads",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: addThreadPayload,
      });
      const { status: addedThreadResponseStatus,
        data: { addedThread }, } = JSON.parse(addedThreadResponse.payload);

      // add comment
      const addCommentPayload = { content: `Komen baru pada thread ${addedThread.id}`, };
      const addedCommentResponse = await server.inject({
        method: "POST",
        url: `/threads/${addedThread.id}/comments`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: addCommentPayload,
      });
      const {
        status: addedCommentResponseStatus,
        data: { addedComment },
      } = JSON.parse(addedCommentResponse.payload);

      // add reply
      const addReplyPayload = {
        content: `Balasan baru pada komen ${addedComment.id}`,
      };
      const addedReplyResponse = await server.inject({
        method: "POST",
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: addReplyPayload,
      });
      const {
        status: addedReplyResponseStatus,
        data: { addedReply },
      } = JSON.parse(addedReplyResponse.payload);

      // Action
      const replyBeforeDelete = await ThreadsTableTestHelper.findCommentsById(addedReply.id);
      const deleteReplyResponse = await server.inject({
        method: "DELETE",
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies/xxx`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const {
        status: deleteReplyResponseStatus,
        message: deleteReplyResponseMessage,
      } = JSON.parse(deleteReplyResponse.payload);
      const replyAfterDelete = await ThreadsTableTestHelper.findCommentsById(addedReply.id);

      // Assert
      expect(addedThreadResponse.statusCode).toEqual(201);
      expect(addedThreadResponseStatus).toEqual("success");
      expect(addedCommentResponse.statusCode).toEqual(201);
      expect(addedCommentResponseStatus).toEqual("success");
      expect(addedReplyResponse.statusCode).toEqual(201);
      expect(addedReplyResponseStatus).toEqual("success");
      expect(deleteReplyResponse.statusCode).toEqual(404);
      expect(deleteReplyResponseStatus).toEqual("fail");
      expect(deleteReplyResponseMessage).toEqual("Reply tidak ditemukan");
      expect(replyBeforeDelete).toHaveLength(1);
      expect(replyBeforeDelete[0].is_delete).toEqual(false);
      expect(replyAfterDelete).toHaveLength(1);
      expect(replyAfterDelete[0].is_delete).toEqual(false);
    });
    it("should throw authorization error when failed to verify reply owner", async () => {
      // Arrange
      const server = await createServer(container);
      const accessToken = await ServerTestHelper.getAccessToken(server);

      // add thread
      const addThreadPayload = {
        title: "judul thread",
        body: "body thread",
      };
      const addedThreadResponse = await server.inject({
        method: "POST",
        url: "/threads",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: addThreadPayload,
      });
      const { status: addedThreadResponseStatus,
        data: { addedThread }, } = JSON.parse(addedThreadResponse.payload);

      // add comment
      const addCommentPayload = {
        content: `Komen baru thread ${addedThread.id}`,
      };
      const addedCommentResponse = await server.inject({
        method: "POST",
        url: `/threads/${addedThread.id}/comments`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: addCommentPayload,
      });
      const { status: addedCommentResponseStatus,
        data: { addedComment }, } = JSON.parse(addedCommentResponse.payload);

      // add reply
      const addReplyPayload = { content: `Balasan baru pada komen ${addedComment.id}`, };
      const addedReplyResponse = await server.inject({
        method: "POST",
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: addReplyPayload,
      });
      const {
        status: addedReplyResponseStatus,
        data: { addedReply },
      } = JSON.parse(addedReplyResponse.payload);

      // Action
      const otherAccessToken = await ServerTestHelper.getAccessToken(server, {
        username: "dicodingkwsuper",
        password: "supersecretpassword",
        fullname: "Dicoding Kabupaten Bandung",
      });
      const replyBeforeDelete = await ThreadsTableTestHelper.findCommentsById(addedReply.id);
      const deleteReplyResponse = await server.inject({
        method: "DELETE",
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies/${addedReply.id}`,
        headers: {
          Authorization: `Bearer ${otherAccessToken}`,
        },
      });
      const {
        status: deleteReplyResponseStatus, message: deleteReplyResponseMessage,
      } = JSON.parse(deleteReplyResponse.payload);
      const replyAfterDelete = await ThreadsTableTestHelper.findCommentsById(addedReply.id);

      // Assert
      expect(addedThreadResponse.statusCode).toEqual(201);
      expect(addedThreadResponseStatus).toEqual("success");
      expect(addedCommentResponse.statusCode).toEqual(201);
      expect(addedCommentResponseStatus).toEqual("success");
      expect(addedReplyResponse.statusCode).toEqual(201);
      expect(addedReplyResponseStatus).toEqual("success");
      expect(deleteReplyResponse.statusCode).toEqual(403);
      expect(deleteReplyResponseStatus).toEqual("fail");
      expect(deleteReplyResponseMessage).toEqual("bukan replies punya kamu !");
      expect(replyBeforeDelete).toHaveLength(1);
      expect(replyBeforeDelete[0].is_delete).toEqual(false);
      expect(replyAfterDelete).toHaveLength(1);
      expect(replyAfterDelete[0].is_delete).toEqual(false);
    });
  });

  describe("when updateLike on route /threads/{threadId}/comments/{commentId}/likes", () => {
    it("should increase likes on comment successfully", async () => {
      // Arrange
      const server = await createServer(container);
      const accessToken = await ServerTestHelper.getAccessToken(server);

      // add thread
      const addThreadPayload = {
        title: "judul thread",
        body: "body thread",
      };
      const addedThreadResponse = await server.inject({
        method: "POST",
        url: "/threads",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: addThreadPayload,
      });
      const {
        status: addedThreadResponseStatus,
        data: { addedThread },
      } = JSON.parse(addedThreadResponse.payload);

      // add comment
      const addCommentPayload = {
        content: `Komen baru pada thread ${addedThread.id}`,
      };
      const addedCommentResponse = await server.inject({
        method: "POST",
        url: `/threads/${addedThread.id}/comments`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: addCommentPayload,
      });
      const {
        status: addedCommentResponseStatus,
        data: { addedComment },
      } = JSON.parse(addedCommentResponse.payload);
      const oldCommentLike =
        await ThreadsTableTestHelper.findCommentsById(addedComment.id);

      // Action
      const addLikeResponse = await server.inject({
        method: "PUT",
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const { status: addLikeResponseStatus } = JSON.parse(
        addLikeResponse.payload
      );
      const newCommentLike = await ThreadsTableTestHelper.findCommentsById(addedComment.id);

      // Assert
      expect(addedThreadResponse.statusCode).toEqual(201);
      expect(addedThreadResponseStatus).toEqual("success");
      expect(addedCommentResponse.statusCode).toEqual(201);
      expect(addedCommentResponseStatus).toEqual("success");
      expect(addedComment).toBeInstanceOf(Object);
      expect(addedComment.id).toBeDefined();
      expect(addedComment.content).toBeDefined();
      expect(addedComment.content).toEqual(addCommentPayload.content);
      expect(addedComment.owner).toBeDefined();
      expect(addLikeResponse.statusCode).toEqual(200);
      expect(addLikeResponseStatus).toEqual("success");
      expect(oldCommentLike).toHaveLength(1);
      expect(oldCommentLike[0].likes).toEqual(0);
      expect(newCommentLike).toHaveLength(1);
      expect(newCommentLike[0].likes).toEqual(1);
    });
    it("should decrease likes on comment successfully", async () => {
      // Arrange
      const server = await createServer(container);
      const accessToken = await ServerTestHelper.getAccessToken(server);

      // add thread
      const addThreadPayload = {
        title: "judul thread",
        body: "body thread",
      };
      const addedThreadResponse = await server.inject({
        method: "POST",
        url: "/threads",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: addThreadPayload,
      });
      const {
        status: addedThreadResponseStatus,
        data: { addedThread },
      } = JSON.parse(addedThreadResponse.payload);

      // add comment
      const addCommentPayload = {
        content: `Komen baru pada thread ${addedThread.id}`,
      };
      const addedCommentResponse = await server.inject({
        method: "POST",
        url: `/threads/${addedThread.id}/comments`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: addCommentPayload,
      });
      const {
        status: addedCommentResponseStatus,
        data: { addedComment },
      } = JSON.parse(addedCommentResponse.payload);
      const oldCommentLike = await ThreadsTableTestHelper.findCommentsById(addedComment.id);

      // Action
      const addLikeResponse = await server.inject({
        method: "PUT",
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const { status: addLikeResponseStatus } = JSON.parse(addLikeResponse.payload);

      const newCommentLike = await ThreadsTableTestHelper.findCommentsById(addedComment.id);

      // Action
      const addUnlikeResponse = await server.inject({
        method: "PUT",
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const { status: addUnlikeResponseStatus } = JSON.parse(addUnlikeResponse.payload);

      const newCommentUnlike = await ThreadsTableTestHelper.findCommentsById(addedComment.id);

      // Assert
      expect(addedThreadResponse.statusCode).toEqual(201);
      expect(addedThreadResponseStatus).toEqual("success");
      expect(addedCommentResponse.statusCode).toEqual(201);
      expect(addedCommentResponseStatus).toEqual("success");
      expect(addedComment).toBeInstanceOf(Object);
      expect(addedComment.id).toBeDefined();
      expect(addedComment.content).toBeDefined();
      expect(addedComment.content).toEqual(addCommentPayload.content);
      expect(addedComment.owner).toBeDefined();
      expect(addLikeResponse.statusCode).toEqual(200);
      expect(addUnlikeResponse.statusCode).toEqual(200);
      expect(addLikeResponseStatus).toEqual("success");
      expect(addUnlikeResponseStatus).toEqual("success");
      expect(oldCommentLike).toHaveLength(1);
      expect(oldCommentLike[0].likes).toEqual(0);
      expect(newCommentLike).toHaveLength(1);
      expect(newCommentLike[0].likes).toEqual(1);
      expect(newCommentUnlike).toHaveLength(1);
      expect(newCommentUnlike[0].likes).toEqual(0);
    });
    it("should throw missing authentication when not contain auth permission", async () => {
      // Arrange
      const server = await createServer(container);
      const accessToken = await ServerTestHelper.getAccessToken(server);

      // add thread
      const addThreadPayload = {
        title: "judul thread",
        body: "body thread",
      };
      const addedThreadResponse = await server.inject({
        method: "POST",
        url: "/threads",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: addThreadPayload,
      });
      const {
        status: addedThreadResponseStatus,
        data: { addedThread },
      } = JSON.parse(addedThreadResponse.payload);

      // add comment
      const addCommentPayload = {
        content: `Komen baru pada thread ${addedThread.id}`,
      };
      const addedCommentResponse = await server.inject({
        method: "POST",
        url: `/threads/${addedThread.id}/comments`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: addCommentPayload,
      });
      const {
        status: addedCommentResponseStatus,
        data: { addedComment },
      } = JSON.parse(addedCommentResponse.payload);
      const oldCommentLike = await ThreadsTableTestHelper.findCommentsById(addedComment.id);

      // Action
      const addLikeResponse = await server.inject({
        method: "PUT",
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/likes`,
      });
      const { message: addLikeMessage } = JSON.parse(
        addLikeResponse.payload
      );
      const newCommentLike = await ThreadsTableTestHelper.findCommentsById(addedComment.id);

      // Assert
      expect(addedThreadResponse.statusCode).toEqual(201);
      expect(addedThreadResponseStatus).toEqual("success");
      expect(addedCommentResponse.statusCode).toEqual(201);
      expect(addedCommentResponseStatus).toEqual("success");
      expect(addedComment).toBeInstanceOf(Object);
      expect(addedComment.id).toBeDefined();
      expect(addedComment.content).toBeDefined();
      expect(addedComment.content).toEqual(addCommentPayload.content);
      expect(addedComment.owner).toBeDefined();
      expect(addLikeResponse.statusCode).toEqual(401);
      expect(addLikeMessage).toEqual("Missing authentication");
      expect(oldCommentLike).toHaveLength(1);
      expect(oldCommentLike[0].likes).toEqual(0);
      expect(newCommentLike).toHaveLength(1);
      expect(newCommentLike[0].likes).toEqual(0);
    });
  });
});

