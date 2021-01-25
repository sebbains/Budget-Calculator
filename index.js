/* Instructions:

1. Wire up the budgeting tool so it tells the user whether or 
not they can afford an item based on their available funds. 💸
2. Style it as you wish 💅 

*/

// grab inputs and list
const budgetInput = document.querySelector('.addBudget');
const expenseItems = document.querySelector('.itemList');
const expenseNameInput = document.querySelector('.updateItem');
const expensePriceInput = document.querySelector('.updatePrice');
const button = document.querySelector('.updateSubmit');

// and bars
const expenseBar = document.querySelector('.expenseBar');
const savingsBar = document.querySelector('.savingsBar');
// set totals
let budget = JSON.parse(localStorage.getItem('budget')) || null;
let expensesTotal = 0;
let editIndex;
// pull local expenses or initialise empty expenses array
const expenses = JSON.parse(localStorage.getItem('expenses')) || [];

// update budget
function updateBudget(){
    // set budget value
    budget = budgetInput.value;
    // update css expense bar height variable
    document.documentElement.style.setProperty('--savings-height', '100%');
    // update expenses and show bars
    updateExpenseTotal();
    // save to local
    localStorage.setItem('budget', JSON.stringify(budget));
}

// add item or update existing
function updateItem(){
    // grab expense values
    const name = expenseNameInput.value;
    const price = expensePriceInput.value;
    // create expense obj
    const expense = {
        name,
        price
    }
    // edit if global index is set
    if (editIndex){
        // overwrite item at provided index 
        expenses[editIndex] = expense;
        editIndex = null;
    }else{
        // add new item to expenses array
        expenses.push(expense);
    }
    // update html list
    updateList(expenses, expenseItems);
    // save to local
    localStorage.setItem('expenses', JSON.stringify(expenses));
    // clear inputs
    expenseNameInput.value = "";
    expensePriceInput.value = "";
    // update expenseTotal
    updateExpenseTotal();
}

// update html expenses list
function updateList(expenses, expenseItems){
    // convert each array item into desired html and stick in list
    expenseItems.innerHTML = expenses.map((expense, index) => {
        return `
            <li data-index="${index}">
                <div class="buttons">
                    <i class="material-icons edit" style="font-size:1em;">edit</i>
                    <i class="material-icons delete" style="font-size:1em;">delete</i>
                </div>
                <span class="name">${expense.name}</span>
                <span class="price">£ ${expense.price}</span>
            </li>
        `
    }).join(''); // output as string
}

// add expenses total & set bars & remaining money
function updateExpenseTotal(){
    // add total expenses price
    expensesTotal = expenses.reduce((total, expense) => total += Number(expense.price), 0);
    // calc diffs
    const budgetToExpenses = budget / expensesTotal;
    const expensesToBudget = expensesTotal / budget;
    const expensesGreaterThanBudget = expensesTotal > budget? true: false;
    // set bar percentages on which is greatest (100%)
    const savingsPercentage = expensesGreaterThanBudget? `${budgetToExpenses * 100}%`: '100%';
    const expensesPercentage = expensesGreaterThanBudget? '100%': `${expensesToBudget * 100}%`;
    // set css variables %
    document.documentElement.style.setProperty('--savings-height', savingsPercentage);
    document.documentElement.style.setProperty('--expense-height', expensesPercentage);
    // round bars if over 95%
    savingsBar.style.borderRadius = (budgetToExpenses > 0.95)? '35px': '0 0 35px 35px';
    expenseBar.style.borderRadius = (expensesToBudget > 0.95)? '35px': '0 0 35px 35px';
    // show both bars
    savingsBar.style.opacity = 1;
    expenseBar.style.opacity = (expensesTotal > 0)? 1 : 0;
    // send expenses to back
    expenseBar.style.zIndex = expensesGreaterThanBudget? -1: 0;
    // set savings color
    const savingsColors = expensesGreaterThanBudget? `linear-gradient(
        0deg,
        rgb(255, 0, 0) 0%,
        rgb(122, 13, 173) 100%
      )`: `rgba(106, 13, 173, 0.3)`;
    document.documentElement.style.setProperty('--savings-color', savingsColors);
    // warning
    const mainArea = document.querySelector('main');
    if(expensesGreaterThanBudget){
        // add animation and red warning class to main
        mainArea.classList.add('warning');
    }else{
        mainArea.classList.remove('warning');
    }
    // update remaining money
    updateRemainingMoney();
    // refresh icon listeners
    addIconListeners();
}

function deleteListItem(itemIndex){
    // remove item from expenses list by index
    expenses.splice(itemIndex, 1);
     // update html list
     updateList(expenses, expenseItems);
     //save to local
     localStorage.setItem('expenses', JSON.stringify(expenses));
     // update expenseTotal
     updateExpenseTotal();
    // refresh icon listeners
    addIconListeners();
}

function editListItem(itemIndex){
    // grab item from list
    const {name, price} = expenses[itemIndex];
    // populate inputs
    expenseNameInput.value = name;
    expensePriceInput.value = price;
    // set global index for next button click
    editIndex = itemIndex;
}

function addIconListeners(){
    // grab all populated list icons
    const allPopListItems = [...document.querySelectorAll('li')];
    // add icon listener
    allPopListItems.forEach((item) => item.addEventListener('click', (e) => {
        // grab li index to send (i > div > li)
        const liIndex = e.target.parentNode.parentNode.dataset.index;
        if (e.target.classList.contains("edit")){
            // run edit function
            editListItem(liIndex);
        }else if(e.target.classList.contains("delete")){
            // run delete function
            deleteListItem(liIndex);
        };
    }))
}

function updateRemainingMoney(){
    // grab savings text and update
    const savings = document.querySelector('.savingsAmount h3');
    const remainingSavings = (budget - expensesTotal).toFixed(2);
    savings.textContent = `£ ${remainingSavings}`;
    // grab grandparent and show
    const wrapper = savings.parentNode.parentNode;
    wrapper.style.opacity = 1;
}

// set listeners
budgetInput.addEventListener('change', updateBudget);
button.addEventListener('click', updateItem);

// populate items on page load and add listeners
updateList(expenses, expenseItems);
addIconListeners();
// pull budget on page load
budgetInput.value = budget;