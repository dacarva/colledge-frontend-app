/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import {ethers} from "ethers";
import * as admin from "firebase-admin";
admin.initializeApp();

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

export const helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});

export const signInWithEthereum = onRequest(async (request, response) => {
  const {address, signature} = request.body;

  const message = "Sign in to Colledge App";

  const messageHash = ethers.id(message);
  const messageArray = ethers.toBeArray(messageHash);

  const recoveredAddress = ethers.verifyMessage(messageArray, signature);
  logger.info(`address: ${address}`);
  logger.info(`Signature: ${signature}`);
  logger.info(`Recovered address: ${recoveredAddress}`);


  if (recoveredAddress.toLowerCase === address.toLowerCase) {
    const token = await admin.auth().createCustomToken(address);
    response.send({token});
  } else {
    response.status(401).send("Unauthorized");
  }
});
