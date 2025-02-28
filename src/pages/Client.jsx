import React, { useState, useEffect } from 'react';
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import axios from 'axios';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Loading.css"
import FloatingMenu from '../Chats/FloatingMenu'


const Client = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const [selectedClient, setSelectedClient] = useState(null);

    // Create a client
    const [formData, setFormData] = useState({
        clientName: '',
        clientEmail: '',
        clientPassword: '',
        clientPhone: '',
        clientAddress: '',
        clientDL: null,
        clientPassport: null,
        clientAgentID: null,
        clientGovtID: null,
        clientImage: null, // Initialize clientImage state to null
        accountNumber: '',
        accountType: '',
        accountHolderName: '',
        ifscCode: '',
        bankName: '',
        upiId: '',
        qrCode: '',
        paymentApp: '',
    });
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    const handleImageChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.files[0], // Store the selected file in the appropriate state field
        });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('clientName', formData.clientName);
            formDataToSend.append('clientEmail', formData.clientEmail);
            formDataToSend.append('clientPassword', formData.clientPassword);
            formDataToSend.append('clientPhone', formData.clientPhone);
            formDataToSend.append('clientAddress', formData.clientAddress);
            formDataToSend.append('clientImage', formData.clientImage);
            formDataToSend.append('accountNumber', formData.accountNumber);
            formDataToSend.append('accountType', formData.accountType);
            formDataToSend.append('accountHolderName', formData.accountHolderName);
            formDataToSend.append('ifscCode', formData.ifscCode);
            formDataToSend.append('bankName', formData.bankName);
            formDataToSend.append('upiId', formData.upiId);
            formDataToSend.append('qrCode', formData.qrCode);
            formDataToSend.append('paymentApp', formData.paymentApp);

            // Append document images if they exist
            if (formData.clientDL) formDataToSend.append('clientDL', formData.clientDL);
            if (formData.clientPassport) formDataToSend.append('clientPassport', formData.clientPassport);
            if (formData.clientAgentID) formDataToSend.append('clientAgentID', formData.clientAgentID);
            if (formData.clientGovtID) formDataToSend.append('clientGovtID', formData.clientGovtID);

            const response = await axios.post(`${import.meta.env.VITE_BASE_URL}api/clients`, formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const newClient = response.data;
            setClients((prevClient) => [newClient, ...prevClient]);
            setFormData({
                clientName: '',
                clientEmail: '',
                clientPassword: '',
                clientPhone: '',
                clientAddress: '',
                clientDL: null,
                clientPassport: null,
                clientAgentID: null,
                clientGovtID: null,
                clientImage: null,
                accountNumber: '',
                accountType: '',
                accountHolderName: '',
                ifscCode: '',
                bankName: '',
                upiId: '',
                qrCode: '',
                paymentApp: '',
            });
            // Close the modal programmatically
            const modalElement = document.getElementById("createproject");
            const modal = window.bootstrap.Modal.getInstance(modalElement);
            modal.hide();

            toast.success("Client Added Successfully!", {
                style: {
                    backgroundColor: "#0d6efd",
                    color: "white",
                },
            });
            // Reload the page after 5 seconds
            setTimeout(() => {
                window.location.reload();
            }, 5000);
        } catch (error) {
            console.error('Error creating client:', error);
            // Handle error, show error message to the user, etc.
        }
    };

    //Get All Client
    useEffect(() => {
        const fetchClients = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${import.meta.env.VITE_BASE_URL}api/clients`);
                // console.log(response.data);
                setClients(response.data);
            } catch (error) {
                console.error('Error fetching clients:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchClients();
    }, []);

    //Search By Name
    const [searchQuery, setSearchQuery] = useState('');
    const handleSearchSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}api/search?name=${searchQuery}`);
            setClients(response.data);
            // setErrorMessage('');
        } catch (error) {
            console.error('Error searching clients:', error);
            setClients([]);
            // setErrorMessage('Error searching clients. Please try again later.');
        }
    };

    //Update a Client
    const [clientData, setClientData] = useState({
        clientName: '',
        clientEmail: '',
        clientPassword: '',
        clientPhone: '',
        clientAddress: '',
        clientDL: null,
        clientPassport: null,
        clientAgentID: null,
        clientGovtID: null,
        clientImage: null,
        accountNumber: '',
        accountType: '',
        accountHolderName: '',
        ifscCode: '',
        bankName: '',
        upiId: '',
        qrCode: '',
        paymentApp: ''
    });
    const [toEdit, setToEdit] = useState("");

    useEffect(() => {
        const fetchClientData = async () => {
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_BASE_URL}api/clients/${toEdit}`
                );

                setClientData({
                    clientName: response.data.clientName,
                    clientEmail: response.data.clientEmail,
                    clientPassword: response.data.clientPassword,
                    clientPhone: response.data.clientPhone,
                    clientAddress: response.data.clientAddress,
                    clientDL: response.data.clientDL,
                    clientPassport: response.data.clientPassport,
                    clientAgentID: response.data.clientAgentID,
                    clientGovtID: response.data.clientGovtID,
                    clientImage: response.data.clientImage,
                    accountNumber: response.data.bankDetails?.accountNumber || '',
                    accountType: response.data.bankDetails?.accountType || '',
                    accountHolderName: response.data.bankDetails?.accountHolderName || '',
                    ifscCode: response.data.bankDetails?.ifscCode || '',
                    bankName: response.data.bankDetails?.bankName || '',
                    upiId: response.data.bankDetails?.upiId || '',
                    qrCode: response.data.bankDetails?.qrCode || '',
                    paymentApp: response.data.bankDetails?.paymentApp || ''
                });
            } catch (error) {
                console.error('Error fetching client data:', error);
            }
        };

        if (toEdit) {
            fetchClientData();
        }
    }, [toEdit]);

    const updateChange = (e) => {
        const { name, value, files } = e.target;
        setClientData((prevState) => ({
            ...prevState,
            [name]: files ? files[0] : value,
        }));
    };

    const updateSubmit = async (e) => {
        e.preventDefault();
        try {
            const updateDataToSend = new FormData();
            Object.keys(clientData).forEach(key => {
                // Check if clientImage is a file and append correctly
                if (key === "clientImage" && clientData[key] instanceof File) {
                    updateDataToSend.append(key, clientData[key]);
                } else {
                    updateDataToSend.append(key, clientData[key]);
                }
            });

            const response = await axios.put(
                `${import.meta.env.VITE_BASE_URL}api/clients/${toEdit}`,
                updateDataToSend,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            if (response.status === 200) {
                // console.log('Client updated successfully');
            }

            //  Close the modal programmatically
            const modalElement = document.getElementById("editproject");
            const modal = window.bootstrap.Modal.getInstance(modalElement);
            modal.hide();

            toast.success("Client Updated", {
                style: {
                    backgroundColor: "#0d6efd",
                    color: "white",
                },
            });
            // Reload the page after 5 seconds
            setTimeout(() => {
                window.location.reload();
            }, 5000);


        } catch (error) {
            console.error('Error updating client:', error);
        }
    };



    //Delete a Client
    const [deletableId, setDeletableId] = useState("");
    const handleDelete = async (id) => {
        try {
            const response = await axios.delete(
                `${import.meta.env.VITE_BASE_URL}api/clients/${deletableId}`
            );
            const remainingClitent = clients.filter((prevClient) => {
                return prevClient._id !== deletableId
            })
            setClients(remainingClitent); // Update state to remove deleted client
            const modalElement = document.getElementById("deleteproject");
            const modal = window.bootstrap.Modal.getInstance(modalElement);
            modal.hide();

            toast.error("Client Deleted Successfully!", {
                style: {
                    backgroundColor: "#0d6efd",
                    color: "white",
                },
            });
            // Reload the page after 5 seconds
            setTimeout(() => {
                window.location.reload();
            }, 5000);
        } catch (error) {
            console.error('Error deleting client:', error);
        }
    };

    // Add this state for password visibility
    const [showPassword, setShowPassword] = useState(false);
    const [showEditPassword, setShowEditPassword] = useState(false);

    // Handle file click for preview
    const handleFileClick = (e, url, type, title) => {
        e.preventDefault();
        // Create a modal to display the file
        const modal = document.createElement('div');
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        modal.style.display = 'flex';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';
        modal.style.zIndex = '9999';
        modal.style.padding = '20px';
        modal.style.flexDirection = 'column';

        // Add title
        const titleElement = document.createElement('h3');
        titleElement.textContent = title;
        titleElement.style.color = 'white';
        titleElement.style.marginBottom = '20px';
        modal.appendChild(titleElement);

        // Add content based on type
        if (type === 'image') {
            const img = document.createElement('img');
            img.src = url;
            img.style.maxWidth = '70%';
            img.style.maxHeight = '70%';
            img.style.marginLeft = '5rem';
            img.style.objectFit = 'contain';
            modal.appendChild(img);
        } else {
            const iframe = document.createElement('iframe');
            iframe.src = url;
            iframe.style.width = '90%';
            iframe.style.height = '80%';
            iframe.style.border = 'none';
            modal.appendChild(iframe);
        }

        // Add close button
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.style.marginTop = '20px';
        closeButton.style.padding = '10px 20px';
        closeButton.style.backgroundColor = '#0d6efd';
        closeButton.style.color = 'white';
        closeButton.style.border = 'none';
        closeButton.style.borderRadius = '5px';
        closeButton.style.cursor = 'pointer';
        closeButton.onclick = () => {
            document.body.removeChild(modal);
        };
        modal.appendChild(closeButton);

        // Add modal to body
        document.body.appendChild(modal);
    };

    // Handle file download
    const handleDownload = async (filePath, fileName) => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}${filePath}`, {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success('File downloaded successfully!');
        } catch (error) {
            console.error('Error downloading file:', error);
            toast.error('Error downloading file');
        }
    };

    return (
        <>
            <div id="mytask-layout">
                <Sidebar />
                {/* main body area */}
                <div className="main px-lg-4 px-md-4">
                    {/* Body: Header */}
                    <Header />

                    <>
                        {/* Body: Body */}
                        <div className="body d-flex py-lg-3 py-md-2">
                            <div className="container-xxl">
                                <div className="row clearfix">
                                    <div className="col-md-12">
                                        <div className="card border-0 mb-2 no-bg">
                                            <div className="card-header py-3 px-0 d-flex align-items-center  justify-content-between border-bottom">
                                                <h3 className=" fw-bold flex-fill mb-0">Team Members</h3>
                                                <div className="col-auto d-flex">
                                                    <button
                                                        type="button"
                                                        className="btn btn-dark me-1 mt-1 w-sm-100"
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#createproject"
                                                    >
                                                        <i className="icofont-plus-circle me-2 fs-6" />
                                                        Add Team Member
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="d-flex justify-content-between mt-3 border-bottom">

                                                <div className="d-flex mb-3">
                                                    {viewMode === 'grid' ? (
                                                        <button
                                                            className="btn btn-outline-primary"
                                                            onClick={() => setViewMode('list')}
                                                            title="Switch to List View"
                                                        >
                                                            <i className="bi bi-list-task"></i>
                                                        </button>
                                                    ) : (
                                                        <button
                                                            className="btn btn-outline-primary"
                                                            onClick={() => setViewMode('grid')}
                                                            title="Switch to Grid View"
                                                        >
                                                            <i className="bi bi-grid-3x3-gap-fill"></i>
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="mb-3">
                                                    <div className="input-group">
                                                        <input
                                                            type="search"
                                                            className="form-control"
                                                            aria-label="search"
                                                            aria-describedby="addon-wrapping"
                                                            value={searchQuery}
                                                            onChange={(e) => {
                                                                setSearchQuery(e.target.value);
                                                                handleSearchSubmit(e.target.value);
                                                            }}
                                                            placeholder="Enter Member Name"
                                                        />
                                                        <button
                                                            type="button"
                                                            className="input-group-text"
                                                            id="addon-wrapping"
                                                            onClick={handleSearchSubmit}
                                                        >
                                                            <i className="fa fa-search" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Row End */}
                                {loading ? (
                                    <div className="custom-loader "></div>
                                ) : clients.length === 0 ? (
                                    <div className="text-center mt-4">
                                        <h1 className="text-muted">No Members available. Please add a Member.</h1>
                                    </div>
                                ) : (
                                    viewMode === 'grid' ? (
                                        // Existing grid view
                                        <div className="row g-3 row-cols-1 row-cols-sm-1 row-cols-md-1 row-cols-lg-2 row-cols-xl-2 row-cols-xxl-2 row-deck py-1 pb-4">
                                            {clients.map(client => (
                                                <div className="col" key={client._id}>
                                                    <div className="card teacher-card">
                                                        <div className="card-body d-flex">
                                                            <div className="profile-av pe-xl-4 pe-md-2 pe-sm-4 pe-4 text-center w220">
                                                                <div className="position-relative d-inline-block">
                                                                    <img
                                                                        src={`${import.meta.env.VITE_BASE_URL}/uploads/${client.clientImage}`}
                                                                        alt=""
                                                                        className="avatar xl rounded-circle img-thumbnail shadow-sm"
                                                                        style={{
                                                                            transition: 'transform 0.3s ease-in-out',
                                                                            cursor: 'pointer',
                                                                            objectFit: 'cover'
                                                                        }}
                                                                        onMouseEnter={(e) => {
                                                                            e.target.style.transform = 'scale(2.5)';
                                                                            e.target.style.zIndex = '100';
                                                                        }}
                                                                        onMouseLeave={(e) => {
                                                                            e.target.style.transform = 'scale(1)';
                                                                            e.target.style.zIndex = '1';
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div className="about-info d-flex align-items-center mt-1 justify-content-center flex-column">
                                                                    <h6 className="mb-0 fw-bold d-block fs-6 mt-2">{client.clientName}</h6>
                                                                    <div
                                                                        className="btn-group mt-2"
                                                                        role="group"
                                                                        aria-label="Basic outlined example"
                                                                    >
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-outline-secondary"
                                                                            data-bs-toggle="modal"
                                                                            data-bs-target="#editproject"
                                                                            onClick={() => setToEdit(client._id)}
                                                                        >
                                                                            <i className="icofont-edit text-success" />
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-outline-secondary"
                                                                            data-bs-toggle="modal"
                                                                            data-bs-target="#deleteproject"
                                                                            onClick={() => {
                                                                                setDeletableId(client._id);
                                                                            }}
                                                                        >
                                                                            <i className="icofont-ui-delete text-danger" />
                                                                        </button>

                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="teacher-info border-start ps-xl-4 ps-md-3 ps-sm-4 ps-4 w-100">
                                                                <h6 className="mb-0 mt-2 fw-bold d-block fs-6">
                                                                    {client.clientName}
                                                                </h6>
                                                                <span className="py-1 fw-bold small-11 mb-0 mt-1 text-muted">
                                                                    Phone No. - {client.clientPhone}
                                                                </span>
                                                                <div className="video-setting-icon mt-3 pt-3 border-top">
                                                                    <div className="d-flex align-items-center mb-2">
                                                                        <i className="bi bi-envelope-fill text-primary me-2 fs-5"></i>
                                                                        <p className="mb-0"><span className="fw-bold">Email - </span>{client.clientEmail}</p>
                                                                    </div>
                                                                    <div className="d-flex align-items-center mb-2">
                                                                        <i className="bi bi-geo-alt-fill text-danger me-2 fs-5"></i>
                                                                        <p className="mb-0"><span className="fw-bold">Address - </span>{client.clientAddress}</p>
                                                                    </div>
                                                                    <div className="d-flex justify-content-between mt-3 gap-2">
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-sm btn-outline-primary"
                                                                            data-bs-toggle="modal"
                                                                            data-bs-target="#bankDetailsModal"
                                                                            onClick={() => setSelectedClient(client)}
                                                                        >
                                                                            <i className="bi bi-bank me-2"></i>
                                                                            Bank
                                                                        </button>
                                                                        <button
                                                                            className="btn btn-sm btn-outline-success"
                                                                            data-bs-toggle="modal"
                                                                            data-bs-target="#documentsDetailsModal"
                                                                            onClick={() => setSelectedClient(client)}
                                                                        >
                                                                            <i className="bi bi-file-earmark-text me-2"></i>
                                                                            Documents
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        // New list view
                                        <div className="row clearfix g-3">
                                            <div className="col-sm-12">
                                                <div className="card mb-3">
                                                    <div className="card-body">
                                                        <table id="myProjectTable" className="table table-hover align-middle mb-0" style={{ width: '100%' }}>
                                                            <thead>
                                                                <tr>
                                                                    <th><i className="bi bi-person-circle me-2 text-primary"></i>Member</th>
                                                                    <th><i className="bi bi-bank me-2 text-success"></i>Bank Details</th>
                                                                    <th><i className="bi bi-gear me-2 text-info"></i>Actions</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {clients.map(client => (
                                                                    <tr key={client._id}>
                                                                        <td>
                                                                            <div className="d-flex align-items-center">
                                                                                <img className="avatar rounded-circle me-2" src={`${import.meta.env.VITE_BASE_URL}/uploads/${client.clientImage}`} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover' }} />
                                                                                <div>
                                                                                    <h6 className="mb-0">{client.clientName}</h6>
                                                                                    <div className="d-flex align-items-center text-muted small">
                                                                                        <i className="bi bi-envelope-fill me-1 text-primary"></i>
                                                                                    <small>{client.clientEmail}</small>
                                                                                    </div>
                                                                                    <div className="d-flex align-items-center text-muted small mt-1">
                                                                                        <i className="bi bi-telephone-fill me-1 text-success"></i>
                                                                                        <small>{client.clientPhone}</small>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                        <td>
                                                                            <div>
                                                                                {client.bankDetails?.accountNumber && 
                                                                                    <div className="d-flex align-items-center mb-1">
                                                                                        <i className="bi bi-credit-card me-2 text-primary"></i>
                                                                                        <span>Acc: {client.bankDetails.accountNumber}</span>
                                                                                    </div>
                                                                                }
                                                                                {client.bankDetails?.bankName && 
                                                                                    <div className="d-flex align-items-center mb-1">
                                                                                        <i className="bi bi-building me-2 text-success"></i>
                                                                                        <span>Bank: {client.bankDetails.bankName}</span>
                                                                                    </div>
                                                                                }
                                                                                {client.bankDetails?.upiId && 
                                                                                    <div className="d-flex align-items-center">
                                                                                        <i className="bi bi-phone me-2 text-danger"></i>
                                                                                        <span>UPI: {client.bankDetails.upiId}</span>
                                                                                    </div>
                                                                                }
                                                                                {!client.bankDetails?.accountNumber && !client.bankDetails?.bankName && !client.bankDetails?.upiId && 
                                                                                    <div className="text-muted fst-italic">
                                                                                        <i className="bi bi-info-circle me-1"></i>
                                                                                        No bank details available
                                                                                    </div>
                                                                                }
                                                                            </div>
                                                                        </td>
                                                                        <td>
                                                                            <div className="btn-group" role="group" aria-label="Basic outlined example">
                                                                                <button type="button" className="btn btn-outline-primary" data-bs-toggle="modal" data-bs-target="#editproject" onClick={() => setToEdit(client._id)} title="Edit Member">
                                                                                    <i className="icofont-edit"></i>
                                                                                </button>
                                                                                <button type="button" className="btn btn-outline-danger" data-bs-toggle="modal" data-bs-target="#deleteproject" onClick={() => setDeletableId(client._id)} title="Delete Member">
                                                                                    <i className="icofont-ui-delete"></i>
                                                                                </button>
                                                                                <button type="button" className="btn btn-outline-success" data-bs-toggle="modal" data-bs-target="#bankDetailsModal" onClick={() => setSelectedClient(client)} title="Bank Details">
                                                                                    <i className="bi bi-bank"></i>
                                                                                </button>
                                                                                <button type="button" className="btn btn-outline-info" data-bs-toggle="modal" data-bs-target="#documentsDetailsModal" onClick={() => setSelectedClient(client)} title="Documents">
                                                                                    <i className="bi bi-file-earmark-text"></i>
                                                                                </button>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    </>


                    <>
                        {/* Create Client*/}
                        <div
                            className="modal fade"
                            id="createproject"
                            tabIndex={-1}
                            aria-hidden="true"
                        >
                            <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title  fw-bold" id="createprojectlLabel">
                                            {" "}
                                            Add Member
                                        </h5>
                                        <button
                                            type="button"
                                            className="btn-close"
                                            data-bs-dismiss="modal"
                                            aria-label="Close"
                                        />
                                    </div>
                                    <div className="modal-body">
                                        <div className="mb-3">
                                            <label htmlFor="exampleFormControlInput877" className="form-label">
                                                Member Name <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="exampleFormControlInput877"
                                                placeholder="Member Name"
                                                name="clientName" value={formData.clientName} onChange={handleChange}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="formFileMultipleoneone" className="form-label">
                                                Profile Image
                                            </label>
                                            <input
                                                className="form-control"
                                                type="file"
                                                id="formFileMultipleoneone"
                                                name="clientImage"
                                                onChange={handleImageChange}
                                            />
                                        </div>
                                        {/* Client Documents images */}
                                        <div className="row g-3 mb-3">
                                            <div className="col-md-6">
                                                <label htmlFor="clientDL" className="form-label">
                                                    Driving License
                                                </label>
                                                <input
                                                    type="file"
                                                    className="form-control"
                                                    id="clientDL"
                                                    name="clientDL"
                                                    onChange={handleImageChange}
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label htmlFor="clientPassport" className="form-label">
                                                    Passport
                                                </label>
                                                <input
                                                    type="file"
                                                    className="form-control"
                                                    id="clientPassport"
                                                    name="clientPassport"
                                                    onChange={handleImageChange}
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label htmlFor="clientAgentID" className="form-label">
                                                    Agent ID
                                                </label>
                                                <input
                                                    type="file"
                                                    className="form-control"
                                                    id="clientAgentID"
                                                    name="clientAgentID"
                                                    onChange={handleImageChange}
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label htmlFor="clientGovtID" className="form-label">
                                                    Government ID
                                                </label>
                                                <input
                                                    type="file"
                                                    className="form-control"
                                                    id="clientGovtID"
                                                    name="clientGovtID"
                                                    onChange={handleImageChange}
                                                />
                                            </div>
                                        </div>

                                        <div className="deadline-form">
                                            <form>
                                                <div className="row g-3 mb-3">
                                                    <div className="col">
                                                        <label
                                                            htmlFor="exampleFormControlInput477"
                                                            className="form-label"
                                                        >
                                                            Email ID <span className="text-danger">*</span>
                                                        </label>
                                                        <input
                                                            type="email"
                                                            className="form-control"
                                                            id="exampleFormControlInput477"
                                                            placeholder="Email ID"
                                                            name="clientEmail" value={formData.clientEmail} onChange={handleChange}
                                                        />
                                                    </div>
                                                    <div className="col">
                                                        <label
                                                            htmlFor="exampleFormControlInput277"
                                                            className="form-label"
                                                        >
                                                            Password <span className="text-danger">*</span>
                                                        </label>
                                                        <div className="input-group">
                                                            <input
                                                                type={showPassword ? "text" : "password"}
                                                                className="form-control"
                                                                id="exampleFormControlInput277"
                                                                placeholder="Password"
                                                                name="clientPassword"
                                                                value={formData.clientPassword}
                                                                onChange={handleChange}
                                                            />
                                                            <button
                                                                className="btn btn-outline-secondary"
                                                                type="button"
                                                                onClick={() => setShowPassword(!showPassword)}
                                                            >
                                                                <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="row g-3 mb-3">
                                                    <div className="col">
                                                        <label
                                                            htmlFor="exampleFormControlInput477"
                                                            className="form-label"
                                                        >
                                                            Address
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            id="exampleFormControlInput477"
                                                            placeholder="Address"
                                                            name="clientAddress" value={formData.clientAddress} onChange={handleChange}
                                                        />
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                        <div className="row g-3 mb-3">
                                            <div className="col">
                                                <label
                                                    htmlFor="exampleFormControlInput777"
                                                    className="form-label"
                                                >
                                                    Phone
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="exampleFormControlInput777"
                                                    placeholder="Phone Number"
                                                    name="clientPhone" value={formData.clientPhone} onChange={handleChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Bank Details</label>
                                            <div className="row g-3">
                                                <div className="col-md-6">
                                                    <div className="input-group mb-3">
                                                        <span className="input-group-text"><i className="bi bi-bank"></i></span>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="Account Number"
                                                            name="accountNumber"
                                                            value={formData.accountNumber || ''}
                                                            onChange={handleChange}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="input-group mb-3">
                                                        <span className="input-group-text"><i className="bi bi-credit-card"></i></span>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="Account Type"
                                                            name="accountType"
                                                            value={formData.accountType || ''}
                                                            onChange={handleChange}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="input-group mb-3">
                                                        <span className="input-group-text"><i className="bi bi-person"></i></span>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="Account Holder Name"
                                                            name="accountHolderName"
                                                            value={formData.accountHolderName || ''}
                                                            onChange={handleChange}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="input-group mb-3">
                                                        <span className="input-group-text"><i className="bi bi-upc"></i></span>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="IFSC Code"
                                                            name="ifscCode"
                                                            value={formData.ifscCode || ''}
                                                            onChange={handleChange}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="input-group mb-3">
                                                        <span className="input-group-text"><i className="bi bi-building"></i></span>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="Bank Name"
                                                            name="bankName"
                                                            value={formData.bankName || ''}
                                                            onChange={handleChange}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="input-group mb-3">
                                                        <span className="input-group-text"><i className="bi bi-phone"></i></span>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="UPI ID"
                                                            name="upiId"
                                                            value={formData.upiId || ''}
                                                            onChange={handleChange}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="input-group mb-3">
                                                        <span className="input-group-text"><i className="bi bi-qr-code"></i></span>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="QR Code"
                                                            name="qrCode"
                                                            value={formData.qrCode || ''}
                                                            onChange={handleChange}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="input-group mb-3">
                                                        <span className="input-group-text"><i className="bi bi-wallet2"></i></span>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="Payment App"
                                                            name="paymentApp"
                                                            value={formData.paymentApp || ''}
                                                            onChange={handleChange}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            data-bs-dismiss="modal"
                                        >
                                            Done
                                        </button>
                                        <button type="button" className="btn close text-white"
                                            style={{ backgroundColor: "#0a9400" }} onClick={handleSubmit}>
                                            Create
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Update Client*/}
                        <div
                            className="modal fade"
                            id="editproject"
                            tabIndex={-1}
                            aria-hidden="true"
                        >
                            <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title fw-bold" id="createprojectlLabel">Edit Member</h5>
                                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
                                    </div>
                                    <div className="modal-body">
                                        <div className="mb-3">
                                            <label htmlFor="exampleFormControlInput877" className="form-label">Member Name</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="exampleFormControlInput877"
                                                placeholder="Client Name"
                                                name="clientName"
                                                value={clientData.clientName}
                                                onChange={updateChange}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="formFileMultipleoneone" className="form-label">Profile Image</label>
                                            <input
                                                className="form-control"
                                                type="file"
                                                id="formFileMultipleoneone"
                                                name="clientImage"
                                                onChange={updateChange}
                                            />
                                        </div>
                                        {/* Client Documents images - Added to edit modal */}
                                        <div className="row g-3 mb-3">
                                            <div className="col-md-6">
                                                <label htmlFor="clientDLEdit" className="form-label">
                                                    Driving License
                                                </label>
                                                <input
                                                    type="file"
                                                    className="form-control"
                                                    id="clientDLEdit"
                                                    name="clientDL"
                                                    onChange={updateChange}
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label htmlFor="clientPassportEdit" className="form-label">
                                                    Passport
                                                </label>
                                                <input
                                                    type="file"
                                                    className="form-control"
                                                    id="clientPassportEdit"
                                                    name="clientPassport"
                                                    onChange={updateChange}
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label htmlFor="clientAgentIDEdit" className="form-label">
                                                    Agent ID
                                                </label>
                                                <input
                                                    type="file"
                                                    className="form-control"
                                                    id="clientAgentIDEdit"
                                                    name="clientAgentID"
                                                    onChange={updateChange}
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label htmlFor="clientGovtIDEdit" className="form-label">
                                                    Government ID
                                                </label>
                                                <input
                                                    type="file"
                                                    className="form-control"
                                                    id="clientGovtIDEdit"
                                                    name="clientGovtID"
                                                    onChange={updateChange}
                                                />
                                            </div>
                                        </div>

                                        <div className="deadline-form">
                                            <form>
                                                <div className="row g-3 mb-3">
                                                    <div className="col">
                                                        <label htmlFor="exampleFormControlInput477" className="form-label">Email ID</label>
                                                        <input
                                                            type="email"
                                                            className="form-control"
                                                            id="exampleFormControlInput477"
                                                            placeholder="Email ID"
                                                            name="clientEmail"
                                                            value={clientData.clientEmail}
                                                            onChange={updateChange}
                                                        />
                                                    </div>
                                                    <div className="col">
                                                        <label htmlFor="exampleFormControlInput277" className="form-label">Password</label>
                                                        <div className="input-group">
                                                            <input
                                                                type={showEditPassword ? "text" : "password"}
                                                                className="form-control"
                                                                id="exampleFormControlInput277"
                                                                placeholder="Password"
                                                                name="clientPassword"
                                                                value={clientData.clientPassword}
                                                                onChange={updateChange}
                                                            />
                                                            <button
                                                                className="btn btn-outline-secondary"
                                                                type="button"
                                                                onClick={() => setShowEditPassword(!showEditPassword)}
                                                            >
                                                                <i className={`bi ${showEditPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="row g-3 mb-3">
                                                    <div className="col">
                                                        <label htmlFor="exampleFormControlInput477" className="form-label">Address</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            id="exampleFormControlInput477"
                                                            placeholder="Address"
                                                            name="clientAddress"
                                                            value={clientData.clientAddress}
                                                            onChange={updateChange}
                                                        />
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                        <div className="row g-3 mb-3">
                                            <div className="col">
                                                <label htmlFor="exampleFormControlInput777" className="form-label">Phone</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="exampleFormControlInput777"
                                                    placeholder="Phone Number"
                                                    name="clientPhone"
                                                    value={clientData.clientPhone}
                                                    onChange={updateChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Bank Details</label>
                                            <div className="row g-3">
                                                <div className="col-md-6">
                                                    <div className="input-group mb-3">
                                                        <span className="input-group-text"><i className="bi bi-bank"></i></span>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="Account Number"
                                                            name="accountNumber"
                                                            value={clientData.accountNumber || ''}
                                                            onChange={updateChange}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="input-group mb-3">
                                                        <span className="input-group-text"><i className="bi bi-credit-card"></i></span>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="Account Type"
                                                            name="accountType"
                                                            value={clientData.accountType || ''}
                                                            onChange={updateChange}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="input-group mb-3">
                                                        <span className="input-group-text"><i className="bi bi-person"></i></span>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="Account Holder Name"
                                                            name="accountHolderName"
                                                            value={clientData.accountHolderName || ''}
                                                            onChange={updateChange}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="input-group mb-3">
                                                        <span className="input-group-text"><i className="bi bi-upc"></i></span>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="IFSC Code"
                                                            name="ifscCode"
                                                            value={clientData.ifscCode || ''}
                                                            onChange={updateChange}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="input-group mb-3">
                                                        <span className="input-group-text"><i className="bi bi-building"></i></span>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="Bank Name"
                                                            name="bankName"
                                                            value={clientData.bankName || ''}
                                                            onChange={updateChange}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="input-group mb-3">
                                                        <span className="input-group-text"><i className="bi bi-phone"></i></span>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="UPI ID"
                                                            name="upiId"
                                                            value={clientData.upiId || ''}
                                                            onChange={updateChange}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="input-group mb-3">
                                                        <span className="input-group-text"><i className="bi bi-qr-code"></i></span>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="QR Code"
                                                            name="qrCode"
                                                            value={clientData.qrCode || ''}
                                                            onChange={updateChange}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="input-group mb-3">
                                                        <span className="input-group-text"><i className="bi bi-wallet2"></i></span>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="Payment App"
                                                            name="paymentApp"
                                                            value={clientData.paymentApp || ''}
                                                            onChange={updateChange}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Done</button>
                                        <button type="button" className="btn close text-white"
                                            style={{ backgroundColor: "#0a9400" }} onClick={updateSubmit}>Update</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal  Delete Folder/ File*/}
                        <div
                            className="modal fade"
                            id="deleteproject"
                            tabIndex={-1}
                            aria-hidden="true"
                        >
                            <div className="modal-dialog modal-dialog-centered modal-md modal-dialog-scrollable">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title  fw-bold" id="deleteprojectLabel">
                                            {" "}
                                            Delete item Permanently?
                                        </h5>
                                        <button
                                            type="button"
                                            className="btn-close"
                                            data-bs-dismiss="modal"
                                            aria-label="Close"
                                        />
                                    </div>
                                    <div className="modal-body justify-content-center flex-column d-flex">
                                        <i className="icofont-ui-delete text-danger display-2 text-center mt-2" />
                                        <p className="mt-4 fs-5 text-center">
                                            You can only delete this item Permanently
                                        </p>
                                    </div>
                                    <div className="modal-footer">
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            data-bs-dismiss="modal"
                                        >
                                            Cancel
                                        </button>
                                        <button type="button" className="btn btn-danger color-fff" onClick={handleDelete}>
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bank Details Modal */}
                        <div
                            className="modal fade"
                            id="bankDetailsModal"
                            tabIndex={-1}
                            aria-hidden="true"
                            style={{ zIndex: 9998 }}
                        >
                            <div className="modal-dialog modal-dialog-centered">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title fw-bold">
                                            {selectedClient?.clientName || 'Member'}'s Bank Details
                                        </h5>
                                        <button
                                            type="button"
                                            className="btn-close"
                                            data-bs-dismiss="modal"
                                            aria-label="Close"
                                        />
                                    </div>
                                    <div className="modal-body">
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <div className="bank-info-item p-3 border rounded h-100">
                                                    <i className="bi bi-bank fs-4 text-primary me-2"></i>
                                                    <div className="flex-grow-1">
                                                        <div className="fw-bold">Bank Name</div>
                                                        <div className="d-flex align-items-center">
                                                            <span className="me-2">{selectedClient?.bankDetails?.bankName || 'Not provided'}</span>
                                                            {selectedClient?.bankDetails?.bankName && (
                                                                <i
                                                                    className="bi bi-clipboard cursor-pointer"
                                                                    onClick={() => {
                                                                        navigator.clipboard.writeText(selectedClient.bankDetails.bankName);
                                                                        toast.success('Bank Name copied!');
                                                                    }}
                                                                    title="Copy Bank Name"
                                                                    style={{ cursor: 'pointer' }}
                                                                ></i>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-md-6">
                                                <div className="bank-info-item p-3 border rounded h-100">
                                                    <i className="bi bi-person fs-4 text-success me-2"></i>
                                                    <div className="flex-grow-1">
                                                        <div className="fw-bold">Account Holder</div>
                                                        <div className="d-flex align-items-center">
                                                            <span className="me-2">{selectedClient?.bankDetails?.accountHolderName || 'Not provided'}</span>
                                                            {selectedClient?.bankDetails?.accountHolderName && (
                                                                <i
                                                                    className="bi bi-clipboard cursor-pointer"
                                                                    onClick={() => {
                                                                        navigator.clipboard.writeText(selectedClient.bankDetails.accountHolderName);
                                                                        toast.success('Account Holder Name copied!');
                                                                    }}
                                                                    title="Copy Account Holder Name"
                                                                    style={{ cursor: 'pointer' }}
                                                                ></i>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-md-6">
                                                <div className="bank-info-item p-3 border rounded h-100">
                                                    <i className="bi bi-credit-card fs-4 text-info me-2"></i>
                                                    <div className="flex-grow-1">
                                                        <div className="fw-bold">Account Number</div>
                                                        <div className="d-flex align-items-center">
                                                            <span className="me-2">{selectedClient?.bankDetails?.accountNumber || 'Not provided'}</span>
                                                            {selectedClient?.bankDetails?.accountNumber && (
                                                                <i
                                                                    className="bi bi-clipboard cursor-pointer"
                                                                    onClick={() => {
                                                                        navigator.clipboard.writeText(selectedClient.bankDetails.accountNumber);
                                                                        toast.success('Account Number copied!');
                                                                    }}
                                                                    title="Copy Account Number"
                                                                    style={{ cursor: 'pointer' }}
                                                                ></i>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-md-6">
                                                <div className="bank-info-item p-3 border rounded h-100">
                                                    <i className="bi bi-building fs-4 text-warning me-2"></i>
                                                    <div className="flex-grow-1">
                                                        <div className="fw-bold">IFSC Code</div>
                                                        <div className="d-flex align-items-center">
                                                            <span className="me-2">{selectedClient?.bankDetails?.ifscCode || 'Not provided'}</span>
                                                            {selectedClient?.bankDetails?.ifscCode && (
                                                                <i
                                                                    className="bi bi-clipboard cursor-pointer"
                                                                    onClick={() => {
                                                                        navigator.clipboard.writeText(selectedClient.bankDetails.ifscCode);
                                                                        toast.success('IFSC Code copied!');
                                                                    }}
                                                                    title="Copy IFSC Code"
                                                                    style={{ cursor: 'pointer' }}
                                                                ></i>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-md-6">
                                                <div className="bank-info-item p-3 border rounded h-100">
                                                    <i className="bi bi-wallet2 fs-4 text-danger me-2"></i>
                                                    <div className="flex-grow-1">
                                                        <div className="fw-bold">Account Type</div>
                                                        <div className="d-flex align-items-center">
                                                            <span className="me-2">{selectedClient?.bankDetails?.accountType || 'Not provided'}</span>
                                                            {selectedClient?.bankDetails?.accountType && (
                                                                <i
                                                                    className="bi bi-clipboard cursor-pointer"
                                                                    onClick={() => {
                                                                        navigator.clipboard.writeText(selectedClient.bankDetails.accountType);
                                                                        toast.success('Account Type copied!');
                                                                    }}
                                                                    title="Copy Account Type"
                                                                    style={{ cursor: 'pointer' }}
                                                                ></i>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-md-6">
                                                <div className="bank-info-item p-3 border rounded h-100">
                                                    <i className="bi bi-phone fs-4 text-success me-2"></i>
                                                    <div className="flex-grow-1">
                                                        <div className="fw-bold">UPI ID</div>
                                                        <div className="d-flex align-items-center">
                                                            <span className="me-2">{selectedClient?.bankDetails?.upiId || 'Not provided'}</span>
                                                            {selectedClient?.bankDetails?.upiId && (
                                                                <i
                                                                    className="bi bi-clipboard cursor-pointer"
                                                                    onClick={() => {
                                                                        navigator.clipboard.writeText(selectedClient.bankDetails.upiId);
                                                                        toast.success('UPI ID copied!');
                                                                    }}
                                                                    title="Copy UPI ID"
                                                                    style={{ cursor: 'pointer' }}
                                                                ></i>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-md-6">
                                                <div className="bank-info-item p-3 border rounded h-100">
                                                    <i className="bi bi-app fs-4 text-primary me-2"></i>
                                                    <div className="flex-grow-1">
                                                        <div className="fw-bold">Payment App</div>
                                                        <div className="d-flex align-items-center">
                                                            <span className="me-2">{selectedClient?.bankDetails?.paymentApp || 'Not provided'}</span>
                                                            {selectedClient?.bankDetails?.paymentApp && (
                                                                <i
                                                                    className="bi bi-clipboard cursor-pointer"
                                                                    onClick={() => {
                                                                        navigator.clipboard.writeText(selectedClient.bankDetails.paymentApp);
                                                                        toast.success('Payment App copied!');
                                                                    }}
                                                                    title="Copy Payment App"
                                                                    style={{ cursor: 'pointer' }}
                                                                ></i>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {selectedClient?.bankDetails?.qrCode && (
                                                <div className="col-md-6">
                                                    <div className="bank-info-item p-3 border rounded h-100">
                                                        <i className="bi bi-qr-code fs-4 text-dark me-2"></i>
                                                        <div>
                                                            <div className="fw-bold">QR Code</div>
                                                            <div className="d-flex align-items-center gap-2 mt-2">
                                                                <img
                                                                    src={`${import.meta.env.VITE_BASE_URL}${selectedClient.bankDetails.qrCode}`}
                                                                    alt="QR Code"
                                                                    style={{ width: '100px', height: '100px', objectFit: 'contain', cursor: 'pointer' }}
                                                                    onClick={(e) => handleFileClick(
                                                                        e,
                                                                        `${import.meta.env.VITE_BASE_URL}${selectedClient.bankDetails.qrCode}`,
                                                                        'image',
                                                                        `${selectedClient.clientName} - QR Code`
                                                                    )}
                                                                />
                                                                <i
                                                                    className="bi bi-download fs-4 text-primary"
                                                                    style={{ cursor: 'pointer' }}
                                                                    onClick={() => handleDownload(
                                                                        selectedClient.bankDetails.qrCode,
                                                                        `${selectedClient.clientName}_qr_code${selectedClient.bankDetails.qrCode.substr(selectedClient.bankDetails.qrCode.lastIndexOf('.'))}`
                                                                    )}
                                                                    title="Download QR Code"
                                                                ></i>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Documents Modal */}
                        <div
                            className="modal fade"
                            id="documentsDetailsModal"
                            tabIndex={-1}
                            aria-hidden="true"
                            style={{ zIndex: 9999, marginLeft: '1rem' }}
                        >
                            <div className="modal-dialog modal-dialog-centered modal-lg" style={{ zIndex: 9999, marginLeft: '20rem' }}>
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title fw-bold">
                                            {selectedClient?.clientName || 'Member'}'s Documents
                                        </h5>
                                        <button
                                            type="button"
                                            className="btn-close"
                                            data-bs-dismiss="modal"
                                            aria-label="Close"
                                        />
                                    </div>
                                    <div className="modal-body">
                                        <div className="row g-3">
                                            {selectedClient?.clientDL && (
                                                <div className="col-md-6">
                                                    <div className="document-item p-3 border rounded h-100">
                                                        <div className="d-flex flex-column align-items-center">
                                                            <i className="bi bi-file-earmark-text fs-1 text-primary mb-2"></i>
                                                            <div className="fw-bold mb-2">Driving License</div>
                                                            <div className="d-flex justify-content-center gap-3 mt-2">
                                                                <button
                                                                    className="btn btn-sm btn-outline-primary"
                                                                    onClick={(e) => handleFileClick(
                                                                        e,
                                                                        `${import.meta.env.VITE_BASE_URL}${selectedClient.clientDL}`,
                                                                        'image',
                                                                        `${selectedClient.clientName} - Driving License`
                                                                    )}
                                                                >
                                                                    <i className="bi bi-eye me-1"></i> View
                                                                </button>
                                                                <button
                                                                    className="btn btn-sm btn-outline-success"
                                                                    onClick={() => handleDownload(
                                                                        selectedClient.clientDL,
                                                                        `${selectedClient.clientName}_driving_license${selectedClient.clientDL.substr(selectedClient.clientDL.lastIndexOf('.'))}`
                                                                    )}
                                                                >
                                                                    <i className="bi bi-download me-1"></i> Download
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {selectedClient?.clientPassport && (
                                                <div className="col-md-6">
                                                    <div className="document-item p-3 border rounded h-100">
                                                        <div className="d-flex flex-column align-items-center">
                                                            <i className="bi bi-file-earmark-text fs-1 text-success mb-2"></i>
                                                            <div className="fw-bold mb-2">Passport</div>
                                                            <div className="d-flex justify-content-center gap-3 mt-2">
                                                                <button
                                                                    className="btn btn-sm btn-outline-primary"
                                                                    onClick={(e) => handleFileClick(
                                                                        e,
                                                                        `${import.meta.env.VITE_BASE_URL}${selectedClient.clientPassport}`,
                                                                        'image',
                                                                        `${selectedClient.clientName} - Passport`
                                                                    )}
                                                                >
                                                                    <i className="bi bi-eye me-1"></i> View
                                                                </button>
                                                                <button
                                                                    className="btn btn-sm btn-outline-success"
                                                                    onClick={() => handleDownload(
                                                                        selectedClient.clientPassport,
                                                                        `${selectedClient.clientName}_passport${selectedClient.clientPassport.substr(selectedClient.clientPassport.lastIndexOf('.'))}`
                                                                    )}
                                                                >
                                                                    <i className="bi bi-download me-1"></i> Download
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {selectedClient?.clientAgentID && (
                                                <div className="col-md-6">
                                                    <div className="document-item p-3 border rounded h-100">
                                                        <div className="d-flex flex-column align-items-center">
                                                            <i className="bi bi-file-earmark-text fs-1 text-warning mb-2"></i>
                                                            <div className="fw-bold mb-2">Agent ID</div>
                                                            <div className="d-flex justify-content-center gap-3 mt-2">
                                                                <button
                                                                    className="btn btn-sm btn-outline-primary"
                                                                    onClick={(e) => handleFileClick(
                                                                        e,
                                                                        `${import.meta.env.VITE_BASE_URL}${selectedClient.clientAgentID}`,
                                                                        'image',
                                                                        `${selectedClient.clientName} - Agent ID`
                                                                    )}
                                                                >
                                                                    <i className="bi bi-eye me-1"></i> View
                                                                </button>
                                                                <button
                                                                    className="btn btn-sm btn-outline-success"
                                                                    onClick={() => handleDownload(
                                                                        selectedClient.clientAgentID,
                                                                        `${selectedClient.clientName}_agent_id${selectedClient.clientAgentID.substr(selectedClient.clientAgentID.lastIndexOf('.'))}`
                                                                    )}
                                                                >
                                                                    <i className="bi bi-download me-1"></i> Download
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {selectedClient?.clientGovtID && (
                                                <div className="col-md-6">
                                                    <div className="document-item p-3 border rounded h-100">
                                                        <div className="d-flex flex-column align-items-center">
                                                            <i className="bi bi-file-earmark-text fs-1 text-danger mb-2"></i>
                                                            <div className="fw-bold mb-2">Government ID</div>
                                                            <div className="d-flex justify-content-center gap-3 mt-2">
                                                                <button
                                                                    className="btn btn-sm btn-outline-primary"
                                                                    onClick={(e) => handleFileClick(
                                                                        e,
                                                                        `${import.meta.env.VITE_BASE_URL}${selectedClient.clientGovtID}`,
                                                                        'image',
                                                                        `${selectedClient.clientName} - Government ID`
                                                                    )}
                                                                >
                                                                    <i className="bi bi-eye me-1"></i> View
                                                                </button>
                                                                <button
                                                                    className="btn btn-sm btn-outline-success"
                                                                    onClick={() => handleDownload(
                                                                        selectedClient.clientGovtID,
                                                                        `${selectedClient.clientName}_govt_id${selectedClient.clientGovtID.substr(selectedClient.clientGovtID.lastIndexOf('.'))}`
                                                                    )}
                                                                >
                                                                    <i className="bi bi-download me-1"></i> Download
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {!selectedClient?.clientDL && !selectedClient?.clientPassport &&
                                                !selectedClient?.clientAgentID && !selectedClient?.clientGovtID && (
                                                    <div className="col-12 text-center py-5">
                                                        <i className="bi bi-exclamation-circle fs-1 text-muted"></i>
                                                        <h5 className="mt-3 text-muted">No documents available for this member</h5>
                                                    </div>
                                                )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                </div>
                <ToastContainer />
                <FloatingMenu userType="client" isMobile={isMobile} />
            </div>
        </>
    )
}

export default Client
