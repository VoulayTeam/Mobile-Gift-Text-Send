const database = require("../database/firestore");
const {getFirestore, Timestamp, FieldValue, Filter} = require('firebase-admin/firestore');

async function submitVote(req, res) {
    const {
        userId,
        blockId,
        supported,
        other,
    } = req.body;
    if (!userId || !blockId || !supported || !other) {
        return res.status(400).json({error: "Missing required fields"});
    }

    const timestamp = Timestamp.now();

    try {
        const documentSnapshot = await database.collection("blocks").doc(blockId).get();

        // Voting block does not yet exist, create new voting block
        if (!documentSnapshot.exists) {
            const blockData = {
                brands: {
                    [supported]: [],
                    [other]: [],
                },
                status: "active",
                createdAt: timestamp,
                completedAt: null,
            };
            blockData.brands[supported].push({
                user: userId,
                timestamp: timestamp
            });
            await documentSnapshot.ref.create(blockData);
            return res.status(201).json({id: blockId, ...blockData});
        }

        // Check if status is active
        if (documentSnapshot.data().status !== "active") {
            return res.status(400).json({error: "Voting block is not active"});
        }

        // Check if user already voted for this block
        if (documentSnapshot.data().votes.some(vote => vote.user === userId)) {
            return res.status(400).json({error: "User already voted for this block"});
        }

        const blockData = documentSnapshot.data();

        // Check if the brand, with the user's vote, surpasses the threshold
        if (documentSnapshot.data().brands[supported].length + 1 >= 3) {
            blockData.completedAt = timestamp;
            blockData.status = "completed";
            // Trigger workflows to create LAPDs
        }

        // Update existing voting block with the new vote
        blockData.brands[supported].push({
            user: userId,
            timestamp: timestamp
        });
        await documentSnapshot.ref.update(blockData);
        return res.status(200).json({id: blockId, ...blockData});
    } catch (error) {
        console.error("Error submitting vote: ", error);
        return res.status(500).json({error: "Failed to submit vote"});
    }
}

module.exports = { submitVote };