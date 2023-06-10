const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: String,
    createdAt: {
        type: Date,
        required: true,
        immutable: true,
        default: Date.now()
    },
    color: String,
})


module.exports = mongoose.model('Category', categorySchema)
