import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useLocation, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import axios from 'axios';
import FloatingMenu from '../Chats/FloatingMenu'
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Modal, Button, Spinner, Badge, Tabs, Tab, Row, Col } from 'react-bootstrap';

const IccrScholarship = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [iccrForms, setIccrForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [viewMode, setViewMode] = useState('list'); // Default is list view
    const [selectedFormId, setSelectedFormId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedForm, setSelectedForm] = useState(null);
    const [formDetailLoading, setFormDetailLoading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [formToDelete, setFormToDelete] = useState(null);
    const [iccr2Data, setIccr2Data] = useState([]);
    const [showIccr2Details, setShowIccr2Details] = useState(false);
    const [showIccr2Modal, setShowIccr2Modal] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [viewDetailLoading, setViewDetailLoading] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        fetchIccrForms();
    }, []);

    // Fetch ICCR form data
    const fetchIccrForms = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}api/form1`, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.data && response.data.data) {
                setIccrForms(response.data.data);
            } else {
                setError('Failed to fetch ICCR forms: Unexpected response structure');
            }
        } catch (err) {
            console.error("API Error:", err);
            setError('Error fetching ICCR forms: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    // Fetch single form details
    const fetchFormDetails = async (id) => {
        try {
            setFormDetailLoading(true);
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}api/form1/${id}`, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.data && response.data.data) {
                setSelectedForm(response.data.data);
                setShowModal(true);
            } else {
                toast.error('Failed to fetch form details: Unexpected response structure');
            }
        } catch (err) {
            console.error("API Error:", err);
            toast.error('Error fetching form details: ' + (err.response?.data?.message || err.message));
        } finally {
            setFormDetailLoading(false);
        }
    };

    // Handle view details
    const handleViewDetails = (id) => {
        fetchFormDetails(id);
    };

    // Close modal
    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedForm(null);
    };

    // Manual refresh function
    const handleRefresh = () => {
        fetchIccrForms();
    };

    // Show delete confirmation modal
    const showDeleteConfirmation = (id) => {
        setFormToDelete(id);
        setShowDeleteModal(true);
        document.body.classList.add('modal-open');
    };

    // Close delete modal
    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setFormToDelete(null);
        document.body.classList.remove('modal-open');
    };

    // Delete ICCR form
    const handleDelete = async () => {
        if (!formToDelete) return;

        try {
            setDeleteLoading(true);
            const response = await axios.delete(`${import.meta.env.VITE_BASE_URL}api/form1/${formToDelete}`, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.data && response.data.success) {
                // Remove the deleted form from the state
                setIccrForms(iccrForms.filter(form => form._id !== formToDelete));
                toast.success("Form deleted successfully!");
                closeDeleteModal();
                // Reload the page after 5 seconds
                setTimeout(() => {
                    window.location.reload();
                }, 5000);
            } else {
                toast.error("Failed to delete form: " + (response.data?.message || "Unknown error"));
            }
        } catch (err) {
            console.error("Delete Error:", err);
            toast.error("Error deleting form: " + (err.response?.data?.message || err.message));
        } finally {
            setDeleteLoading(false);
        }
    };

    // Filter forms based on search term
    const filteredForms = iccrForms.filter(form =>
        form.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        form.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        form.mobileNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        form.course?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredForms.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredForms.length / itemsPerPage);

    // Pagination controls
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

    // Page number chunking
    const pageLimit = 5;
    const startPage = Math.floor((currentPage - 1) / pageLimit) * pageLimit + 1;
    const endPage = Math.min(startPage + pageLimit - 1, totalPages);

    // Format date function with time
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
            return format(new Date(dateString), 'dd/MM/yyyy hh:mm a');
        } catch (error) {
            return "Invalid Date";
        }
    };

    // Format date function without time (for DOB)
    const formatDateOnly = (dateString) => {
        if (!dateString) return "N/A";
        try {
            return format(new Date(dateString), 'dd/MM/yyyy');
        } catch (error) {
            return "Invalid Date";
        }
    };

    // Function to fetch ICCR2 data
    const fetchIccr2Data = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:5000/api/iccr');
            setIccr2Data(response.data.data);
            setShowIccr2Modal(true);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching ICCR2 data:', error);
            setLoading(false);
            alert('Failed to fetch ICCR2 data. Please try again.');
        }
    };

    // Function to fetch single application details
    const fetchApplicationDetails = async (id) => {
        try {
            setViewDetailLoading(true);
            const response = await axios.get(`http://localhost:5000/api/iccr/${id}`);
            setSelectedApplication(response.data.data);
            setViewDetailLoading(false);
        } catch (error) {
            console.error('Error fetching application details:', error);
            setViewDetailLoading(false);
            alert('Failed to fetch application details. Please try again.');
        }
    };

    // Update the button click handler
    const handleIccr2ButtonClick = () => {
        fetchIccr2Data();
    };

    // Handle view details click
    const handleViewDetailsClick = (id) => {
        fetchApplicationDetails(id);
    };

    // Close application details modal
    const handleCloseDetails = () => {
        setSelectedApplication(null);
    };

    // Close ICCR2 modal
    const handleCloseIccr2Modal = () => {
        setShowIccr2Modal(false);
    };

    return (
        <div id="mytask-layout">
            <Sidebar />
            <div className="main px-lg-4 px-md-4">
                <Header />
                <div className="body d-flex py-lg-3 py-md-2">
                    <div className="container-xxl">
                        <div className="border-0 mb-3">
                            <div className="card-header py-3 no-bg bg-transparent d-flex align-items-center px-0 justify-content-between border-bottom flex-wrap">
                                <h3 className="fw-bold mb-0">ICCR Scholarship</h3>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleRefresh}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Loading...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-arrow-clockwise me-2"></i>
                                            Refresh Data
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="d-flex justify-content-between border-bottom mb-3">
                            <button
                                className="btn btn-outline-primary me-3 mb-3"
                                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                                title={viewMode === 'grid' ? "Switch to List View" : "Switch to Grid View"}
                            >
                                <i className={`bi ${viewMode === 'grid' ? 'bi-list-task' : 'bi-grid-3x3-gap-fill'}`}></i>
                            </button>

                            <button 
                                className="btn btn-outline-primary me-3 mb-3"
                                onClick={handleIccr2ButtonClick}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                        Loading...
                                    </>
                                ) : 'ICCR Form 2'}
                            </button>

                            <div className="input-group mb-3" style={{ width: '250px' }}>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <button type="button" className="btn btn-outline-secondary">
                                    <i className="fa fa-search" />
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="text-center">
                                <div className="spinner-border" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="alert alert-danger">{error}</div>
                        ) : (
                            <>
                                {viewMode === 'list' ? (
                                    // List View
                                    <div className="card">
                                        <div className="card-header">
                                            <h5 className="card-title">ICCR Form 1 Submissions</h5>
                                        </div>
                                        <div className="card-body">
                                            <div className="table-responsive">
                                                <table className="table table-hover align-middle mb-0">
                                                    <thead>
                                                        <tr>
                                                            <th className="text-center">S.No</th>
                                                            <th className="text-center">Name</th>
                                                            <th className="text-center">Email</th>
                                                            <th className="text-center">Mobile</th>
                                                            <th className="text-center">Course</th>
                                                            <th className="text-center">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {currentItems.length > 0 ? (
                                                            currentItems.map((form, index) => (
                                                                <tr key={form._id}>
                                                                    <td className="text-center">{indexOfFirstItem + index + 1}</td>
                                                                    <td className="text-center">{form.fullName}</td>
                                                                    <td className="text-center">{form.email}</td>
                                                                    <td className="text-center">{form.countryCode} {form.mobileNumber}</td>
                                                                    <td className="text-center">{form.course}</td>
                                                                    <td className="text-center">
                                                                        <div className="btn-group">
                                                                            <button
                                                                                className="btn icofont-eye text-primary fs-6 me-2"
                                                                                onClick={() => handleViewDetails(form._id)}
                                                                                disabled={formDetailLoading}
                                                                                title="View Details"
                                                                            >
                                                                            </button>
                                                                            <button
                                                                                className="btn icofont-ui-delete text-danger fs-6"
                                                                                onClick={() => showDeleteConfirmation(form._id)}
                                                                                disabled={deleteLoading}
                                                                                title="Delete"
                                                                            >
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        ) : (
                                                            <tr>
                                                                <td colSpan="6" className="text-center">No ICCR form submissions found</td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    // Grid View
                                    <div className="row">
                                        {currentItems.length > 0 ? (
                                            currentItems.map((form, index) => (
                                                <div className="col-md-4" key={form._id}>
                                                    <div
                                                        className="card mt-4 task-card"
                                                        style={{
                                                            height: 'auto',
                                                            minHeight: '250px'
                                                        }}
                                                    >
                                                        <div className="card-body d-flex flex-column">
                                                            <div className="d-flex justify-content-between">
                                                                <span className="fw-bold fs-5">{indexOfFirstItem + index + 1}. </span>
                                                                <h5 className="card-title text-capitalize fw-bold">
                                                                    {form.fullName}
                                                                </h5>
                                                            </div>

                                                            <div className="mt-3">
                                                                <div><span className="fw-semibold">Email: </span>{form.email}</div>
                                                                <div><span className="fw-semibold">Mobile: </span>{form.countryCode} {form.mobileNumber}</div>
                                                                <div><span className="fw-semibold">Course: </span>{form.course}</div>
                                                            </div>

                                                            <div className="mt-auto pt-3 d-flex justify-content-end">
                                                                <button
                                                                    className="btn btn-sm btn-primary me-2"
                                                                    onClick={() => handleViewDetails(form._id)}
                                                                    disabled={formDetailLoading}
                                                                >
                                                                    <i className="icofont-eye me-1"></i>
                                                                    View
                                                                </button>
                                                                <button
                                                                    className="btn btn-sm btn-danger"
                                                                    onClick={() => showDeleteConfirmation(form._id)}
                                                                    disabled={deleteLoading}
                                                                >
                                                                    <i className="icofont-ui-delete me-1"></i>
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="col-12 text-center mt-4">
                                                <p>No ICCR form submissions found</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Pagination controls */}
                                <div className="row mt-3">
                                    <div className="col-12 col-md-6 mb-3">
                                        <div className="d-flex align-items-center">
                                            <label htmlFor="itemsPerPage" className="form-label me-2 mb-0">Items per page:</label>
                                            <select
                                                id="itemsPerPage"
                                                className="form-select"
                                                style={{ width: 'auto' }}
                                                value={itemsPerPage}
                                                onChange={(e) => {
                                                    setItemsPerPage(e.target.value === 'all' ? filteredForms.length : parseInt(e.target.value, 10));
                                                    setCurrentPage(1);
                                                }}
                                            >
                                                <option value="10">10</option>
                                                <option value="25">25</option>
                                                <option value="50">50</option>
                                                <option value="100">100</option>
                                                <option value="all">Show All</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <nav aria-label="Page navigation">
                                            <ul className="pagination justify-content-md-end">
                                                <li className="page-item">
                                                    <button onClick={prevPage} className="page-link" disabled={currentPage === 1}>
                                                        &laquo;
                                                    </button>
                                                </li>
                                                {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((page) => (
                                                    <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                                                        <button onClick={() => paginate(page)} className="page-link bg-white">
                                                            {page}
                                                        </button>
                                                    </li>
                                                ))}
                                                {endPage < totalPages && (
                                                    <li className="page-item">
                                                        <button onClick={nextPage} className="page-link">
                                                            &raquo;
                                                        </button>
                                                    </li>
                                                )}
                                            </ul>
                                        </nav>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Add a section to display ICCR2 data */}
                        {showIccr2Details && (
                            <div className="mt-4">
                                <h3>ICCR Form 2 Applications</h3>
                                {iccr2Data.length > 0 ? (
                                    <div className="table-responsive">
                                        <table className="table table-striped table-hover">
                                            <thead>
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Email</th>
                                                    <th>Course Level</th>
                                                    <th>Course Stream</th>
                                                    <th>Status</th>
                                                    <th>Date Applied</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {iccr2Data.map((application) => (
                                                    <tr key={application._id}>
                                                        <td>{application.fullName}</td>
                                                        <td>{application.email}</td>
                                                        <td>{application.levelOfCourse}</td>
                                                        <td>{application.courseMainStream}</td>
                                                        <td>
                                                            <span className={`badge ${
                                                                application.status === 'Approved' ? 'bg-success' :
                                                                application.status === 'Rejected' ? 'bg-danger' :
                                                                application.status === 'Under Review' ? 'bg-warning' : 'bg-secondary'
                                                            }`}>
                                                                {application.status}
                                                            </span>
                                                        </td>
                                                        <td>{new Date(application.createdAt).toLocaleDateString()}</td>
                                                        <td>
                                                            <button 
                                                                className="btn btn-sm btn-primary me-2"
                                                                
                                                            >
                                                                View Details
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="alert alert-info">
                                        No ICCR Form 2 applications found.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal for viewing form details */}
            {showModal && selectedForm && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content" style={{ marginLeft: '1rem' }}>
                            <div className="modal-header">
                                <h5 className="modal-title">ICCR Form Details</h5>
                                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                            </div>
                            <div className="modal-body">
                                {formDetailLoading ? (
                                    <div className="text-center">
                                        <div className="spinner-border" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="container">
                                        <div className="row mb-3">
                                            <div className="col-12">
                                                <h4 className="border-bottom pb-2">Personal Information</h4>
                                            </div>
                                            <div className="col-md-6">
                                                <p><strong>Full Name:</strong> {selectedForm.fullName || 'N/A'}</p>
                                                <p><strong>Email:</strong> {selectedForm.email || 'N/A'}</p>
                                                <p><strong>Mobile:</strong> {selectedForm.countryCode} {selectedForm.mobileNumber || 'N/A'}</p>
                                            </div>
                                            <div className="col-md-6">
                                                <p><strong>Date of Birth:</strong> {formatDateOnly(selectedForm.dateOfBirth)}</p>
                                                <p><strong>Gender:</strong> {selectedForm.gender || 'N/A'}</p>
                                                <p><strong>Last Qualification:</strong> {selectedForm.lastQualification || 'N/A'}</p>
                                            </div>
                                        </div>

                                        <div className="row mb-3">
                                            <div className="col-12">
                                                <h4 className="border-bottom pb-2">Course Information</h4>
                                            </div>
                                            <div className="col-md-6">
                                                <p><strong>Course:</strong> {selectedForm.course || 'N/A'}</p>
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-12">
                                                <h4 className="border-bottom pb-2">Application Information</h4>
                                            </div>
                                            <div className="col-md-6">
                                                <p><strong>Application Date:</strong> {formatDate(selectedForm.createdAt)}</p>
                                            </div>
                                            <div className="col-md-6">
                                                <p><strong>Last Updated:</strong> {formatDate(selectedForm.updatedAt)}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <div
                className={`modal fade ${showDeleteModal ? 'show' : ''}`}
                id="deleteproject"
                tabIndex={-1}
                aria-hidden={!showDeleteModal}
                style={{
                    display: showDeleteModal ? 'block' : 'none',
                    backgroundColor: showDeleteModal ? 'rgba(0,0,0,0.5)' : 'transparent',
                    paddingRight: '17px'
                }}
            >
                <div className="modal-dialog modal-dialog-centered modal-md modal-dialog-scrollable">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5
                                className="modal-title fw-bold"
                                id="deleteprojectLabel"
                            >
                                Delete item Permanently?
                            </h5>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={closeDeleteModal}
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
                                onClick={closeDeleteModal}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn btn-danger color-fff"
                                onClick={handleDelete}
                                disabled={deleteLoading}
                            >
                                {deleteLoading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Deleting...
                                    </>
                                ) : (
                                    "Delete"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ICCR2 Applications Modal */}
            <Modal 
                show={showIccr2Modal} 
                onHide={handleCloseIccr2Modal}
                size="xl"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>ICCR Form 2 Applications</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {iccr2Data.length > 0 ? (
                        <div className="table-responsive">
                            <table className="table table-striped table-hover">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Course Level</th>
                                        <th>Course Stream</th>
                                        <th>Status</th>
                                        <th>Date Applied</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {iccr2Data.map((application) => (
                                        <tr key={application._id}>
                                            <td>{application.fullName}</td>
                                            <td>{application.email}</td>
                                            <td>{application.levelOfCourse}</td>
                                            <td>{application.courseMainStream}</td>
                                            <td>
                                                <Badge bg={
                                                    application.status === 'Approved' ? 'success' :
                                                    application.status === 'Rejected' ? 'danger' :
                                                    application.status === 'Under Review' ? 'warning' : 'secondary'
                                                }>
                                                    {application.status}
                                                </Badge>
                                            </td>
                                            <td>{new Date(application.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                <Button 
                                                    variant="primary" 
                                                    size="sm"
                                                    onClick={() => handleViewDetailsClick(application._id)}
                                                >
                                                    View Details
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="alert alert-info">
                            No ICCR Form 2 applications found.
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseIccr2Modal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
            
            {/* Application Details Modal */}
            <Modal 
                show={selectedApplication !== null} 
                onHide={handleCloseDetails}
                size="xl"
                centered
                dialogClassName="modal-90w"
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        Application Details
                        {selectedApplication && (
                            <Badge 
                                bg={
                                    selectedApplication.status === 'Approved' ? 'success' :
                                    selectedApplication.status === 'Rejected' ? 'danger' :
                                    selectedApplication.status === 'Under Review' ? 'warning' : 'secondary'
                                }
                                className="ms-3"
                            >
                                {selectedApplication?.status}
                            </Badge>
                        )}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {viewDetailLoading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                            <p className="mt-3">Loading application details...</p>
                        </div>
                    ) : selectedApplication ? (
                        <Tabs defaultActiveKey="personal" className="mb-4">
                            <Tab eventKey="personal" title="Personal Information">
                                <Row className="mb-3">
                                    <Col md={3}>
                                        <div className="text-center mb-3">
                                            {selectedApplication.studentPhoto ? (
                                                <img 
                                                    src={`http://localhost:5000/${selectedApplication.studentPhoto.replace(/\\/g, '/')}`} 
                                                    alt="Student" 
                                                    className="img-thumbnail" 
                                                    style={{ maxWidth: '150px', maxHeight: '150px' }}
                                                />
                                            ) : (
                                                <div className="border p-3 text-center">No Photo</div>
                                            )}
                                        </div>
                                    </Col>
                                    <Col md={9}>
                                        <Row>
                                            <Col md={6}>
                                                <p><strong>Full Name:</strong> {selectedApplication.fullName}</p>
                                                <p><strong>Gender:</strong> {selectedApplication.gender}</p>
                                                <p><strong>Date of Birth:</strong> {selectedApplication.dateOfBirth ? new Date(selectedApplication.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
                                                <p><strong>Place of Birth:</strong> {selectedApplication.placeOfBirth}</p>
                                            </Col>
                                            <Col md={6}>
                                                <p><strong>Email:</strong> {selectedApplication.email}</p>
                                                <p><strong>Mobile:</strong> {selectedApplication.mobileNumber}</p>
                                                <p><strong>WhatsApp:</strong> {selectedApplication.whatsappNumber || 'N/A'}</p>
                                                <p><strong>Country:</strong> {selectedApplication.addressCountry}</p>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                                
                                <h5 className="mt-4">Passport Details</h5>
                                <Row>
                                    <Col md={3}>
                                        <p><strong>Passport No:</strong> {selectedApplication.passport}</p>
                                    </Col>
                                    <Col md={3}>
                                        <p><strong>Issue Place:</strong> {selectedApplication.passportCountry}</p>
                                    </Col>
                                    <Col md={3}>
                                        <p><strong>Issue Date:</strong> {selectedApplication.passportIssueDate ? new Date(selectedApplication.passportIssueDate).toLocaleDateString() : 'N/A'}</p>
                                    </Col>
                                    <Col md={3}>
                                        <p><strong>Expiry Date:</strong> {selectedApplication.passportExpiryDate ? new Date(selectedApplication.passportExpiryDate).toLocaleDateString() : 'N/A'}</p>
                                    </Col>
                                </Row>
                                
                                <h5 className="mt-4">Address</h5>
                                <Row>
                                    <Col md={12}>
                                        <p><strong>Address:</strong> {selectedApplication.addressLine}</p>
                                    </Col>
                                    <Col md={3}>
                                        <p><strong>City:</strong> {selectedApplication.city}</p>
                                    </Col>
                                    <Col md={3}>
                                        <p><strong>State:</strong> {selectedApplication.state}</p>
                                    </Col>
                                    <Col md={3}>
                                        <p><strong>Country:</strong> {selectedApplication.addressCountry}</p>
                                    </Col>
                                    <Col md={3}>
                                        <p><strong>Zipcode:</strong> {selectedApplication.zipcode}</p>
                                    </Col>
                                </Row>
                                
                                <h5 className="mt-4">Parent Information</h5>
                                <Row>
                                    <Col md={6}>
                                        <p><strong>Father's Name:</strong> {selectedApplication.fatherName}</p>
                                        <p><strong>Father's Phone:</strong> {selectedApplication.fatherPhone}</p>
                                        <p><strong>Father's Email:</strong> {selectedApplication.fatherEmail}</p>
                                    </Col>
                                    <Col md={6}>
                                        <p><strong>Mother's Name:</strong> {selectedApplication.motherName}</p>
                                        <p><strong>Mother's Phone:</strong> {selectedApplication.motherPhone}</p>
                                        <p><strong>Mother's Email:</strong> {selectedApplication.motherEmail}</p>
                                    </Col>
                                </Row>
                            </Tab>
                            
                            <Tab eventKey="education" title="Education">
                                <h5>English Proficiency</h5>
                                <Row className="mb-4">
                                    <Col md={3}>
                                        <p><strong>English Proficiency:</strong> {selectedApplication.englishProficiency1}</p>
                                    </Col>
                                    <Col md={3}>
                                        <p><strong>Level:</strong> {selectedApplication.tillWhatLevel1}</p>
                                    </Col>
                                    <Col md={3}>
                                        <p><strong>Score:</strong> {selectedApplication.score1}</p>
                                    </Col>
                                    <Col md={3}>
                                        <p><strong>TOEFL/IELTS/Duolingo:</strong> {selectedApplication.englishProficiency2}</p>
                                    </Col>
                                    {selectedApplication.toeflScore && (
                                        <Col md={3}>
                                            <p><strong>TOEFL Score:</strong> {selectedApplication.toeflScore}</p>
                                        </Col>
                                    )}
                                    {selectedApplication.ieltsScore && (
                                        <Col md={3}>
                                            <p><strong>IELTS Score:</strong> {selectedApplication.ieltsScore}</p>
                                        </Col>
                                    )}
                                    {selectedApplication.duolingoScore && (
                                        <Col md={3}>
                                            <p><strong>Duolingo Score:</strong> {selectedApplication.duolingoScore}</p>
                                        </Col>
                                    )}
                                </Row>
                                
                                <h5>Previous Education</h5>
                                {selectedApplication.previousEducations && selectedApplication.previousEducations.length > 0 ? (
                                    <div className="table-responsive">
                                        <table className="table table-bordered">
                                            <thead>
                                                <tr>
                                                    <th>Degree/Certificate</th>
                                                    <th>Country</th>
                                                    <th>Board/University</th>
                                                    <th>School/College</th>
                                                    <th>Subjects</th>
                                                    <th>Year</th>
                                                    <th>Percentage/Grade</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedApplication.previousEducations.map((edu, index) => (
                                                    <tr key={index}>
                                                        <td>{edu.degree}</td>
                                                        <td>{edu.country}</td>
                                                        <td>{edu.board}</td>
                                                        <td>{edu.school}</td>
                                                        <td>{edu.subject}</td>
                                                        <td>{edu.year}</td>
                                                        <td>{edu.percentage}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p>No previous education details available</p>
                                )}
                                
                                <h5 className="mt-4">Course Information</h5>
                                <Row>
                                    <Col md={4}>
                                        <p><strong>Academic Year:</strong> {selectedApplication.academicYear}</p>
                                    </Col>
                                    <Col md={4}>
                                        <p><strong>Level of Course:</strong> {selectedApplication.levelOfCourse}</p>
                                    </Col>
                                    <Col md={4}>
                                        <p><strong>Course Main Stream:</strong> {selectedApplication.courseMainStream}</p>
                                    </Col>
                                </Row>
                                
                                {selectedApplication.essay && (
                                    <div className="mt-4">
                                        <h5>Essay</h5>
                                        <div className="border p-3 bg-light">
                                            {selectedApplication.essay}
                                        </div>
                                    </div>
                                )}
                            </Tab>
                            
                            <Tab eventKey="preferences" title="University Preferences">
                                {selectedApplication.universityPreferences && selectedApplication.universityPreferences.length > 0 ? (
                                    <div className="table-responsive">
                                        <table className="table table-bordered">
                                            <thead>
                                                <tr>
                                                    <th>Preference</th>
                                                    <th>University</th>
                                                    <th>Course</th>
                                                    <th>Subject</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedApplication.universityPreferences.map((pref, index) => (
                                                    <tr key={index}>
                                                        <td>{pref.preference}</td>
                                                        <td>{pref.university}</td>
                                                        <td>{pref.course}</td>
                                                        <td>{pref.subject}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p>No university preferences available</p>
                                )}
                            </Tab>
                            
                            <Tab eventKey="references" title="References & Contacts">
                                <h5>References</h5>
                                {selectedApplication.references && selectedApplication.references.length > 0 ? (
                                    <div className="table-responsive mb-4">
                                        <table className="table table-bordered">
                                            <thead>
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Occupation</th>
                                                    <th>Email</th>
                                                    <th>Phone</th>
                                                    <th>Address</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedApplication.references.map((ref, index) => (
                                                    <tr key={index}>
                                                        <td>{ref.name}</td>
                                                        <td>{ref.occupation}</td>
                                                        <td>{ref.email}</td>
                                                        <td>{ref.phone}</td>
                                                        <td>{ref.address}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p>No references available</p>
                                )}
                                
                                <h5 className="mt-4">Indian Contacts</h5>
                                {selectedApplication.indianContacts && selectedApplication.indianContacts.length > 0 ? (
                                    <div className="table-responsive">
                                        <table className="table table-bordered">
                                            <thead>
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Relationship</th>
                                                    <th>Occupation</th>
                                                    <th>Telephone</th>
                                                    <th>Email</th>
                                                    <th>Address</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedApplication.indianContacts.map((contact, index) => (
                                                    <tr key={index}>
                                                        <td>{contact.contactName}</td>
                                                        <td>{contact.relationship}</td>
                                                        <td>{contact.occupation}</td>
                                                        <td>{contact.telephone}</td>
                                                        <td>{contact.email}</td>
                                                        <td>{contact.address}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p>No Indian contacts available</p>
                                )}
                            </Tab>
                            
                            <Tab eventKey="additional" title="Additional Information">
                                <Row>
                                    <Col md={6}>
                                        <p><strong>Travelled to India:</strong> {selectedApplication.travelledInIndia}</p>
                                        <p><strong>Previous ICCR Scholarship:</strong> {selectedApplication.previousICCRScholarship}</p>
                                        <p><strong>Indian Resident:</strong> {selectedApplication.residenceInIndia}</p>
                                    </Col>
                                    <Col md={6}>
                                        <p><strong>Married to Indian:</strong> {selectedApplication.marriedToIndian}</p>
                                        <p><strong>International Driving License:</strong> {selectedApplication.internationalDrivingLicense}</p>
                                        <p><strong>Other Information:</strong> {selectedApplication.otherInformation || 'N/A'}</p>
                                    </Col>
                                </Row>
                                
                                <Row className="mt-4">
                                    <Col md={6}>
                                        <p><strong>Declaration Date:</strong> {selectedApplication.dateOfApplication ? new Date(selectedApplication.dateOfApplication).toLocaleDateString() : 'N/A'}</p>
                                    </Col>
                                    <Col md={6}>
                                        <p><strong>Declaration Place:</strong> {selectedApplication.placeOfApplication}</p>
                                    </Col>
                                </Row>
                                
                                {selectedApplication.signature && (
                                    <div className="mt-4">
                                        <h5>Signature</h5>
                                        <img 
                                            src={`http://localhost:5000/${selectedApplication.signature.replace(/\\/g, '/')}`} 
                                            alt="Signature" 
                                            className="img-thumbnail" 
                                            style={{ maxWidth: '300px' }}
                                        />
                                    </div>
                                )}
                            </Tab>
                            
                            <Tab eventKey="documents" title="Documents">
                                <Row className="mt-3">
                                    {selectedApplication.permanentUniqueId && (
                                        <Col md={4} className="mb-4">
                                            <div className="card">
                                                <div className="card-header">Permanent Unique ID</div>
                                                <div className="card-body text-center">
                                                    <a 
                                                        href={`http://localhost:5000/${selectedApplication.permanentUniqueId.replace(/\\/g, '/')}`} 
                                                        target="_blank" 
                                                        rel="noreferrer"
                                                        className="btn btn-primary"
                                                    >
                                                        View Document
                                                    </a>
                                                </div>
                                            </div>
                                        </Col>
                                    )}
                                    
                                    {selectedApplication.passportCopy && (
                                        <Col md={4} className="mb-4">
                                            <div className="card">
                                                <div className="card-header">Passport Copy</div>
                                                <div className="card-body text-center">
                                                    <a 
                                                        href={`http://localhost:5000/${selectedApplication.passportCopy.replace(/\\/g, '/')}`} 
                                                        target="_blank" 
                                                        rel="noreferrer"
                                                        className="btn btn-primary"
                                                    >
                                                        View Document
                                                    </a>
                                                </div>
                                            </div>
                                        </Col>
                                    )}
                                    
                                    {selectedApplication.gradeXMarksheet && (
                                        <Col md={4} className="mb-4">
                                            <div className="card">
                                                <div className="card-header">Grade X Marksheet</div>
                                                <div className="card-body text-center">
                                                    <a 
                                                        href={`http://localhost:5000/${selectedApplication.gradeXMarksheet.replace(/\\/g, '/')}`} 
                                                        target="_blank" 
                                                        rel="noreferrer"
                                                        className="btn btn-primary"
                                                    >
                                                        View Document
                                                    </a>
                                                </div>
                                            </div>
                                        </Col>
                                    )}
                                    
                                    {selectedApplication.gradeXIIMarksheet && (
                                        <Col md={4} className="mb-4">
                                            <div className="card">
                                                <div className="card-header">Grade XII Marksheet</div>
                                                <div className="card-body text-center">
                                                    <a 
                                                        href={`http://localhost:5000/${selectedApplication.gradeXIIMarksheet.replace(/\\/g, '/')}`} 
                                                        target="_blank" 
                                                        rel="noreferrer"
                                                        className="btn btn-primary"
                                                    >
                                                        View Document
                                                    </a>
                                                </div>
                                            </div>
                                        </Col>
                                    )}
                                    
                                    {selectedApplication.medicalFitnessCertificate && (
                                        <Col md={4} className="mb-4">
                                            <div className="card">
                                                <div className="card-header">Medical Fitness Certificate</div>
                                                <div className="card-body text-center">
                                                    <a 
                                                        href={`http://localhost:5000/${selectedApplication.medicalFitnessCertificate.replace(/\\/g, '/')}`} 
                                                        target="_blank" 
                                                        rel="noreferrer"
                                                        className="btn btn-primary"
                                                    >
                                                        View Document
                                                    </a>
                                                </div>
                                            </div>
                                        </Col>
                                    )}
                                    
                                    {selectedApplication.englishTranslationOfDocuments && (
                                        <Col md={4} className="mb-4">
                                            <div className="card">
                                                <div className="card-header">English Translation of Documents</div>
                                                <div className="card-body text-center">
                                                    <a 
                                                        href={`http://localhost:5000/${selectedApplication.englishTranslationOfDocuments.replace(/\\/g, '/')}`} 
                                                        target="_blank" 
                                                        rel="noreferrer"
                                                        className="btn btn-primary"
                                                    >
                                                        View Document
                                                    </a>
                                                </div>
                                            </div>
                                        </Col>
                                    )}
                                    
                                    {selectedApplication.englishAsSubjectDocument && (
                                        <Col md={4} className="mb-4">
                                            <div className="card">
                                                <div className="card-header">English as Subject Document</div>
                                                <div className="card-body text-center">
                                                    <a 
                                                        href={`http://localhost:5000/${selectedApplication.englishAsSubjectDocument.replace(/\\/g, '/')}`} 
                                                        target="_blank" 
                                                        rel="noreferrer"
                                                        className="btn btn-primary"
                                                    >
                                                        View Document
                                                    </a>
                                                </div>
                                            </div>
                                        </Col>
                                    )}
                                    
                                    {selectedApplication.anyOtherDocument && (
                                        <Col md={4} className="mb-4">
                                            <div className="card">
                                                <div className="card-header">Other Document</div>
                                                <div className="card-body text-center">
                                                    <a 
                                                        href={`http://localhost:5000/${selectedApplication.anyOtherDocument.replace(/\\/g, '/')}`} 
                                                        target="_blank" 
                                                        rel="noreferrer"
                                                        className="btn btn-primary"
                                                    >
                                                        View Document
                                                    </a>
                                                </div>
                                            </div>
                                        </Col>
                                    )}
                                </Row>
                            </Tab>
                        </Tabs>
                    ) : (
                        <div className="alert alert-danger">
                            Failed to load application details.
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    {selectedApplication && (
                        <>
                            <Button variant="success" className="me-2">
                                Approve
                            </Button>
                            <Button variant="danger" className="me-2">
                                Reject
                            </Button>
                            <Button variant="warning" className="me-2">
                                Mark as Under Review
                            </Button>
                        </>
                    )}
                    <Button variant="secondary" onClick={handleCloseDetails}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            <ToastContainer />
            <FloatingMenu userType="admin" isMobile={isMobile} />

            {/* Modal backdrop */}
            {showDeleteModal && (
                <div
                    className="modal-backdrop fade show"
                    onClick={closeDeleteModal}
                ></div>
            )}
        </div>
    );
};

export default IccrScholarship;

