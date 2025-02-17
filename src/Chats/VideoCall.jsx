import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './VideoCall.css';

const VideoCall = ({ selectedUser, currentUser, onClose }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadZoomLibrary = () => {
            // Create Zoom script element
            const script = document.createElement('script');
            script.src = 'https://source.zoom.us/2.9.7/lib/vendor/react.min.js';
            script.async = true;
            document.body.appendChild(script);

            // Load Zoom SDK after React
            script.onload = () => {
                const zoomScript = document.createElement('script');
                zoomScript.src = 'https://source.zoom.us/2.9.7/zoom.min.js';
                zoomScript.async = true;
                document.body.appendChild(zoomScript);

                zoomScript.onload = initZoom;
            };
        };

        const initZoom = async () => {
            try {
                const ZoomMtg = window.ZoomMtg;
                
                // Initialize Zoom
                ZoomMtg.setZoomJSLib('https://source.zoom.us/2.9.7/lib', '/av');
                ZoomMtg.preLoadWasm();
                ZoomMtg.prepareWebSDK();

                // Set language
                ZoomMtg.i18n.load('en-US');
                ZoomMtg.i18n.reload('en-US');

                // Get meeting details
                const response = await axios.post(
                    `${import.meta.env.VITE_BASE_URL}api/create-zoom-meeting`,
                    {
                        senderId: currentUser._id,
                        receiverId: selectedUser._id
                    }
                );

                const { signature, meetingNumber, sdkKey } = response.data;

                // Send meeting link in chat
                const meetingLink = `${window.location.origin}/chat?meeting=${meetingNumber}`;
                const messageData = {
                    senderId: currentUser._id,
                    senderType: currentUser.role === 'admin' ? 'AdminUser' : 
                               currentUser.role === 'employee' ? 'Employee' : 'Client',
                    receiverId: selectedUser._id,
                    receiverType: selectedUser.userType,
                    message: `Video Call Link: ${meetingLink}\nClick to join the video call!`
                };

                // Send message with meeting link
                const messageResponse = await axios.post(
                    `${import.meta.env.VITE_BASE_URL}api/createChat`,
                    messageData
                );

                // Initialize meeting
                ZoomMtg.init({
                    leaveUrl: `${window.location.origin}/chat`,
                    disableCORP: true,
                    isSupportAV: true,
                    isSupportChat: true,
                    success: () => {
                        ZoomMtg.join({
                            signature: signature,
                            meetingNumber: meetingNumber.toString(),
                            userName: currentUser.username || currentUser.employeeName || currentUser.clientName,
                            sdkKey: sdkKey,
                            userEmail: currentUser.email || currentUser.emailid || currentUser.clientEmail,
                            passWord: "",
                            success: () => {
                                setIsLoading(false);
                                console.log('Joined meeting successfully');
                            },
                            error: (joinError) => {
                                setError('Failed to join meeting: ' + joinError.errorMessage);
                                console.error('Join meeting error:', joinError);
                                setIsLoading(false);
                            }
                        });
                    },
                    error: (initError) => {
                        setError('Failed to initialize Zoom: ' + initError.errorMessage);
                        console.error('Init error:', initError);
                        setIsLoading(false);
                    }
                });
            } catch (error) {
                setError('Failed to setup video call: ' + error.message);
                console.error('Setup error:', error);
                setIsLoading(false);
            }
        };

        // Load Zoom library
        loadZoomLibrary();

        // Cleanup function
        return () => {
            if (window.ZoomMtg) {
                try {
                    window.ZoomMtg.leaveMeeting({});
                } catch (error) {
                    console.error('Error leaving meeting:', error);
                }
            }
            // Remove Zoom scripts
            const scripts = document.querySelectorAll('script[src*="zoom"]');
            scripts.forEach(script => script.remove());
        };
    }, []);

    if (isLoading) {
        return (
            <div className="video-call-container d-flex justify-content-center align-items-center">
                <div className="text-center text-white">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Initializing video call...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="video-call-container d-flex justify-content-center align-items-center">
                <div className="text-center">
                    <div className="alert alert-danger">
                        <p>{error}</p>
                        <button 
                            className="btn btn-outline-danger mt-2"
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="video-call-container">
            <div id="zmmtg-root"></div>
            <button 
                className="btn btn-danger position-absolute top-0 end-0 m-3"
                onClick={onClose}
                style={{ zIndex: 10001 }}
            >
                End Call
            </button>
        </div>
    );
};

export default VideoCall;