const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const router = express.Router();

const PORT = process.env.PORT || 8000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded( { extended:true } ));
app.use(cookieParser());
app.use(morgan('dev'));


app.set('views', 'public');
app.set('view-engine', 'html');
app.use(express.static(__dirname + '/public'));


router.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});

server.listen(PORT, () => {
	console.log('listening on ' + PORT);
});