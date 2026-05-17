module.exports = ({ env }) => ({
  responses: {
    privateAttributes: ['_v', 'createdBy', 'updatedBy'],
  },
  rest: {
    defaultLimit: 100,
    maxLimit: 250,
    withCount: true,
  },
});
