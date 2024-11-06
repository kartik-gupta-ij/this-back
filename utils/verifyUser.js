import jwt from 'jsonwebtoken';
import { errorHandler } from './error.js';
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK (ensure this is done once in your app)
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault(), // or use your Firebase service account credentials
    });
}

export const verifyToken = (req, res, next) => {
    // First, try to get the JWT token from cookies (manual signup/login)
    const token = req.cookies.access_token || req.headers.authorization?.split(' ')[1];

    if (!token) return next(errorHandler(401, 'You are not authenticated!'));

    // Check if the token is a Firebase ID token or a custom JWT
    if (token.startsWith('firebase:')) {
        // This is a Firebase ID token, so verify it with Firebase Admin SDK
        const firebaseToken = token.split(':')[1]; // Extract the token part

        admin.auth().verifyIdToken(firebaseToken)
            .then((decodedToken) => {
                req.user = decodedToken; // Store Firebase user data
                next();
            })
            .catch((error) => {
                return next(errorHandler(403, 'Firebase token is not valid!'));
            });
    } else {
        // This is a custom JWT token (manual signup/login), so verify it with JWT
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) return next(errorHandler(403, 'Token is not valid!'));

            req.user = user; // Store user data
            next(); // Continue to the next middleware/route
        });
    }
};
