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
            return res.status(201).json({id: blockId, ...newBlockData});
        }

        const blockData = documentSnapshot.data();

        // Check if status is active
        if (blockData.status !== "active") {
            return res.status(400).json({error: "Voting block is not active"});
        }

        // Check if user already voted for this block
        if (Object.values(blockData.brands).some(
            brandVotes => brandVotes.some(vote => vote.user === userId)
        )) {
            return res.status(400).json({error: "User already voted for this block"});
        }

        // Update existing voting block with the new vote
        blockData.brands[supported].push({
            user: userId,
            timestamp: timestamp
        });
        await documentSnapshot.ref.update(blockData);

        // Check if the brand, with the user's vote, surpasses the threshold
        if (blockData.brands[supported].length + 1 >= 3) {
            blockData.completedAt = timestamp;
            blockData.status = "completed";
            // Trigger workflows to create LAPDs
            await lapoWorkflows(blockId, supported, blockData.brands[supported]);
            return res.status(200).json({id: blockId, ...blockData});
        }

        return res.status(200).json({id: blockId, ...blockData});
    } catch (error) {
        console.error("Error submitting vote: ", error);
        return res.status(500).json({error: "Failed to submit vote"});
    }
}

// A LAPO (Living Advertising Package Offer) is a monetizable item in the Voulay platform that represents user engagement through voting. When users vote for brands, LAPOs are generated once a voting block is completed. These LAPOs can then be purchased by affiliates, with the revenue being shared between Voulay and the users who voted for the winning brand.
//     When a brand surpasses the voting threshold (3 votes in this case), the following workflows need to be triggered:
//
//     Determine the winning brand - Identify which brand received the majority of votes in the completed block
// Generate LAPOs - Create one LAPO per vote (typically 3 total) and mark them as available for purchase by affiliates
// Identify eligible recipients - Mark users who voted for the winning brand as eligible for rewards
//     Update brand weighting - Increase the weight of the winning brand in the system to affect its chances of appearing in future voting pairs
// Mark the block as completed - Update the status and timestamp to indicate the voting block is now closed
//
// These workflows are essential for the monetization aspect of the platform, as they create the connection between user voting activity and potential rewards when affiliates purchase the resulting LAPOs.
async function lapoWorkflows(blockId, brandId, winningVotes) {
    // 2. Generate LAPOs
    const lapoPromises = winningVotes.map(vote => {
        return database.collection("lapos").add({
            userId: vote.user,
            status: "available",
            block: blockId,
            createdAt: Timestamp.now(),
        });
    });

    await Promise.all(lapoPromises);

    // 3. Identify eligible recipients
    // Add money to user's wallets here
    // TODO

    // 4. Update brand weighting
    await database.collection("brands").doc(brandId).update({
        weight: FieldValue.increment(1),
    });

    // 5. Mark the block as completed
    await database.collection("blocks").doc(blockId).update({
        status: "completed",
        completedAt: Timestamp.now(),
    });
}

module.exports = { submitVote };