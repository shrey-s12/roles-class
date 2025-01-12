const { fillTaskDetails, TASKS } = require('../db.js');
const { populateTask } = require('../middleware/data.js');
const { paginate } = require('../middleware/pagination.js');
const { canViewTask, canDeleteTask } = require('../permission.js');
const router = require('express').Router();

router.get('/', filterTasks, paginate, (req, res) => {
    // const detailedTasks = res.paginatedResults.results
    //     .filter(task => canViewTask(task, req.user))
    //     .map(task => fillTaskDetails(task));
    res.json(res.paginatedResults);
});

router.get('/:id', populateTask, authViewTask, (req, res) => {
    res.json(fillTaskDetails(req.task));
});

router.delete('/:id', populateTask, authDeleteTask, (req, res) => {
    console.log("Marked task completed", req.task.id);
    res.status(204).send();
});

function authViewTask(req, res, next) {
    if (!canViewTask(req.task, req.user)) {
        return res.status(401).json({ message: "Not allowed" });
    }
    next();
}

function authDeleteTask(req, res, next) {
    if (!canDeleteTask(req.task, req.user)) {
        return res.status(401).json({ message: "Not allowed" });
    }
    next();
}

function filterTasks(req, res, next) {
    const { users } = req.query;
    let filteredTasks = TASKS;
    if (users) {
        const userIds = users.split(',').map(id => parseInt(id));
        filteredTasks = filteredTasks.filter(task => userIds.includes(task.userId));
    }
    req.paginationResource = filteredTasks;
    next();
}

module.exports = router;