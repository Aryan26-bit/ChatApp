import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './styles.css';

const socket = io('http://localhost:5000');

function App() {
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [joined, setJoined] = useState(false);
  const [privateRecipient, setPrivateRecipient] = useState('');

  useEffect(() => {
    if (joined) {
      socket.emit('joinRoom', { username, room });

      socket.on('updateUsers', (userList) => {
        setUsers(userList);
      });

      socket.on('message', ({ username, message, private: isPrivate }) => {
        setMessages((prevMessages) => [
          ...prevMessages,
          { username, message, private: isPrivate }
        ]);
      });

      return () => {
        socket.off('updateUsers');
        socket.off('message');
      };
    }
  }, [joined, username, room]);

  const joinRoom = () => {
    if (username && room) {
      setJoined(true);
    }
  };

  const sendMessage = () => {
    if (message.trim()) {
      if (privateRecipient) {
        socket.emit('privateMessage', { recipientUsername: privateRecipient, message });
      } else {
        socket.emit('message', message);
      }
      setMessage('');
    }
  };

  return (
    <div className="chat-app">
      {!joined ? (
        <div className="join-form">
          <h1>Join Chat Room</h1>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="text"
            placeholder="Enter room name"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          />
          <button onClick={joinRoom}>Join Room</button>
        </div>
      ) : (
        <div className="chat-box">
          <div className="header">
            <h1>Chat Room: {room}</h1>
            <select
              value={privateRecipient}
              onChange={(e) => setPrivateRecipient(e.target.value)}
            >
              <option value="">Select user to message</option>
              {users
                .filter((user) => user.username !== username)
                .map((user, index) => (
                  <option key={index} value={user.username}>
                    {user.username}
                  </option>
                ))}
            </select>
          </div>
          <div className="message-area">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message ${msg.username === username ? 'user' : ''} ${msg.private ? 'private' : ''}`}
              >
                <strong>{msg.username}:</strong> {msg.message}
              </div>
            ))}
          </div>
          <div className="input-area">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
