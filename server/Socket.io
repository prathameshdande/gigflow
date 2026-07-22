const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server, { cors: { origin: process.env.CLIENT_URL } });
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
    if (err) return next(new Error('Authentication error'));
    socket.userId = decoded.id;
    next();
  });
}).on('connection', socket => { ... });
server.listen(PORT, ...);