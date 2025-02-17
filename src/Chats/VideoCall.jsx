import React, { useEffect, useRef, useState } from 'react';
import './VideoCall.css';

const VideoCall = ({ selectedUser, currentUser, onClose, socket }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerConnection = useRef(null);
    const localStream = useRef(null);

    useEffect(() => {
        const initializeCall = async () => {
            try {
                console.log('Requesting media devices...');
                // Get local media stream with explicit constraints
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: 1280 },
                        height: { ideal: 720 },
                        facingMode: 'user'
                    },
                    audio: true
                });
                
                console.log('Media stream obtained:', stream.getTracks());
                localStream.current = stream;

                // Display local video
                if (localVideoRef.current) {
                    console.log('Setting local video stream');
                    localVideoRef.current.srcObject = stream;
                    await localVideoRef.current.play().catch(e => console.error('Error playing local video:', e));
                }

                // Initialize WebRTC peer connection
                const configuration = {
                    iceServers: [
                        { urls: 'stun:stun.l.google.com:19302' },
                        {
                            urls: 'turn:turn.anyfirewall.com:443?transport=tcp',
                            username: 'webrtc',
                            credential: 'webrtc'
                        }
                    ]
                };

                console.log('Initializing peer connection');
                peerConnection.current = new RTCPeerConnection(configuration);

                // Add local stream tracks to peer connection
                stream.getTracks().forEach(track => {
                    console.log('Adding track to peer connection:', track.kind);
                    peerConnection.current.addTrack(track, stream);
                });

                // Handle incoming remote stream
                peerConnection.current.ontrack = (event) => {
                    console.log('Received remote track:', event.track.kind);
                    if (remoteVideoRef.current && event.streams[0]) {
                        console.log('Setting remote video stream');
                        remoteVideoRef.current.srcObject = event.streams[0];
                        remoteVideoRef.current.play().catch(e => console.error('Error playing remote video:', e));
                    }
                };

                // ICE candidate handling
                peerConnection.current.onicecandidate = (event) => {
                    if (event.candidate) {
                        console.log('Sending ICE candidate');
                        socket.current.emit('ice-candidate', {
                            candidate: event.candidate,
                            senderId: currentUser._id,
                            receiverId: selectedUser._id
                        });
                    }
                };

                // Connection state changes
                peerConnection.current.onconnectionstatechange = () => {
                    console.log('Connection state:', peerConnection.current.connectionState);
                };

                // ICE connection state changes
                peerConnection.current.oniceconnectionstatechange = () => {
                    console.log('ICE connection state:', peerConnection.current.iceConnectionState);
                };

                // Create and send offer if initiator
                if (currentUser._id < selectedUser._id) {
                    console.log('Creating offer');
                    const offer = await peerConnection.current.createOffer();
                    await peerConnection.current.setLocalDescription(offer);
                    socket.current.emit('offer', {
                        offer,
                        senderId: currentUser._id,
                        receiverId: selectedUser._id
                    });
                }

                setIsLoading(false);
            } catch (err) {
                console.error('Video call initialization error:', err);
                setError('Failed to access camera/microphone: ' + err.message);
                setIsLoading(false);
            }
        };

        // Socket event listeners for WebRTC signaling
        if (socket.current) {
            socket.current.on('offer', async (data) => {
                console.log('Received offer');
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
                console.log('Received answer');
                if (peerConnection.current) {
                    await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.answer));
                }
            });

            socket.current.on('ice-candidate', async (data) => {
                console.log('Received ICE candidate');
                if (peerConnection.current) {
                    await peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate));
                }
            });
        }

        initializeCall();

        // Cleanup function
        return () => {
            console.log('Cleaning up video call');
            if (localStream.current) {
                localStream.current.getTracks().forEach(track => {
                    console.log('Stopping track:', track.kind);
                    track.stop();
                });
            }
            if (peerConnection.current) {
                peerConnection.current.close();
            }
            if (socket.current) {
                socket.current.off('offer');
                socket.current.off('answer');
                socket.current.off('ice-candidate');
            }
        };
    }, [currentUser, selectedUser, socket]);

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