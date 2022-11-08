const express = require('express') 
const app = express()
const port = 5000
const path = __dirname + '/views';

app.use(express.json());

app.use(express.urlencoded({extended: false}))

//TEST
app.get('/', (req, res) => { 
  res.send('Hello TEST!')
})

app.use('/view', express.static(path))

app.listen(port, () => {
  console.log(`MBTI TEST http://localhost:${port}`)
})