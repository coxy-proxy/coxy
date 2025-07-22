const port = process.env.PORT || 3000;

export default {
  '/api': {
    target: `http://localhost:${port}`,
    secure: false,
  },
};
