import express from 'express';
import { BigIDConnector } from './BigIDConnector';
import bodyparser from 'body-parser'
const app = express();
const port = 8000;

// Load Configuration from .env file
require('dotenv').config()

app.use(bodyparser.json())
BigIDConnector(app);


app.listen(port, () => {
    console.log(`Connector listening at http://localhost:${port}`)
})