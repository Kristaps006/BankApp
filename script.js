'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-07-26T17:01:17.194Z',
    '2020-07-28T23:36:17.929Z',
    '2020-08-01T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);
  console.log(daysPassed);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  // const day = `${date.getDate()}`.padStart(2, 0);
  // const month = `${date.getMonth() + 1}`.padStart(2, 0);
  // const year = date.getFullYear();
  // return `${day}/${month}/${year}`;
  return new Intl.DateTimeFormat(locale).format(date);
};

const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);

    const formattedMov = formatCur(mov, acc.locale, acc.currency);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMov}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCur(Math.abs(out), acc.locale, acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

const startLogOutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    // In each call, print the remaining time to UI
    labelTimer.textContent = `${min}:${sec}`;

    // When 0 seconds, stop timer and log out user
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
    }

    // Decrease 1s
    time--;
  };

  // Set time to 5 minutes
  let time = 120;

  // Call the timer every second
  tick();
  const timer = setInterval(tick, 1000);

  return timer;
};

///////////////////////////////////////
// Event handlers
let currentAccount, timer;

// FAKE ALWAYS LOGGED IN
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    // Create current date and time
    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      // weekday: 'long',
    };
    // const locale = navigator.language;
    // console.log(locale);

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    // const day = `${now.getDate()}`.padStart(2, 0);
    // const month = `${now.getMonth() + 1}`.padStart(2, 0);
    // const year = now.getFullYear();
    // const hour = `${now.getHours()}`.padStart(2, 0);
    // const min = `${now.getMinutes()}`.padStart(2, 0);
    // labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min}`;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // Timer
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();

    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);

    // Reset timer
    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function () {
      // Add movement
      currentAccount.movements.push(amount);

      // Add loan date
      currentAccount.movementsDates.push(new Date().toISOString());

      // Update UI
      updateUI(currentAccount);

      // Reset timer
      clearInterval(timer);
      timer = startLogOutTimer();
    }, 2500);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  // BUG in video:
  // displayMovements(currentAccount.movements, !sorted);

  // FIX:
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
// Functions

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURE
/* 
console.log(23 === 23.0);

//Base 10 is nr  0 to 9
//Binary base 2 - 0 1

console.log(typeof Number('23')); // number converting from

console.log(+'23'); // also converts string to number

//_______________PARSING

//Second number in bracket mean what type of base numebr it is

console.log(Number.parseInt('30px', 10)); // return - 30 number . it needs to start with number to  convert to numbers
console.log(Number.parseInt('e23', 10)); // wont return

console.log(Number.parseFloat('2.5rem')); // parseFloat returns decimals 2,5 but parseInt returns 2

//Check if value is not a number
console.log(Number.isNaN(20));

//Checks if values is number
console.log(Number.isFinite(20)); // check if its a number - logs true
console.log(Number.isFinite('20')); // logs false

console.log(Number.isInteger(23));
/*  

/* //__________MATH ROUND UPS

console.log(Math.sqrt(25)); //square root

console.log(25 ** (1 / 2)); // square root

console.log(8 ** (1 / 3)); // cubic

console.log(Math.max(5, 6, 8, 3, 67)); // returns 67
console.log(Math.max(5, 6, 8, '3', 67)); // works if its string too

console.log(Math.min(5, 6, 8, 3, 67)); //logs 3

console.log(Math.PI * Number.parseFloat('10px') ** 2); // calculate PI

console.log(Math.trunc(Math.random() * 6) + 1);

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// Creating random number from min to max
const randomIn = (min, max) =>
  Math.floor(Math.random() * (max - min) + 1) + min;

console.log(randomIn(10, 20));

//Rounding integers

console.log(Math.trunc(23.3)); // removes decimal parts

console.log(Math.round(23.9)); // Rounds to closest integers

console.log(Math.ceil(23.3)); // Rounds to 24
console.log(Math.ceil(23.9)); //Rounds to 24

console.log(Math.floor(23.3)); // rounds to 23
console.log(Math.floor(23.9)); // rounds to 23

// ROUNDING decimals

console.log((2.7).toFixed(0)); // rounds to 3 and returns always STRING
console.log((2.7).toFixed(3)); // 2.700

console.log(+(2.7).toFixed(3)); // Add plus and it will convert to number
 */
