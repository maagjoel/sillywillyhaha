const SHA256 = require('crypto-js/sha256');

// NEW COMMIT!!!!!!!!!!!!!!!!!!








/**
 * Creating a Block class where voting information will be encrypted using
the SHA256 algorithm
 */
class Block{
    constructor(index, timestamp, data, previousHash = ''){
        this.index = index; //the index of the block in the blockchain array
        this.timestamp = timestamp; //the date the vote was made
        this.data = data; //data about the vote (who voted, who they voted for)
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

        console.log("Hash mined: " + this.hash);
    }
}
/**
 * The class for the blockchain, where the blocks will be stored in an array
 */
class Blockchain{
    constructor(){
        this.chain = [this.createGenesisBlock]; //The array for blocks to be stored in
        this.difficulty = 2; //The # of zeroes you want preceding the hashes
    }
    /**
     * Creates the first block in the block chain
     */
    createGenesisBlock(){
        return new Block(0, "01/01/2020", "Genesis Block","0");
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
    addBlock(newBlock){
        newBlock.previousHash = this.getLatestBlock().hash; //assigns the current block's value to the previous hash of the new block being created
        newBlock.hash = newBlock.calculateHash();  //assigns a hash to the new block in the block chain
        this.chain.push(newBlock); //adds the new block to the block chain array
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

let votingProcess = new Blockchain(); 
votingProcess.addBlock(new Block(1,"10/07/2019",{amount: 4}))
votingProcess.addBlock(new Block(2,"10/10/2019",{amount: 10}))

//console.log(JSON.stringify(votingProcess, null, 4));

console.log('Is blockchain valid? ' + votingProcess.isChainValid());

votingProcess.chain[1].data = { amount: 100};
votingProcess.chain[1].hash = votingProcess.chain[1].calculateHash();

console.log('Is blockchain valid? ' + votingProcess.isChainValid());
