const routes = (handler) => ([
  {
    method: 'GET',
    path: '/threads/{threadId}',
    handler: handler.getDetailThread,
  },
  {
    method: 'POST',
    path: '/threads',
    handler: handler.postThreadHandler,
    options: {
      auth: "apiforum_jwt",
    },
  },
]);

module.exports = routes;
