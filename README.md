# 🏠 QA-with-Express

A Q&A API system developed using Node.js + Express with document management using Swagger.

## 📌 Features
- View all Questions or Question by ID 
- Write/Edit/Delete Questions and Answers
- Search Question by Title or Category
- Vote for Questions and Answers
- API Documentation with Swagger

## 🛠 Tools
- Node.js
- Express.js
- pgAdmin 4
- Swagger

## 🚀 Backend Setup

1. Clone the repository:
    ```bash
    git clone https://github.com/PZ2KK/backend-skill-checkpoint-express-server/
    cd backend-skill-checkpoint-express-server
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Run the development server:
    ```bash
    npm run start
    ```

4. The API will be running at `http://localhost:4000`

5. Visit `http://localhost:4000/api-docs` to see the Swagger API documentation.

## Structure of the Project:
.
├── config/
│   └── swagger.js              # Swagger configuration
├── middleware/
│   └── validateQuestion.mjs    # Validate question data before saving
├── routes/
│   ├── answerRoute.mjs         # Route for managing answers
│   ├── questionRoute.mjs       # Route for managing questions
│   └── voteRoute.mjs           # Route for voting
├── utils/
│   └── db.mjs                  # Database connection
├── app.mjs                     # Main Express App setup
├── package.json
└── README.md

## 👤 Author
**PZ2KK**  
- [Github](https://github.com/PZ2KK) 

## 🤝 Contributing
Any contributions is welcome !
If you want to adjust anything please contact me via DM!

## Badges
![Build Status](https://img.shields.io/badge/build-passing-brightgreen)  
![License](https://img.shields.io/badge/license-MIT-blue)  
![Last Commit](https://img.shields.io/github/last-commit/your-username/your-repo)  