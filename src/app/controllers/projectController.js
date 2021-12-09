const express = require('express')
const router = express.Router()

const Project = require('../models/project')
const Task = require('../models/task')

const authMiddleware = require('../middlewares/auth')

router.use(authMiddleware)

router.get('/', async(req, res) => {
    try{
        const projects = await Project.find().populate(['user', 'tasks'])
        return res.send({projects})
    }catch(e){
        console.log(e)
        return res.status(404).send('Error: Error loading projects')
    }
})

router.get('/:projectId', async(req, res) => {
    try{
        const project = await Project.findById(req.params.projectId).populate(['user', 'tasks'])
        return res.send({project})
    }catch(e){
        console.log(e)
        return res.status(404).send('Error: Error loading project')
    }
})


router.post('/', async(req, res) => {
    try{
        const {title, description, tasks} = req.body
        const project = await Project.create({title, description, user: req.userId})

        await Promise.all(tasks.map(async task => {
            const projectTask = new Task({...task, project: project._id})
            await projectTask.save()
            project.tasks.push(projectTask)

        }))
        await project.save()
        return res.send({project})
    }catch(e){
        return res.status(404).send('Error: Error creating new project')
    }
})

router.put('/:projectId', async(req, res) => {
    try{
        const {title, description, tasks} = req.body
        const project = await Project.findByIdAndUpdate(req.params.projectId, {title, description}, {new: true})
        
        console.log(tasks)

        project.tasks = []
        await Task.remove({project: project._id})

        await Promise.all(tasks.map(async task => {
            const projectTask = new Task({...task, project: project._id})
            await projectTask.save()
            project.tasks.push(projectTask)

        }))
        await project.save()
        return res.send({project})
    }catch(e){
        console.log(e)
        return res.status(404).send('Error: Error updating new project')
    }
})

router.delete('/:projectId', async(req, res) => {
    try{
        await Project.findByIdAndRemove(req.params.projectId)
        return res.send('ok')
    }catch(e){
        console.log(e)
        return res.status(404).send('Error: Error deleting project')
    }
})
module.exports = app => app.use('/projects', router)