let fs = require('fs')

let express = require('express')
let router = express.Router()
let uniqid = require('uniqid')

router.get('/', (req, res) => {
    let transactions = getAll('transactions')
    let categories = getAll('categories')

    let resTrans = []

    for(let trans in transactions) {
        let slct;
        for(let ct in categories){
            if(transactions[trans].categoryId == categories[ct].id){
                slct = categories[ct];
            }
        }
        transactions[trans].categoryId = slct
        resTrans.push(transactions[trans])
    }

    // console.log(resTrans)
    res.render('transactions', {title: 'Transaction', transactions: resTrans, statInfo: getStatInfo()})
})

router.get('/incomes', (req, res) => {
    res.json(getChartData('income'))
})

router.get('/expenses', (req, res) => {
    res.json(getChartData('expense'))
})

function getChartData(type){
    let transactions = getAll('transactions').filter(transaction => transaction.type == type)
    let categories = getAll('categories')

    let resStats = []
    let resColors = []

    for(let trIdx in transactions) {
        for (let ctIdx in categories){
            if(transactions[trIdx].categoryId == categories[ctIdx].id){

                let isFound = false
                for(let rsIndex in resStats){
                    if(resStats[rsIndex].name == categories[ctIdx].name){
                        resStats[rsIndex].value = resStats[rsIndex].value * 1 + transactions[trIdx].amount * 1
                        isFound = true
                    }
                }

                if (!isFound){
                    resStats.push({value: 1 * transactions[trIdx].amount, name: categories[ctIdx].name})
                    resColors.push(categories[ctIdx].color)
                }
            }
        }
    }

    // console.log(resStats)

    let total = 0;
    for(let idx in resStats){
        total = total + 1 * resStats[idx].value
    }

    for (let idx in resStats){
        let percentage = Math.round(((resStats[idx].value / total) * 100) * 10) /10
        resStats[idx].name += ' ' + percentage + '%'
    }

    let res = {
        colors: resColors,
        values: resStats
    }
    return res
}


router.route('/create')
    .get((req, res) => {
        let categories = getAll('categories')
        let incomeCategories = categories.filter(category => category.type == 'income')


        res.render('create-transaction', {title: 'Transaction', categories: incomeCategories})
    })
    .post((req, res) => {
        let transactions = getAll('transactions')

        transactions.push({
            id: uniqid(),
            type: req.body.type,
            categoryId: req.body.category,
            date: req.body.date,
            note: req.body.note,
            amount: 1 * req.body.amount
        })

        let wallets = getAll('wallets')
        if (req.body.type == 'income'){
            wallets[0].balance = 1 * wallets[0].balance + 1 * req.body.amount
        } else {
            wallets[0].balance = 1 * wallets[0].balance - 1 * req.body.amount
        }

        saveAll('transactions', transactions)
        saveAll('wallets', wallets)

        res.redirect('/transactions')
    })


router.delete('/delete', (req, res) => {
    let transactions = getAll('transactions')
    let filteredTransactions = transactions.filter(transaction => transaction.id != req.body.id)
    let transaction = transactions.find(transaction => transaction.id == req.body.id)

    console.log(transaction)
    console.log(transaction.amount)

    let wallets = getAll('wallets')
    if (transaction.type == 'income'){
        wallets[0].balance = 1 * wallets[0].balance - 1 * transaction.amount
    } else {
        wallets[0].balance = 1 * wallets[0].balance + 1 * transaction.amount
    }

    saveAll('transactions', filteredTransactions)
    saveAll('wallets', wallets)
    res.json({ deleted: true })
})


router.route('/update/:id')
    .get((req, res) => {
        let id = req.params.id
        let transaction = getAll('transactions').find(transaction => transaction.id == id)
        let categories = getAll('categories').filter(category => category.type == transaction.type)

        res.render('create-transaction', {title: 'Transaction', transaction: transaction, categories: categories })
    })
    .put((req, res) => {
        let id = req.params.id

        let transactions = getAll('transactions')

        let transaction = transactions.find(transaction => transaction.id == id)

        let idx = transactions.indexOf(transaction)

        let wallets = getAll('wallets')

        if (transactions[idx].type == 'income'){
            wallets[0].balance = 1 * wallets[0].balance - 1 * transactions[idx].amount
        } else {
            wallets[0].balance = 1 * wallets[0].balance + 1 * transactions[idx].amount
        }

        transactions[idx].type = req.body.data.type
        transactions[idx].categoryId = req.body.data.category
        transactions[idx].date = req.body.data.date
        transactions[idx].note = req.body.data.note
        transactions[idx].amount = 1 * req.body.data.amount

        if (transactions[idx].type == 'income'){
            wallets[0].balance = 1 * wallets[0].balance + 1 * transactions[idx].amount
        } else {
            wallets[0].balance = 1 * wallets[0].balance - 1 * transactions[idx].amount
        }

        saveAll('transactions', transactions)
        saveAll('wallets', wallets)


        res.json({ updated: true })
    })



module.exports = router


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

function  getAll(collection) {
    return JSON.parse(fs.readFileSync(`./data/${collection}.json`))
}

function saveAll(collection, data) {
    fs.writeFileSync(`./data/${collection}.json`, JSON.stringify(data))
}

