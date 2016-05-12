//running indicator
console.log('starting password manager');

//require + initialization
var crypto = require('crypto-js');

var storage = require('node-persist');
storage.initSync();

var argv = require('yargs')
	.command('create', 'Create and new Account', function(yargs){
		yargs.options({
			name:{
				demand: true,
				alias: 'n',
				description: 'The account name',
				type: 'string'
			},
			username:{
				demand: true,
				alias: 'u',
				description: 'The account username ',
				type: 'string'
			},
			password:{
				demand: true,
				alias: 'p',
				description: 'The account password ',
				type: 'string'
			},
			masterPassword:{
				demand: true,
				alias: 'm',
				description: 'The master password ',
				type: 'string'
			}

		})
		.help('help')
	})
	.command('get', 'Get Account by name', function(yargs){
		yargs.options({
			name:{
				demand: true,
				alias: 'n',
				description: 'The account name ',
				type: 'string'
			},
			masterPassword:{
				demand: true,
				alias: 'm',
				description: 'The master password ',
				type: 'string'
			}
		})
		.help('help')
	})
	.help('help')
	.argv;

var command = argv._[0];


/* account properties:
	account.name Facebook
	account.username User12!
	account.password 123456
*/

function createAccountObject(){
	var account = {
		name: argv.name,
		username: argv.username,
		password: argv.password
	}

	return account;
}


function getAccounts(masterPassword){
	var encAcounts = storage.getItemSync('Accounts');
	if (typeof encAcounts === 'undefined'){
		return [];
	}else{
		var bytes = crypto.AES.decrypt(encAcounts, masterPassword);

		var accounts = JSON.parse(bytes.toString(crypto.enc.Utf8));

		return accounts;
	}
}

function saveAccounts(accounts, masterPassword){
	var encAccount = crypto.AES.encrypt(JSON.stringify(accounts), masterPassword);
	storage.setItemSync('Accounts', encAccount.toString());
	return accounts;
}

function createAccount(account, masterPassword){
	var accounts = getAccounts(masterPassword);

	//adding the account
	accounts.push(account);
	saveAccounts(accounts, masterPassword);
	
	return account;
}

function getAccount(accountName, masterPassword){
	var accounts = getAccounts(masterPassword);
	var result;

	accounts.forEach(function(account){
		if (account.name === accountName){
			result =  account;
		}
	});

	return result;
}

if (command === 'create'){
	try{
		var account = createAccount(
			createAccountObject(), argv.masterPassword);

		console.log('Created account ->'+ account.name );
	}catch(e){
		console.log('Unable to create account: '+ e);
	}
}else if (command === 'get'){
	try{
		var account = getAccount(argv.name, argv.masterPassword);
		console.log(account);
	}catch(e){
		console.log('Unable to get account: '+ e);
	}
}
