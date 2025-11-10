import { ServerPayload } from '@shared/models/server-payload.model';
import { QuizServerPayload } from '@shared/models/quiz-model';

import cors from "cors";
import express, { Application, Request, Response, Router } from "express";
import { firestoreRef } from "../config/firebase-config";
import { GcpLogger } from "../middlewares/logger";


const quizApp: Application = express();

export class QuizController {
    router = Router();
    constructor() {
        this.init();
    }

    init() {
        quizApp.post('/submitQuizAnswer', this.submitQuizAnswer.bind(this));
        quizApp.post('/getQuizState', this.getQuizState.bind(this));
    }

    /**
     * Get database reference based on userId or sessionId
     */
    private getDocRef(serverPayload: ServerPayload<any>): FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData, FirebaseFirestore.DocumentData> {
        if (serverPayload.userId) {
            // Hierarchy: experienceId -> userId -> chapters -> chapterId
            return firestoreRef
                .collection(serverPayload.experienceId)
                .doc(serverPayload.userId)
                .collection('chapters')
                .doc(serverPayload.chapterId);
        } else {
            // Hierarchy: experienceId -> sessionId -> chapters -> chapterId
            return firestoreRef
                .collection(serverPayload.experienceId)
                .doc(serverPayload.sessionId)
                .collection('chapters')
                .doc(serverPayload.chapterId);
        }
    }

    async submitQuizAnswer(req: Request, res: Response): Promise<any> {
        try {
            const serverPayload: ServerPayload<QuizServerPayload> = req.body;
            console.log('Received quiz answer payload:', serverPayload);
            if (!serverPayload.sessionId || !serverPayload.chapterId || !serverPayload.experienceId) {
                return res.status(400).send('Missing params');
            }

            // Use helper function to get document reference
            const docRef = this.getDocRef(serverPayload);

            // Get current quiz state from database
            const doc = await docRef.get();
            const currentData = doc.exists ? doc.data() : {};
            const currentQuizState = currentData?.quiz || {};

            console.log('Current quiz state from DB:', currentQuizState);
            console.log('New data to merge:', serverPayload.data);

            // Get the quiz ID from the payload
            const quizId = serverPayload.data.id;

            // Organize quiz data under the quiz ID
            const updatedQuizState = {
                ...currentQuizState,
                [quizId]: {
                    ...currentQuizState[quizId],
                    ...serverPayload.data
                }
            };

            console.log('Updated quiz state:', updatedQuizState);

            // Update the document with the merged quiz state
            await docRef.set({
                ...currentData, // Preserve all other document data
                quiz: updatedQuizState
            }, { merge: true });

            return res.status(200).json({
                success: true,
                message: 'Answer submitted successfully'
            });

        } catch (error) {
            console.error('Error submitting quiz answer:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to submit answer'
            });
        }
    }

    async getQuizState(req: Request, res: Response): Promise<any> {
        try {
            const serverPayload: ServerPayload<{ chapterId: string; quizId: string }> = req.body;

            if (!serverPayload.sessionId || !serverPayload.data?.chapterId || !serverPayload.data?.quizId || !serverPayload.experienceId) {
                return res.status(400).send({ error: 'Missing sessionId, chapterId, quizId, or experienceId' });
            }

            const { chapterId, quizId } = serverPayload.data;

            // Use helper function to get document reference
            const docRef = this.getDocRef(serverPayload);

            const doc = await docRef.get();

            if (!doc.exists) {
                return res.status(200).json({
                    success: true,
                    data: null,
                    message: 'No quiz state found'
                });
            }

            const data = doc.data();
            const allQuizData = data?.quiz || {};

            // Get specific quiz data by ID
            const specificQuizData = allQuizData[quizId] || null;

            return res.status(200).json({
                success: true,
                data: specificQuizData,
                message: specificQuizData ? 'Quiz state retrieved successfully' : 'No quiz state found for this quiz ID'
            });

        } catch (error) {
            console.error('Error getting quiz state:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to get quiz state'
            });
        }
    }
}

const logger = new GcpLogger();
quizApp.use(cors({ origin: true }));
quizApp.use(express.json());
quizApp.use(logger.request());
// No prefix here - the function name will be the prefix
quizApp.use("/", new QuizController().router);

export default quizApp;
