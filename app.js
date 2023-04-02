const path = require('path')
let fs = require('fs')
const express = require('express')
const app = express()
const PORT = 3000

app.set('view engine', 'pug')
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

app.use('/transactions', require('./routes/transactions'))
app.use('/budgets', require('./routes/budgets'))
app.use('/wallets', require('./routes/wallets'))
app.use('/settings', require('./routes/settings'))
app.use('/api/v1/categories', require('./routes/categories'))

app.get('/', (req, res) => {
    res.render('home', { title: 'Home', statInfo: getStatInfo()})
})


app.listen(PORT, () => {
    console.log(`App listening on port ${ PORT }`)
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

function  getAll(collection) {
    return JSON.parse(fs.readFileSync(`./data/${collection}.json`))
}
