 Tech Stack

 Frontend
- React.js (Create React App)
- Axios
- CSS

 Backend
- Node.js
- Express.js

 Database
- MySQL 8

 Other Tools
- mysql2
- express-validator
- dotenv
- CORS
_____________________________________________________________________________________________________________________________________________________________________
Architecture

The application follows a three-layer architecture.

Frontend (React)
|
REST API (Express.js)
|
MySQL Database
Flow:
User
|
React UI
|
Axios API Calls
|
Express Routes
|
Controllers
|
MySQL Database

The frontend communicates with the backend using REST APIs.
The backend validates requests, performs business logic, interacts with MySQL using parameterized queries, and returns JSON responses.
______________________________________________________________________________________________________________________________________________________________________
 Assumptions

- Each student has a unique email address.
- A student can have multiple marks.
- Each subject is stored only once in the Subjects table.
- Marks are between 0 and 100.
- Duplicate marks for the same student, subject, and exam type are not allowed.
- Deleting a student automatically deletes all related marks using ON DELETE CASCADE.
- MySQL 8.0 or later is used.
- Node.js version 18 or later is installed.

______________________________________________________________________________________________________________________________________________________________________
Student Management System.postman_collection.json

Include requests like:

GET /students
POST /students
GET /students/:id
PUT /students/:id
DELETE /students/:id
GET /subjects
GET /students/:id/marks
POST /students/:id/marks
PUT /students/:id/marks/:markId
DELETE /students/:id/marks/:markId
