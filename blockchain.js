const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
/**
 * Creating a transaction class that will contain
 * data on the person voting and who they are voting for
 */
class Transaction{
    constructor(fromAddress, toAddress, amount){
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }
/**
 * Generates hash and returns it as a string
 * @return the has to be returned
 */
    calculateHash(){
        return SHA256(this.fromAddress + this.toAddress + this.amount).toString();
    }
/**
 *  Makes sure the transaction is from the owner of the key
 * @param {The key of the person making the transaction} signingKey 
 */
    signTransaction(signingKey){
        if(signingKey.getPublic('hex') !== this.fromAddress){ //checks to see if the key matches the fromAddress
            throw new Error('You cannot sign transactions for other wallets!');
        }

        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx, 'base64');
        this.signature = sig.toDER('hex');
    }
/**
 * Checks to see if the address exists, then if a signature exists. If it does
 * have a valid signature, it uses the fromAddress as the
 * 
 */
    isValid(){
        if(this.fromAddress === null) return true;

        if(!this.signature || this.signature.length === 0){
            throw new Error ('No signature in this transaction');
        }

        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature);
    }
}
/**
 * Creating a Block class where voting information will be encrypted using
the SHA256 algorithm
 */
class Block{
    /**
   * @param {number} timestamp
   * @param {Transaction[]} transactions
   * @param {string} previousHash
   */
    constructor( timestamp, transactions, previousHash = ''){
        this.timestamp = timestamp; //the date the vote was made
        this.transactions = transactions; //data about the vote (who voted, who they voted for)
        this.previousHash = previousHash; //The hash of the previous block in the chain
        this.hash = this.calculateHash(); //the hash of the current block in the chain
        this.nonce = 0; //number that can be changed so new hashes can be mined
    }
    /**
     * Calculates the hash code using the SHA256 algorithm
     */
    calculateHash(){
        return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data) + this.nonce).toString();
    }
    /**
     * Makes the hash of the block with a certain amount of zeroes preceding
     * @param {*The # of zeroes you want the hash to start with} difficulty 
     */
    mineBlock(difficulty){
        while(this.hash.substring(0,difficulty) !== Array(difficulty + 1).join("0")) {
            this.nonce++;
            this.hash = this.calculateHash();
        }

        console.log("BLock mined: " + this.hash);
    }

    hasValidTransactions(){
        for(const tx of this.transactions){
            if(!tx.isValid()){
                return false;
            }
        }

        return true;
    }
}
/**
 * The class for the blockchain, where the blocks will be stored in an array
 */
class Blockchain{
    constructor(){
        this.chain = [this.createGenesisBlock()]; //The array for blocks to be stored in
        this.difficulty = 2; //The # of zeroes you want preceding the hashes
        this.pendingTransactions = [];
        this.miningReward = 100;
    }
    /**
     * Creates the first block in the block chain
     */
    createGenesisBlock(){
        return new Block(Date.parse('2017-01-01'), [], '0');
    }
    /**
     * Returns the most recently created block in the block chain
     */
    getLatestBlock(){
        return this.chain[this.chain.length-1]
    }
    /**
     * Adds a new block to the blockchain 
     * @param {The block  to be added into the block chain array} newBlock 
     */
    
    /**
     * This will replace the addBlock method
     */
    minePendingTransactions(miningRewardAddress){
        
        const rewardTx = new Transaction(null, miningRewardAddress, this.miningReward);
        this.pendingTransactions.push(rewardTx);

        let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
        block.mineBlock(this.difficulty);

        console.log('Block successfully mined!');
        this.chain.push(block);

        this.pendingTransactions = [];
        
        // let block = new Block(Date.now(), this.pendingTransactions);
        // block.mineBlock(this.difficulty);

        // console.log('Block successfully mined!');
        // this.chain.push(block);

        // this.pendingTransactions = [
        //     new Transaction(null,miningRewardAddress, this.miningReward)
        // ];
    }

    addTransaction(transaction){
        if(!transaction.fromAddress || !transaction.toAddress){
            throw new Error('Transaction must include from and to address');
        }

        if(!transaction.isValid()){
            throw new Error ('Cannot add invalid transaction to chain');
        }

        this.pendingTransactions.push(transaction);
    }

    getBalanceOfAddress(address) {
        let balance = 0;
    
        for (const block of this.chain) {
          for (const trans of block.transactions) {
            if (trans.fromAddress === address) {
              balance -= trans.amount;
            }
    
            if (trans.toAddress === address) {
              balance += trans.amount;
            }
          }
        }
    
        return balance;
      }
    /**
     * Checks that each block in the blockchain is valid by ensuring the
     * hashes of the current block match with the hashes generated by the SHA256 algorithm.
     * Then it checks to see if the previous block in the chain's hash matches what the current
     * block in the chain says was the value for the previous block in the chain's hash
     */
    isChainValid(){
        for(let i = 1; i<this.chain.length; i++){ //start at index 1 to compare to the index before it
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i-1];

            if(!currentBlock.hasValidTransactions()){
                return false;
            }

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false; //hash for the current block is different because it was altered
            }

            if (previousBlock.hash !==currentBlock.previousHash) {
                return false; //hashes of the previous block in the chain did not match
            }
        }
        return true;    //everything matched
    }
}

module.exports.Blockchain = Blockchain;
module.exports.Transaction = Transaction;