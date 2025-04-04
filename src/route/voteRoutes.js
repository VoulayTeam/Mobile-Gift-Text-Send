const database = require("../database/firestore");
const express = require("express");
const {submitVote} = require("../controller/voteController");
const router = express.Router();

router.post("/vote/submit/", async (req, res) => {
    try {
        await submitVote(req, res);
    } catch (error) {
        res.status(500).json({error: "Failed to submit vote", message: error.message});
    }
});

module.exports = router;