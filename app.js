//budget data --> income and expenses
var budgetController = (function() {
  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function(totalIncome) {
    if(totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function() {
    return this.percentage;
  };

  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function(type) {
    var sum = 0;
    budgetData.allItems[type].forEach(function(cur) {
      sum += cur.value;
    });
    budgetData.totals[type] = sum;
  };

  var budgetData = {
    allItems: {
      inc: [],
      exp: []
    },
    totals: {
      inc: 0,
      exp: 0
    },
    budget: 0,
    percentage: -1
  };

  return {
    addItem: function(type, des, val) {
      var newItem, ID;

      //Creating unique id for every element in inc and exp
      if(budgetData.allItems[type].length > 0) {
        ID = budgetData.allItems[type][budgetData.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }
      

      if(type === 'exp') {
        newItem = new Expense(ID, des, val);
      } else if(type === 'inc') {
        newItem = new Income(ID, des, val);
      }
      //pushing the items
      budgetData.allItems[type].push(newItem);

      //making the items public to other functions.
      return newItem;
    },

    deleteItemData: function(type, id) {
      var ids, index;

      ids = budgetData.allItems[type].map(function(current) {
        return current.id;
      });

      index = ids.indexOf(id);

      if(index !== -1) {
        budgetData.allItems[type].splice(index, 1);
      }
    },

    calculateBudget: function() {

      //1.calculate the total income and expenses.
      calculateTotal('exp');
      calculateTotal('inc');

      //calculate the total budget.
      budgetData.budget = budgetData.totals.inc - budgetData.totals.exp;

      //Calculate percentage
      if(budgetData.totals.inc > 0) {
        budgetData.percentage = Math.round((budgetData.totals.exp / budgetData.totals.inc) * 100);
      } else {
        budgetData.percentage = -1;
      }
    },

    calculateItemPercent: function() {
      budgetData.allItems.exp.forEach(function(cur) {
        return cur.calcPercentage(budgetData.totals.inc);
      });
    },

    getItemPercentages: function() {
      var allItemPercentages = budgetData.allItems.exp.map(function(cur) {
        return cur.getPercentage();
      });
      return allItemPercentages;
    },

    getBudget: function() {
      return {
        budget: budgetData.budget,
        totalInc: budgetData.totals.inc,
        totalExp: budgetData.totals.exp,
        percentage: budgetData.percentage
      }
    },

    testing: function() {

      console.log(budgetData);
    }
  };

})();


//control of all the UI elements
var uiController = (function() {
  DOMstrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    tickButton: '.add__btn',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list',
    budgetValue: '.budget__value',
    incomeValue: '.budget__income--value',
    expensesValue: '.budget__expenses--value',
    expensesPercentage: '.budget__expenses--percentage',
    container: '.container',
    itemPercentage: '.item__percentage',
    monthUI: '.budget__title--month'
  };

  var formatNumber = function(num, type) {
    var numSplit, int, dec, type;

    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split('.');
    
    int = numSplit[0];
    dec = numSplit[1];

    if(int.length > 3) {
      int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
    }
    
    return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
  };

  return {
    getInput : function() {
      return {
        type: document.querySelector(DOMstrings.inputType).value,
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      }
    },

    addListItem: function(obj, type) {
      var html, newHtml, element;
      if(type === 'inc') {
        element = DOMstrings.incomeContainer;
        html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
      } else if(type === 'exp') {
        element = DOMstrings.expensesContainer;
        html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
      }
      //Replace the placeholder text with actual data
      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

      //Insert the new HTML elements into the dom
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },

    clearFields: function() {
      var fields, fieldArr;
      fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
      fieldArr = Array.prototype.slice.call(fields);
      fieldArr.forEach(function(current, index, array) {
        current.value = "";
      });
      fieldArr[0].focus();
    },

    displayPercentages: function(percentages) {
      var fields = document.querySelectorAll(DOMstrings.itemPercentage);
      
      var nodeListForEach = function(list, callback) {
        for(var i = 0; i < list.length; i++) {
          callback(list[i], i);
        }
      };

      nodeListForEach(fields, function(current, index) {
        if(percentages[index] > 0) {
          current.textContent = percentages[index] + '%';
        } else {
          current.textContent = '---';
        }
        
      });
    },

    displayBudget: function(obj) {
      document.querySelector(DOMstrings.budgetValue).textContent = obj.budget;
      document.querySelector(DOMstrings.incomeValue).textContent = obj.totalInc;
      document.querySelector(DOMstrings.expensesValue).textContent = obj.totalExp;
      
      if(obj.percentage > 0) {
        document.querySelector(DOMstrings.expensesPercentage).textContent = obj.percentage + '%';
      } else {
        document.querySelector(DOMstrings.expensesPercentage).textContent = '---';
      }
    },

    deleteItemUI: function(selectorID) {
      var el = document.getElementById(selectorID);

      el.parentNode.removeChild(el);
  },

  displayDate: function() {
    var month, months, now, year;

    now = new Date();

    months = ['January', 'Februray', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    month = now.getMonth();

    year = now.getFullYear();
    document.querySelector(DOMstrings.monthUI).textContent = months[month] + ' ' + year;


  },
 
    getDOMstrings: function() {
      return DOMstrings;
    }
  };

})();


/*controller function acts as a communication
medium between budgetController and uiController*/
var controller = (function(budgetCtrl, uiCtrl) {
  var setupEventListeners = function() {
    var dom = uiCtrl.getDOMstrings();

    document.querySelector(dom.tickButton).addEventListener('click', ctrlAddItem);
    document.addEventListener('keypress', function(event) {
      if(event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });

    document.querySelector(dom.container).addEventListener('click', ctrlDeleteItem);

    
  }

  var updateBudget = function() {
    //1. calculate the budget
    budgetCtrl.calculateBudget();

    //2. Return the budget
    var budget = budgetCtrl.getBudget();

    //3. Display the budget on the ui
    uiCtrl.displayBudget(budget);
  }

  var updateItemPercentage = function() {
    //1. Calculate percentage of each item
    budgetCtrl.calculateItemPercent();

    //2. read item percentage in the budget controller.
    var itemPercent = budgetCtrl.getItemPercentages();

    //3. Update item percentage in the UI
    uiCtrl.displayPercentages(itemPercent);
  }



  var ctrlAddItem = function() {
    
    var input, presentItem;

    //1. Get the field input data
    input = uiCtrl.getInput();

    //Checking the description and value of the item to be not empty and value to be greater than zero
    if(input.description !== "" && !isNaN(input.value) && input.value > 0) {

      //2. Add the item to the budgetController
    presentItem = budgetCtrl.addItem(input.type, input.description, input.value);

    //3. Add the item to the ui
    uiCtrl.addListItem(presentItem, input.type);

    //4. Clearing the input field
    uiCtrl.clearFields();

    //5. Calculate and update budget.
    updateBudget();

    //6. update item percentage in the UI
    updateItemPercentage();

    }
    
  };

  var ctrlDeleteItem = function(event) {
    var itemID, splitID, type, ID;

    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if(itemID) {
      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseInt(splitID[1]);

      //1. Delete the item from the data structure
      budgetCtrl.deleteItemData(type, ID);

      //2. Delete the item from the UI
      uiCtrl.deleteItemUI(itemID);

      //3. Update and show the new budget
      updateBudget();

    }
  };

  return {
    init: function() {
      console.log('Application has started');

      uiCtrl.displayDate();


      //resetting the values to zero
      uiCtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: ''
      });

      setupEventListeners();
    }
  };
  
  
})(budgetController, uiController);

controller.init();


/*var Block = function(index, timestamp, data, previousHash = '') {
  this.index = index;
  this.data = data;
  this.timestamp = timestamp;
  this.previousHash = previousHash;
  this.hash = '';
}*/

