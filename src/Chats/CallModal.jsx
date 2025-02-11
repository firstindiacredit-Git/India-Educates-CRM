import React from 'react';
import { Modal } from 'react-bootstrap';

const CallModal = ({
    show,
    onHide,
    callStatus,
    callData,
    onAccept,
    onReject,
    onEnd,
    isCallConnected,
    callDuration,
    formatTime
}) => {
    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Body className="text-center py-4">
                {callStatus === 'incoming' && (
                    <>
                        <h5>Incoming Call</h5>
                        <p>from {callData?.callerName}</p>
                        <div className="d-flex justify-content-center gap-3">
                            <button className="btn btn-success" onClick={onAccept}>
                                <i className="bi bi-telephone-fill"></i> Accept
                            </button>
                            <button className="btn btn-danger" onClick={onReject}>
                                <i className="bi bi-telephone-x-fill"></i> Reject
                            </button>
                        </div>
                    </>
                )}

                {callStatus === 'outgoing' && (
                    <>
                        <h5>Calling...</h5>
                        <p>Please wait</p>
                        <button className="btn btn-danger" onClick={onEnd}>
                            <i className="bi bi-telephone-x-fill"></i> End Call
                        </button>
                    </>
                )}

                {isCallConnected && (
                    <>
                        <h5>Call in Progress</h5>
                        <p>{formatTime(callDuration)}</p>
                        <button className="btn btn-danger" onClick={onEnd}>
                            <i className="bi bi-telephone-x-fill"></i> End Call
                        </button>
                    </>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default CallModal; 