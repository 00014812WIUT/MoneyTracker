let fs = require('fs')

let express = require('express')
let router = express.Router()

router.get('/', (req, res) => {
    let categories = getAll('categories')
    res.json(categories)
})

router.get('/income', (req, res) => {
    let categories = getAll('categories').filter(category => category.type == 'income')
    res.json(categories)
})

router.get('/expense', (req, res) => {
    let categories = getAll('categories').filter(category => category.type == 'expense')
    res.json(categories)
})

module.exports = router

function  getAll(collection) {
    return JSON.parse(fs.readFileSync(`./data/${collection}.json`))
}

function saveAll(collection, data) {
    fs.writeFileSync(`./data/${collection}.json`, JSON.stringify(data))
}