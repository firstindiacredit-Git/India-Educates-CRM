import React, { useState, useEffect } from 'react';
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import FloatingMenu from '../Chats/FloatingMenu'
// import axios from 'axios';

const WebMail = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    return (
        <>
            <div id="mytask-layout" style={{ backgroundColor: '#F4F4F5' }}>
                <Sidebar />
                <div className="main px-lg-4 px-md-4">
                    <Header />

                    <div className="body d-flex py-lg-3 py-md-2 flex-column">
                        <h4 className="mb-0 fw-bold">Web Mail</h4>

                        <div className="flex-grow-1 mt-5" style={{}}>
                            <iframe
                                src="https://crm.indiaeducates.org/webmail/"
                                style={{
                                    width: "100%",
                                    height: "100vh",
                                    border: "none",
                                    position: "relative",
                                    top: "-4.5rem",
                                }}
                                title="Web Mail"
                                allow="camera; microphone; display-capture; clipboard-write; autoplay"
                                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                            />

                        </div>
                    </div>
                </div>
                <FloatingMenu userType="admin" isMobile={isMobile} />
            </div>
        </>
    );
};

export default WebMail;
