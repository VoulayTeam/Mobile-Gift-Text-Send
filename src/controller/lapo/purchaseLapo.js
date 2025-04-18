const database = require("../../database/firestore");
const {Timestamp, FieldValue} = require("firebase-admin/firestore");
const {addToCashout} = require("../addToCashout");
const {distributeLapoPrice} = require("./distrubuteLapoPrice");

async function purchaseLapo(req, res) {
    try {
        const {lapoId, affiliateId} = req.body;

        await database.runTransaction(async (transaction) => {
            if (!lapoId || !affiliateId) {
                throw new Error("Missing required fields");
            }

            const ref = await database
                .collection("lapos")
                .doc(lapoId);
            const doc = await transaction.get(ref);

            if (!doc.exists) {
                throw new Error("LAPO not found");
            }
            const data = doc.data();
            if (data.status !== "available") {
                throw new Error("LAPO is not available for purchase");
            }

            await transaction.update(ref, {
                status: "purchased",
                purchasedBy: affiliateId,
                purchasedAt: Timestamp.now()
            });
            await addToCashout(affiliateId, lapoId, data.blockId);
            await distributeLapoPrice(data.recipients, data.blockId);
        });

        return res.status(200).json({
            success: true,
            message: "LAPO purchased successfully",
            lapoId: lapoId
        });
    } catch (error) {
        return res.status(500).json({error: "Failed to purchase LAPO", message: error.message});
    }
}

module.exports = {purchaseLapo}