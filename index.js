const dorenv = require('dotenv');
dorenv.config();

const express = require('express');
const tasksRouter = require('./routes/tasks.js');
const projectsRouter = require('./routes/projects.js');
const { ROLES, USERS } = require('./db.js');
const { authenticateToken, authRole } = require('./middleware/auth.js');
const { paginate } = require('./middleware/pagination.js');

const app = express();
const PORT = process.env.PORT1;

// Middleware to parse JSON
app.use(express.json());
app.use(authenticateToken);

app.use('/tasks', tasksRouter);
app.use('/projects', authRole(ROLES.ADMIN, ROLES.MANAGER), projectsRouter);

app.get('/users', authRole(ROLES.ADMIN), filterUsers, paginate, (req, res) => {
    // console.log(res.paginatedResults);
    return res.json(res.paginatedResults);
});

function filterUsers(req, res, next) {
    req.paginationResource = USERS;
    next();
}

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
