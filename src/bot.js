const Bot = require('./lib/Bot')
const SOFA = require('sofa-js')
const Fiat = require('./lib/Fiat')
const Web3 = require('web3');
const fs = require("fs");
const solc = require('solc');

const web3 = new Web3(new Web3.providers.HttpProvider("http://192.168.1.12:8545"));

let bot = new Bot()

// DEPLOY CONTRACT
const source = fs.readFileSync('./src/contracts/SimpleStorage.sol', 'utf8');
const compiledContract = solc.compile(source, 1);
const abi = compiledContract.contracts[':SimpleStorage'].interface;
const bytecode = compiledContract.contracts[':SimpleStorage'].bytecode;
const gasEstimate = web3.eth.estimateGas({data: bytecode});
const SimpleStorage = web3.eth.contract(JSON.parse(abi));

let simpleStorageInstance;

// ROUTING

bot.onEvent = function(session, message) {
  switch (message.type) {
    case 'Init':
      welcome(session)
      break
    case 'Message':
      onMessage(session, message)
      break
    case 'Command':
      onCommand(session, message)
      break
  }
}

function onMessage(session, message) {
  welcome(session)
}

function onCommand(session, command) {
  switch (command.content.value) {
    case 'count':
      count(session);
      break
    case 'deploy':
      deploy(session);
      break;
    }
}

// STATES

function welcome(session) {
  sendMessage(session, `Hello from BrehonBot!`)
}

// example of how to store state on each user
function count(session) {
  let count = (session.get('count') || 0) + 1
  session.set('count', count)
  sendMessage(session, `${count}`)
}

function deploy(session) {
  simpleStorageInstance = SimpleStorage.new({data: bytecode, gas: 300000, from: session.user.payment_address});
  sendMessage(session, simpleStorageInstance.address);

}

// HELPERS

function sendMessage(session, message) {
  let controls = [
    {type: 'button', label: 'Count', value: 'count'},
    {type: 'button', label: 'Deploy', value: 'deploy'},
  ]
  session.reply(SOFA.Message({
    body: message,
    controls: controls,
    showKeyboard: false,
  }))
}
