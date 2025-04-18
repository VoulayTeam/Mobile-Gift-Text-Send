const database = require("../../database/firestore");
const {Timestamp, FieldValue} = require("firebase-admin/firestore");
const {addToCashout} = require("../addToCashout");
const configManager = require("../../util/configManager");

async function distributeLapoPrice(recipients, blockId) {
    const lapoPrice = configManager.get("lapoPrice", 5.00);
    const splitRatio = configManager.get("lapoSplitRatio", 0.6);

    const batch = database.batch();
    const timestamp = Timestamp.now();

    for (const userId in recipients) {
        const userRef = database.collection("users").doc(userId);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            break;
        }

        const brandsRef = userRef.collection("brands")
    }
//     for (const user of qualifyingUsers) {
//         const walletRef = database
//             .collection("wallets")
//             .doc(user.userId)
//             .collection("brands")
//             .doc(user.majorBrand);
//
//         // Get current wallet data
//         const walletDoc = await walletRef.get();
//
//         if (walletDoc.exists) {
//             // Update existing wallet
//             batch.update(walletRef, {
//                 total: FieldValue.increment(amountPerUser),
//                 sources: FieldValue.arrayUnion({
//                     blockId: blockId,
//                     amount: amountPerUser,
//                     timestamp: distributionTimestamp,
//                     type: "lapo_purchase"
//                 })
//             });
//         } else {
//             // Create new wallet
//             batch.set(walletRef, {
//                 total: amountPerUser,
//                 sources: [{
//                     blockId: blockId,
//                     amount: amountPerUser,
//                     timestamp: distributionTimestamp,
//                     type: "lapo_purchase"
//                 }]
//             });
//         }
//
//         // Record this distribution
//         distributionRecords.push({
//             userId: user.userId,
//             majorBrand: user.majorBrand,
//             amount: amountPerUser
//         });
//     }
//
//     // Create a distribution record for auditing
//     const distributionRef = database.collection("moneyDistributions").doc();
//     batch.set(distributionRef, {
//         blockId: blockId,
//         winningBrand: winningBrand,
//         totalAmount: totalDistributionAmount,
//         amountPerUser: amountPerUser,
//         timestamp: distributionTimestamp,
//         recipients: distributionRecords
//     });
//
//     // Commit all the writes atomically
//     await batch.commit();
//
//     return {
//         success: true,
//         message: `Distributed ${totalDistributionAmount} to ${qualifyingUsers.length} users`,
//         perUserAmount: amountPerUser,
//         totalDistributed: totalDistributionAmount,
//         recipientCount: qualifyingUsers.length,
//         distributionId: distributionRef.id
//     };
//
// } catch (error) {
//     console.error("Error distributing LAPO price:", error);
//     return {
//         success: false,
//         message: `Failed to distribute LAPO price: ${error.message}`,
//         error: error.message
//     };
}

module.exports = {distributeLapoPrice}