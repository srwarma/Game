import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer
import sqlite3

from datetime import datetime

class TicTacToeConsumer(AsyncJsonWebsocketConsumer):

    def make_logDB(self, winner, roomID):
        con = sqlite3.connect('db.sqlite3')
        cur = con.cursor()
        sql2 = 'CREATE TABLE IF NOT EXISTS logs (id integer PRIMARY KEY,winner text NOT NULL,roomID text,time datetime);'
        cur.execute(sql2)
        con.commit()
        now=datetime.now()
        time = now.strftime("%Y/%m/%d %H:%M:%S")
        sql = "INSERT INTO logs ('winner', 'roomID', 'time') VALUES (?,?,?)"
        val = (str(winner),str(roomID),time)
        cur.execute(sql,val)
        con.commit()
        con.close()


    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_code']
        self.room_group_name = 'room_%s' % self.room_name
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        print("Disconnected")
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        """
        Receive message from WebSocket.
        Get the event and send the appropriate event
        """
        response = json.loads(text_data)
        event = response.get("event", None)
        message = response.get("message", None)
        winner = response.get("winner", None)
        if event == 'MOVE':
            # Send message to room group
            await self.channel_layer.group_send(self.room_group_name, {
                'type': 'send_message',
                'message': message,
                "event": "MOVE"
            })
            
        if event == 'START':
            # Send message to room group
            await self.channel_layer.group_send(self.room_group_name, {
                'type': 'send_message',
                'message': message,
                'event': "START"
            })
            
        if event == 'END':
            self.make_logDB(winner, self.room_group_name)
            # Send message to room group
            await self.channel_layer.group_send(self.room_group_name, {
                'type': 'send_message',
                'message': message,
                'event': "END"
            })

    async def send_message(self, res):
        """ Receive message from room group """
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            "payload": res,
        }))