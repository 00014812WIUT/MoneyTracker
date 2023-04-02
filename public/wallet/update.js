let walletEditForm = document.getElementById('wallet-edit-form')

walletEditForm.addEventListener('submit', e => {
    e.preventDefault()

    fetch(`/wallets/update/${e.target.dataset.id}`, {
        method: 'PUT',
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