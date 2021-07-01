import { ValidationPipe } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, OnGatewayConnection, WebSocketServer, MessageBody } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io'
import { AnswerCallDto } from './dto/AnswerCallDto';
import { CallUserEventDto } from './dto/CallUserEvent';
import { RejectCallEventDto } from './dto/RejectCallDto';

@WebSocketGateway()
export class WsGateway implements OnGatewayConnection {
 
  @WebSocketServer()
  server: Server

  async handleConnection(socket: Socket) {
    socket.emit('me', socket.id)
    this.server.to(socket.id).emit('hey', 'Helloo')
  }
  
  @SubscribeMessage('call.user')
  callUser(@MessageBody(ValidationPipe) data: CallUserEventDto) {
    this.server.to(data.user_to_call).emit('user.calling', {signal: data.signal, from: data.from})
  }


  @SubscribeMessage('answer.call')
  answerCall(@MessageBody(ValidationPipe) data: AnswerCallDto) {
    this.server.to(data.to).emit('call.accepted', {signal: data.signal})
  }

  @SubscribeMessage('reject.call')
  rejectCall(@MessageBody(ValidationPipe) data: RejectCallEventDto) {
    this.server.to(data.to).emit('call.rejected', {from: data.from})
  }

  @SubscribeMessage('reject.call')
  endCall(@MessageBody(ValidationPipe) data: RejectCallEventDto) {
    this.server.to(data.to).emit('call.rejected', {from: data.from})
  }
}
