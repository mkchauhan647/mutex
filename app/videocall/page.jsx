'use client'
import React, { useEffect, useRef, useState } from 'react';

// const ws = new WebSocket('ws://localhost:3001');
const ws = new WebSocket('ws://backendweb-9yj49y0t7-manoj-kumar-chauhans-projects.vercel.app');

const WebRTC = () => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [localStream, setLocalStream] = useState(null);
  const peerConnection = useRef(null);

  useEffect(() => {
    const init = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideoRef.current.srcObject = stream;
        setLocalStream(stream);

        ws.onmessage = (message) => {
          const data = JSON.parse(message.data);
          switch (data.type) {
            case 'offer':
              handleOffer(data.offer);
              break;
            case 'answer':
              handleAnswer(data.answer);
              break;
            case 'candidate':
              handleCandidate(data.candidate);
              break;
            default:
              break;
          }
        };
      } catch (error) {
        console.error('Error accessing media devices.', error);
      }
    };

    init();
  }, []);

  const createPeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        ws.send(JSON.stringify({ type: 'candidate', candidate: event.candidate }));
      }
    };

    pc.ontrack = (event) => {
      remoteVideoRef.current.srcObject = event.streams[0];
    };

    if (localStream) {
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });
    }

    return pc;
  };

  const handleOffer = async (offer) => {
    if (!peerConnection.current) {
      peerConnection.current = createPeerConnection();
    }

    await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.current.createAnswer();
    await peerConnection.current.setLocalDescription(answer);
    ws.send(JSON.stringify({ type: 'answer', answer }));
  };

  const handleAnswer = async (answer) => {
    await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
  };

  const handleCandidate = (candidate) => {
    const iceCandidate = new RTCIceCandidate(candidate);
    peerConnection.current.addIceCandidate(iceCandidate);
  };

  const startCall = async () => {
    if (!peerConnection.current) {
      peerConnection.current = createPeerConnection();
    }

    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);
    ws.send(JSON.stringify({ type: 'offer', offer }));
  };

  return (
    <div>
      <h1>WebRTC Example</h1>
      <video ref={localVideoRef} autoPlay playsInline muted></video>
      <video ref={remoteVideoRef} autoPlay playsInline></video>
      <button onClick={startCall}>Start Call</button>
    </div>
  );
};

export default WebRTC;
