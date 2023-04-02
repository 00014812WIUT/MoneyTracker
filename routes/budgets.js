let fs = require('fs')

let express = require('express')
const uniqid = require("uniqid");
const {body, validationResult} = require("express-validator");
let router = express.Router()

router.get('/', (req, res) => {
    let budget = getAll('budgets')[0]
    if (budget == undefined) {
        res.render('budgets', {title: 'Budget'})
        return
    }

    let transactions = getAll('transactions').filter(transaction => transaction.type == 'expense')
    let totalExpenses = 0;
    for (let idx in transactions){
        totalExpenses += transactions[idx].amount * 1
    }
    let spentInPercent = Math.round(((totalExpenses / budget.amount) * 100) * 10) / 10;
    let isAccountPositive = budget.amount - totalExpenses > 0

    let budgetInfo = {
        id: budget.id,
        originallyBudgeted: budget.amount,
        spent: totalExpenses,
        moneyLeft: Math.abs(budget.amount - totalExpenses),
        perDay: isAccountPositive? findMoneyPerDay(budget, totalExpenses) : 0,
        spentPercent: spentInPercent,
        startDate: formatDate(budget.startDate),
        finishDate: formatDate(addDays(budget.startDate, 30)),
        isPositive: isAccountPositive
    }

    res.render('budgets', {title: 'Budget', budgetInfo: budgetInfo})
})

function formatDate(date) {
    let objectDate = new Date(date);

    let day = objectDate.getDate();

    let year = objectDate.getFullYear();

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    let month = monthNames[objectDate.getMonth()]

    return month + " " + day + ", " + year
}

function findMoneyPerDay(budget, totalExpenses) {
    let moneyLeft = budget.amount - totalExpenses
    let finishDate = addDays(budget.startDate, 30)
    let currentDate = new Date()

    let difference = finishDate.getTime() - currentDate.getTime();
    let TotalDays = Math.ceil(difference / (1000 * 3600 * 24));
    return Math.round((moneyLeft / TotalDays) * 100) / 100;
}

function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

router.route('/create')
    .get((req, res) => {
        res.render('create-budget', {title: 'Budget'})
    })
    .post(
        body('name')
            .not().trim().isEmpty()
            .withMessage('Budget name should not be empty'),
        body('amount').custom((value, { req }) => {
            if (value < 0) {
                throw new Error('Amount should be positive number');
            }
            return true;
        }),
        (req, res) => {
            let errors = validationResult(req)
            if(!errors.isEmpty()){
                return res.json({status: 400, errors: errors.array()})
            }

            let budgets = getAll('budgets')

            budgets.push({
                id: uniqid(),
                name: req.body.name,
                amount: 1 * req.body.amount,
                startDate: req.body.startDate
            })

            // console.log(req.body)
            saveAll('budgets', budgets)
            res.json({status: 200})
            // res.redirect('/budgets')
    })

router.route('/update/:id')
    .get((req, res) => {
        let id = req.params.id
        let budget = getAll('budgets').find(budget => budget.id == id)
        res.render('create-budget', {title: 'Budget', budget: budget})
    })
    .put(
        body('name')
            .not().trim().isEmpty()
            .withMessage('Budget name should not be empty'),
        body('amount').custom((value, { req }) => {
            if (value < 0) {
                throw new Error('Amount should be positive number');
            }
            return true;
        }),
        (req, res) => {
            let errors = validationResult(req)
            if(!errors.isEmpty()){
                return res.json({status: 400, errors: errors.array()})
            }

            let id = req.params.id

            let budgets = getAll('budgets')

            let budget = budgets.find(budget => budget.id == id)

            let idx = budgets.indexOf(budget)

            budgets[idx].name = req.body.name
            budgets[idx].amount = 1 * req.body.amount
            budgets[idx].startDate = req.body.startDate

            saveAll('budgets', budgets)

            res.json({status: 200})
            // res.redirect('/budgets')
    })


module.exports = router

function  getAll(collection) {
    return JSON.parse(fs.readFileSync(`./data/${collection}.json`))
}

function saveAll(collection, data) {
    fs.writeFileSync(`./data/${collection}.json`, JSON.stringify(data))
}