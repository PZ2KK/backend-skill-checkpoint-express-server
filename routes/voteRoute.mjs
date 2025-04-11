import { Router } from "express";
import connectionPool from "../utils/db.mjs";
import { validateVote } from "../middleware/validateQuestion.mjs";

const voteRouter = Router();

/**
 * @swagger
 * /answers/{answerId}/vote:
 *   post:
 *     summary: Vote on an answer
 *     parameters:
 *       - in: path
 *         name: answerId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               vote:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Vote recorded
 *       404:
 *         description: Answer not found
 */
voteRouter.post("/answer/:answerId/vote", [validateVote] ,async (req, res) => {
    try {
        const answerId = req.params.answerId
        const newVote = {
            ...req.body,
        };

        const results = await connectionPool.query(
            `
            SELECT id FROM answers WHERE id = $1
            `, [answerId]);

        if (results.rows.length === 0) {
            return res.status(404).json({
                message: `Answers not found.`,
        });
        }

        await connectionPool.query(
            `
              INSERT INTO answer_votes
              (answer_id, vote)
              VALUES ($1, $2)
            `,
            [
              answerId,
              newVote.vote,
            ]
          );

        return res.status(201).json({
            message: "Vote on the answer has been recorded successfully.",
        });

    } catch(err) {
        console.error(err);
        return res.status(500).json({
            message: "Unable to vote question.",
        });
    }
});

/**
 * @swagger
 * /questions/{questionId}/vote:
 *   post:
 *     summary: Vote on a question
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               vote:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Vote recorded
 *       404:
 *         description: Question not found
 */
voteRouter.post("/question/:questionId/vote", async (req, res) => {
    try {
        const questionId = req.params.questionId
        const newVote = {
            ...req.body,
        };

        const results = await connectionPool.query(
            `
            SELECT id FROM questions WHERE id = $1
            `, [questionId]);

        if (results.rows.length === 0) {
            return res.status(404).json({
                message: `Questions not found.`,
        });
        }

        await connectionPool.query(
            `
              INSERT INTO question_votes
              (question_id, vote)
              VALUES ($1, $2)
            `,
            [
              questionId,
              newVote.vote,
            ]
          );

        return res.status(201).json({
            message: "Vote on the question has been recorded successfully.",
        });

    } catch(err) {
        console.error(err);
        return res.status(500).json({
            message: "Unable to vote question.",
        });
    }
});

export default voteRouter;