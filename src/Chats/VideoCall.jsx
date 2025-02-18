import React, { useEffect, useRef, useState, useCallback } from 'react';
import './VideoCall.css';

const VideoCall = ({ selectedUser, currentUser, onClose, socket }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerConnection = useRef(null);
    const localStream = useRef(null);
    const connectionEstablished = useRef(false);

    const initializePeerConnection = useCallback(async () => {
        if (connectionEstablished.current) return;

        try {
            console.log('Requesting media devices...');
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                },
                audio: true
            });

            localStream.current = stream;

            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            const configuration = {
                iceServers: [
                    {
                        urls: "stun:stun.relay.metered.ca:80",
                    },
                    {
                        urls: "turn:global.relay.metered.ca:80",
                        username: "9348afee20c90d47a859bcb9",
                        credential: "oFQZw8oWOvFdR9GI",
                    },
                    {
                        urls: "turn:global.relay.metered.ca:80?transport=tcp",
                        username: "9348afee20c90d47a859bcb9",
                        credential: "oFQZw8oWOvFdR9GI",
                    },
                    {
                        urls: "turn:global.relay.metered.ca:443",
                        username: "9348afee20c90d47a859bcb9",
                        credential: "oFQZw8oWOvFdR9GI",
                    },
                    {
                        urls: "turns:global.relay.metered.ca:443?transport=tcp",
                        username: "9348afee20c90d47a859bcb9",
                        credential: "oFQZw8oWOvFdR9GI",
                    },
                ]
            };

            peerConnection.current = new RTCPeerConnection(configuration);

            stream.getTracks().forEach(track => {
                peerConnection.current.addTrack(track, stream);
            });

            peerConnection.current.ontrack = (event) => {
                if (remoteVideoRef.current && event.streams[0]) {
                    remoteVideoRef.current.srcObject = event.streams[0];
                }
            };

            peerConnection.current.onicecandidate = (event) => {
                if (event.candidate && socket.current) {
                    socket.current.emit('ice-candidate', {
                        candidate: event.candidate,
                        senderId: currentUser._id,
                        receiverId: selectedUser._id
                    });
                }
            };

            connectionEstablished.current = true;
            setIsLoading(false);

        } catch (err) {
            console.error('Video call initialization error:', err);
            setError('Failed to access camera/microphone: ' + err.message);
            setIsLoading(false);
        }
    }, [currentUser._id, selectedUser._id]);

    useEffect(() => {
        let mounted = true;

        const setupSocketListeners = () => {
            if (!socket.current) return;

            socket.current.on('offer', async (data) => {
                if (!mounted) return;
                await initializePeerConnection();

                if (peerConnection.current) {
                    await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.offer));
                    const answer = await peerConnection.current.createAnswer();
                    await peerConnection.current.setLocalDescription(answer);
                    socket.current.emit('answer', {
                        answer,
                        senderId: currentUser._id,
                        receiverId: data.senderId
                    });
                }
            });

            socket.current.on('answer', async (data) => {
                if (!mounted || !peerConnection.current) return;
                await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.answer));
            });

            socket.current.on('ice-candidate', async (data) => {
                if (!mounted || !peerConnection.current) return;
                try {
                    await peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate));
                } catch (err) {
                    console.error('Error adding ICE candidate:', err);
                }
            });
        };

        const startCall = async () => {
            await initializePeerConnection();

            if (currentUser._id < selectedUser._id && peerConnection.current) {
                const offer = await peerConnection.current.createOffer();
                await peerConnection.current.setLocalDescription(offer);
                socket.current.emit('offer', {
                    offer,
                    senderId: currentUser._id,
                    receiverId: selectedUser._id
                });
            }
        };

        setupSocketListeners();
        startCall();

        return () => {
            mounted = false;
            if (localStream.current) {
                localStream.current.getTracks().forEach(track => track.stop());
            }
            if (peerConnection.current) {
                peerConnection.current.close();
            }
            if (socket.current) {
                socket.current.off('offer');
                socket.current.off('answer');
                socket.current.off('ice-candidate');
            }
            connectionEstablished.current = false;
        };
    }, [currentUser._id, selectedUser._id, initializePeerConnection]);

    return (
        <div className="video-call-container">
            {isLoading ? (
                <div className="loading-container">
                    <div className="spinner-border text-light" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="text-light mt-3">Initializing video call...</p>
                </div>
            ) : error ? (
                <div className="error-container">
                    <div className="alert alert-danger">
                        <p>{error}</p>
                        <button className="btn btn-danger mt-2" onClick={onClose}>
                            Close
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="video-grid">
                        <div className="video-box local-video">
                            <video
                                ref={localVideoRef}
                                autoPlay
                                playsInline
                                muted
                            />
                            <div className="video-label">You</div>
                        </div>
                        <div className="video-box remote-video">
                            <video
                                ref={remoteVideoRef}
                                autoPlay
                                playsInline
                            />
                            <div className="video-label">
                                {selectedUser?.username || selectedUser?.employeeName || selectedUser?.clientName}
                            </div>
                        </div>
                    </div>
                    <div className="controls">
                        <button className="btn btn-danger" onClick={onClose}>
                            End Call
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default VideoCall;