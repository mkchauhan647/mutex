'use client';
import { useEffect, useRef, useState } from 'react';

export default function Forum() {
  const message = useRef<string>('');
  const socketRef = useRef<WebSocket>(null); // Ref to store the WebSocket instance
    const [messages,setMessages] = useState<Array<string>>([]);
  useEffect(() => {
    async function getMessages() {
      const response = await fetch('http://localhost:3001/getMessages');

      const messages = (await response.json()).messages;
      setMessages(messages);
    }
      if (messages.length == 0 ) {
        getMessages();
      }
      if (!socketRef.current) {
          const socket = new WebSocket('ws://localhost:3001');
      
          socket.addEventListener('open', (event) => {
              console.log('Connected to WebSocket server.');
          });
      
          socket.addEventListener('message', (event) => {
              const messageContainer = document.getElementById('messages');
              const element = document.createElement('p');
              element.textContent = event.data;
              messageContainer?.append(element);
              console.log('Message from server ', event.data);
          });

          (socketRef.current as WebSocket | null) = socket;
        // Rtcpee
    //   }
    //   // Clean up on unmount
    //   return () => {
    //     socketRef.current.close();
    //   };
        }
        // getMessages();
        
  }, []); // Empty dependency array ensures this runs only once

  const sendMessage = () => {
    const socket = socketRef.current; // Access the WebSocket instance from the ref

    if (socket && socket.readyState === WebSocket.OPEN) {
      const messageContainer = document.getElementById('messages');
      const element = document.createElement('p');
      element.textContent = message.current.value;
      messageContainer?.append(element);
      socket.send(message.current.value);
    } else {
      console.log('The WebSocket connection is not open.');
    }
  };

  return (
    <>
      <label>input message:</label>
      <input ref={message} type='text' placeholder='Enter your message' />
      <button onClick={sendMessage}>Send Message</button>

          <div id='messages'>
              {
                  messages && messages.map((value, index) => {
                    return <p key={index}>{value}</p>
                  })
              }
      </div>
    </>
  );
}
