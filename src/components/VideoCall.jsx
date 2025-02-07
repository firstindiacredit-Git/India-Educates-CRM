import React, { useEffect, useRef, useState } from "react";
import Peer from "simple-peer";
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
  incomingCall = null,
}) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [peer, setPeer] = useState(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callState, setCallState] = useState(
    isIncoming ? "incoming" : "calling"
  );

  const localVideoRef = useRef();
  const remoteVideoRef = useRef();

  useEffect(() => {
    if (isOpen) {
      startCall();
    }
    return () => {
      cleanup();
    };
  }, [isOpen]);

  // Handle socket events for Simple-peer
  useEffect(() => {
    socket.on("webrtc-signal", (data) => {
      console.log("📥 Received signal from:", data.callerId);
      if (peer) {
        peer.signal(data.signal);
      }
    });

    socket.on("call-response", (data) => {
      if (data.accepted) {
        setCallState("connecting");
      } else {
        toast.info("Call was rejected");
        cleanup();
        onClose();
      }
    });

    socket.on("call-ended", () => {
      toast.info("Call ended");
      cleanup();
      onClose();
    });

    return () => {
      socket.off("webrtc-signal");
      socket.off("call-response");
      socket.off("call-ended");
    };
  }, [peer]);

  const startCall = async () => {
    try {
      console.log("Starting call, getting user media...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const newPeer = new Peer({
        initiator: !isIncoming,
        trickle: true,
        stream: stream,
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

      newPeer.on("signal", (signal) => {
        socket.emit("webrtc-signal", {
          signal,
          receiverId,
          callerName,
        });
      });

      newPeer.on("stream", (stream) => {
        console.log("📥 Received remote stream");
        setRemoteStream(stream);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
        }
      });

      newPeer.on("error", (err) => {
        console.error("Peer error:", err);
        toast.error("Connection error occurred");
        cleanup();
      });

      setPeer(newPeer);
      setCallState("connected");
    } catch (err) {
      console.error("Error starting call:", err);
      toast.error("Could not access camera/microphone");
      cleanup();
      onClose();
    }
  };

  const cleanup = () => {
    console.log("Cleaning up call resources");
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    if (peer) {
      peer.destroy();
    }
    setLocalStream(null);
    setRemoteStream(null);
    setPeer(null);
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioMuted(!audioTrack.enabled);
        peer?.send(
          JSON.stringify({
            type: "mute",
            kind: "audio",
            enabled: audioTrack.enabled,
          })
        );
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
        peer?.send(
          JSON.stringify({
            type: "mute",
            kind: "video",
            enabled: videoTrack.enabled,
          })
        );
      }
    }
  };

  const endCall = () => {
    socket.emit("end-call", {
      callerId,
      receiverId,
    });
    cleanup();
    onClose();
  };

  const renderCallState = () => {
    switch (callState) {
      case "incoming":
        return (
          <div className="incoming-call-dialog">
            <h3>Incoming call from {callerName}</h3>
            <div className="call-actions">
              <button className="accept-btn" onClick={startCall}>
                <i className="bi bi-telephone-fill"></i>
              </button>
              <button
                className="decline-btn"
                onClick={() => {
                  socket.emit("call-rejected", { callerId, receiverId });
                  onClose();
                }}
              >
                <i className="bi bi-telephone-x-fill"></i>
              </button>
            </div>
          </div>
        );
      case "calling":
        return <div className="call-status">Calling...</div>;
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="video-call-container">
      <div className="video-grid">
        {remoteStream && (
          <div className="remote-video-container">
            <video
              ref={remoteVideoRef}
              className="remote-video"
              autoPlay
              playsInline
            />
          </div>
        )}
        <div className="local-video-container">
          <video
            ref={localVideoRef}
            className="local-video"
            autoPlay
            playsInline
            muted
          />
        </div>
      </div>

      <div className="controls">
        <button
          className={`control-btn ${isAudioMuted ? "active" : ""}`}
          onClick={toggleAudio}
        >
          <i className={`bi bi-mic${isAudioMuted ? "-mute" : ""}-fill`}></i>
        </button>
        <button
          className={`control-btn ${isVideoOff ? "active" : ""}`}
          onClick={toggleVideo}
        >
          <i
            className={`bi bi-camera-video${isVideoOff ? "-off" : ""}-fill`}
          ></i>
        </button>
        <button className="control-btn end-call" onClick={endCall}>
          <i className="bi bi-telephone-x-fill"></i>
        </button>
      </div>

      {renderCallState()}
    </div>
  );
};

export default VideoCall;
