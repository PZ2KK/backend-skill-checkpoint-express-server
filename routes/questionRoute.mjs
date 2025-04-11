import { Router } from "express";
import connectionPool from "../utils/db.mjs";

const questionRouter = Router();

//------------------------------Question------------------------------

//get all question
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

//get a question by title or category
questionRouter.get("/search", async (req, res) => {
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

//get a question by Id
questionRouter.get("/:questionId", async (req, res) => {
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

// create a new question
questionRouter.post("/", async (req, res) => {
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

// update a question by id
questionRouter.put("/:questionId", async (req, res) => {
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

// update a question by id
questionRouter.put("/:questionId", async (req, res) => {
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

//delete a question by Id
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

// vote on a question
questionRouter.post("/:questionId/vote", async (req, res) => {
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

//------------------------------Answer------------------------------

//get all answers for a question
questionRouter.get("/:questionId/answers", async (req, res) => {
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

// create new answer a question
questionRouter.post("/:questionId/answers", async (req,  res) => {
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

// delete all answer from a question
questionRouter.delete("/:questionId/answers", async (req, res) => {
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

export default questionRouter;