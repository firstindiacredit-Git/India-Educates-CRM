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

const CreditLines = () => {
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [editLoanData, setEditLoanData] = useState({
        amount: '',
        remainingAmount: '',
        description: '',
        date: '',
        status: '',
        studentId: '',
        _id: ''
    });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [selectedLoanId, setSelectedLoanId] = useState(null);
    const [selectedStudentId, setSelectedStudentId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [viewMode, setViewMode] = useState('list');

    useEffect(() => {
        const fetchLoans = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${import.meta.env.VITE_BASE_URL}api/all-loans`);
                setLoans(response.data.loans || []);
                console.log(response.data.loans);
            } catch (error) {
                toast.error("Error fetching loans");
                console.error(error);
                setLoans([]);
            } finally {
                setLoading(false);
            }
        };
        fetchLoans();
    }, []);

    const handleLoanDeleteClick = (loanId, studentId) => {
        setSelectedLoanId(loanId);
        setSelectedStudentId(studentId);
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setSelectedLoanId(null);
        setSelectedStudentId(null);
    };

    const handleDelete = async () => {
        setDeleteLoading(true);
        try {
            await axios.delete(
                `${import.meta.env.VITE_BASE_URL}api/student/${selectedStudentId}/loan/${selectedLoanId}`
            );
            closeDeleteModal();
            toast.success("Loan deleted successfully", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            setLoans(loans.filter(loan => loan._id !== selectedLoanId));
            //Reload in 5 seconds
            setTimeout(() => {
                window.location.reload();
            }, 5000);
        } catch (error) {
            toast.error("Error deleting loan", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            console.error(error);
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleEditClick = (loan) => {
        setEditLoanData({
            amount: loan.amount,
            remainingAmount: loan.remainingAmount,
            description: loan.description,
            date: new Date(loan.date),
            status: loan.status,
            studentId: loan.studentId,
            _id: loan._id
        });
        setShowEditModal(true);
    };

    const closeEditModal = () => {
        setShowEditModal(false);
        setEditLoanData({
            amount: '',
            remainingAmount: '',
            description: '',
            date: '',
            status: '',
            studentId: '',
            _id: ''
        });
    };

    const handleUpdate = async () => {
        setEditLoading(true);
        try {
            await axios.put(
                `${import.meta.env.VITE_BASE_URL}api/student/${editLoanData.studentId}/loan/${editLoanData._id}`,
                editLoanData
            );
            closeEditModal();
            toast.success("Loan updated successfully", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            // Refresh loans list
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}api/all-loans`);
            setLoans(response.data.loans || []);
            //Reload in 5 seconds
            setTimeout(() => {
                window.location.reload();
            }, 5000);
        } catch (error) {
            toast.error("Error updating loan", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            console.error(error);
        } finally {
            setEditLoading(false);
        }
    };

    const filteredLoans = loans.filter(loan =>
        loan.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.status?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredLoans.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredLoans.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

    const pageLimit = 5;
    const startPage = Math.floor((currentPage - 1) / pageLimit) * pageLimit + 1;
    const endPage = Math.min(startPage + pageLimit - 1, totalPages);

    return (
        <div id="mytask-layout">
            <Sidebar />
            <div className="main px-lg-4 px-md-4">
                <Header />
                <div className="body d-flex py-lg-3 py-md-2">
                    <div className="container-xxl">
                        <div className="border-0 mb-3">
                            <div className="card-header py-3 no-bg bg-transparent d-flex align-items-center px-0 justify-content-between border-bottom flex-wrap">
                                <h3 className="fw-bold mb-0">Credit Lines</h3>
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
                                        <div className="text-center">Loading...</div>
                                    ) : (
                            <>
                                {viewMode === 'list' ? (
                                    <div className="card">
                                        <div className="card-body">
                                        <table className="table table-hover align-middle mb-0">
                                            <thead>
                                                <tr>
                                                    <th>Sr.No</th>
                                                    <th>Student Name</th>
                                                    <th>Amount</th>
                                                    <th>Remaining</th>
                                                    <th>Description</th>
                                                    <th>Due Date</th>
                                                    <th>Status</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                    {currentItems.map((loan, index) => (
                                                    <tr key={loan._id}>
                                                            <td>{indexOfFirstItem + index + 1}</td>
                                                        <td>{loan.studentImage ? <img src={`${import.meta.env.VITE_BASE_URL}${loan.studentImage}`} alt="Student" style={{ width: '30px', height: '30px', borderRadius: '50%' }} /> : 'N/A'} {loan.studentName}</td>
                                                        <td className="text-success">₹{loan.amount}</td>
                                                        <td className="text-danger">₹{loan.remainingAmount}</td>
                                                        <td>{loan.description}</td>
                                                        <td>{new Date(loan.date).toLocaleDateString()}</td>

                                                        <td>
                                                            <span className={`badge ${loan.status === 'PAID'
                                                                ? 'bg-success'
                                                                : loan.status === 'PARTIALLY_PAID'
                                                                    ? 'bg-warning'
                                                                    : 'bg-primary'
                                                                }`}>
                                                                {loan.status}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div className="btn-group" role="group">
                                                                <button
                                                                    className="btn btn-sm btn-outline-secondary"
                                                                    onClick={() => handleEditClick(loan)}
                                                                >
                                                                    <i className="icofont-edit text-success"></i>
                                                                </button>
                                                                <button
                                                                    className="btn btn-sm btn-outline-secondary"
                                                                    onClick={() => handleLoanDeleteClick(loan._id, loan.studentId)}
                                                                >
                                                                    <i className="icofont-ui-delete text-danger"></i>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="row">
                                        {currentItems.map((loan, index) => (
                                            <div className="col-md-4" key={loan._id}>
                                                <div className="card mt-4 task-card">
                                                    <div className="card-body d-flex flex-column">
                                                        <div className="d-flex justify-content-between">
                                                            <span className="fw-bold fs-5">{indexOfFirstItem + index + 1}. </span>
                                                            <h5 className="card-title text-capitalize fw-bold">
                                                                {loan.studentName}
                                                            </h5>
                                                        </div>
                                                        <div className="mt-3">
                                                            <div><span className="fw-semibold">Amount: </span>₹{loan.amount}</div>
                                                            <div><span className="fw-semibold">Remaining: </span>₹{loan.remainingAmount}</div>
                                                            <div><span className="fw-semibold">Description: </span>{loan.description}</div>
                                                            <div><span className="fw-semibold">Due Date: </span>{new Date(loan.date).toLocaleDateString()}</div>
                                                            <div><span className="fw-semibold">Status: </span>
                                                                <span className={`badge ${loan.status === 'PAID'
                                                                    ? 'bg-success'
                                                                    : loan.status === 'PARTIALLY_PAID'
                                                                        ? 'bg-warning'
                                                                        : 'bg-primary'
                                                                    }`}>
                                                                    {loan.status}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="mt-auto pt-3 d-flex justify-content-end">
                                                            <button
                                                                className="btn btn-sm btn-outline-secondary me-2"
                                                                onClick={() => handleEditClick(loan)}
                                                            >
                                                                <i className="icofont-edit text-success"></i>
                                                            </button>
                                                            <button
                                                                className="btn btn-sm btn-outline-secondary"
                                                                onClick={() => handleLoanDeleteClick(loan._id, loan.studentId)}
                                                            >
                                                                <i className="icofont-ui-delete text-danger"></i>
                                                            </button>
                                </div>
                            </div>
                        </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

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
                                                    setItemsPerPage(e.target.value === 'all' ? filteredLoans.length : parseInt(e.target.value, 10));
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
                                                <li className="page-item">
                                                    <button onClick={nextPage} className="page-link" disabled={currentPage === totalPages}>
                                                        &raquo;
                                                    </button>
                                                </li>
                                            </ul>
                                        </nav>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

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
                            <h5 className="modal-title fw-bold" id="deleteprojectLabel">
                                Delete item Permanently?
                            </h5>
                            <button type="button" className="btn-close" onClick={closeDeleteModal} aria-label="Close" />
                        </div>
                        <div className="modal-body justify-content-center flex-column d-flex">
                            <i className="icofont-ui-delete text-danger display-2 text-center mt-2" />
                            <p className="mt-4 fs-5 text-center">
                                You can only delete this item Permanently
                            </p>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={closeDeleteModal}>
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

            <div 
                className={`modal fade ${showEditModal ? 'show' : ''}`} 
                tabIndex={-1} 
                aria-hidden={!showEditModal}
                style={{ 
                    display: showEditModal ? 'block' : 'none', 
                    backgroundColor: showEditModal ? 'rgba(0,0,0,0.5)' : 'transparent',
                    paddingRight: '17px' 
                }}
            >
                <div className="modal-dialog modal-dialog-centered modal-lg" style={{marginLeft:"20rem"}}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Edit Loan</h5>
                            <button type="button" className="btn-close" onClick={closeEditModal}></button>
                        </div>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label className="form-label">Amount</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={editLoanData.amount}
                                    onChange={(e) => setEditLoanData({...editLoanData, amount: e.target.value})}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Remaining Amount</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={editLoanData.remainingAmount}
                                    onChange={(e) => setEditLoanData({...editLoanData, remainingAmount: e.target.value})}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Description</label>
                                <textarea
                                    className="form-control"
                                    value={editLoanData.description}
                                    onChange={(e) => setEditLoanData({...editLoanData, description: e.target.value})}
                                ></textarea>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Due Date</label>
                                <DatePicker
                                    selected={editLoanData.date ? new Date(editLoanData.date) : null}
                                    onChange={(date) => setEditLoanData({...editLoanData, date})}
                                    className="form-control"
                                    dateFormat="dd/MM/yyyy"
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Status</label>
                                <select
                                    className="form-select"
                                    value={editLoanData.status}
                                    onChange={(e) => setEditLoanData({...editLoanData, status: e.target.value})}
                                >
                                    <option value="PENDING">Pending</option>
                                    <option value="PARTIALLY_PAID">Partially Paid</option>
                                    <option value="PAID">Paid</option>
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={closeEditModal}>
                                Cancel
                            </button>
                            <button 
                                type="button" 
                                className="btn btn-primary"
                                onClick={handleUpdate}
                                disabled={editLoading}
                            >
                                {editLoading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Updating...
                                    </>
                                ) : (
                                    "Update Loan"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
};

export default CreditLines;

