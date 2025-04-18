const database = require("../../database/firestore");
const {getFirestore, Timestamp, FieldValue, Filter} = require('firebase-admin/firestore');
const {generateLapos} = require("../lapo/generateLapos");
const {ErrorTypes} = require("../../middleware/error");

async function processVote(userId, blockId, supported, other) {
    // Validate inputs
    if (!userId || !blockId || !supported || !other) {
        throw ErrorTypes.VALIDATION("Missing required fields");
    }

    const timestamp = Timestamp.now();
    const documentSnapshot = await database.collection("blocks").doc(blockId).get();

    // Handle new voting block creation
    if (!documentSnapshot.exists) {
        const newBlockData = {
            brands: {
                [supported]: [],
                [other]: [],
            },
            status: "active",
            createdAt: timestamp,
            completedAt: null,
        };

        newBlockData.brands[supported].push({
            user: userId,
            timestamp: timestamp
        });

        await documentSnapshot.ref.create(newBlockData);
        return {id: blockId, ...newBlockData, isNew: true};
    }

    const blockData = documentSnapshot.data();

    // Validate block status
    if (blockData.status !== "active") {
        throw ErrorTypes.FORBIDDEN("Voting block is not active");
    }

    // Check for duplicate votes
    if (Object.values(blockData.brands).some(
        brandVotes => brandVotes.some(vote => vote.user === userId)
    )) {
        throw ErrorTypes.CONFLICT("User has already voted for this block");
    }

    // Update block with new vote
    blockData.brands[supported].push({
        user: userId,
        timestamp: timestamp
    });

    await documentSnapshot.ref.update(blockData);

    // Check for threshold and handle completion
    let completed = false;
    if (blockData.brands[supported].length >= 3) {
        blockData.completedAt = timestamp;
        blockData.status = "completed";
        completed = true;

        // Update document status
        await documentSnapshot.ref.update({
            completedAt: timestamp,
            status: "completed"
        });

        // Trigger LAPO generation
        await generateLapos(blockId, supported, blockData.brands[supported]);
    }

    return {
        id: blockId,
        ...blockData,
        isNew: false,
        completed: completed
    };
}

// Controller function that handles HTTP
async function submitVote(req, res, next) {
    try {
        const {userId, blockId, supported, other} = req.body;

        const result = await processVote(userId, blockId, supported, other);

        // Determine response status based on result
        const statusCode = result.isNew ? 201 : 200;
        return res.status(statusCode).json(result);
    } catch (error) {
        next(error);
    }
}

module.exports = {submitVote};