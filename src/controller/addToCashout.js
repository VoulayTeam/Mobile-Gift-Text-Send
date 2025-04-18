const database = require("../database/firestore");
const {Timestamp, FieldValue} = require("firebase-admin/firestore");

async function addToCashout(affiliateId, lapoId, blockId) {
    const counterRef = database.collection("metadata").doc("cashoutCounter");

    await database.runTransaction(async (transaction) => {
        const counterDoc = await transaction.get(counterRef);
        const position = counterDoc.exists ? counterDoc.data().position + 1 : 1;
        transaction.set(counterRef, {
            position: position,
            lastUpdated: Timestamp.now()
        });

        const queueRef = database.collection("cashout").doc();
        transaction.set(queueRef, {
            affiliateId,
            lapoId,
            blockId,
            position,
            addedAt: Timestamp.now(),
        });
    });
}

module.exports = {addToCashout}