/* 
///////////////////// ________ REMAINDER OPERATOR _____________________

console.log(5 % 2); // logs 1

console.log(8 % 3); // logs 2

//Check even numbers

console.log(6 % 2); // logs 0

const isEven = n => n % 2 === 0;

console.log(isEven(8)); // true
console.log(isEven(7)); // false

labelBalance.addEventListener('click', function () {
  [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
    if (i % 2 === 0) row.style.backgroundColor = 'orangered';
    // 0, 3 , 6, 9
    if (i % 3 === 0) row.style.backgroundColor = 'blue';
  });
}); */
/* 
///  WORKING WITH BIGINT  ///////////////////////////

console.log(2 ** 53 - 1); // logs 9007199254740991   it's the biggest number javascript can represent
console.log(Number.MAX_SAFE_INTEGER); // logs 9007199254740991

// BIGINT can be used to store numbers as large as we want

console.log(85748548548754875845847958459488n); // n -  turns to number to BIGINT

//  OPERATIONS WITH BIGINT

console.log(10000n + 1000n); // it adds, however you can not mix regular number with BIGINT

const huge = 1000000000n;

const num = 23;

console.log(huge + BigInt(num)); // we need to transform num to bigint

console.log(huge + 'is Really Big!!!'); // logs 1000000000is Really Big!!!

// DIVISIONS

console.log(10n / 3n); // logs 3 , returns closest bumber , it will cut off the decimal part 
 */

// _____________________________  CREATING DATES  --------------------------------

// Create a date

// const now = new Date();

// console.log(now);

// console.log(new Date('Mar 01 2021'));
// console.log(new Date('December 23, 2015'));

// console.log(new Date(account1.movementsDates[0]));

// console.log(new Date(2037, 10, 50, 60, 60));

// console.log(new Date(2037, 10, 35));

// console.log(new Date(0));

// console.log(new Date(3 * 24 * 60 * 60 * 1000));

// These dates above are special type of objects
// Workign wth Dates bellow

/* const future = new Date(2037, 10, 19, 15, 23);
console.log(future);

console.log(future.getFullYear());
console.log(future.getMonth());
console.log(future.getDate());
console.log(future.getHours());
console.log(future.getMinutes());
console.log(future.getSeconds());

console.log(future.toISOString());
console.log(future.getTime());
console.log(new Date(2142253380000)); // will log original time

console.log(Date.now());

future.setFullYear(2050);
console.log(future); // logs Sat Nov 19 2050 15:23:00 GMT+0100 (Central European Standard Time)
 */

//_____________________________ OPERATIONS WITH DATES------------------------
/* 
const future = new Date(2037, 10, 19, 15, 23);
console.log(+future);

const calcDaysPast = (date1, date2) =>
  Math.abs((date2 - date1) / (1000 * 60 * 60 * 24));

const day1 = calcDaysPast(new Date(2037, 3, 14), new Date(2037, 3, 4));
console.log(day1);
 */

//_____________________________ INTERNATIONALIZING Numbers  (INTL) ------------------------

/* const number = 38883848943.23;

const options = {
  style: 'unit',
  unit: 'celsius',
  currency: 'EUR',
};

console.log(
  'US:      ',
  new Intl.NumberFormat('en-US', options).format(number)
);

console.log('Germany:', new Intl.NumberFormat('de-DE', options).format(number));

console.log('Germany:', new Intl.NumberFormat('ar-SY', options).format(number));
 */

//_____________________________ SET TIMEOUTS  ------------------------

const ingredients = ['olives', 'spinach'];

const pizzaTimer = setTimeout(
  (ing1, ing2) => console.log(`here is your pizza with ${ing1} and ${ing2} `),
  3000,
  ...ingredients
);

console.log('waiting...');

if (ingredients.includes('spinach')) clearTimeout(pizzaTimer);

// SET INTERVAl -repeats every 1 sec

setInterval(function () {
  const now = new Date();
  console.log(now);
}, 1000);
