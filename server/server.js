const express = require('express')

const app = express();
const webSocket = require('ws')
const cors = require('cors')
const server = require('http').createServer(app);

const wss = new webSocket.Server({server:server})

let clients = 0;
let users = [];
let messages = [];
wss.on('connection', (ws) => {
    console.log("a new client is connected !")
    clients++;
    ws.send("Welcome new Client");

    // ws.on('message', function message(data, isBinary) {
    //     messages.push(data.toString());

    //     wss.clients.forEach(function each(client) {
    //         if (client !== ws && client.readyState === webSocket.OPEN) {
    //             console.log(data.toString())
    //             client.send(data, { binary: isBinary });
    //         }
    //     })
    // });
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        switch (data.type) {
            case 'offer':
            case 'answer':
            case 'candidate':
                // Broadcast the message to all other clients
                wss.clients.forEach(client => {
                    if (client !== ws && client.readyState === webSocket.OPEN) {
                        client.send(JSON.stringify(data));
                    }
                });
                break;
            default:
                break;
        }
    });
});

app.use(cors())

app.get('/getClients', (req, res) => {
    res.send({ numberOfClients: clients });
})
app.get('/getMessages', (req, res) => {
    res.send(JSON.stringify({ messages: messages }));
})
app.get('/', (req, res) => {
    res.send("Hello World")
});


// module.exports =  server;

server.listen(3001, () => {
    console.log("listening on 3001")
})