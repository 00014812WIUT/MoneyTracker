let walletAddForm = document.getElementById('wallet-add-form')

walletAddForm.addEventListener('submit', e => {
    e.preventDefault()


    fetch('/wallets/create', {
        method: 'POST',
        headers: {
            "Content-Type" : 'application/json'
        },
        body: JSON.stringify({
            name: getValue('name'),
            balance: getValue('balance'),
            owner: getValue('owner')
        })
    })
        .then(res => res.json())
        .then(data => {
            if(data.status === 200) {
                window.location = '/wallets'
            } else {
                data.errors.forEach(err => {
                    get(`${err.param}-error`).classList.add("alert", "alert-danger");
                    get(`${err.param}-error`).textContent = err.msg
                })
            }
        })
})


function getValue(elemId) {
    return document.getElementById(elemId).value
}

function get(elemId) {
    return document.getElementById(elemId)
}