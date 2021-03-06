// BUDGET CONTROLLER
let budgetController = (function() {

    let Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {

        if (totalIncome > 0) {
            this.percentage = Math.round(this.value / totalIncome * 100);
        } else {
            this.percentage = -1;
        }

    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }

    let Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value
    };

    let calculateTotal = function(type) {
        let sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };

    let data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    return {
        addItem: function(type, desc, val) {

            let newItem, ID;

            // Create new ID
            ID = data.allItems[type].length;
            /*
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            */

            if (type == 'exp') {
                newItem = new Expense(ID, desc, val);
            } else if (type == 'inc') {
                newItem = new Income(ID, desc, val);
            }

            data.allItems[type].push(newItem);
            return newItem;

        },


        deleteItem: function(type, id) {
            let ids, index;

            ids = data.allItems[type].map(function(current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index != -1) {
                data.allItems[type].splice(index, 1);
            }

        },


        calculateBudget: function() {

            calculateTotal('exp');
            calculateTotal('inc');

            data.budget = data.totals.inc - data.totals.exp;

            if (data.totals.inc > 0) {
                data.percentage = Math.round(data.totals.exp / data.totals.inc * 100);
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentages: function() {

            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentage(data.totals.inc);
            });

        },

        getPercentages: function() {
            let allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            });
            return allPerc;
        },


        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        testing: function() {
            console.log(data);
        }
    }
    
})();


// UI CONTROLLER
let UIController = (function() {

    let DOMstrings = {
        inputType: '.add__type',
        inputDesc: '.add__description',
        inputVal: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    let formatNumber = function(num, type) {
        let numSplit, int, dec, sign;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');
        [int, dec] = numSplit;

        if (int.length > 3) {
            int = `${int.substr(0, int.length - 3)},${int.substr(int.length - 3, 3)}`;
        }

        sign = (type == 'exp') ? '-' : '+';

        return `${sign} ${int}.${dec}`;

    };

    let nodeListForEach = function(list, callback) {
        for (let i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        getInput: function(){
            return {
                type : document.querySelector(DOMstrings.inputType).value,
                description : document.querySelector(DOMstrings.inputDesc).value,
                value : +document.querySelector(DOMstrings.inputVal).value
            }
        },

        addListItem: function(obj, type) {
            let html, newHtml;

            // Create HTML string with placeholder text
            if (type == 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item" id="inc-%id%"><div class="item__description">%description%</div><div class="right"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type == 'exp') {
                element = DOMstrings.expensesContainer;
                html = '<div class="item" id="exp-%id%"><div class="item__description">%description%</div><div class="right"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function(selectorID) {
            let el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields: function() {
            let fields, fieldsArr;

            fields = document.querySelectorAll(DOMstrings.inputDesc + ', ' + DOMstrings.inputVal);

            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(element => {
                element.value = '';
            });

            fieldsArr[0].focus();
        },

        displayBudget: function(obj) {

            let type = obj.budget > 0 ? 'inc' : 'exp';
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, type);
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, type);
            document.querySelector(DOMstrings.percentageLabel).textContent = formatNumber(obj.percentage, type);

            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },

        displayPercentages: function(percentages) {

            let fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            nodeListForEach(fields, function(current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }

            });
        },

        displayMonth: function() {
            let now, year, month;
            
            now = new Date();

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = months[now.getMonth()];

            year = now.getFullYear();

            document.querySelector(DOMstrings.dateLabel).textContent = month + ' ' + year;
        },

        removeData: function() {
            document.querySelector('.income__list').innerHTML = '';
            document.querySelector('.expenses__list').innerHTML = '';
        },

        changedType: function() {

            let fields = document.querySelectorAll(
                `${DOMstrings.inputType},${DOMstrings.inputDesc},${DOMstrings.inputVal}`
            );

            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },
        
        
        getDOMstrings: function() {
            return DOMstrings;
        }
    }

})();


// GLOBAL APP CONTROLLER
let controller = (function(budgetCtrl, UICtrl) {

    let setupEventListeners = function() {
        let DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event) {
            if (event.keyCode == 13 || event.which == 13) ctrlAddItem();
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    }


    let updateBudget = function() {

        // 1. Calculate the budget
        budgetCtrl.calculateBudget();

        // 2. Return the budget
        let budget = budgetCtrl.getBudget();

        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);

    }

    let updatePercentages = function() {

        budgetCtrl.calculatePercentages();

        let percentages = budgetCtrl.getPercentages();

        UICtrl.displayPercentages(percentages);


    }
    

    let ctrlAddItem = function() {

        let input, newItem;

        // 1. Get the field input data
        input = UICtrl.getInput();

        if (input.description != '' && !isNaN(input.value) && input.value > 0) {
            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear the fields
            UICtrl.clearFields();

            // 5. Calculate and update budget
            updateBudget();

            // 6. Handle percentages
            updatePercentages();
        }

    }

    let ctrlDeleteItem = function(event) {
        let itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {

            splitID = itemID.split('-');
            
            type = splitID[0];
            ID = +splitID[1];

            budgetCtrl.deleteItem(type, ID);

            UICtrl.deleteListItem(itemID);

            updateBudget();

            updatePercentages();
        }
    }

    return {
        init: function() {
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            UICtrl.removeData();
            setupEventListeners();
        }
    }

})(budgetController, UIController);


controller.init();