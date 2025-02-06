import React, { useEffect, useRef, useState, useCallback } from "react";
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
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [callStatus, setCallStatus] = useState("initializing");
  const [callState, setCallState] = useState(
    isIncoming ? "incoming" : "calling"
  );

  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerConnection = useRef(null);

  const configuration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };

  useEffect(() => {
    if (isOpen) {
      if (!isIncoming) {
        startCall();
      }
    }
    return () => {
      cleanup();
    };
  }, [isOpen]);

  useEffect(() => {
    socket.on("call-rejected", () => {
      toast.info("Call was rejected", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      onClose();
    });

    return () => {
      socket.off("call-rejected");
    };
  }, [onClose]);

  const startCall = async () => {
    try {
      if (localStream) {
        console.log("Using existing stream");
        return;
      }

      console.log("Requesting media permissions...");
      const stream = await navigator.mediaDevices
        .getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user",
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 48000,
          },
        })
        .catch(async (err) => {
          console.error("Error getting media:", err);
          if (err.name === "NotReadableError" || err.name === "NotFoundError") {
            toast.warning("Camera in use, trying audio only...");
            return await navigator.mediaDevices.getUserMedia({
              video: false,
              audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
                sampleRate: 48000,
              },
            });
          }
          throw err;
        });

      console.log(
        "Got media stream:",
        stream.getTracks().map((t) => ({
          kind: t.kind,
          enabled: t.enabled,
          muted: t.muted,
          readyState: t.readyState,
        }))
      );

      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      peerConnection.current = new RTCPeerConnection(configuration);

      stream.getTracks().forEach((track) => {
        console.log("Adding track to peer connection:", track.kind);
        peerConnection.current.addTrack(track, stream);
      });

      peerConnection.current.ontrack = (event) => {
        console.log("Received remote track:", event.track.kind);
        console.log("Track enabled:", event.track.enabled);
        console.log("Track muted:", event.track.muted);
        console.log("Track readyState:", event.track.readyState);

        let stream = null;
        if (event.streams && event.streams[0]) {
          console.log("Using existing stream from event");
          stream = event.streams[0];
        } else {
          console.log("Creating new MediaStream for track");
          stream = new MediaStream();
          stream.addTrack(event.track);
        }

        // Log stream details
        console.log(
          "Stream tracks:",
          stream.getTracks().map((t) => ({
            kind: t.kind,
            enabled: t.enabled,
            muted: t.muted,
            readyState: t.readyState,
          }))
        );

        setRemoteStream(stream);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
          remoteVideoRef.current.play().catch((err) => {
            console.error("Error playing remote stream:", err);
          });

          // Add event listeners to the video element
          remoteVideoRef.current.onloadedmetadata = () => {
            console.log("Remote video metadata loaded");
          };
          remoteVideoRef.current.onplay = () => {
            console.log("Remote video started playing");
          };
          remoteVideoRef.current.onpause = () => {
            console.log("Remote video paused");
          };
        }

        // Monitor track ending
        event.track.onended = () => {
          console.log(`Remote ${event.track.kind} track ended`);
        };
        event.track.onmute = () => {
          console.log(`Remote ${event.track.kind} track muted`);
        };
        event.track.onunmute = () => {
          console.log(`Remote ${event.track.kind} track unmuted`);
        };
      };

      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", {
            candidate: event.candidate,
            receiverId: receiverId,
            callerId: callerId,
          });
        }
      };

      if (!isIncoming) {
        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);

        socket.emit("call-user", {
          callerId: callerId,
          receiverId: receiverId,
          callerName: callerName,
          offer: offer,
        });
      }

      setIsCallActive(true);
    } catch (err) {
      console.error("Error starting call:", err);
      if (err.name === "NotAllowedError") {
        toast.error("Permission denied for camera/microphone");
      } else if (err.name === "NotFoundError") {
        toast.error("No camera/microphone found");
      } else {
        toast.error("Could not start call. Please try audio only.");
      }
      onClose();
    }
  };

  const handleAnswer = async () => {
    try {
      if (localStream) {
        console.log("Using existing stream");
        return;
      }

      const stream = await navigator.mediaDevices
        .getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
          },
        })
        .catch(async (err) => {
          if (err.name === "NotReadableError" || err.name === "NotFoundError") {
            toast.warning("Camera in use, trying audio only...");
            return await navigator.mediaDevices.getUserMedia({
              video: false,
              audio: {
                echoCancellation: true,
                noiseSuppression: true,
              },
            });
          }
          throw err;
        });

      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      peerConnection.current = new RTCPeerConnection(configuration);

      stream.getTracks().forEach((track) => {
        peerConnection.current.addTrack(track, stream);
      });

      peerConnection.current.ontrack = (event) => {
        console.log("Received remote track:", event.track.kind);
        console.log("Track enabled:", event.track.enabled);
        console.log("Track muted:", event.track.muted);
        console.log("Track readyState:", event.track.readyState);

        let stream = null;
        if (event.streams && event.streams[0]) {
          console.log("Using existing stream from event");
          stream = event.streams[0];
        } else {
          console.log("Creating new MediaStream for track");
          stream = new MediaStream();
          stream.addTrack(event.track);
        }

        // Log stream details
        console.log(
          "Stream tracks:",
          stream.getTracks().map((t) => ({
            kind: t.kind,
            enabled: t.enabled,
            muted: t.muted,
            readyState: t.readyState,
          }))
        );

        setRemoteStream(stream);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
          remoteVideoRef.current.play().catch((err) => {
            console.error("Error playing remote stream:", err);
          });

          // Add event listeners to the video element
          remoteVideoRef.current.onloadedmetadata = () => {
            console.log("Remote video metadata loaded");
          };
          remoteVideoRef.current.onplay = () => {
            console.log("Remote video started playing");
          };
          remoteVideoRef.current.onpause = () => {
            console.log("Remote video paused");
          };
        }

        // Monitor track ending
        event.track.onended = () => {
          console.log(`Remote ${event.track.kind} track ended`);
        };
        event.track.onmute = () => {
          console.log(`Remote ${event.track.kind} track muted`);
        };
        event.track.onunmute = () => {
          console.log(`Remote ${event.track.kind} track unmuted`);
        };
      };

      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", {
            candidate: event.candidate,
            receiverId: callerId,
            callerId: receiverId,
          });
        }
      };

      if (incomingCall?.offer) {
        console.log("Setting remote description from offer");
        await peerConnection.current.setRemoteDescription(
          new RTCSessionDescription(incomingCall.offer)
        );

        console.log("Creating answer");
        const answer = await peerConnection.current.createAnswer();

        console.log("Setting local description");
        await peerConnection.current.setLocalDescription(answer);

        console.log("Sending answer");
        socket.emit("call-answered", {
          callerId: callerId,
          receiverId: receiverId,
          answer: answer,
        });
      }

      setIsCallActive(true);
      setCallState("connected");
    } catch (err) {
      console.error("Error answering call:", err);
      if (err.name === "NotAllowedError") {
        toast.error("Permission denied for camera/microphone");
      } else if (err.name === "NotFoundError") {
        toast.error("No camera/microphone found");
      } else {
        toast.error("Could not answer call. Please try audio only.");
      }
      onClose();
    }
  };

  const handleIncomingCall = async (offer) => {
    try {
      await peerConnection.current.setRemoteDescription(
        new RTCSessionDescription(offer)
      );
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);
      socket.emit("call-answered", {
        callerId: callerId,
        receiverId: receiverId,
        answer: answer,
      });
    } catch (err) {
      console.error("Error handling incoming call:", err);
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      audioTracks.forEach((track) => {
        console.log(`Toggling audio track. Was: ${track.enabled}`);
        track.enabled = !track.enabled;
        console.log(`Now: ${track.enabled}`);
      });
      setIsAudioMuted(!isAudioMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const endCall = () => {
    socket.emit("end-call", {
      callerId: callerId,
      receiverId: receiverId,
    });
    cleanup();
    onClose();
  };

  const rejectCall = () => {
    socket.emit("call-rejected", {
      callerId: callerId,
      receiverId: receiverId,
    });
    onClose();
    toast.info("Call rejected", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const cleanup = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        track.stop();
        localStream.removeTrack(track);
      });
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => {
        track.stop();
        remoteStream.removeTrack(track);
      });
    }
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    setLocalStream(null);
    setRemoteStream(null);
    setIsCallActive(false);
  };

  const renderCallState = () => {
    switch (callState) {
      case "incoming":
        return (
          <div className="incoming-call-popup">
            <div className="caller-avatar">
              <i className="bi bi-person-fill"></i>
            </div>
            <div className="caller-name">{callerName}</div>
            <div className="call-type">Incoming video call</div>
            <div className="call-actions">
              <button
                className="call-button decline-call"
                onClick={rejectCall}
                title="Decline"
              >
                <i className="bi bi-telephone-x-fill"></i>
              </button>
              <button
                className="call-button accept-call"
                onClick={handleAnswer}
                title="Accept"
              >
                <i className="bi bi-telephone-fill"></i>
              </button>
            </div>
          </div>
        );
      case "calling":
        return (
          <div className="incoming-call-popup">
            <div className="caller-avatar">
              <i className="bi bi-person-fill"></i>
            </div>
            <div className="caller-name">Calling {callerName}...</div>
            <div className="call-type">Outgoing video call</div>
            <div className="call-actions">
              <button
                className="call-button decline-call"
                onClick={endCall}
                title="Cancel"
              >
                <i className="bi bi-telephone-x-fill"></i>
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const AudioVisualizer = ({ stream }) => {
    const [audioLevel, setAudioLevel] = useState(0);
    const analyzerRef = useRef(null);
    const animationFrameRef = useRef(null);

    useEffect(() => {
      if (!stream) return;

      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const analyzer = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);

      analyzer.fftSize = 256;
      analyzer.smoothingTimeConstant = 0.8;
      microphone.connect(analyzer);
      analyzerRef.current = analyzer;

      const dataArray = new Uint8Array(analyzer.frequencyBinCount);

      const updateAudioLevel = () => {
        analyzer.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(average);
        animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
      };

      updateAudioLevel();

      return () => {
        cancelAnimationFrame(animationFrameRef.current);
        microphone.disconnect();
        audioContext.close();
      };
    }, [stream]);

    return (
      <div className="audio-visualizer">
        <div className="audio-indicator">
          {audioLevel > 50 ? "Speaking" : "Silent"}
        </div>
        <div className="audio-bars">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="audio-bar"
              style={{
                height: `${Math.min(
                  100,
                  (audioLevel / 256) * 100 * (1 + Math.sin(i / 10))
                )}%`,
                opacity: audioLevel > 5 ? 1 : 0.3,
              }}
            />
          ))}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="video-call-container">
      <div className="video-grid">
        {remoteStream && (
          <>
            <video
              ref={remoteVideoRef}
              className="remote-video"
              autoPlay
              playsInline
              controls
            />
            <AudioVisualizer stream={remoteStream} />
          </>
        )}
        <video
          ref={localVideoRef}
          className="local-video"
          autoPlay
          playsInline
          muted={true}
          controls
        />
        {localStream && <AudioVisualizer stream={localStream} />}
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

      {!isCallActive && renderCallState()}

      {callStatus === "connecting" && (
        <div className="call-status">Connecting...</div>
      )}
    </div>
  );
};

export default VideoCall;
