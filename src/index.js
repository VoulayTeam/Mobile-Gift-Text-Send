require('dotenv').config()

const express = require("express");
const database = require("./database/firestore");
const validateApiKey = require("./middleware/validation");
const {errorHandler} = require("./middleware/error");
const configManager = require("./util/configManager");

configManager.initialize().then(r => {
        const app = express();
        app.use(express.json());

        app.use(validateApiKey);

        app.use("/api/", require("./route/giftRoutes"));
        app.use("/api/", require("./route/voteRoutes"));
        app.use("/api/", require("./route/lapoRoutes"));

        app.use(errorHandler);

        app.listen(3535)
    }
);
