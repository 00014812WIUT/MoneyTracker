let fs = require('fs')

let express = require('express')
const uniqid = require("uniqid");
const { body, validationResult } = require('express-validator');
let router = express.Router()

router.get('/', (req, res) => {
    let wallet = getAll('wallets')[0]
    res.render('wallets', {title: 'Wallet', walletInfo: wallet, statInfo: getStatInfo()})
})

function getStatInfo() {
    let transactions = getAll('transactions')
    let wallet = getAll('wallets')[0]
    if (wallet == undefined)
        return undefined
    let totalExpenses = 0;
    let totalIncomes = 0;
    for (let idx in transactions){
        if(transactions[idx].type == 'income'){
            totalIncomes += transactions[idx].amount * 1
        } else {
            totalExpenses += transactions[idx].amount * 1
        }
    }

    let statInfo = {
        isBalancePositive: wallet.balance * 1 > 0,
        walletBalance: Math.abs(wallet.balance),
        isPeriodPositive: totalIncomes > totalExpenses,
        periodChange: Math.abs(totalIncomes - totalExpenses),
        periodExpense: totalExpenses,
        periodIncomes: totalIncomes
    }

    return statInfo
}

router.route('/create')
    .get((req, res) => {
        res.render('create-wallet', {title: 'Wallet'})
    })
    .post(
        body('name')
            .not().trim().isEmpty()
            .withMessage('Wallet name should not be empty'),
        body('owner')
            .not().trim().isEmpty()
            .withMessage('Owner name should not be empty'),
        body('balance').custom((value, { req }) => {
            if (value < 0) {
                throw new Error('Balance should be positive number');
            }
            return true;
        }),
        (req, res) => {
            let errors = validationResult(req)
            if(!errors.isEmpty()){
                return res.json({status: 400, errors: errors.array()})
            }

            let wallets = getAll('wallets')

            wallets.push({
                id: uniqid(),
                name: req.body.name,
                balance: 1 * req.body.balance,
                owner: req.body.owner
            })

            saveAll('wallets', wallets)
            res.json({status: 200})
            // res.redirect('/wallets')
    })

router.route('/update/:id')
    .get((req, res) => {
        let id = req.params.id
        let wallet = getAll('wallets').find(wallet => wallet.id == id)
        res.render('create-wallet', { wallet: wallet, title: 'Wallet'})
    })
    .put(
        body('name')
            .not().trim().isEmpty()
            .withMessage('Wallet name should not be empty'),
        body('owner')
            .not().trim().isEmpty()
            .withMessage('Owner name should not be empty'),
        body('balance').custom((value, { req }) => {
            if (value < 0) {
                throw new Error('Balance should be positive number');
            }
            return true;
        }),
        (req, res) => {
            let errors = validationResult(req)
            if(!errors.isEmpty()){
                return res.json({status: 400, errors: errors.array()})
            }

            let id = req.params.id

            let wallets = getAll('wallets')

            let wallet = wallets.find(wallet => wallet.id == id)

            let idx = wallets.indexOf(wallet)

            wallets[idx].name = req.body.name
            wallets[idx].balance = 1 * req.body.balance
            wallets[idx].owner = req.body.owner

            // console.log(req.body)
            saveAll('wallets', wallets)

            res.json({status: 200})
            // res.redirect('/wallets')
    })


module.exports = router

function  getAll(collection) {
    return JSON.parse(fs.readFileSync(`./data/${collection}.json`))
}

function saveAll(collection, data) {
    fs.writeFileSync(`./data/${collection}.json`, JSON.stringify(data))
}