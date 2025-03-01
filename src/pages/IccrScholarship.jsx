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

                            <div className="input-group mb-3" style={{ width: '250px' }}>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search forms..."
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
                                            <h5 className="card-title">ICCR Form Submissions</h5>
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

