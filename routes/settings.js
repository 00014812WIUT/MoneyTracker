let fs = require('fs')

let express = require('express')
const uniqid = require("uniqid");
let router = express.Router()

router.get('/', (req, res) => {
    res.render('settings', {title: 'Settings'})
})


router.get('/reset', (req, res) => {

    saveAll('transactions', [])
    saveAll('wallets', [])
    saveAll('budgets', [])
    res.redirect('/')
})




module.exports = router

function  getAll(collection) {
    return JSON.parse(fs.readFileSync(`./data/${collection}.json`))
}

function saveAll(collection, data) {
    fs.writeFileSync(`./data/${collection}.json`, JSON.stringify(data))
}