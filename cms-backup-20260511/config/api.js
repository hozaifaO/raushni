module.exports = ({ env }) => ({
  responses: {
    privateAttributes: ['_v', 'createdBy', 'updatedBy'],
  },
  rest: {
    defaultLimit: 25,
    maxLimit: 100,
    withCount: true,
  },
});