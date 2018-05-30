const express = require('express')

const app = express()

// app.use('node_modules', express.static(__dirname + '/node_modules'))
app.use(express.static(__dirname))

app.get('/', (req, res) => {
	res.type('text/html');
	res.sendFile(__dirname + '/index.html');
})

app.get('/editor', (req, res) => {
	res.type('text/html');
	res.sendFile(__dirname + '/editor/editor.html');
})

app.listen(7777)