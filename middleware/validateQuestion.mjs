export const validateQuestionBody = (req, res, next) => {
    if (!req.body.title) {
        return res.status(400).json({
            message: "title is rqeuired.",
        });
    }

    if (!req.body.description) {
        return res.status(400).json({
            message: "description is rqeuired.",
        });
    }

    if (!req.body.category) {
        return res.status(400).json({
            message: "Category is rqeuired.",
        });
    }
    next()
}

export const validateSearchParam = (req, res, next) => {
    const { category, title } = req.query;
    const categoryList = ["cuisine", "history", "literature", "miscellaneous", "movies", "music", "sports", "technology", "travelling"]
    const hasValidCategory = !category || categoryList.includes(category)

    if (!hasValidCategory) {
        return res.status(400).json({
            message: "Invalid category.",
        });
    }
    next()
}

export const validateAnswerBody = (req, res, next) => {
    const contentLength = (req.body.content.lenght > 0 && req.body.content.lenght < 300)

    if (!req.body.content) {
        return res.status(400).json({
            message: "content is rqeuired.",
        });
    }

    if (!contentLength) {
        return res.status(400).json({
            message: "content must be filled and no more than 300 characters",
        });
    }   
    next()
}

export const validateVote = (req, res, next) => {
    const { vote } = req.body
    const validateVoteType= ( vote === -1 || vote === 1)
    if (!validateVoteType) {
        return res.status(400).json({
            message: "Invalid vote value.",
        });
    }
    next()
}