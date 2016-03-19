const app = require('express')()
const http = require('http')

const port = 3000
const server = http.createServer(app)

const io = require('socket.io')(server)

server.listen(port, function() {
    console.log('[%s] Listening on http://localhost:%d', 'development', port)
})
// routing
app.get('/', function (req, res, next) {
  res.sendFile(__dirname + '/myapp.html')
})

// 使用者
const usernames = {}

// 聊天室陣列
const rooms = ['room1','room2','room3']
const room_num = 3

//連線到聊天室
io.sockets.on('connection', function (socket) {

//連到指定的聊天室
	socket.on('adduser', function(username,room){

		socket.username = username

    var check = false
    //尋找是否有欲前往的聊天室存在
    for(var i =0;i<room_num;i++){
      if(room == rooms[i]){
        socket.room = room
        check = true
        break
      }
    }
    //找到則連入
		if(check){

		usernames[username] = username

		socket.join(room)

		socket.emit('updatechat', '訊息', '你已加入' +socket.room)

		socket.broadcast.to(socket.room).emit('updatechat', '訊息', username + ' 已加入')
		socket.emit('updaterooms', rooms, socket.room)
  }
  else{//沒找到
    socket.emit('RoomNotFound')

  }
	})

	// 發送訊息
	socket.on('sendchat', function (data) {
		io.sockets.in(socket.room).emit('updatechat', socket.username, data)
	})

  socket.on('endchat',function(){
    io.sockets.in(socket.room).emit('updatechatroom',socket.username,data)
  })


  //切換房間
	socket.on('switchRoom', function(newroom){
    //登出
		socket.leave(socket.room)
    //加入新聊天室
		socket.join(newroom)
		socket.emit('updatechat', '訊息', '你已加入 '+ newroom)

		socket.broadcast.to(socket.room).emit('updatechat', '訊息', socket.username+' 已離開')

		socket.room = newroom
		socket.broadcast.to(newroom).emit('updatechat', '訊息', socket.username+'已加入')
		socket.emit('updaterooms', rooms, newroom)
	})




	//離開聊天室
	socket.on('disconnect', function(){

		delete usernames[socket.username]

		io.sockets.emit('updateusers', usernames)

		socket.broadcast.emit('updatechat', '訊息', socket.username + '已離開')
		socket.leave(socket.room)
	})
})
