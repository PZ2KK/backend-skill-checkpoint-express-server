import { Router } from "express";
import connectionPool from "../utils/db.mjs";

const questionRouter = Router();

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

//get question by Id
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

//get question by title or category
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

export default questionRouter;