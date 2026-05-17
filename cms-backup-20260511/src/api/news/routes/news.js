module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/news',
      handler: 'news.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/news/:id',
      handler: 'news.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/news',
      handler: 'news.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/news/:id',
      handler: 'news.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/news/:id',
      handler: 'news.delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
