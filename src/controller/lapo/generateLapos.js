const database = require("../../database/firestore");
const {Timestamp, FieldValue} = require("firebase-admin/firestore");

async function generateLapos(blockId, brandId, winningVotes) {
    const lapoPromises = winningVotes.map(vote => {
        return database.collection("lapos").add({
            recipients: winningVotes.map(v => v.user),
            status: "available",
            blockId: blockId,
            purchasedBy: null,
            purchasedAt: null,
            createdAt: Timestamp.now(),
        });
    });

    await Promise.all(lapoPromises);

    await database.collection("brands").doc(brandId).update({
        weight: FieldValue.increment(1),
    });

    await database.collection("blocks").doc(blockId).update({
        status: "completed",
        completedAt: Timestamp.now(),
    });
}

module.exports = {generateLapos}