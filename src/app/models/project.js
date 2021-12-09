const moongose = require('../../database')
const bcrypt = require('bcryptjs')

const ProjectSchema = new moongose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    user:{
        type: moongose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    tasks: [{
        type: moongose.Schema.Types.ObjectId,
        ref: 'task',   
    }],
    createdAt:{
        type: Date,
        required: true,
        default: Date.now()
    }
})


const Project = moongose.model('project', ProjectSchema)
module.exports = Project