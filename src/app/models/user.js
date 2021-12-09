const moongose = require('../../database')
const bcrypt = require('bcryptjs')

const UserSchema = new moongose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        select: false //não vai aparecer no select
    },
    passwordResetToken: {
        type: String,
        select: false,
    },
    passwordResetExpires: {
        type: Date,
        select: false,
    },
    createdAt:{
        type: Date,
        required: true,
        default: Date.now(
        )
    }
})

UserSchema.pre('save', async function(next){
    const hash = await bcrypt.hash(this.password, 10)
    this.password = hash
    next()
})

const User = moongose.model('user', UserSchema)
module.exports = User