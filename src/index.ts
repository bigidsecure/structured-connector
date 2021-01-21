import express from 'express';
import { BigIDConnector } from './BigIDConnector';
const app = express();
const port = 3000;

// Load Configuration from .env file
require('dotenv').config()

BigIDConnector(app);

app.listen(port, () => {
    console.log(`Connector listening at http://localhost:${port}`)
})