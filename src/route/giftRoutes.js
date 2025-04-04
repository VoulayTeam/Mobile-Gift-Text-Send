const database = require("../database/firestore");
const express = require("express");
const router = express.Router();

router.route("/gifts/")
    .get(async (req, res) => {
        try {
            const {status, owner, amount} = req.query;
            let query = database.collection("gifts");

            if (status) query = query.where("status", "==", status);
            if (owner) query = query.where("owner", "==", owner);
            if (amount) query = query.where("amount", "==", parseFloat(amount));

            const snapshot = await query.get();
            const gifts = snapshot.docs.map(doc =>
                ({id: doc.id, ...doc.data()}));
            res.status(200).json(gifts);
        } catch (error) {
            res.status(500).json({error: "Failed to retrieve gifts"});
        }
    });

router.post("/gifts/", async (req, res) => {
    try {
        const body = req.body;
        const documentReference = await database.collection("gifts").add(body);
        res.status(201).json({id: documentReference.id, ...body});
    } catch (error) {
        res.status(500).json({error: "Failed to create gift"});
    }
});

router.route("/gifts/:giftId")
    .get(async (req, res) => {
        try {
            const {giftId} = req.params;
            const documentSnapshot = await database
                .collection("gifts")
                .doc(giftId)
                .get()
            if (!documentSnapshot.exists) return res.status(404).json({error: "Gift not found"});
            res.status(200).json({id: documentSnapshot.id, ...documentSnapshot.data()});
        } catch {
            res.status(500).json({error: "Failed to retrieve gift"});
        }
    })
    .put(async (req, res) => {
        try {
            const {giftId} = req.params;
            const body = req.body;
            const documentSnapshot = await database
                .collection("gifts")
                .doc(giftId)
                .get()
            if (!documentSnapshot.exists) return res.status(404).json({error: "Gift not found"});
            await documentSnapshot.ref.update(body);
            res.status(200).json({message: "Gift updated"});
        } catch {
            res.status(500).json({error: "Failed to update gift"});
        }
    })
    .delete(async (req, res) => {
        try {
            const {giftId} = req.params;
            const documentSnapshot = await database
                .collection("gifts")
                .doc(giftId)
                .get();
            if (!documentSnapshot.exists) return res.status(404).json({error: "Gift not found"});
            await documentSnapshot.ref.delete();
            res.status(200).json({message: "Gift deleted"});
        } catch (error) {
            res.status(500).json({error: "Failed to delete gift"});
        }
    });

module.exports = router;