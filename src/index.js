require('dotenv').config()

const express = require("express");
const database = require("./database/firestore");

const app = express();
app.use(express.json());

const validateApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    const validApiKeys = process.env.API_KEYS.split(',');

    if (!apiKey || !validApiKeys.includes(apiKey)) {
        return res.status(401).send('Unauthorized - Invalid API Key');
    }

    next();
};
app.use(validateApiKey);

app.use("/api/", require("./route/giftRoutes"));
app.use("/api/", require("./route/voteRoutes"));

app.listen(3535)