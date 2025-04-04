const express = require("express");
const database = require("./database/firestore");

const app = express();
app.use(express.json());

app.use("/api/", require("./route/giftRoutes"));
app.use("/api/", require("./route/voteRoutes"));

app.listen(3535)