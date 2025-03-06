const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/user.html');
});

const PORT = 8080;

// GraphQL схема
const schema = buildSchema(`
    type Category {
        id: ID!
        name: String!
    }

    type Product {
        id: ID!
        name: String!
        categoryIds: [ID!]!
    }

    type Query {
        products: [Product]
        categories: [Category]
    }
`);

// Корневой резолвер
const root = {
    products: () => {
        const data = JSON.parse(fs.readFileSync('./data.json', 'utf-8'));
        return data.products;
    },
    categories: () => {
        const data = JSON.parse(fs.readFileSync('./data.json', 'utf-8'));
        return data.categories;
    }
};

app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
}));

// WebSocket соединение
wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
        console.log(`Received message: ${message}`);
        ws.send(`Echo: ${message}`);
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

// Запуск сервера
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});