import { ValidationPipe } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, OnGatewayConnection, WebSocketServer, MessageBody, OnGatewayDisconnect } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io'
import { AnswerCallDto } from './dto/AnswerCallDto';
import { CallUserEventDto } from './dto/CallUserEvent';
import { RejectCallEventDto } from './dto/RejectCallDto';

@WebSocketGateway()
export class WsGateway implements OnGatewayConnection, OnGatewayDisconnect {
 
  @WebSocketServer()
  server: Server

  private users = {}

  async handleConnection(socket: Socket) {
    const id = Math.floor(Math.random() * 10000) 
    this.users[id] = socket.id
    socket.emit('me', id)
    this.server.to(socket.id).emit('hey', 'Helloo')
    console.log(this.users)
  }

  async handleDisconnect(socket: Socket) {
    for(var f in this.users) {
      if(this.users.hasOwnProperty(f) && this.users[f] == socket.id) {
          delete this.users[f];
      }
  }}
  
  @SubscribeMessage('call.user')
  callUser(@MessageBody(ValidationPipe) data: CallUserEventDto) {
    this.server.to(this.users[data.user_to_call]).emit('user.calling', {signal: data.signal, from: data.from})
  }


  @SubscribeMessage('answer.call')
  answerCall(@MessageBody(ValidationPipe) data: AnswerCallDto) {
    this.server.to(this.users[data.to]).emit('call.accepted', {signal: data.signal})
  }

  @SubscribeMessage('reject.call')
  rejectCall(@MessageBody(ValidationPipe) data: RejectCallEventDto) {
    this.server.to(data.to).emit('call.rejected', {from: data.from})
  }

  @SubscribeMessage('end.call')
  endCall(@MessageBody(ValidationPipe) data: RejectCallEventDto) {
    this.server.to(data.to).emit('call.rejected', {from: data.from})
  }
}
