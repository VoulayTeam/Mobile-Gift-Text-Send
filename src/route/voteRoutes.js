const database = require("../database/firestore");
const express = require("express");
const {submitVote} = require("../controller/vote/submitVote");
const router = express.Router();

router.post("/vote/submit/", async (req, res, next) => {
    await submitVote(req, res, next);
});

module.exports = router;