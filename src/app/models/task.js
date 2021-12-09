const moongose = require('../../database')
const bcrypt = require('bcryptjs')

const TaskSchema = new moongose.Schema({
    title: {
        type: String,
        required: true
    },
    project: {
        type: moongose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    assignedTo:{
        type: moongose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    completed: {
        type: Boolean,
        required: true,
        default: false
    },
    createdAt:{
        type: Date,
        required: true,
        default: Date.now()
    }
})


const Task = moongose.model('task', TaskSchema)
module.exports = Task