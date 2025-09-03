/* eslint-disable */
import axios from 'axios';

module.exports = async () => {
  // Configure axios for tests to use.
  const host = process.env.HOST ?? 'localhost';
  const port = process.env.BACKEND_PORT ?? '3020';
  axios.defaults.baseURL = `http://${host}:${port}`;
};
