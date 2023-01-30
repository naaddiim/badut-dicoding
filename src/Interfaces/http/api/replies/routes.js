const routes = (handler) => ([
  {
    method: 'POST',
    path: '/threads/{threadId}/comments/{commentId}/replies',
    handler: handler.postReplyHandler,
    options: {
      auth: "apiforum_jwt",
    },
  },
  // {
  //   method: 'DELETE',
  //   path: '/threads/{threadId}/comments/{commentId}',
  //   handler: handler.deleteCommentHandler,
  //   options: {
  //     auth: "apiforum_jwt",
  //   },
  // },

]);

module.exports = routes;
