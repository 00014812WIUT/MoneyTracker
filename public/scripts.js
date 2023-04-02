// let deleteBtns = document.querySelectorAll('.delete')
let deleteBtns = document.querySelectorAll('.delete')
let updateBtns = document.querySelectorAll('.edit')
let updateRecord = document.getElementById('update-record')
let form = document.getElementById('update-form');

deleteBtns.forEach(btn => {
    btn.addEventListener('click', e => {
    	fetch('/transactions/delete', {
    		method: 'DELETE',
    		headers: {
    			'Content-Type': 'application/json'
    		},
    		body: JSON.stringify({ id: e.target.dataset.id })
    	})
    	.then(res => res.json())
    	.then(data => {
    		if (data.deleted) {
    			e.target.parentElement.parentElement.parentElement.parentElement.remove()
    		}
    	})
    })
})

updateBtns.forEach(btn => {
    btn.addEventListener('click', e => {
    	window.location = `/transactions/update/${e.target.dataset.id}`
    })
})

form.addEventListener('submit', e => {
	const amount = document.getElementById('amount').value
	// console.log(amount)
	if(amount < 0){
		const amountErr = document.getElementById('amount-error')
		amountErr.classList.add("alert", "alert-danger");
		amountErr.textContent = "Please enter a positive amount."
		// window.alert("Please enter a positive amount.")
		e.preventDefault()
		return;
	}
    e.preventDefault()

    let formData = new FormData(form)

    fetch(`/transactions/update/${e.target.dataset.id}`, {
    	method: 'PUT',
    	headers: {
    		'Content-Type': 'application/json'
    	},
    	body: JSON.stringify({ data: Object.fromEntries(formData)})
    })
    .then(res => res.json())
    .then(data => {
    	// console.log(data)
		window.location = '/transactions'
    })
})