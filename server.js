const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(express.static('public'))

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/user.html')
})

const PORT = 8080;

const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs')

// Swagger документация
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Task Management API',
            version: '1.0.0',
            description: 'API для управления задачами',
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
            },
        ],
    },
    apis: ['user_openapi.yaml'], // укажите путь к файлам с аннотациями
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


// Middleware для парсинга JSON
app.use(bodyParser.json());


// Получить список данных
app.get('/products', (req, res) => {
    fs.readFile('./data.json', 'utf-8', function(err, data) {
        if (err) throw err

        let jsonData = JSON.parse(data);
        let categoryIdToName = {}
        for (const category of jsonData.categories) {
            categoryIdToName[category.id] = category.name;
        }

        let result = {};
        for (const product of jsonData.products) {
            for (const categoryId of product.categoryIds) {
                let categoryName = categoryIdToName[categoryId];
                if (result.hasOwnProperty(categoryName)) {
                    result[categoryName].push(product);
                } else {
                    result[categoryName] = [product];
                }
            }
        }
        res.json(result);
    });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log("Server is running on http://localhost:", PORT);
});