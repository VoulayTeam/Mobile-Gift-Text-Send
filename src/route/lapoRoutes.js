const database = require("../database/firestore");
const express = require("express");
const {submitVote} = require("../controller/vote/submitVote");
const {purchaseLapo} = require("../controller/lapo/purchaseLapo");
const router = express.Router();

router.post("/lapo/purchase/", async (req, res) => {
    try {
        await purchaseLapo(req, res);
    } catch (error) {
        res.status(500).json({error: "Failed to purchase LAPO", message: error.message});
    }
});

module.exports = router;