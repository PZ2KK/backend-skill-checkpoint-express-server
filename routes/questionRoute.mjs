import { Router } from "express";
import connectionPool from "../utils/db.mjs";
import { validateQuestionBody, validateSearchParam} from "../middleware/validateQuestion.mjs";

const questionRouter = Router();

/**
 * @swagger
 * /questions:
 *   get:
 *     summary: Get all questions
 *     responses:
 *       200:
 *         description: List of all questions
 */
questionRouter.get("/", async (req, res) => {
    try {
        const results = await connectionPool.query(`SELECT * FROM questions`);
        return res.status(200).json({
            data: results.rows,
          });

    } catch(err) {
        console.error(err);
        return res.status(500).json({
            message: "Unable to fetch questions.",
        });
    };
});

/**
 * @swagger
 * /questions/search:
 *   get:
 *     summary: Search questions by title or category
 *     parameters:
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Search results
 */
questionRouter.get("/search", [validateSearchParam],  async (req, res) => {
    try {
        const { title, category } = req.query;

        let query = "SELECT * FROM questions";
        let values = [];
        let whereClauses = [];

        if (title) {
            whereClauses.push(`title ILIKE $${values.length + 1}`);
            values.push(`%${title}%`);
        }
        
        if (category) {
            whereClauses.push(`category ILIKE $${values.length + 1}`);
            values.push(`%${category}%`);
        }   

        if (whereClauses.length > 0) {
            query += " WHERE " + whereClauses.join(" AND ");
        }

        const results = await connectionPool.query(query, values);

        if (results.rows.length === 0) {
            return res.status(400).json({
                message: `Invalid search parameters.`,
        });
        }

        return res.status(200).json({
        data: results.rows,
        });
          
    } catch(err) {
        console.error(err);
        return res.status(500).json({
            message: "Unable to fetch questions.",
        });
    };
});


/**
 * @swagger
 * /questions/{questionId}:
 *   get:
 *     summary: Get a question by ID
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A question object
 *       404:
 *         description: Question not found
 */
questionRouter.get("/:questionId",  async (req, res) => {
    try {
        const questionId = req.params.questionId
        const results = await connectionPool.query(
            `
            SELECT * FROM questions WHERE id = $1
            `, [questionId]);

        if (results.rows.length === 0) {
            return res.status(404).json({
                message: `Question not found.`,
        });
        }

        return res.status(200).json({
            data: results.rows[0],
        });

    } catch(err) {
        console.error(err);
        return res.status(500).json({
            message: "Unable to fetch questions.",
        });
    };
});

/**
 * @swagger
 * /questions:
 *   post:
 *     summary: Create a new question
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *     responses:
 *       201:
 *         description: Question created
 */
questionRouter.post("/", [validateQuestionBody] ,async (req, res) => {
    try {
        const newQuestion = {
            ...req.body,
        };

        await connectionPool.query(
            `
              INSERT INTO questions 
              (title, description, category)
              VALUES ($1, $2, $3)
            `,
            [
              newQuestion.title,
              newQuestion.description,
              newQuestion.category,
            ]
          );

        return res.status(201).json({
            message: "Question created successfully.",
        });

    } catch(err) {
        console.error(err);
        return res.status(500).json({
            message: "Unable to create question.",
        });
    }
});

/**
 * @swagger
 * /questions/{questionId}:
 *   put:
 *     summary: Update a question by ID
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
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *     responses:
 *       200:
 *         description: Question updated
 *       404:
 *         description: Question not found
 */
questionRouter.put("/:questionId", [validateQuestionBody], async (req, res) => {
    try {
        const questionId = req.params.questionId

        const questionCheck = await connectionPool.query(
            `SELECT id FROM questions WHERE id = $1`,
            [questionId]
          );
          if (questionCheck.rows.length === 0) {
            return res.status(404).json({
              message: `Question not found.`,
            });
          }
        
        const updateQuestion = {
            ...req.body,
        };

        await connectionPool.query(
            `
              UPDATE questions 
              SET   title = $2,
                    description = $3,
                    category = $4
              WHERE id = $1
            `,
            [
              questionId,
              updateQuestion.title,
              updateQuestion.description,
              updateQuestion.category,
            ]
          );

        return res.status(200).json({
            message: "Update question successfully.",
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Unable to update question.",
        });
    }    
});

/**
 * @swagger
 * /questions/{questionId}:
 *   delete:
 *     summary: Delete a question and its answers
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Question and answers deleted
 *       404:
 *         description: Question not found
 */
questionRouter.delete("/:questionId", async (req, res) => {
    try {
        const questionId = req.params.questionId

        const questionCheck = await connectionPool.query(
            `SELECT id FROM questions WHERE id = $1`,
            [questionId]
          );
          if (questionCheck.rows.length === 0) {
            return res.status(404).json({
              message: `Question not found.`,
            });
          }

        await connectionPool.query(
            `DELETE FROM questions WHERE id = $1`,
            [questionId]
        );
        await connectionPool.query(
            `DELETE FROM answers WHERE question_id = $1`,
            [questionId]
        );
      
          return res.status(200).json({
            message: "Deleted question and answer successfully",
          });

    } catch(err) {
        console.error(err);
        return res.status(500).json({
            message: "Unable to delete questions.",
        });
    };
});

export default questionRouter;