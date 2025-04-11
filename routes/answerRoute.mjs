import { Router } from "express";
import connectionPool from "../utils/db.mjs";
import { validateAnswerBody } from "../middleware/validateQuestion.mjs";

const answerRouter = Router({ mergeParams: true });

/**
 * @swagger
 * /questions/{questionId}/answers:
 *   get:
 *     summary: Get all answers for a question
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of answers
 *       404:
 *         description: Answers not found
 */
answerRouter.get("/", async (req, res) => {
    try {
        const questionId = req.params.questionId
        const results = await connectionPool.query(
            `
            SELECT * FROM answers WHERE question_id = $1
            `, [questionId]);

        if (results.rows.length === 0) {
            return res.status(404).json({
                message: `Answers not found.`,
        });
        }

        return res.status(200).json({
            data: results.rows,
        });

    } catch(err) {
        console.error(err);
        return res.status(500).json({
            message: "Unable to fetch answers.",
        });
    };
});

/**
 * @swagger
 * /questions/{questionId}/answers:
 *   post:
 *     summary: Create a new answer for a question
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
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Answer created
 */
answerRouter.post("/", [validateAnswerBody], async (req,  res) => {
    try {
        const questionId = req.params.questionId
        const newAnswer = {
            ...req.body,
        };

        await connectionPool.query(
            `
              INSERT INTO answers 
              (question_id, content)
              VALUES ($1, $2)
            `,
            [questionId, newAnswer.content]
          );

        return res.status(201).json({
            message: "Answer created successfully.",
        });

    } catch(err) {
        console.error(err);
        return res.status(500).json({
            message: "Unable to create answers.",
        });
    }
});

/**
 * @swagger
 * /questions/{questionId}/answers:
 *   delete:
 *     summary: Delete all answers for a question
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: All answers deleted
 *       404:
 *         description: Question or answers not found
 */
answerRouter.delete("/", async (req, res) => {
    try {
        const questionId = req.params.questionId

        const questionCheck = await connectionPool.query(
            `SELECT id FROM questions WHERE id = $1`,
            [questionId]
          );    
        const answerCheck = await connectionPool.query(
            `SELECT * FROM answers WHERE question_id = $1`,
            [questionId]
          );    

        if (questionCheck.rows.length === 0) {
            return res.status(404).json({
              message: `Question not found.`,
            });
        }
        if (answerCheck.rows.length === 0) {
            return res.status(404).json({
              message: `There is no answer exist.`,
            });
        }

        await connectionPool.query(
            `DELETE FROM answers WHERE question_id = $1`,
            [questionId]
          );
      
          return res.status(200).json({
            message: "All answers for the question have been deleted successfully.",
          });

    } catch(err) {
        console.error(err);
        return res.status(500).json({
            message: "Unable to delete answers.",
        });
    };
});

export default answerRouter;