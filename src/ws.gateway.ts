import { Logger, ValidationPipe } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, OnGatewayConnection, WebSocketServer, MessageBody, OnGatewayDisconnect } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io'
import { AnswerCallDto } from './dto/AnswerCallDto';
import { CallUserEventDto } from './dto/CallUserEvent';
import { RejectCallEventDto } from './dto/RejectCallDto';

@WebSocketGateway()
export class WsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  
  private readonly logger = new Logger(WsGateway.name);

  @WebSocketServer()
  server: Server

  private users = {}

  async handleConnection(socket: Socket) {
    const id = Math.floor(Math.random() * 10000) 
    this.users[id] = socket.id
    socket.emit('me', id)
    this.server.to(socket.id).emit('hey', 'Helloo')
    this.logger.log(`New Socket >> ${socket.id}`)
  }

  async handleDisconnect(socket: Socket) {
    this.logger.log(`Socket Disconnect >> ${socket.id}`)
    for(var f in this.users) {
      if(this.users.hasOwnProperty(f) && this.users[f] == socket.id) {
          delete this.users[f];
      }
  }}
  
  @SubscribeMessage('call.user')
  callUser(@MessageBody(ValidationPipe) data: CallUserEventDto) {
    this.logger.log(`Call User Event `)
    this.logger.log(`Emitting User Calling Event`)
    this.server.to(this.users[data.user_to_call]).emit('user.calling', {signal: data.signal, from: data.from})
  }


  @SubscribeMessage('answer.call')
  answerCall(@MessageBody(ValidationPipe) data: AnswerCallDto) {
    this.logger.log(`Answer Call Event `)
    this.logger.log(`Emitting Call Accepted Event`)
    this.server.to(this.users[data.to]).emit('call.accepted', {signal: data.signal})
  }

  @SubscribeMessage('reject.call')
  rejectCall(@MessageBody(ValidationPipe) data: RejectCallEventDto) {
    this.logger.log(`Reject Call Event Event `)
    this.logger.log(`Emitting Call Rejected Event`)
    this.server.to(this.users[data.to]).emit('call.rejected', {from: data.from})
  }

  @SubscribeMessage('cancel.call')
  cancelCall(@MessageBody(ValidationPipe) data: RejectCallEventDto) {
    this.logger.log(`Cancel Call Event  `)
    this.logger.log(`Emitting Call Cancelled Event`)
    this.server.to(this.users[data.to]).emit('call.cancelled', {from: data.from})
  }

  @SubscribeMessage('end.call')
  endCall(@MessageBody(ValidationPipe) data: RejectCallEventDto) {
    this.logger.log(`End Call Event `)
    this.logger.log(`Emitting Call Ended Event`)
    this.server.to(this.users[data.to]).emit('call.ended', {from: data.from})
  }
}
