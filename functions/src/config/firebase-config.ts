import * as admin from 'firebase-admin';
var serviceAccount = require(`../service-account-key.json`);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as any),
});

export const firestoreRef = admin.firestore();
