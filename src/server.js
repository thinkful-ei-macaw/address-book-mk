/* eslint-disable no-console */
const app = require('./app');
const { NODE_ENV, PORT } = require('./config');

app.listen(PORT, () => console.log(`Server listening in ${NODE_ENV} mode at http://localhost:${PORT}`));