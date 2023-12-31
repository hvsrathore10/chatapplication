/*
*Here are some ideas to improve the application:
1.Broadcast a message to connected users when someone connects or disconnects.
2.Add support for nicknames.
3.Don’t send the same message to the user that sent it. 
Instead, append the message directly as soon as they press enter.
4.Add “{user} is typing” functionality.
5.Show who’s online.
6.Add private messaging.
*/

import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';
import dotenv from 'dotenv'

//SQL Lite Database modules ::
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

//modules help to use multiple core's of OS for Horizontal scaling (also known as "scaling out")
import { availableParallelism } from 'node:os';
import cluster from 'node:cluster';
import { createAdapter, setupPrimary } from '@socket.io/cluster-adapter';


if (cluster.isPrimary) {
  const numCPUs = availableParallelism();
  // create one worker per available core
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork({
      PORT: 3000 + i
    });
  }

  // set up the adapter on the primary thread
  setupPrimary();
} else {
  // open the database file
  const db = await open({
    filename: 'chat.db',
    driver: sqlite3.Database
  });

  // create our 'messages' table 
  await db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_offset TEXT UNIQUE,
      content TEXT
  );
`);
  dotenv.config();

  const app = express();
  const server = createServer(app);
  const io = new Server(server, {
    connectionStateRecovery: {},
    // set up the adapter on each worker thread
    adapter: createAdapter()
  });

  const __dirname = dirname(fileURLToPath(import.meta.url));

  app.get('/', (req, res) => {
    res.sendFile(join(__dirname, './views/index.html'));
  });

  io.on('connection', async (socket) => {
    socket.on('chat message', async (msg,clientOffset) => {
      let result;
      try {
        // store the message in the database
        result = await db.run('INSERT INTO messages (content, client_offset) VALUES (?, ?)', msg, clientOffset);
      } catch (e) {
        console.log('msg not store in db!');
        return;
      }
      // include the offset with the message
      io.emit('chat message', msg, result.lastID);
    });
    if (!socket.recovered) {
      // if the connection state recovery was not successful
      try {
        await db.each('SELECT id, content FROM messages WHERE id > ?',
          [socket.handshake.auth.serverOffset || 0],
          (_err, row) => {
            socket.emit('chat message', row.content, row.id);
          }
        )
      } catch (e) {
        // something went wrong
        console.log('something went wrong');
      }
    }
  });

  // each worker will listen on a distinct port
  const port = process.env.PORT;

  server.listen(port, () => {
    console.log(`server running at http://localhost:${port}`);
  });
  // Fetch all rows from the messages table
  const allMessages = await db.all('SELECT * FROM messages');
  console.log(allMessages);
}
