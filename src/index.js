const express = require("express");
const database = require("./firestore");

const app = express();
app.use(express.json());

app.use("/", require("./routes/giftRoutes"));

app.listen(3535)