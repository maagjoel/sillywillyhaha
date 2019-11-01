const {Blockchain, Transaction} = require('./blockchain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const myKey = ec.keyFromPrivate('440a9ca5667e4828f380652a140964bb10e423ac2536e0a9ae6661b1cc5242f0');
const myWalletAddress = myKey.getPublic('hex');



let votingProcess = new Blockchain(); 

const tx1 = new Transaction(myWalletAddress, 'public key goes here', 10);
tx1.signTransaction(myKey);
votingProcess.addTransaction(tx1);


console.log('\n Starting the miner.');
votingProcess.minePendingTransactions(myWalletAddress);

console.log('\nBalance of xavier is', votingProcess.getBalanceOfAddress(myWalletAddress));
console.log('Is chain valid?', votingProcess.isChainValid());

//Uncomment lines below to see what happens when you try to change the chain's data
//votingProcess.chain[1].transactions[0].amount = 1;
//console.log('Is chain valid?', votingProcess.isChainValid());







