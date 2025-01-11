const { PROJECTS, TASKS, findTasksByProject, findManager, fillProjectDetails, ROLES } = require('../db.js');
const { populateProject } = require('../middleware/data.js');
const { canViewProject } = require('../permission.js');
const router = require('express').Router();

router.get('/', (req, res) => {
    const detailedProjects = PROJECTS.map(project => {
        const taskCount = findTasksByProject(project.id).length;
        const manager = findManager(project.managerId);
        return {
            ...project,
            taskCount,
            managerName: manager ? manager.username : null,
        };
    });
    res.json(detailedProjects);
});

router.get('/:id', populateProject, authViewProject, (req, res) => {
    res.json(fillProjectDetails(req.project));
});

// authViewProject is a middleware and canViewProject is a function or logic that checks if the user has the permission to view the project.
function authViewProject(req, res, next) {
    if (!canViewProject(req.project, req.user)) {
        return res.status(403).json({ message: "Not Allowed" });
    }
    next();
}

router.post('/', (req, res) => {
    const { name, managerId } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'Name and managerId are required' });
    }

    const manager = findManager(managerId);
    if (!manager) {
        return res.status(400).json({ error: 'Manager not found with id: ' + managerId });
    }

    const newProject = {
        id: PROJECTS.length + 1,
        name,
        managerId,
    };
    PROJECTS.push(newProject);
    res.status(201).json(newProject);
});

router.post('/:id/task', populateProject, (req, res) => {
    const { name, userId } = req.body;
    if (!name || !userId) {
        return res.status(400).json({ error: 'Name, and userId are required' });
    }
    const projectId = req.project.id;
    const newTask = {
        id: TASKS.length + 1,
        name,
        projectId,
        userId,
    };
    TASKS.push(newTask);
    res.status(201).json(newTask);
});

router.delete('/:id', populateProject, (req, res) => {
    console.log("Marked project completed", req.project.id);
    res.status(204).send();
});

module.exports = router;