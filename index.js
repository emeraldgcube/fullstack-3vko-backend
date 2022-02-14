require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require("morgan")
const cors = require("cors")
const Person = require('./models/person')
const { response } = require('express')
app.use(express.json())
app.use(cors())
app.use(express.static('build'))

const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
  }

  app.use(requestLogger)

app.get('/', (req, res) => {
  res.send(`<h1>Tervetuloa puhelinluettelo-apiin</h1>`)
})
  
  morgan.token('body', (req, res) => JSON.stringify(req.body));
  app.use(morgan(':method :url :status :response-time ms - :res[content-length] :body - :req[content-length]'));
   
app.post('/api/persons', (request, response, next) => {
const body = request.body

if (body.name === undefined || body.number === undefined) {
    return response.status(400).json({ 
    error: 'missing name or number' 
    })

}

/*
const existingperson = persons.find(person => person.name === body.name)

if (existingperson) {
    return response.status(400).json({
        error: "name already exists"
    })
}
*/

const person = new Person({
    name: body.name,
    number: body.number,
    id: Math.floor(Math.random()*100000)
})

person.save().then(savedPerson => {
response.json(savedPerson)
})
.catch(error => next(error))
})


app.delete('/api/persons/:id', (request, response, next) => {
Person.findByIdAndRemove(request.params.id)
.then(result => {
response.status(204).end()
})
.catch(error => next(error))
})

app.use(morgan("tiny"))

app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
      res.json(persons)
  })
})

app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
  .then(person => {
      if (person) {
          response.json(person)
      } else {
          response.status(404).end()
      }
    })
    .catch(error => {
        next(error)
    })
  })

app.get('/info', (req, res) => {
    Person.find({}).then(persons => {
    res.send(`<p>Luettelossa ${persons.length} nimeä </p>
    <p>Request time ${new Date()}</p>`)
    })
  })

app.put('/api/persons/:id', (request, response, next) => {
const body = request.body

const person = {
    name: body.name,
    number: body.number,
}

Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
    response.json(updatedPerson)
    })
    .catch(error => next(error))
})  

const unknownEndpoint = (request, response) => {
response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
console.error(error.message)

if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
} else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
}
next(error)
}

app.use(errorHandler)


const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})



