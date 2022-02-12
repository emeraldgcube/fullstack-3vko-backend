const express = require('express')
const app = express()
const morgan = require("morgan")
const cors = require("cors")
app.use(express.json())
app.use(cors())


let persons = [
      {
        "name": "Arto Hellas",
        "number": "040-123456",
        "id": 1
      },
      {
        "name": "Ada Lovelace",
        "number": "39-44-5323523",
        "id": 2
      },
      {
        "name": "Dan Abramov",
        "number": "12-43-234345",
        "id": 3
      },
      {
        "name": "Mary Poppendieck",
        "number": "39-23-6423122",
        "id": 4
      }
    ]

app.get('/', (req, res) => {
  res.send('<h1>Tervetuloa puhelinluettelo-apiin</h1>')
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
    if (person) {
        response.json(person)
    }
    else {
        response.status(404).end()
      }
  })

  
  morgan.token('body', (req, res) => JSON.stringify(req.body));
  app.use(morgan(':method :url :status :response-time ms - :res[content-length] :body - :req[content-length]'));
   
app.post('/api/persons', (request, response) => {
const body = request.body
console.log(body)

if (!body.name || !body.number) {
    return response.status(400).json({ 
    error: 'missing name or number' 
    })
}

const existingperson = persons.find(person => person.name === body.name)

if (existingperson) {
    return response.status(400).json({
        error: "name already exists"
    })
}

const person = {
    name: body.name,
    number: body.number,
    id: Math.floor(Math.random()*100000)
}

persons = persons.concat(person)

response.json(person)
})









app.delete('/api/persons/:id', (request, response) => {
const id = Number(request.params.id)
persons = persons.filter(person => person.id !== id)
response.status(204).end()
})

app.use(morgan("tiny"))

app.get('/api/persons', (req, res) => {
  res.json(persons)
})

app.get('/info', (req, res) => {
    res.send(`<p>Luettelossa ${persons.length} nimeä </p>
    <p>Request time ${new Date()}</p>`)
  })

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})



