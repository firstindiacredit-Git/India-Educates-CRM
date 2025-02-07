import React, { useEffect, useRef, useState } from "react";
import Peer from "simple-peer";
import socket from "../socket";

const VideoCall = ({ initiator, stream, onClose }) => {
  const [peer, setPeer] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const remoteVideoRef = useRef();

  useEffect(() => {
    const newPeer = new Peer({
      initiator,
      trickle: true,
      stream,
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          {
            urls: "turn:global.relay.metered.ca:80",
            username: "d1d68a0a0a8a21d7b48a0a8a",
            credential: "VQ+5DZkH9mz0N3wV",
          },
        ],
      },
    });

    newPeer.on("signal", (data) => {
      socket.emit("webrtc-signal", data);
    });

    newPeer.on("stream", (stream) => {
      remoteVideoRef.current.srcObject = stream;
      setRemoteStream(stream);
    });

    socket.on("webrtc-signal", (data) => {
      newPeer.signal(data);
    });

    setPeer(newPeer);

    return () => {
      newPeer.destroy();
      socket.off("webrtc-signal");
    };
  }, []);

  return (
    <div className="video-call-container">
      <video ref={remoteVideoRef} autoPlay playsInline />
      <button onClick={onClose}>End Call</button>
    </div>
  );
};

export default VideoCall;
