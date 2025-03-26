import React, { useState, useEffect, useMemo } from "react";
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
    // New states for advanced filtering
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        gender: '',
        course: '',
        lastQualification: '',
        dateFrom: null,
        dateTo: null
    });
    const [sortConfig, setSortConfig] = useState({
        key: 'createdAt',
        direction: 'desc'
    });

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

    // Handle filter change
    const handleFilterChange = (name, value) => {
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
        setCurrentPage(1); // Reset to first page when filters change
    };
    
    // Clear all filters
    const clearFilters = () => {
        setFilters({
            gender: '',
            course: '',
            lastQualification: '',
            dateFrom: null,
            dateTo: null
        });
        setSearchTerm('');
        setCurrentPage(1);
    };
    
    // Handle sorting
    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };
    
    // Get unique values for filter dropdowns
    const getUniqueValues = (array, key) => {
        return [...new Set(array.map(item => item[key]).filter(Boolean))];
    };
    
    const uniqueCourses = getUniqueValues(iccrForms, 'course');
    const uniqueQualifications = getUniqueValues(iccrForms, 'lastQualification');
    
    // Apply filters and sorting to the data
    const filteredAndSortedForms = useMemo(() => {
        // First apply search filter
        let result = iccrForms.filter(form =>
            form.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            form.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            form.mobileNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            form.course?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        // Then apply advanced filters
        if (filters.gender) {
            result = result.filter(form => form.gender === filters.gender);
        }
        
        if (filters.course) {
            result = result.filter(form => form.course === filters.course);
        }
        
        if (filters.lastQualification) {
            result = result.filter(form => form.lastQualification === filters.lastQualification);
        }
        
        if (filters.dateFrom) {
            result = result.filter(form => new Date(form.createdAt) >= new Date(filters.dateFrom));
        }
        
        if (filters.dateTo) {
            const dateTo = new Date(filters.dateTo);
            dateTo.setHours(23, 59, 59, 999); // End of the day
            result = result.filter(form => new Date(form.createdAt) <= dateTo);
        }
        
        // Finally apply sorting
        if (sortConfig.key) {
            result.sort((a, b) => {
                if (!a[sortConfig.key] && !b[sortConfig.key]) return 0;
                if (!a[sortConfig.key]) return 1;
                if (!b[sortConfig.key]) return -1;
                
                const aValue = typeof a[sortConfig.key] === 'string' ? a[sortConfig.key].toLowerCase() : a[sortConfig.key];
                const bValue = typeof b[sortConfig.key] === 'string' ? b[sortConfig.key].toLowerCase() : b[sortConfig.key];
                
                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        
        return result;
    }, [iccrForms, searchTerm, filters, sortConfig]);
    
    // Pagination logic updated to use filteredAndSortedForms
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredAndSortedForms.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredAndSortedForms.length / itemsPerPage);

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
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}api/iccr`);
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
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}api/iccr/${id}`);
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
                            <div className="card-header py-4 bg-transparent d-flex align-items-center px-0 justify-content-between border-bottom flex-wrap" style={{
                                borderBottom: '2px solid rgba(82, 180, 71, 0.2) !important'
                            }}>
                                <h3 className="mb-0" style={{
                                    fontWeight: '700',
                                    color: '#333',
                                    fontSize: '24px',
                                    position: 'relative',
                                    paddingLeft: '15px'
                                }}>
                                    <span style={{
                                        position: 'absolute',
                                        left: '0',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        width: '5px',
                                        height: '24px',
                                        background: 'linear-gradient(to bottom, #ff8a00, #ff5e00)',
                                        borderRadius: '3px'
                                    }}></span>
                                    ICCR Scholarship
                                </h3>
                                <div>
                                    <button
                                        className="btn me-2"
                                        style={{
                                            backgroundColor: showFilters ? 'rgba(255, 138, 0, 0.1)' : 'white',
                                            color: '#ff5e00',
                                            border: '1px solid rgba(255, 138, 0, 0.3)',
                                            borderRadius: '8px',
                                            padding: '8px 16px',
                                            fontWeight: '600',
                                            transition: 'all 0.2s ease',
                                            boxShadow: showFilters ? '0 3px 8px rgba(255, 138, 0, 0.1)' : 'none'
                                        }}
                                        onClick={() => setShowFilters(!showFilters)}
                                    >
                                        <i className="icofont-filter me-2" style={{ fontSize: '16px' }}></i>
                                        {showFilters ? 'Hide Filters' : 'Show Filters'}
                                    </button>
                                    <button
                                        className="btn"
                                        style={{
                                            background: 'linear-gradient(135deg, #52b447, #429938)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            padding: '8px 18px',
                                            fontWeight: '600',
                                            boxShadow: '0 4px 10px rgba(82, 180, 71, 0.2)',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onClick={handleRefresh}
                                        disabled={loading}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = '0 6px 12px rgba(82, 180, 71, 0.3)';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 4px 10px rgba(82, 180, 71, 0.2)';
                                        }}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Loading...
                                            </>
                                        ) : (
                                            <>
                                                <i className="icofont-refresh me-2"></i>
                                                Refresh Data
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Advanced Filter Panel */}
                        {showFilters && (
                            <div className="card mb-4" style={{
                                borderRadius: '12px',
                                boxShadow: '0 6px 15px rgba(0,0,0,0.05)',
                                border: '1px solid rgba(82, 180, 71, 0.15)',
                                overflow: 'hidden'
                            }}>
                                <div className="card-body" style={{ padding: '25px' }}>
                                    <h5 className="card-title mb-4" style={{
                                        color: '#333',
                                        fontWeight: '700',
                                        fontSize: '18px',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}>
                                        <i className="icofont-filter-alt" style={{ 
                                            color: '#ff5e00', 
                                            marginRight: '10px',
                                            fontSize: '20px'
                                        }}></i>
                                        Advanced Filters
                                    </h5>
                                    <div className="row g-3">
                                        <div className="col-md-6 col-lg-3">
                                            <label htmlFor="searchInput" className="form-label" style={{
                                                fontWeight: '600',
                                                color: '#444',
                                                fontSize: '14px',
                                                marginBottom: '8px'
                                            }}>Search</label>
                                            <div className="input-group">
                                                <input
                                                    id="searchInput"
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Name, Email, Mobile..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    style={{
                                                        borderRadius: '8px 0 0 8px',
                                                        border: '1px solid rgba(82, 180, 71, 0.3)',
                                                        padding: '10px 15px',
                                                        color: '#333',
                                                        boxShadow: 'none'
                                                    }}
                                                />
                                                <span className="input-group-text" style={{
                                                    backgroundColor: '#52b447',
                                                    border: 'none',
                                                    borderRadius: '0 8px 8px 0',
                                                    color: 'white'
                                                }}>
                                                    <i className="icofont-search"></i>
                                                </span>
                                            </div>
                                        </div>
                                        <div className="col-md-6 col-lg-3">
                                            <label htmlFor="genderFilter" className="form-label" style={{
                                                fontWeight: '600',
                                                color: '#444',
                                                fontSize: '14px',
                                                marginBottom: '8px'
                                            }}>Gender</label>
                                            <select
                                                id="genderFilter"
                                                className="form-select"
                                                value={filters.gender}
                                                onChange={(e) => handleFilterChange('gender', e.target.value)}
                                                style={{
                                                    borderRadius: '8px',
                                                    border: '1px solid rgba(82, 180, 71, 0.3)',
                                                    padding: '10px 15px',
                                                    color: '#333',
                                                    boxShadow: 'none',
                                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%2352b447' d='M8 10.5l-4-4h8l-4 4z'/%3E%3C/svg%3E")`,
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <option value="">All Genders</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div className="col-md-6 col-lg-3">
                                            <label htmlFor="courseFilter" className="form-label" style={{
                                                fontWeight: '600',
                                                color: '#444',
                                                fontSize: '14px',
                                                marginBottom: '8px'
                                            }}>Course</label>
                                            <select
                                                id="courseFilter"
                                                className="form-select"
                                                value={filters.course}
                                                onChange={(e) => handleFilterChange('course', e.target.value)}
                                                style={{
                                                    borderRadius: '8px',
                                                    border: '1px solid rgba(82, 180, 71, 0.3)',
                                                    padding: '10px 15px',
                                                    color: '#333',
                                                    boxShadow: 'none',
                                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%2352b447' d='M8 10.5l-4-4h8l-4 4z'/%3E%3C/svg%3E")`,
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <option value="">All Courses</option>
                                                {uniqueCourses.map((course, index) => (
                                                    <option key={index} value={course}>{course}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-md-6 col-lg-3">
                                            <label htmlFor="qualificationFilter" className="form-label" style={{
                                                fontWeight: '600',
                                                color: '#444',
                                                fontSize: '14px',
                                                marginBottom: '8px'
                                            }}>Qualification</label>
                                            <select
                                                id="qualificationFilter"
                                                className="form-select"
                                                value={filters.lastQualification}
                                                onChange={(e) => handleFilterChange('lastQualification', e.target.value)}
                                                style={{
                                                    borderRadius: '8px',
                                                    border: '1px solid rgba(82, 180, 71, 0.3)',
                                                    padding: '10px 15px',
                                                    color: '#333',
                                                    boxShadow: 'none',
                                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%2352b447' d='M8 10.5l-4-4h8l-4 4z'/%3E%3C/svg%3E")`,
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <option value="">All Qualifications</option>
                                                {uniqueQualifications.map((qual, index) => (
                                                    <option key={index} value={qual}>{qual}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-md-6 col-lg-3">
                                            <label htmlFor="dateFromFilter" className="form-label" style={{
                                                fontWeight: '600',
                                                color: '#444',
                                                fontSize: '14px',
                                                marginBottom: '8px'
                                            }}>Date From</label>
                                            <DatePicker
                                                id="dateFromFilter"
                                                selected={filters.dateFrom}
                                                onChange={(date) => handleFilterChange('dateFrom', date)}
                                                className="form-control"
                                                placeholderText="From date"
                                                dateFormat="dd/MM/yyyy"
                                                isClearable
                                                style={{
                                                    borderRadius: '8px',
                                                    border: '1px solid rgba(82, 180, 71, 0.3)',
                                                    padding: '10px 15px',
                                                    color: '#333',
                                                    boxShadow: 'none',
                                                    width: '100%'
                                                }}
                                            />
                                        </div>
                                        <div className="col-md-6 col-lg-3">
                                            <label htmlFor="dateToFilter" className="form-label" style={{
                                                fontWeight: '600',
                                                color: '#444',
                                                fontSize: '14px',
                                                marginBottom: '8px'
                                            }}>Date To</label>
                                            <DatePicker
                                                id="dateToFilter"
                                                selected={filters.dateTo}
                                                onChange={(date) => handleFilterChange('dateTo', date)}
                                                className="form-control"
                                                placeholderText="To date"
                                                dateFormat="dd/MM/yyyy"
                                                isClearable
                                                style={{
                                                    borderRadius: '8px',
                                                    border: '1px solid rgba(82, 180, 71, 0.3)',
                                                    padding: '10px 15px',
                                                    color: '#333',
                                                    boxShadow: 'none',
                                                    width: '100%'
                                                }}
                                            />
                                        </div>
                                        <div className="col-md-6 col-lg-3 d-flex align-items-end">
                                            <button 
                                                className="btn w-100"
                                                onClick={clearFilters}
                                                style={{
                                                    backgroundColor: '#fff',
                                                    color: '#ff5e00',
                                                    border: '1px solid rgba(255, 94, 0, 0.3)',
                                                    borderRadius: '8px',
                                                    padding: '10px 15px',
                                                    fontWeight: '600',
                                                    transition: 'all 0.2s ease'
                                                }}
                                                onMouseOver={(e) => {
                                                    e.currentTarget.style.backgroundColor = 'rgba(255, 94, 0, 0.05)';
                                                }}
                                                onMouseOut={(e) => {
                                                    e.currentTarget.style.backgroundColor = '#fff';
                                                }}
                                            >
                                                <i className="icofont-ui-delete me-2"></i>
                                                Clear Filters
                                            </button>
                                        </div>
                                        <div className="col-md-6 col-lg-3 d-flex align-items-end">
                                            <div className="w-100" style={{
                                                background: 'linear-gradient(135deg, #52b447, #429938)',
                                                borderRadius: '8px',
                                                padding: '11px 15px',
                                                color: 'white',
                                                fontWeight: '600',
                                                textAlign: 'center',
                                                fontSize: '14px',
                                                boxShadow: '0 4px 10px rgba(82, 180, 71, 0.2)'
                                            }}>
                                                <i className="icofont-listine-dots me-2"></i>
                                                {filteredAndSortedForms.length} Results Found
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

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
                                style={{
                                    background: 'linear-gradient(135deg, #ff8a00, #ff5e00)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '8px 16px',
                                    fontWeight: '600',
                                    boxShadow: '0 4px 10px rgba(255, 138, 0, 0.2)',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseOver={(e) => {
                                    if (!loading) {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 6px 12px rgba(255, 138, 0, 0.3)';
                                    }
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 10px rgba(255, 138, 0, 0.2)';
                                }}
                            >
                                {loading ? (
                                    <>
                                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                        Loading...
                                    </>
                                ) : (
                                    <>
                                        <i className="icofont-paper me-2"></i>
                                        ICCR Form 2
                                    </>
                                )}
                            </button>

                            <div className="input-group mb-3" style={{ width: '250px' }}>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Quick Search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{
                                        borderRadius: '8px 0 0 8px',
                                        border: '1px solid rgba(82, 180, 71, 0.3)',
                                        padding: '8px 15px',
                                        color: '#333',
                                        boxShadow: 'none'
                                    }}
                                />
                                <button 
                                    type="button" 
                                    className="btn"
                                    style={{
                                        backgroundColor: '#52b447',
                                        border: 'none',
                                        borderRadius: '0 8px 8px 0',
                                        color: 'white'
                                    }}
                                >
                                    <i className="icofont-search" />
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
                                    <div className="card" style={{ 
                                        borderRadius: '12px',
                                        boxShadow: '0 6px 15px rgba(0,0,0,0.05)',
                                        border: 'none',
                                        overflow: 'hidden'
                                    }}>
                                        <div className="card-header" style={{
                                            background: 'linear-gradient(135deg, #52b447, #429938)',
                                            borderBottom: 'none',
                                            padding: '18px 25px'
                                        }}>
                                            <h5 className="card-title" style={{
                                                color: 'white',
                                                margin: '0',
                                                fontWeight: '600',
                                                fontSize: '18px'
                                            }}>
                                                <i className="icofont-listing-box me-2"></i>
                                                ICCR Form 1 Submissions
                                            </h5>
                                        </div>
                                        <div className="card-body" style={{ padding: '0' }}>
                                            <div className="table-responsive">
                                                <table className="table align-middle mb-0" style={{
                                                    borderCollapse: 'separate',
                                                    borderSpacing: '0'
                                                }}>
                                                    <thead style={{
                                                        background: '#f8f9fa'
                                                    }}>
                                                        <tr>
                                                            <th className="text-center" style={{
                                                                padding: '16px 10px',
                                                                borderBottom: '2px solid rgba(82, 180, 71, 0.2)',
                                                                fontWeight: '600',
                                                                color: '#444'
                                                            }}>S.No</th>
                                                            <th className="text-center sortable" 
                                                                onClick={() => requestSort('fullName')}
                                                                style={{
                                                                    padding: '16px 10px',
                                                                    borderBottom: '2px solid rgba(82, 180, 71, 0.2)',
                                                                    fontWeight: '600',
                                                                    color: '#444',
                                                                    cursor: 'pointer'
                                                                }}
                                                            >
                                                                Name
                                                                {sortConfig.key === 'fullName' && (
                                                                    <i className={`bi bi-arrow-${sortConfig.direction === 'asc' ? 'up' : 'down'} ms-1`} style={{ color: '#ff8a00' }}></i>
                                                                )}
                                                            </th>
                                                            <th className="text-center sortable" 
                                                                onClick={() => requestSort('email')}
                                                                style={{
                                                                    padding: '16px 10px',
                                                                    borderBottom: '2px solid rgba(82, 180, 71, 0.2)',
                                                                    fontWeight: '600',
                                                                    color: '#444',
                                                                    cursor: 'pointer'
                                                                }}
                                                            >
                                                                Email
                                                                {sortConfig.key === 'email' && (
                                                                    <i className={`bi bi-arrow-${sortConfig.direction === 'asc' ? 'up' : 'down'} ms-1`} style={{ color: '#ff8a00' }}></i>
                                                                )}
                                                            </th>
                                                            <th className="text-center" style={{
                                                                padding: '16px 10px',
                                                                borderBottom: '2px solid rgba(82, 180, 71, 0.2)',
                                                                fontWeight: '600',
                                                                color: '#444'
                                                            }}>Mobile</th>
                                                            <th className="text-center sortable" 
                                                                onClick={() => requestSort('course')}
                                                                style={{
                                                                    padding: '16px 10px',
                                                                    borderBottom: '2px solid rgba(82, 180, 71, 0.2)',
                                                                    fontWeight: '600',
                                                                    color: '#444',
                                                                    cursor: 'pointer'
                                                                }}
                                                            >
                                                                Course
                                                                {sortConfig.key === 'course' && (
                                                                    <i className={`bi bi-arrow-${sortConfig.direction === 'asc' ? 'up' : 'down'} ms-1`} style={{ color: '#ff8a00' }}></i>
                                                                )}
                                                            </th>
                                                            <th className="text-center sortable" 
                                                                onClick={() => requestSort('createdAt')}
                                                                style={{
                                                                    padding: '16px 10px',
                                                                    borderBottom: '2px solid rgba(82, 180, 71, 0.2)',
                                                                    fontWeight: '600',
                                                                    color: '#444',
                                                                    cursor: 'pointer'
                                                                }}
                                                            >
                                                                Date
                                                                {sortConfig.key === 'createdAt' && (
                                                                    <i className={`bi bi-arrow-${sortConfig.direction === 'asc' ? 'up' : 'down'} ms-1`} style={{ color: '#ff8a00' }}></i>
                                                                )}
                                                            </th>
                                                            <th className="text-center" style={{
                                                                padding: '16px 10px',
                                                                borderBottom: '2px solid rgba(82, 180, 71, 0.2)',
                                                                fontWeight: '600',
                                                                color: '#444'
                                                            }}>Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {currentItems.length > 0 ? (
                                                            currentItems.map((form, index) => (
                                                                <tr key={form._id} 
                                                                    className="align-middle"
                                                                    style={{
                                                                        transition: 'background 0.2s ease',
                                                                    }}
                                                                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(82, 180, 71, 0.04)'}
                                                                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                                                >
                                                                    <td className="text-center" style={{
                                                                        padding: '16px 10px',
                                                                        borderBottom: '1px solid rgba(0,0,0,0.05)'
                                                                    }}>
                                                                        <span style={{
                                                                            background: 'linear-gradient(135deg, #ff8a00, #ff5e00)',
                                                                            color: 'white',
                                                                            borderRadius: '50%',
                                                                            width: '28px',
                                                                            height: '28px',
                                                                            display: 'inline-flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            fontWeight: '600',
                                                                            fontSize: '12px'
                                                                        }}>
                                                                            {indexOfFirstItem + index + 1}
                                                                        </span>
                                                                    </td>
                                                                    <td className="text-center" style={{
                                                                        fontWeight: '600',
                                                                        color: '#333',
                                                                        padding: '16px 10px',
                                                                        borderBottom: '1px solid rgba(0,0,0,0.05)'
                                                                    }}>{form.fullName}</td>
                                                                    <td className="text-center" style={{
                                                                        padding: '16px 10px',
                                                                        borderBottom: '1px solid rgba(0,0,0,0.05)',
                                                                        color: '#555'
                                                                    }}>
                                                                        <i className="icofont-email me-1" style={{ color: '#52b447' }}></i>
                                                                        {form.email}
                                                                    </td>
                                                                    <td className="text-center" style={{
                                                                        padding: '16px 10px',
                                                                        borderBottom: '1px solid rgba(0,0,0,0.05)',
                                                                        color: '#555'
                                                                    }}>
                                                                        <i className="icofont-mobile-phone me-1" style={{ color: '#52b447' }}></i>
                                                                        {form.countryCode} {form.mobileNumber}
                                                                    </td>
                                                                    <td className="text-center" style={{
                                                                        padding: '16px 10px',
                                                                        borderBottom: '1px solid rgba(0,0,0,0.05)'
                                                                    }}>
                                                                        <span style={{
                                                                            backgroundColor: 'rgba(82, 180, 71, 0.1)',
                                                                            color: '#52b447',
                                                                            padding: '5px 12px',
                                                                            borderRadius: '30px',
                                                                            fontWeight: '500',
                                                                            fontSize: '13px',
                                                                            display: 'inline-block',
                                                                            border: '1px solid rgba(82, 180, 71, 0.2)'
                                                                        }}>
                                                                            {form.course}
                                                                        </span>
                                                                    </td>
                                                                    <td className="text-center" style={{
                                                                        padding: '16px 10px',
                                                                        borderBottom: '1px solid rgba(0,0,0,0.05)',
                                                                        color: '#555'
                                                                    }}>
                                                                        <i className="icofont-calendar me-1" style={{ color: '#52b447' }}></i>
                                                                        {formatDateOnly(form.createdAt)}
                                                                    </td>
                                                                    <td className="text-center" style={{
                                                                        padding: '16px 10px',
                                                                        borderBottom: '1px solid rgba(0,0,0,0.05)'
                                                                    }}>
                                                                        <div className="btn-group">
                                                                            <button
                                                                                className="btn"
                                                                                style={{
                                                                                    background: 'linear-gradient(135deg, #52b447, #429938)',
                                                                                    color: 'white',
                                                                                    border: 'none',
                                                                                    borderRadius: '6px',
                                                                                    padding: '6px 12px',
                                                                                    marginRight: '8px',
                                                                                    fontWeight: '500',
                                                                                    fontSize: '13px',
                                                                                    lineHeight: '1.2',
                                                                                    boxShadow: '0 2px 6px rgba(82, 180, 71, 0.2)'
                                                                                }}
                                                                                onClick={() => handleViewDetails(form._id)}
                                                                                disabled={formDetailLoading}
                                                                                title="View Details"
                                                                            >
                                                                                <i className="icofont-eye"></i>
                                                                            </button>
                                                                            <button
                                                                                className="btn"
                                                                                style={{
                                                                                    backgroundColor: 'white',
                                                                                    color: '#ff5e00',
                                                                                    border: '1px solid rgba(255, 94, 0, 0.3)',
                                                                                    borderRadius: '6px',
                                                                                    padding: '6px 12px',
                                                                                    fontWeight: '500',
                                                                                    fontSize: '13px',
                                                                                    lineHeight: '1.2'
                                                                                }}
                                                                                onClick={() => showDeleteConfirmation(form._id)}
                                                                                disabled={deleteLoading}
                                                                                title="Delete"
                                                                            >
                                                                                <i className="icofont-ui-delete"></i>
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        ) : (
                                                            <tr>
                                                                <td colSpan="7" className="text-center py-4" style={{
                                                                    padding: '40px 20px',
                                                                    backgroundColor: '#f9fcf7'
                                                                }}>
                                                                    <i className="icofont-file-alt" style={{ 
                                                                        fontSize: '48px', 
                                                                        color: '#52b447',
                                                                        opacity: '0.5',
                                                                        marginBottom: '15px',
                                                                        display: 'block'
                                                                    }}></i>
                                                                    <p style={{ margin: 0, fontSize: '16px', fontWeight: '500', color: '#666' }}>
                                                                    No ICCR form submissions found
                                                                    </p>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    // Grid View
                                    <div className="row" style={{ margin: "0 -15px" }}>
                                        {currentItems.length > 0 ? (
                                            currentItems.map((form, index) => (
                                                <div className="col-md-4" key={form._id} style={{ padding: "15px" }}>
                                                    <div
                                                        className="card"
                                                        style={{
                                                            height: 'auto',
                                                            minHeight: '280px',
                                                            borderRadius: '12px',
                                                            boxShadow: '0 10px 20px rgba(0,0,0,0.05), 0 6px 6px rgba(0,0,0,0.06)',
                                                            transition: 'all 0.3s ease',
                                                            border: '1px solid rgba(0,0,0,0.05)',
                                                            overflow: 'hidden',
                                                            backgroundColor: '#ffffff',
                                                            position: 'relative'
                                                        }}
                                                        onMouseOver={(e) => {
                                                            e.currentTarget.style.transform = 'translateY(-8px)';
                                                            e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,0,0,0.1), 0 8px 8px rgba(0,0,0,0.08)';
                                                        }}
                                                        onMouseOut={(e) => {
                                                            e.currentTarget.style.transform = 'translateY(0)';
                                                            e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.05), 0 6px 6px rgba(0,0,0,0.06)';
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                position: 'absolute',
                                                                top: 0,
                                                                left: 0,
                                                                right: 0,
                                                                height: '6px',
                                                                background: 'linear-gradient(90deg, #ff8a00, #ff5e00)'
                                                            }}
                                                        ></div>
                                                        <div className="card-body d-flex flex-column" style={{ padding: '25px' }}>
                                                            <div className="d-flex justify-content-between align-items-center">
                                                                <span style={{ 
                                                                    background: 'linear-gradient(135deg, #ff8a00, #ff5e00)',
                                                                    color: 'white', 
                                                                    borderRadius: '50%',
                                                                    width: '36px',
                                                                    height: '36px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    fontWeight: '600',
                                                                    fontSize: '14px',
                                                                    boxShadow: '0 4px 8px rgba(255, 138, 0, 0.3)'
                                                                }}>
                                                                    {indexOfFirstItem + index + 1}
                                                                </span>
                                                                <h5 className="card-title text-capitalize" style={{ 
                                                                    margin: 0,
                                                                    fontWeight: '700',
                                                                    color: '#333333',
                                                                    fontSize: '18px'
                                                                }}>
                                                                    {form.fullName}
                                                                </h5>
                                                            </div>

                                                            <div style={{ 
                                                                marginTop: '22px', 
                                                                backgroundColor: '#f9fcf7', 
                                                                padding: '18px', 
                                                                borderRadius: '10px',
                                                                border: '1px solid rgba(82, 180, 71, 0.15)'
                                                            }}>
                                                                <div style={{ 
                                                                    marginBottom: '12px',
                                                                    display: 'flex',
                                                                    alignItems: 'center'
                                                                }}>
                                                                    <i className="icofont-email" style={{ 
                                                                        color: '#52b447', 
                                                                        marginRight: '8px',
                                                                        fontSize: '16px'
                                                                    }}></i>
                                                                    <span style={{ fontWeight: '600', color: '#555555', width: '60px' }}>Email: </span>
                                                                    <span style={{ 
                                                                        color: '#333333', 
                                                                        fontWeight: '500',
                                                                        textOverflow: 'ellipsis',
                                                                        overflow: 'hidden',
                                                                        whiteSpace: 'nowrap'
                                                                    }}>{form.email}</span>
                                                                </div>
                                                                <div style={{ 
                                                                    marginBottom: '12px',
                                                                    display: 'flex',
                                                                    alignItems: 'center'
                                                                }}>
                                                                    <i className="icofont-mobile-phone" style={{ 
                                                                        color: '#52b447', 
                                                                        marginRight: '8px',
                                                                        fontSize: '16px'
                                                                    }}></i>
                                                                    <span style={{ fontWeight: '600', color: '#555555', width: '60px' }}>Mobile: </span>
                                                                    <span style={{ color: '#333333', fontWeight: '500' }}>{form.countryCode} {form.mobileNumber}</span>
                                                                </div>
                                                                <div style={{ 
                                                                    display: 'flex',
                                                                    alignItems: 'center'
                                                                }}>
                                                                    <i className="icofont-graduate" style={{ 
                                                                        color: '#52b447', 
                                                                        marginRight: '8px',
                                                                        fontSize: '16px'
                                                                    }}></i>
                                                                    <span style={{ fontWeight: '600', color: '#555555', width: '60px' }}>Course: </span>
                                                                    <span style={{ 
                                                                        color: '#333333', 
                                                                        fontWeight: '500',
                                                                        backgroundColor: 'rgba(82, 180, 71, 0.1)',
                                                                        padding: '3px 8px',
                                                                        borderRadius: '4px',
                                                                        fontSize: '13px'
                                                                    }}>{form.course}</span>
                                                                </div>
                                                            </div>

                                                            <div className="mt-auto pt-4 d-flex justify-content-end" style={{ gap: '10px' }}>
                                                                <button
                                                                    className="btn btn-sm"
                                                                    style={{
                                                                        background: 'linear-gradient(135deg, #52b447, #429938)',
                                                                        color: 'white',
                                                                        border: 'none',
                                                                        borderRadius: '8px',
                                                                        padding: '8px 16px',
                                                                        fontWeight: '600',
                                                                        fontSize: '13px',
                                                                        boxShadow: '0 4px 10px rgba(82, 180, 71, 0.3)',
                                                                        transition: 'all 0.2s ease'
                                                                    }}
                                                                    onMouseOver={(e) => {
                                                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                                                        e.currentTarget.style.boxShadow = '0 6px 12px rgba(82, 180, 71, 0.4)';
                                                                    }}
                                                                    onMouseOut={(e) => {
                                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                                        e.currentTarget.style.boxShadow = '0 4px 10px rgba(82, 180, 71, 0.3)';
                                                                    }}
                                                                    onClick={() => handleViewDetails(form._id)}
                                                                    disabled={formDetailLoading}
                                                                >
                                                                    <i className="icofont-eye"></i>
                                                                    
                                                                </button>
                                                                <button
                                                                    className="btn btn-sm"
                                                                    style={{
                                                                        backgroundColor: '#fff',
                                                                        color: '#ff5e00',
                                                                        border: '1px solid rgba(255, 94, 0, 0.3)',
                                                                        borderRadius: '8px',
                                                                        padding: '8px 16px',
                                                                        fontWeight: '600',
                                                                        fontSize: '13px',
                                                                        transition: 'all 0.2s ease'
                                                                    }}
                                                                    onMouseOver={(e) => {
                                                                        e.currentTarget.style.backgroundColor = 'rgba(255, 94, 0, 0.05)';
                                                                        e.currentTarget.style.borderColor = '#ff5e00';
                                                                    }}
                                                                    onMouseOut={(e) => {
                                                                        e.currentTarget.style.backgroundColor = '#fff';
                                                                        e.currentTarget.style.borderColor = 'rgba(255, 94, 0, 0.3)';
                                                                    }}
                                                                    onClick={() => showDeleteConfirmation(form._id)}
                                                                    disabled={deleteLoading}
                                                                >
                                                                    <i className="icofont-ui-delete"></i>
                                                                    
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="col-12 text-center mt-4" style={{ 
                                                padding: '40px 20px', 
                                                backgroundColor: '#f9fcf7', 
                                                borderRadius: '12px',
                                                color: '#666666',
                                                border: '1px dashed rgba(82, 180, 71, 0.3)'
                                            }}>
                                                <i className="icofont-file-alt" style={{ 
                                                    fontSize: '48px', 
                                                    color: '#52b447',
                                                    opacity: '0.5',
                                                    marginBottom: '15px',
                                                    display: 'block'
                                                }}></i>
                                                <p style={{ margin: 0, fontSize: '16px', fontWeight: '500' }}>No ICCR form submissions found</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Pagination controls */}
                                <div className="row mt-4" style={{ marginBottom: '20px' }}>
                                    <div className="col-12 col-md-6 mb-3">
                                        <div className="d-flex align-items-center" style={{ 
                                            background: '#f9fcf7',
                                            padding: '12px 15px',
                                            borderRadius: '8px',
                                            border: '1px solid rgba(82, 180, 71, 0.15)'
                                        }}>
                                            <label htmlFor="itemsPerPage" className="form-label me-3 mb-0" style={{ 
                                                fontWeight: '600',
                                                color: '#444',
                                                fontSize: '14px'
                                            }}>Items per page:</label>
                                            <select
                                                id="itemsPerPage"
                                                className="form-select"
                                                style={{ 
                                                    width: 'auto',
                                                    border: '1px solid rgba(82, 180, 71, 0.3)',
                                                    borderRadius: '6px',
                                                    color: '#333',
                                                    fontWeight: '500',
                                                    padding: '8px 30px 8px 12px',
                                                    boxShadow: 'none',
                                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%2352b447' d='M8 10.5l-4-4h8l-4 4z'/%3E%3C/svg%3E")`,
                                                    cursor: 'pointer'
                                                }}
                                                value={itemsPerPage}
                                                onChange={(e) => {
                                                    setItemsPerPage(e.target.value === 'all' ? filteredAndSortedForms.length : parseInt(e.target.value, 10));
                                                    setCurrentPage(1);
                                                }}
                                            >
                                                <option value="10">10</option>
                                                <option value="25">25</option>
                                                <option value="50">50</option>
                                                <option value="100">100</option>
                                                <option value="all">Show All</option>
                                            </select>
                                            <div style={{ 
                                                marginLeft: '15px',
                                                padding: '6px 12px',
                                                backgroundColor: 'rgba(82, 180, 71, 0.1)',
                                                borderRadius: '6px',
                                                fontSize: '13px',
                                                color: '#52b447',
                                                fontWeight: '600',
                                                display: 'flex',
                                                alignItems: 'center'
                                            }}>
                                                <i className="icofont-listine-dots me-1"></i>
                                                Total: {filteredAndSortedForms.length}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <nav aria-label="Page navigation" style={{ 
                                            background: '#f9fcf7',
                                            padding: '12px 15px',
                                            borderRadius: '8px',
                                            border: '1px solid rgba(82, 180, 71, 0.15)'
                                        }}>
                                            <ul className="pagination justify-content-md-end mb-0">
                                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                    <button 
                                                        onClick={prevPage} 
                                                        className="page-link"
                                                        style={{ 
                                                            border: '1px solid rgba(82, 180, 71, 0.3)',
                                                            borderRadius: '6px 0 0 6px',
                                                            color: currentPage === 1 ? '#999' : '#52b447',
                                                            padding: '8px 14px',
                                                            fontWeight: '600',
                                                            backgroundColor: currentPage === 1 ? '#f8f8f8' : 'white',
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                        disabled={currentPage === 1}
                                                    >
                                                        <i className="icofont-arrow-left" style={{ fontSize: '14px' }}></i>
                                                    </button>
                                                </li>
                                                {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((page) => (
                                                    <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                                                        <button 
                                                            onClick={() => paginate(page)} 
                                                            className="page-link" 
                                                            style={{ 
                                                                border: '1px solid rgba(82, 180, 71, 0.3)',
                                                                borderLeft: 'none',
                                                                borderRight: 'none',
                                                                color: currentPage === page ? 'white' : '#555',
                                                                padding: '8px 14px',
                                                                fontWeight: '600',
                                                                background: currentPage === page ? 
                                                                    'linear-gradient(135deg, #ff8a00, #ff5e00)' : 'white',
                                                                boxShadow: currentPage === page ? 
                                                                    '0 2px 5px rgba(255, 94, 0, 0.3)' : 'none',
                                                                transition: 'all 0.2s ease',
                                                                minWidth: '40px',
                                                                textAlign: 'center'
                                                            }}
                                                        >
                                                            {page}
                                                        </button>
                                                    </li>
                                                ))}
                                                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                                    <button 
                                                        onClick={nextPage} 
                                                        className="page-link" 
                                                        style={{ 
                                                            border: '1px solid rgba(82, 180, 71, 0.3)',
                                                            borderRadius: '0 6px 6px 0',
                                                            color: currentPage === totalPages ? '#999' : '#52b447',
                                                            padding: '8px 14px',
                                                            fontWeight: '600',
                                                            backgroundColor: currentPage === totalPages ? '#f8f8f8' : 'white',
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                        disabled={currentPage === totalPages}
                                                    >
                                                        <i className="icofont-arrow-right" style={{ fontSize: '14px' }}></i>
                                                        </button>
                                                    </li>
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
                <div className="modal fade show" style={{ 
                    display: 'block', 
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(3px)'
                }} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered modal-lg" style={{
                        marginRight: '60px',  // इसे दाहिनी ओर शिफ्ट किया गया है
                        maxWidth: '900px'     // मोडल की चौड़ाई को नियंत्रित करने के लिए
                    }}>
                        <div className="modal-content" style={{ 
                            borderRadius: '15px',
                            border: 'none',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                            overflow: 'hidden'
                        }}>
                            <div className="modal-header" style={{
                                background: 'linear-gradient(135deg, #ff8a00, #ff5e00)',
                                borderBottom: 'none',
                                padding: '15px 25px',  // पैडिंग को कम किया
                                position: 'relative'
                            }}>
                                <h5 className="modal-title" style={{
                                    color: 'white',
                                    fontWeight: '700',
                                    margin: '0',
                                    fontSize: '18px',  // फॉंट साइज को कम किया
                                    display: 'flex',
                                    alignItems: 'center'
                                }}>
                                    <i className="icofont-info-circle me-2" style={{ fontSize: '20px' }}></i>
                                    ICCR Form Details
                            </h5>
                            <button
                                type="button"
                                className="btn-close"
                                    onClick={handleCloseModal}
                                    style={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                        borderRadius: '50%',
                                        padding: '8px',
                                        opacity: '1',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)';
                                        e.currentTarget.style.transform = 'rotate(90deg)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                                        e.currentTarget.style.transform = 'rotate(0deg)';
                                    }}
                                ></button>
                            </div>
                            <div className="modal-body" style={{ padding: '20px 25px' }}>  {/* पैडिंग को कम किया */}
                                {formDetailLoading ? (
                                    <div className="text-center py-4">  {/* पैडिंग को कम किया */}
                                        <div className="spinner-border" style={{ 
                                            color: '#52b447',
                                            width: '3rem',
                                            height: '3rem'
                                        }} role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                        <p style={{ 
                                            marginTop: '15px',
                                            color: '#666',
                                            fontWeight: '500'
                                        }}>Loading form details...</p>
                                    </div>
                                ) : (
                                    <div className="container">
                                        <div className="row mb-3">  {/* मार्जिन को कम किया */}
                                            <div className="col-12">
                                                <h4 style={{
                                                    borderBottom: '2px solid rgba(82, 180, 71, 0.2)',
                                                    paddingBottom: '8px',  // पैडिंग को कम किया
                                                    marginBottom: '15px',  // मार्जिन को कम किया
                                                    color: '#333',
                                                    fontWeight: '700',
                                                    fontSize: '16px',  // फॉन्ट साइज को कम किया
                                                    display: 'flex',
                                                    alignItems: 'center'
                                                }}>
                                                    <i className="icofont-user-alt-7" style={{ 
                                                        color: '#52b447', 
                                                        marginRight: '10px',
                                                        fontSize: '18px'  // आइकॉन साइज को कम किया
                                                    }}></i>
                                                    Personal Information
                                                </h4>
                                            </div>
                                            <div className="col-md-6">
                                                <div style={{
                                                    marginBottom: '10px',  // मार्जिन को कम किया
                                                    padding: '10px',  // पैडिंग को कम किया
                                                    backgroundColor: '#f9fcf7',
                                                    borderRadius: '8px',
                                                    border: '1px solid rgba(82, 180, 71, 0.1)'
                                                }}>
                                                    <p style={{ margin: '0' }}>
                                                        <strong style={{ color: '#555', marginRight: '8px', display: 'inline-block', minWidth: '90px' }}>Full Name:</strong>
                                                        <span style={{ color: '#333', fontWeight: '500' }}>{selectedForm.fullName || 'N/A'}</span>
                                                    </p>
                                                </div>
                                                <div style={{
                                                    marginBottom: '10px',  // मार्जिन को कम किया
                                                    padding: '10px',  // पैडिंग को कम किया
                                                    backgroundColor: '#f9fcf7',
                                                    borderRadius: '8px',
                                                    border: '1px solid rgba(82, 180, 71, 0.1)'
                                                }}>
                                                    <p style={{ margin: '0' }}>
                                                        <strong style={{ color: '#555', marginRight: '8px', display: 'inline-block', minWidth: '90px' }}>Email:</strong>
                                                        <span style={{ color: '#333', fontWeight: '500' }}>{selectedForm.email || 'N/A'}</span>
                                                    </p>
                                                </div>
                                                <div style={{
                                                    marginBottom: '10px',  // मार्जिन को कम किया
                                                    padding: '10px',  // पैडिंग को कम किया
                                                    backgroundColor: '#f9fcf7',
                                                    borderRadius: '8px',
                                                    border: '1px solid rgba(82, 180, 71, 0.1)'
                                                }}>
                                                    <p style={{ margin: '0' }}>
                                                        <strong style={{ color: '#555', marginRight: '8px', display: 'inline-block', minWidth: '90px' }}>Mobile:</strong>
                                                        <span style={{ color: '#333', fontWeight: '500' }}>{selectedForm.countryCode} {selectedForm.mobileNumber || 'N/A'}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div style={{
                                                    marginBottom: '10px',  // मार्जिन को कम किया
                                                    padding: '10px',  // पैडिंग को कम किया
                                                    backgroundColor: '#f9fcf7',
                                                    borderRadius: '8px',
                                                    border: '1px solid rgba(82, 180, 71, 0.1)'
                                                }}>
                                                    <p style={{ margin: '0' }}>
                                                        <strong style={{ color: '#555', marginRight: '8px', display: 'inline-block', minWidth: '90px' }}>Date of Birth:</strong>
                                                        <span style={{ color: '#333', fontWeight: '500' }}>{formatDateOnly(selectedForm.dateOfBirth)}</span>
                                                    </p>
                                                </div>
                                                <div style={{
                                                    marginBottom: '10px',  // मार्जिन को कम किया
                                                    padding: '10px',  // पैडिंग को कम किया
                                                    backgroundColor: '#f9fcf7',
                                                    borderRadius: '8px',
                                                    border: '1px solid rgba(82, 180, 71, 0.1)'
                                                }}>
                                                    <p style={{ margin: '0' }}>
                                                        <strong style={{ color: '#555', marginRight: '8px', display: 'inline-block', minWidth: '90px' }}>Gender:</strong>
                                                        <span style={{ 
                                                            color: '#333', 
                                                            fontWeight: '500',
                                                            backgroundColor: 'rgba(255, 138, 0, 0.1)',
                                                            padding: '2px 8px',  // पैडिंग को कम किया
                                                            borderRadius: '4px',
                                                            fontSize: '12px'  // फॉन्ट साइज को कम किया
                                                        }}>{selectedForm.gender || 'N/A'}</span>
                                                    </p>
                                                </div>
                                                <div style={{
                                                    marginBottom: '10px',  // मार्जिन को कम किया
                                                    padding: '10px',  // पैडिंग को कम किया
                                                    backgroundColor: '#f9fcf7',
                                                    borderRadius: '8px',
                                                    border: '1px solid rgba(82, 180, 71, 0.1)'
                                                }}>
                                                    <p style={{ margin: '0' }}>
                                                        <strong style={{ color: '#555', marginRight: '8px', display: 'inline-block', minWidth: '90px' }}>Last Qualification:</strong>
                                                        <span style={{ color: '#333', fontWeight: '500' }}>{selectedForm.lastQualification || 'N/A'}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="row mb-3">  {/* मार्जिन को कम किया */}
                                            <div className="col-12">
                                                <h4 style={{
                                                    borderBottom: '2px solid rgba(82, 180, 71, 0.2)',
                                                    paddingBottom: '8px',  // पैडिंग को कम किया
                                                    marginBottom: '15px',  // मार्जिन को कम किया
                                                    color: '#333',
                                                    fontWeight: '700',
                                                    fontSize: '16px',  // फॉन्ट साइज को कम किया
                                                    display: 'flex',
                                                    alignItems: 'center'
                                                }}>
                                                    <i className="icofont-graduate" style={{ 
                                                        color: '#52b447', 
                                                        marginRight: '10px',
                                                        fontSize: '18px'  // आइकॉन साइज को कम किया
                                                    }}></i>
                                                    Course Information
                                                </h4>
                                            </div>
                                            <div className="col-md-6">
                                                <div style={{
                                                    marginBottom: '10px',  // मार्जिन को कम किया
                                                    padding: '10px',  // पैडिंग को कम किया
                                                    backgroundColor: '#f9fcf7',
                                                    borderRadius: '8px',
                                                    border: '1px solid rgba(82, 180, 71, 0.1)'
                                                }}>
                                                    <p style={{ margin: '0' }}>
                                                        <strong style={{ color: '#555', marginRight: '8px', display: 'inline-block', minWidth: '90px' }}>Course:</strong>
                                                        <span style={{ 
                                                            color: 'white', 
                                                            fontWeight: '500',
                                                            backgroundColor: '#52b447',
                                                            padding: '2px 8px',  // पैडिंग को कम किया
                                                            borderRadius: '4px',
                                                            fontSize: '12px'  // फॉन्ट साइज को कम किया
                                                        }}>{selectedForm.course || 'N/A'}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-12">
                                                <h4 style={{
                                                    borderBottom: '2px solid rgba(82, 180, 71, 0.2)',
                                                    paddingBottom: '8px',  // पैडिंग को कम किया
                                                    marginBottom: '15px',  // मार्जिन को कम किया
                                                    color: '#333',
                                                    fontWeight: '700',
                                                    fontSize: '16px',  // फॉन्ट साइज को कम किया
                                                    display: 'flex',
                                                    alignItems: 'center'
                                                }}>
                                                    <i className="icofont-file-document" style={{ 
                                                        color: '#52b447', 
                                                        marginRight: '10px',
                                                        fontSize: '18px'  // आइकॉन साइज को कम किया
                                                    }}></i>
                                                    Application Information
                                                </h4>
                                            </div>
                                            <div className="col-md-6">
                                                <div style={{
                                                    marginBottom: '10px',  // मार्जिन को कम किया
                                                    padding: '10px',  // पैडिंग को कम किया
                                                    backgroundColor: '#f9fcf7',
                                                    borderRadius: '8px',
                                                    border: '1px solid rgba(82, 180, 71, 0.1)'
                                                }}>
                                                    <p style={{ margin: '0' }}>
                                                        <strong style={{ color: '#555', marginRight: '8px', display: 'inline-block', minWidth: '110px' }}>Application Date:</strong>
                                                        <span style={{ color: '#333', fontWeight: '500' }}>{formatDate(selectedForm.createdAt)}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div style={{
                                                    marginBottom: '10px',  // मार्जिन को कम किया
                                                    padding: '10px',  // पैडिंग को कम किया
                                                    backgroundColor: '#f9fcf7',
                                                    borderRadius: '8px',
                                                    border: '1px solid rgba(82, 180, 71, 0.1)'
                                                }}>
                                                    <p style={{ margin: '0' }}>
                                                        <strong style={{ color: '#555', marginRight: '8px', display: 'inline-block', minWidth: '110px' }}>Last Updated:</strong>
                                                        <span style={{ color: '#333', fontWeight: '500' }}>{formatDate(selectedForm.updatedAt)}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer" style={{
                                borderTop: '1px solid rgba(82, 180, 71, 0.1)',
                                padding: '12px 25px'  // पैडिंग को कम किया
                            }}>
                                <button 
                                    type="button" 
                                    className="btn"
                                    style={{
                                        background: 'linear-gradient(135deg, #52b447, #429938)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '8px 20px',  // पैडिंग को कम किया
                                        fontWeight: '600',
                                        fontSize: '14px',  // फॉन्ट साइज को कम किया
                                        boxShadow: '0 4px 10px rgba(82, 180, 71, 0.2)',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 6px 12px rgba(82, 180, 71, 0.3)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 4px 10px rgba(82, 180, 71, 0.2)';
                                    }}
                                    onClick={handleCloseModal}
                                >
                                    <i className="icofont-close-circled me-2"></i>
                                    Close
                                </button>
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
                contentClassName="border-0"
                backdropClassName="modal-backdrop-custom"
            >
                <Modal.Header closeButton style={{
                    background: 'linear-gradient(135deg, #ff8a00, #ff5e00)',
                    borderBottom: 'none',
                    padding: '15px 25px',
                    color: 'white'
                }}>
                    <Modal.Title style={{
                        fontWeight: '700',
                        fontSize: '18px',
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        <i className="icofont-paper me-2" style={{ fontSize: '20px' }}></i>
                        ICCR Form 2 Applications
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{
                    padding: '20px',
                    maxHeight: '70vh',
                    overflow: 'auto'
                }}>
                    {iccr2Data.length > 0 ? (
                        <div className="table-responsive">
                            <table className="table" style={{
                                borderCollapse: 'separate',
                                borderSpacing: '0',
                                width: '100%',
                                marginBottom: '0'
                            }}>
                                <thead>
                                    <tr style={{
                                        background: '#f8f9fa',
                                    }}>
                                        <th style={{
                                            padding: '14px 15px',
                                            fontWeight: '600',
                                            color: '#444',
                                            borderBottom: '2px solid rgba(82, 180, 71, 0.2)',
                                            textAlign: 'left'
                                        }}>Name</th>
                                        <th style={{
                                            padding: '14px 15px',
                                            fontWeight: '600',
                                            color: '#444',
                                            borderBottom: '2px solid rgba(82, 180, 71, 0.2)',
                                            textAlign: 'left'
                                        }}>Email</th>
                                        <th style={{
                                            padding: '14px 15px',
                                            fontWeight: '600',
                                            color: '#444',
                                            borderBottom: '2px solid rgba(82, 180, 71, 0.2)',
                                            textAlign: 'left'
                                        }}>Course Level</th>
                                        <th style={{
                                            padding: '14px 15px',
                                            fontWeight: '600',
                                            color: '#444',
                                            borderBottom: '2px solid rgba(82, 180, 71, 0.2)',
                                            textAlign: 'left'
                                        }}>Course Stream</th>
                                        <th style={{
                                            padding: '14px 15px',
                                            fontWeight: '600',
                                            color: '#444',
                                            borderBottom: '2px solid rgba(82, 180, 71, 0.2)',
                                            textAlign: 'center'
                                        }}>Status</th>
                                        <th style={{
                                            padding: '14px 15px',
                                            fontWeight: '600',
                                            color: '#444',
                                            borderBottom: '2px solid rgba(82, 180, 71, 0.2)',
                                            textAlign: 'left'
                                        }}>Date Applied</th>
                                        <th style={{
                                            padding: '14px 15px',
                                            fontWeight: '600',
                                            color: '#444',
                                            borderBottom: '2px solid rgba(82, 180, 71, 0.2)',
                                            textAlign: 'center'
                                        }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {iccr2Data.map((application) => (
                                        <tr key={application._id} style={{
                                            transition: 'background 0.2s ease',
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(82, 180, 71, 0.04)'}
                                        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                                            <td style={{
                                                padding: '14px 15px',
                                                borderBottom: '1px solid rgba(0,0,0,0.05)',
                                                color: '#333',
                                                fontWeight: '600'
                                            }}>{application.fullName}</td>
                                            <td style={{
                                                padding: '14px 15px',
                                                borderBottom: '1px solid rgba(0,0,0,0.05)',
                                                color: '#555'
                                            }}>
                                                <i className="icofont-email me-1" style={{ color: '#52b447' }}></i>
                                                {application.email}
                                            </td>
                                            <td style={{
                                                padding: '14px 15px',
                                                borderBottom: '1px solid rgba(0,0,0,0.05)',
                                                color: '#555'
                                            }}>
                                                <span style={{
                                                    backgroundColor: 'rgba(82, 180, 71, 0.1)',
                                                    color: '#52b447',
                                                    padding: '3px 10px',
                                                    borderRadius: '4px',
                                                    fontWeight: '500',
                                                    fontSize: '13px'
                                                }}>
                                                    {application.levelOfCourse}
                                                </span>
                                            </td>
                                            <td style={{
                                                padding: '14px 15px',
                                                borderBottom: '1px solid rgba(0,0,0,0.05)',
                                                color: '#555'
                                            }}>{application.courseMainStream}</td>
                                            <td style={{
                                                padding: '14px 15px',
                                                borderBottom: '1px solid rgba(0,0,0,0.05)',
                                                textAlign: 'center'
                                            }}>
                                                <span style={{
                                                    backgroundColor: 
                                                        application.status === 'Approved' ? 'rgba(25, 135, 84, 0.1)' :
                                                        application.status === 'Rejected' ? 'rgba(220, 53, 69, 0.1)' :
                                                        application.status === 'Under Review' ? 'rgba(255, 193, 7, 0.1)' : 
                                                        'rgba(108, 117, 125, 0.1)',
                                                    color: 
                                                        application.status === 'Approved' ? '#198754' :
                                                        application.status === 'Rejected' ? '#dc3545' :
                                                        application.status === 'Under Review' ? '#ff8a00' : 
                                                        '#6c757d',
                                                    padding: '5px 10px',
                                                    borderRadius: '30px',
                                                    fontWeight: '600',
                                                    fontSize: '12px',
                                                    display: 'inline-block',
                                                    border: 
                                                        application.status === 'Approved' ? '1px solid rgba(25, 135, 84, 0.2)' :
                                                        application.status === 'Rejected' ? '1px solid rgba(220, 53, 69, 0.2)' :
                                                        application.status === 'Under Review' ? '1px solid rgba(255, 193, 7, 0.2)' : 
                                                        '1px solid rgba(108, 117, 125, 0.2)'
                                                }}>
                                                    {application.status === 'Approved' && <i className="icofont-check-circled me-1"></i>}
                                                    {application.status === 'Rejected' && <i className="icofont-close-circled me-1"></i>}
                                                    {application.status === 'Under Review' && <i className="icofont-clock-time me-1"></i>}
                                                    {application.status}
                                                </span>
                                            </td>
                                            <td style={{
                                                padding: '14px 15px',
                                                borderBottom: '1px solid rgba(0,0,0,0.05)',
                                                color: '#555'
                                            }}>
                                                <i className="icofont-calendar me-1" style={{ color: '#52b447' }}></i>
                                                {new Date(application.createdAt).toLocaleDateString()}
                                            </td>
                                            <td style={{
                                                padding: '14px 15px',
                                                borderBottom: '1px solid rgba(0,0,0,0.05)',
                                                textAlign: 'center'
                                            }}>
                                                <button 
                                                    className="btn"
                                                    style={{
                                                        background: 'linear-gradient(135deg, #52b447, #429938)',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        padding: '6px 12px',
                                                        fontWeight: '500',
                                                        fontSize: '13px',
                                                        boxShadow: '0 2px 6px rgba(82, 180, 71, 0.2)',
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                    onMouseOver={(e) => {
                                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(82, 180, 71, 0.3)';
                                                    }}
                                                    onMouseOut={(e) => {
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                        e.currentTarget.style.boxShadow = '0 2px 6px rgba(82, 180, 71, 0.2)';
                                                    }}
                                                    onClick={() => handleViewDetailsClick(application._id)}
                                                >
                                                    <i className="icofont-eye me-1"></i>
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div style={{ 
                            padding: '30px 20px', 
                            textAlign: 'center',
                            backgroundColor: '#f9fcf7', 
                            borderRadius: '12px',
                            color: '#666666',
                            border: '1px dashed rgba(82, 180, 71, 0.3)'
                        }}>
                            <i className="icofont-file-alt" style={{ 
                                fontSize: '48px', 
                                color: '#52b447',
                                opacity: '0.5',
                                marginBottom: '15px',
                                display: 'block'
                            }}></i>
                            <p style={{ 
                                margin: 0, 
                                fontSize: '16px', 
                                fontWeight: '500',
                                color: '#666' 
                            }}>
                            No ICCR Form 2 applications found.
                            </p>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer style={{
                    borderTop: '1px solid rgba(82, 180, 71, 0.1)',
                    padding: '15px 25px'
                }}>
                    <button 
                        className="btn"
                        style={{
                            background: 'linear-gradient(135deg, #52b447, #429938)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px 20px',
                            fontWeight: '600',
                            fontSize: '14px',
                            boxShadow: '0 4px 10px rgba(82, 180, 71, 0.2)',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 12px rgba(82, 180, 71, 0.3)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 10px rgba(82, 180, 71, 0.2)';
                        }}
                        onClick={handleCloseIccr2Modal}
                    >
                        <i className="icofont-close-circled me-2"></i>
                        Close
                    </button>
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
                                                    src={`${import.meta.env.VITE_BASE_URL}${selectedApplication.studentPhoto.replace(/\\/g, '/')}`} 
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
                                            src={`${import.meta.env.VITE_BASE_URL}${selectedApplication.signature.replace(/\\/g, '/')}`} 
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
                                                        href={`${import.meta.env.VITE_BASE_URL}${selectedApplication.permanentUniqueId.replace(/\\/g, '/')}`} 
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
                                                        href={`${import.meta.env.VITE_BASE_URL}${selectedApplication.passportCopy.replace(/\\/g, '/')}`} 
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
                                                        href={`${import.meta.env.VITE_BASE_URL}${selectedApplication.gradeXMarksheet.replace(/\\/g, '/')}`} 
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
                                                        href={`${import.meta.env.VITE_BASE_URL}${selectedApplication.gradeXIIMarksheet.replace(/\\/g, '/')}`} 
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
                                                        href={`${import.meta.env.VITE_BASE_URL}${selectedApplication.medicalFitnessCertificate.replace(/\\/g, '/')}`} 
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
                                                        href={`${import.meta.env.VITE_BASE_URL}${selectedApplication.englishTranslationOfDocuments.replace(/\\/g, '/')}`} 
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
                                                        href={`${import.meta.env.VITE_BASE_URL}${selectedApplication.englishAsSubjectDocument.replace(/\\/g, '/')}`} 
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
                                                        href={`${import.meta.env.VITE_BASE_URL}${selectedApplication.anyOtherDocument.replace(/\\/g, '/')}`} 
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

