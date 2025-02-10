import React, { useEffect, useRef, useState } from "react";
import { Peer } from "peerjs";
import socket from "../socket";
import "./VideoCall.css";
import { toast } from "react-toastify";

const VideoCall = ({
  isOpen,
  onClose,
  callerId,
  receiverId,
  isIncoming = false,
  callerName = "",
}) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [callState, setCallState] = useState(
    isIncoming ? "incoming" : "calling"
  );

  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerRef = useRef(null);
  const callRef = useRef(null);

  useEffect(() => {
    // Initialize PeerJS
    peerRef.current = new Peer(callerId, {
      host: import.meta.env.VITE_PEER_HOST,
      port: Number(import.meta.env.VITE_PEER_PORT),
      path: "/peerjs",
      secure: true,
      debug: 3,
      config: {
        iceServers: [
          { urls: "stun:stun1.l.google.com:19302" },
          {
            urls: import.meta.env.VITE_TURN_URLS.split(","),
            username: import.meta.env.VITE_TURN_USERNAME,
            credential: import.meta.env.VITE_TURN_CREDENTIAL,
          },
        ],
      },
    });

    // Handle peer connection
    peerRef.current.on("open", (id) => {
      console.log("My peer ID is: " + id);
    });

    // Handle incoming calls
    peerRef.current.on("call", async (call) => {
      callRef.current = call;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setLocalStream(stream);
        localVideoRef.current.srcObject = stream;

        call.answer(stream);

        call.on("stream", (remoteStream) => {
          setRemoteStream(remoteStream);
          remoteVideoRef.current.srcObject = remoteStream;
          setIsCallActive(true);
          setCallState("connected");
        });
      } catch (err) {
        console.error("Failed to get local stream", err);
        toast.error("Could not access camera/microphone");
      }
    });

    return () => {
      if (peerRef.current) {
        peerRef.current.destroy();
      }
      cleanup();
    };
  }, [callerId]);

  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setLocalStream(stream);
      localVideoRef.current.srcObject = stream;

      const call = peerRef.current.call(receiverId, stream);
      callRef.current = call;

      call.on("stream", (remoteStream) => {
        setRemoteStream(remoteStream);
        remoteVideoRef.current.srcObject = remoteStream;
        setIsCallActive(true);
        setCallState("connected");
      });

      call.on("close", () => {
        cleanup();
        onClose();
      });

      socket.emit("call-user", {
        callerId,
        receiverId,
        callerName,
      });
    } catch (err) {
      console.error("Failed to get local stream", err);
      toast.error("Could not access camera/microphone");
      onClose();
    }
  };

  const handleAnswer = async () => {
    setCallState("connecting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setLocalStream(stream);
      localVideoRef.current.srcObject = stream;

      socket.emit("call-answered", {
        callerId,
        receiverId,
      });
    } catch (err) {
      console.error("Failed to get local stream", err);
      toast.error("Could not access camera/microphone");
      onClose();
    }
  };

  const endCall = () => {
    if (callRef.current) {
      callRef.current.close();
    }
    socket.emit("end-call", {
      callerId,
      receiverId,
    });
    cleanup();
    onClose();
  };

  const cleanup = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => track.stop());
    }
    setLocalStream(null);
    setRemoteStream(null);
    setIsCallActive(false);
  };

  if (!isOpen) return null;

  return (
    <div className="video-call-container">
      <div className="video-grid">
        {remoteStream && (
          <video
            ref={remoteVideoRef}
            className="remote-video"
            autoPlay
            playsInline
          />
        )}
        <video
          ref={localVideoRef}
          className="local-video"
          autoPlay
          playsInline
          muted
        />
      </div>

      <div className="call-controls">
        <button className="control-btn end-call" onClick={endCall}>
          <i className="bi bi-telephone-x-fill"></i>
        </button>
      </div>

      {!isCallActive && (
        <div className="call-status">
          {callState === "calling" ? (
            <div className="outgoing-call">
              <div className="caller-info">
                <i className="bi bi-person-circle"></i>
                <span>Calling {callerName}...</span>
              </div>
              <button className="end-call-btn" onClick={endCall}>
                <i className="bi bi-telephone-x-fill"></i>
              </button>
            </div>
          ) : callState === "incoming" ? (
            <div className="incoming-call">
              <div className="caller-info">
                <i className="bi bi-person-circle"></i>
                <span>Incoming call from {callerName}</span>
              </div>
              <div className="call-actions">
                <button className="accept-call" onClick={handleAnswer}>
                  <i className="bi bi-telephone-fill"></i>
                </button>
                <button className="decline-call" onClick={onClose}>
                  <i className="bi bi-telephone-x-fill"></i>
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default VideoCall;
