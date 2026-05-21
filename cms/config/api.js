module.exports = () => ({
  responses: {
    privateAttributes: ['_v', 'createdBy', 'updatedBy'],
  },
  rest: {
    defaultLimit: 50,
    maxLimit: 250,
    withCount: true,
  },
});
