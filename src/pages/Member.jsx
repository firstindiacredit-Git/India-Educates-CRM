import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Link } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Loading.css"
import { useNavigate } from "react-router-dom";
import FloatingMenu from '../Chats/FloatingMenu'

const Member = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('grid');
  const [employeeProjects, setEmployeeProjects] = useState({});
  const [employeeTasks, setEmployeeTasks] = useState({});
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');

  //CREATE EMPLOYEE
  const [formData, setFormData] = useState({
    employeeName: '',
    employeeId: '',
    emailid: '',
    password: '',
    phone: '',
    description: '',
    joiningDate: '',
    // Add address fields
    street: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    // Bank details
    bankName: '',
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    accountType: '',
    upiId: '',
    paymentApp: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.files[0],
    });
  };

  const handleSubmit = async () => {
    try {
      const formDataToSend = new FormData();

      // Add basic fields
      formDataToSend.append('employeeName', formData.employeeName);
      formDataToSend.append('employeeId', formData.employeeId);
      formDataToSend.append('joiningDate', formData.joiningDate);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('emailid', formData.emailid);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('description', formData.description);

      // Add address fields
      formDataToSend.append('street', formData.street || '');
      formDataToSend.append('city', formData.city || '');
      formDataToSend.append('state', formData.state || '');
      formDataToSend.append('country', formData.country || '');
      formDataToSend.append('postalCode', formData.postalCode || '');

      // Add bank details
      formDataToSend.append('bankName', formData.bankName || '');
      formDataToSend.append('accountHolderName', formData.accountHolderName || '');
      formDataToSend.append('accountNumber', formData.accountNumber || '');
      formDataToSend.append('ifscCode', formData.ifscCode || '');
      formDataToSend.append('accountType', formData.accountType || '');
      formDataToSend.append('upiId', formData.upiId || '');
      formDataToSend.append('paymentApp', formData.paymentApp || '');

      // Add files if they exist
      if (formData.employeeImage) {
        formDataToSend.append('employeeImage', formData.employeeImage);
      }
      if (formData.qrCode) {
        formDataToSend.append('qrCode', formData.qrCode);
      }

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}api/employees`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.status === 201) {
        toast.success('Employee created successfully!', {
          style: {
            backgroundColor: "#0d6efd",
            color: "white",
          },
        });

        // Close modal
        const modal = document.getElementById('createemp');
        const bootstrapModal = bootstrap.Modal.getInstance(modal);
        bootstrapModal.hide();

        // Reset form
        setFormData({
          employeeName: '',
          employeeImage: null,
          employeeId: '',
          joiningDate: '',
          password: '',
          emailid: '',
          phone: '+91',
          description: '',
          street: '',
          city: '',
          state: '',
          country: '',
          postalCode: '',
          bankName: '',
          accountHolderName: '',
          accountNumber: '',
          ifscCode: '',
          accountType: '',
          upiId: '',
          qrCode: null,
          paymentApp: ''
        });

        // Refresh employee list
        await fetchEmployees();

        // Optional: Reload page after 5 seconds
        setTimeout(() => {
          window.location.reload();
        }, 5000);
      }
    } catch (error) {
      console.error('Error creating employee:', error);
      toast.error(error.response?.data?.message || 'Failed to create employee');
    }
  };

  // Add this function to fetch project counts for each employee
  const fetchEmployeeProjects = async (employeeId) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}api/totalAssigneeProjects`,
        { _id: employeeId }
      );
      return response.data.totalProjects;
    } catch (error) {
      console.error("Error fetching project count:", error);
      return 0;
    }
  };

  // Add this function to fetch task counts for each employee
  const fetchEmployeeTasks = async (employeeId) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}api/totalAssigneeTasks`,
        { _id: employeeId }
      );
      return response.data.totalTasks;
    } catch (error) {
      console.error("Error fetching task count:", error);
      return 0;
    }
  };

  // Modify the useEffect to fetch both projects and tasks
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}api/employees`
        );
        let lastOldId = 1;
        response.data.forEach((d) => {
          // Add null check and ensure employeeId exists and has the expected format
          if (d && d.employeeId && typeof d.employeeId === 'string') {
            const newId = parseInt(d.employeeId.slice(2), 10);
            if (!Number.isNaN(newId) && newId > lastOldId) {
              lastOldId = newId;
            }
          }
        });

        const newId = `#IE00${lastOldId + 1}`;
        setFormData((prevFormData) => ({
          ...prevFormData,
          employeeId: newId,
        }));

        // Save the fetched employees
        const modifiedEmployees = response.data.map(employee => ({
          ...employee,
          employeeImage: employee.employeeImage ? employee.employeeImage : ''
        }));

        // Fetch both project and task counts for each employee
        const projectCounts = {};
        const taskCounts = {};
        await Promise.all(
          modifiedEmployees.map(async (employee) => {
            const [projectCount, taskCount] = await Promise.all([
              fetchEmployeeProjects(employee._id),
              fetchEmployeeTasks(employee._id)
            ]);
            projectCounts[employee._id] = projectCount;
            taskCounts[employee._id] = taskCount;
          })
        );

        setEmployeeProjects(projectCounts);
        setEmployeeTasks(taskCounts);
        setEmployees(modifiedEmployees); // Set the modified employees

      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Add useEffect for fetching countries
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch('https://api.countrystatecity.in/v1/countries', {
          headers: {
            'X-CSCAPI-KEY': 'eUNnUGVIam1VVXVqOFdKWWtzc0I1REM5cFVnZWtaTEEyM1l5ZE1JMw=='
          }
        });
        const data = await response.json();
        setCountries(data);
      } catch (error) {
        console.error('Error fetching countries:', error);
      }
    };
    fetchCountries();
  }, []);

  // Add useEffect for fetching states when country changes
  useEffect(() => {
    const fetchStates = async () => {
      if (selectedCountry) {
        try {
          const response = await fetch(`https://api.countrystatecity.in/v1/countries/${selectedCountry}/states`, {
            headers: {
              'X-CSCAPI-KEY': 'eUNnUGVIam1VVXVqOFdKWWtzc0I1REM5cFVnZWtaTEEyM1l5ZE1JMw=='
            }
          });
          const data = await response.json();
          setStates(data);
        } catch (error) {
          console.error('Error fetching states:', error);
        }
      } else {
        setStates([]);
      }
    };
    fetchStates();
  }, [selectedCountry]);

  // Add country change handler
  const handleCountryChange = (e) => {
    const countryCode = e.target.value;
    setSelectedCountry(countryCode);
    setFormData(prev => ({
      ...prev,
      country: countries.find(c => c.iso2 === countryCode)?.name || '',
      state: '' // Reset state when country changes
    }));
  };

  // Add state change handler
  const handleStateChange = (e) => {
    const stateName = e.target.value;
    setFormData(prev => ({
      ...prev,
      state: stateName
    }));
  };

  //DELETE EMPLOYEE
  const [deletableId, setDeletableId] = useState("");
  const handleDelete = async () => {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}api/employees/` + deletableId
      );
      // console.log(response.data);
      // window.location.reload();
      const remainingEmployee = employees.filter((prevEmployee) => {
        return prevEmployee._id !== deletableId;
      });
      setEmployees(remainingEmployee);

      const modalElement = document.getElementById("deleteproject");
      const modal = window.bootstrap.Modal.getInstance(modalElement);
      modal.hide();

      toast.error("Employee Deleted Successfully!", {
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
      console.error("Error:", error);
    }
  };

  // UPDATE EMPLOYEE
  const [employeeData, setEmployeeData] = useState({
    employeeName: "",
    employeeImage: null,
    employeeId: "",
    joiningDate: "",
    password: "",
    emailid: "",
    phone: "+91",
    description: "",
    street: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    bankName: "",
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    accountType: "",
    upiId: "",
    qrCode: null,
    paymentApp: ""
  });
  const [toEdit, setToEdit] = useState("");
  // console.log(projectFormData);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}api/employees/${toEdit}`
        );
        const { data } = response;
        let formattedDate = "";
        const fDate = (data) => {
          const sd = new Date(data);
          const sy = sd.getFullYear();
          const sm =
            sd.getMonth() + 1 < 10
              ? "0" + (Number(sd.getMonth()) + 1)
              : sd.getMonth();
          const sdd = sd.getDate() < 10 ? "0" + sd.getDate() : sd.getDate();
          formattedDate = `${sy}-${sm}-${sdd}`;
          return formattedDate;
        };
        const fStartDate = fDate(data.joiningDate);
        // console.log(fStartDate);
        setEmployeeData({
          employeeName: data.employeeName,
          employeeImage: data.employeeImage,
          employeeId: data.employeeId,
          joiningDate: fStartDate,
          password: data.password,
          emailid: data.emailid,
          phone: data.phone,
          description: data.description,
          street: data.address?.street || '',
          city: data.address?.city || '',
          state: data.address?.state || '',
          country: data.address?.country || '',
          postalCode: data.address?.postalCode || '',
          bankName: data.bankDetails?.bankName || '',
          accountHolderName: data.bankDetails?.accountHolderName || '',
          accountNumber: data.bankDetails?.accountNumber || '',
          ifscCode: data.bankDetails?.ifscCode || '',
          accountType: data.bankDetails?.accountType || '',
          upiId: data.bankDetails?.upiId || '',
          qrCode: data.bankDetails?.qrCode || null,
          paymentApp: data.bankDetails?.paymentApp || ''
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    if (toEdit) {
      fetchData();
    }
  }, [toEdit]);
  const updateChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === 'file') {
      setEmployeeData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    } else {
      setEmployeeData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const handleEditClick = (employee) => {
    setSelectedEmployee(employee); // Add this line
    setToEdit(employee._id);
    setEmployeeData({
      ...employee,
      bankName: employee.bankDetails?.bankName || '',
      accountHolderName: employee.bankDetails?.accountHolderName || '',
      accountNumber: employee.bankDetails?.accountNumber || '',
      ifscCode: employee.bankDetails?.ifscCode || '',
      accountType: employee.bankDetails?.accountType || '',
      upiId: employee.bankDetails?.upiId || '',
      paymentApp: employee.bankDetails?.paymentApp || ''
    });
  };

  // Add this function before the updateSubmit function
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}api/employees`
      );

      // Save the fetched employees
      const modifiedEmployees = response.data.map(employee => ({
        ...employee,
        employeeImage: employee.employeeImage ? employee.employeeImage : ''
      }));

      // Fetch both project and task counts for each employee
      const projectCounts = {};
      const taskCounts = {};
      await Promise.all(
        modifiedEmployees.map(async (employee) => {
          const [projectCount, taskCount] = await Promise.all([
            fetchEmployeeProjects(employee._id),
            fetchEmployeeTasks(employee._id)
          ]);
          projectCounts[employee._id] = projectCount;
          taskCounts[employee._id] = taskCount;
        })
      );

      setEmployeeProjects(projectCounts);
      setEmployeeTasks(taskCounts);
      setEmployees(modifiedEmployees);

    } catch (error) {
      console.error("Error:", error);
      toast.error('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const updateSubmit = async () => {
    try {
      const formData = new FormData();

      // Add basic fields
      Object.keys(employeeData).forEach(key => {
        if (employeeData[key] !== null &&
          key !== 'socialLinks' &&
          key !== '_id' &&
          key !== '__v' &&
          key !== 'createdAt' &&
          key !== 'updatedAt') {
          // Ensure social link values are strings
          if (typeof employeeData[key] === 'string') {
            formData.append(key, employeeData[key]);
          }
        }
      });

      // Add files if they exist
      if (employeeData.employeeImage instanceof File) {
        formData.append('employeeImage', employeeData.employeeImage);
      }

      // Add bank details
      formData.append('bankName', employeeData.bankName || '');
      formData.append('accountHolderName', employeeData.accountHolderName || '');
      formData.append('accountNumber', employeeData.accountNumber || '');
      formData.append('ifscCode', employeeData.ifscCode || '');
      formData.append('accountType', employeeData.accountType || '');
      formData.append('upiId', employeeData.upiId || '');
      formData.append('paymentApp', employeeData.paymentApp || '');

      if (employeeData.qrCode instanceof File) {
        formData.append('qrCode', employeeData.qrCode);
      }

      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}api/employees/${toEdit}`, // Use toEdit instead of selectedEmployee._id
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.status === 200) {
        toast.success('Employee updated successfully!', {
          style: {
            backgroundColor: "#0d6efd",
            color: "white",
          },
        });
        // Close modal
        const modal = document.getElementById('editemp');
        const bootstrapModal = bootstrap.Modal.getInstance(modal);
        bootstrapModal.hide();

        // Refresh employee list
        await fetchEmployees();

        // Optional: Reload page after 5 seconds (keeping your existing pattern)
        setTimeout(() => {
          window.location.reload();
        }, 5000);
      }
    } catch (error) {
      console.error('Error updating employee:', error);
      toast.error(error.response?.data?.message || 'Failed to update employee');
    }
  };

  // GET SINGLE EMPLOYEE
  const [searchQuery, setSearchQuery] = useState("");
  const handleSearch = async (searchQuery) => {
    if (searchQuery !== "") {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}api/search?id=${searchQuery}`
        );
        setEmployees(response.data);
      } catch (error) {
        console.error("Error:", error);
        setEmployees(null);
      }
    } else {
      const fetchData = async () => {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_BASE_URL}api/employees`
          );
          setEmployees(response.data);
        } catch (error) {
          console.error("Error:", error);
        }
      };

      fetchData();
    }
  };

  const [selectedImageDetails, setSelectedImageDetails] = useState({ url: null, name: null });

  const handleImageClick = useCallback((imageUrl, employeeName) => {
    setSelectedImageDetails({ url: imageUrl, name: employeeName });
  }, []);

  const [pdfUrl, setPdfUrl] = useState(null);


  const handleFileClick = useCallback((e, fileUrl, fileType, employeeName) => {
    e.preventDefault();
    e.stopPropagation();
    if (fileType === 'pdf') {
      setPdfUrl(fileUrl);
      setSelectedImageDetails(prev => ({ ...prev, name: employeeName }));
    } else {
      setSelectedImageDetails({ url: fileUrl, name: employeeName });
    }
  }, []);
  const closeImageModal = () => {
    setSelectedImageDetails({ url: null, name: null });
  };
  const closePdfViewer = () => {
    setPdfUrl(null);
  };

  const handleEmployeeClick = (employee) => {
    console.log(employee.employeeId)
    navigate('/members/MembersDashboard', {
      state: {
        employeeId: employee._id,
        employeeCode: employee.employeeId,
        employee
      }
    });
  };

  // Add useEffect for handling ESC key
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        if (pdfUrl) {
          closePdfViewer();
        }
        if (selectedImageDetails.url) {
          closeImageModal();
        }
      }
    };

    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [pdfUrl, selectedImageDetails.url]);

  // Add click handler functions for modal backdrop
  const handlePdfModalBackdropClick = (e) => {
    if (e.target.classList.contains('modal')) {
      closePdfViewer();
    }
  };

  const handleImageModalBackdropClick = (e) => {
    if (e.target.classList.contains('modal')) {
      closeImageModal();
    }
  };

  // Add this function near your other handler functions
  const handleDownload = async (fileUrl, fileName) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}${fileUrl}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Download failed');
    }
  };

  // Add this new function to handle document deletion
  const handleDocumentDelete = async (employeeId, documentType) => {
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_BASE_URL}api/employees/${employeeId}/document`,
        { documentType }
      );

      if (response.status === 200) {
        // Update the local state to reflect the change
        setEmployees(employees.map(emp => {
          if (emp._id === employeeId) {
            return {
              ...emp,
              [documentType]: null
            };
          }
          return emp;
        }));

        toast.success('Document deleted successfully!', {
          style: {
            backgroundColor: "#0d6efd",
            color: "white",
          },
        });
        setTimeout(() => {
          window.location.reload();
        }, 5000);
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
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
                    <div className="card border-0 mb-4 no-bg">
                      <div className="card-header py-3 px-0 d-sm-flex align-items-center  justify-content-between border-bottom">
                        <h3 className=" fw-bold flex-fill mb-0 mt-sm-0">
                          ASSOCIATES
                        </h3>
                        <button
                          type="button"
                          className="btn btn-dark me-1 mt-1 w-sm-100"
                          data-bs-toggle="modal"
                          data-bs-target="#createemp"
                        >
                          <i className="icofont-plus-circle me-2 fs-6" />
                          Add Associate
                        </button>

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
                        <div className="order-0 col-lg-4 col-md-4 col-sm-12 col-12 mb-3 mb-md-0 ">
                          <div className="input-group">
                            <input
                              type="search"
                              className="form-control"
                              aria-label="search"
                              aria-describedby="addon-wrapping"
                              value={searchQuery}
                              onChange={(e) => {
                                setSearchQuery(e.target.value);
                                handleSearch(e.target.value);
                              }}
                              placeholder="Enter Associate Name"
                            />
                            <button
                              type="button"
                              className="input-group-text"
                              id="addon-wrapping"
                              onClick={handleSearch}
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
                  <div className="custom-loader"></div>
                ) : employees.length === 0 ? (
                  <div className="text-center mt-4">
                    <h1 className="text-muted">No Associates available. Please add an Associate.</h1>
                  </div>
                ) : (viewMode === 'grid' ? (
                  <div className="row g-3 row-cols-1 row-cols-sm-1 row-cols-md-1 row-cols-lg-2 row-cols-xl-2 row-cols-xxl-2 row-deck py-1 pb-4">
                    {employees.map((employee) => {
                      const newDate = new Date(employee?.joiningDate);
                      const date = newDate.getDate();
                      const month = newDate.getMonth() + 1; // months are 0-indexed
                      const year = newDate.getFullYear();
                      return (
                        <div className="col" key={employee.employeeId}>
                          <div className="card teacher-card">
                            <div className="card-body d-flex">

                              <div className="profile-av pe-xl-4 pe-md-2 pe-sm-4 pe-4 text-center w-75">
                                <div className="position-relative d-inline-block">
                                  <img
                                    src={`${import.meta.env.VITE_BASE_URL}${employee.employeeImage}`}
                                    alt=""
                                    className="avatar xl rounded-circle img-thumbnail shadow-sm"
                                    style={{
                                      transition: 'transform 0.3s ease-in-out',
                                      cursor: 'pointer',
                                      objectFit: 'cover',
                                    }}
                                    onMouseEnter={(e) => {
                                      e.target.style.transform = 'scale(2.5)';
                                      e.target.style.zIndex = '100';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.target.style.transform = 'scale(1)';
                                      e.target.style.zIndex = '1';
                                    }}
                                    onClick={() => handleImageClick(
                                      `${import.meta.env.VITE_BASE_URL}${employee.employeeImage}`,
                                      employee.employeeName
                                    )}
                                  />
                                </div>

                                <div className="about-info mt-3">
                                  <div className="followers me-2">
                                  </div>
                                  <div className="own-video">
                                    <i className="bi bi-telephone-fill text-success fs-6 me-2" />
                                    <span>{employee.phone}</span>
                                  </div>
                                  <p className="rounded-1 d-inline-block fw-bold small-11 mb-1 d-flex justify-content-center">
                                    <i className="bi bi-envelope-at-fill text-primary fs-6 me-1" />
                                    {employee.emailid}
                                  </p>
                                </div>

                              </div>

                              <div className="teacher-info border-start ps-xl-4 ps-md-3 ps-sm-4 ps-4 w-100">
                                <div>
                                  <div className="d-flex justify-content-between">

                                    <div>
                                      <h6
                                        className="mb-0 mt-2 fw-bold d-block fs-6"
                                        onClick={() => handleEmployeeClick(employee)}
                                        style={{ cursor: 'pointer' }}
                                        title="Click to View Employee Dashboard"
                                      >
                                        {employee.employeeName}
                                      </h6>

                                    </div>

                                    <div>
                                      <div
                                        className="btn-group"
                                        role="group"
                                        aria-label="Basic outlined example"
                                      >
                                        <button
                                          type="button"
                                          className="btn btn-outline-secondary"
                                          data-bs-toggle="modal"
                                          data-bs-target="#editemp"
                                          onClick={() => handleEditClick(employee)}
                                        >
                                          <i className="icofont-edit text-success" />
                                        </button>
                                        <button
                                          type="button"
                                          className="btn btn-outline-secondary"
                                          data-bs-toggle="modal"
                                          data-bs-target="#deleteproject"
                                          onClick={() => {
                                            setDeletableId(employee._id);
                                          }}
                                        >
                                          <i className="icofont-ui-delete text-danger" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="d-flex justify-content-between">

                                    <span className="fw-bold small-11 mb-0 mt-1">
                                      <i className="bi bi-calendar-check-fill text-primary fs-6 me-2" />
                                      {date}/{month}/{year}
                                    </span>
                                    <span className="fw-bold small-11 mb-0 mt-1">
                                      <i className="bi bi-person-vcard-fill text-success fs-6 me-2" />
                                      {employee.employeeId}
                                    </span>
                                  </div>
                                </div>
                                <div className="video-setting-icon mt-2 pt-2 border-top">
                                  <p>{employee.description}</p>
                                </div>
                                <div className="mt-2">
                                  <div className="d-flex gap-2 fw-bold">
                                    Projects :
                                    <span className="text-primary">
                                      {employeeProjects[employee._id] || 0}
                                    </span>
                                    <Link
                                      to="/projects"
                                      state={{ employeeName: employee.employeeName }}
                                      className="arrow-link"
                                      title={`Click to View Projects of ${employee.employeeName}`}
                                    >
                                      <i className="bi bi-arrow-right" />
                                    </Link>
                                  </div>
                                  <div className="d-flex gap-2 fw-bold">
                                    Tasks :
                                    <span className="text-success">
                                      {employeeTasks[employee._id] || 0}
                                    </span>
                                    <Link
                                      to="/tasks"
                                      state={{ employeeName: employee.employeeName }}
                                      className="arrow-link"
                                      title={`Click to View Tasks of ${employee.employeeName}`}
                                    >
                                      <i className="bi bi-arrow-right" />
                                    </Link>
                                  </div>
                                </div>

                                {/* bank details */}
                                <div className="d-flex justify-content-between mt-2 gap-2">
                                  <button
                                    className="btn btn-sm btn-outline-primary"
                                    data-bs-toggle="modal"
                                    data-bs-target="#bankDetailsModal"
                                    onClick={() => setSelectedEmployee(employee)}
                                  >
                                    <i className="bi bi-bank me-2"></i>
                                    Bank
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-success"
                                    data-bs-toggle="modal"
                                    data-bs-target="#addressDetailsModal"
                                    onClick={() => setSelectedEmployee(employee)}
                                  >
                                    <i className="bi bi-geo-alt me-2"></i>
                                    Address
                                  </button>
                                </div>

                                {/* social links */}
                                <div className="social-links mt-3">
                                  <div className="d-flex flex-wrap gap-2">
                                    {employee.socialLinks?.linkedin && (
                                      <a href={employee.socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
                                        className="btn btn-sm btn-outline-primary">
                                        <i className="bi bi-linkedin"></i>
                                      </a>
                                    )}
                                    {employee.socialLinks?.instagram && (
                                      <a href={employee.socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                                        className="btn btn-sm btn-outline-danger">
                                        <i className="bi bi-instagram"></i>
                                      </a>
                                    )}
                                    {employee.socialLinks?.youtube && (
                                      <a href={employee.socialLinks.youtube} target="_blank" rel="noopener noreferrer"
                                        className="btn btn-sm btn-outline-danger">
                                        <i className="bi bi-youtube"></i>
                                      </a>
                                    )}
                                    {employee.socialLinks?.facebook && (
                                      <a href={employee.socialLinks.facebook} target="_blank" rel="noopener noreferrer"
                                        className="btn btn-sm btn-outline-primary">
                                        <i className="bi bi-facebook"></i>
                                      </a>
                                    )}
                                    {employee.socialLinks?.github && (
                                      <a href={employee.socialLinks.github} target="_blank" rel="noopener noreferrer"
                                        className="btn btn-sm btn-outline-dark">
                                        <i className="bi bi-github"></i>
                                      </a>
                                    )}
                                    {employee.socialLinks?.website && (
                                      <a href={employee.socialLinks.website} target="_blank" rel="noopener noreferrer"
                                        className="btn btn-sm btn-outline-info">
                                        <i className="bi bi-globe"></i>
                                      </a>
                                    )}
                                    {employee.socialLinks?.other && (
                                      <a href={employee.socialLinks.other} target="_blank" rel="noopener noreferrer"
                                        className="btn btn-sm btn-outline-secondary">
                                        <i className="bi bi-link-45deg"></i>
                                      </a>
                                    )}
                                  </div>
                                </div>



                                {/* <button
                                    className="btn btn-sm btn-outline-secondary mt-2 ms-2"
                                    data-bs-toggle="modal"
                                    data-bs-target="#viewDocumentsModal"
                                    onClick={() => setSelectedEmployee(employee)}
                                  >
                                    <i className="bi bi-file-earmark-text me-2"></i>
                                    View Documents
                                  </button> */}





                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="row clearfix">
                    <div className="col-md-12">
                      <div className="card">
                        <div className="card-body">
                          <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                              <thead>
                                <tr>
                                  <th>Employee</th>
                                  <th>Contact</th>
                                  <th>Department</th>
                                  <th>Projects</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {employees.map((employee) => {
                                  const newDate = new Date(employee?.joiningDate);
                                  const date = newDate.getDate();
                                  const month = newDate.getMonth() + 1; // months are 0-indexed
                                  const year = newDate.getFullYear();
                                  return (
                                    <tr key={employee.employeeId}>
                                      <td>
                                        <div className="d-flex align-items-center">
                                          <img
                                            src={`${import.meta.env.VITE_BASE_URL}${employee.employeeImage}`}
                                            alt=""
                                            className="avatar rounded-circle me-2"
                                            style={{
                                              width: '40px',
                                              height: '40px',
                                              objectFit: 'cover',
                                              cursor: 'pointer'
                                            }}
                                            onClick={() => handleImageClick(
                                              `${import.meta.env.VITE_BASE_URL}${employee.employeeImage}`,
                                              employee.employeeName
                                            )}
                                          />
                                          <div>
                                            <h6 className="mb-0">{employee.employeeName}</h6>
                                            <small>{employee.employeeId}</small>
                                          </div>
                                        </div>
                                      </td>
                                      <td>
                                        <div>{employee.phone}</div>
                                        <small>{employee.emailid}</small>
                                        <div> <i className="bi bi-calendar-check-fill text-primary fs-6 me-2" />
                                          {date}/{month}/{year}</div>
                                      </td>
                                      <td>
                                        <div>{employee.department}</div>
                                        <small>{employee.designation}</small>
                                      </td>
                                      <td>
                                        <div className="d-flex flex-column gap-1">
                                          <Link
                                            to="/projects"
                                            state={{ employeeName: employee.employeeName }}
                                            title={`Click to View Projects of ${employee.employeeName}`}
                                          >
                                            <span className="badge bg-primary px-3">
                                              Projects: {employeeProjects[employee._id] || 0}
                                            </span>
                                          </Link>
                                          <Link
                                            to="/tasks"
                                            state={{ employeeName: employee.employeeName }}
                                            title={`Click to View Tasks of ${employee.employeeName}`}
                                          >
                                            <span className="badge bg-success px-3">
                                              Tasks: {employeeTasks[employee._id] || 0}
                                            </span>
                                          </Link>
                                        </div>
                                      </td>
                                      <td>
                                        <div className="btn-group" role="group">
                                          <button
                                            className="btn btn-sm btn-outline-secondary"
                                            data-bs-toggle="modal"
                                            data-bs-target="#editemp"
                                            onClick={() => handleEditClick(employee)}
                                          >
                                            <i className="icofont-edit text-success"></i>
                                          </button>
                                          <button
                                            className="btn btn-sm btn-outline-secondary"
                                            data-bs-toggle="modal"
                                            data-bs-target="#deleteproject"
                                            onClick={() => setDeletableId(employee._id)}
                                          >
                                            <i className="icofont-ui-delete text-danger"></i>
                                          </button>

                                        </div>
                                        <div className="mt-2">
                                          <div className="btn-group" role="group">
                                            {/* LOCATION */}
                                            <button
                                              className="btn btn-sm btn-outline-secondary"
                                              data-bs-toggle="modal"
                                              data-bs-target="#addressDetailsModal"
                                              onClick={() => setSelectedEmployee(employee)}
                                              title="Click to View Address Details of Employee"
                                            >
                                              <i className="bi bi-geo-alt"></i>
                                            </button>
                                            {/* BANK DETAILS */}
                                            <button
                                              className="btn btn-sm btn-outline-secondary"
                                              data-bs-toggle="modal"
                                              data-bs-target="#bankDetailsModal"
                                              onClick={() => setSelectedEmployee(employee)}
                                              title="Click to View Bank Details of Employee"
                                            >
                                              <i className="bi bi-bank"></i>
                                            </button>
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
                )}
              </div>
            </div>

            {/* Update Employee*/}
            <div
              className="modal fade"
              id="editemp"
              tabIndex={-1}
              aria-hidden="true"
            >
              <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5
                      className="modal-title  fw-bold"
                      id="createprojectlLabel"
                    >
                      {" "}
                      Edit Associate
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
                      <label
                        htmlFor="exampleFormControlInput877"
                        className="form-label"
                      >
                        Associate Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="exampleFormControlInput877"
                        placeholder="Explain what the Project Name"
                        name="employeeName"
                        value={employeeData.employeeName}
                        onChange={updateChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label
                        htmlFor="updateEmployeeImage"
                        className="form-label"
                      >
                        Associate Image
                      </label>
                      <input
                        className="form-control"
                        type="file"
                        id="updateEmployeeImage"
                        name="employeeImage"
                        onChange={updateChange}
                      />
                    </div>
                    <div className="deadline-form">
                      <form>
                        <div className="row g-3 mb-3">
                          <div className="col-sm-6">
                            <label
                              htmlFor="exampleFormControlInput1778"
                              className="form-label"
                            >
                              Associate ID
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="exampleFormControlInput1778"
                              placeholder="User Name"
                              name="employeeId"
                              value={employeeData.employeeId}
                              onChange={updateChange}
                            />
                          </div>
                          <div className="col-sm-6">
                            <label
                              htmlFor="exampleFormControlInput2778"
                              className="form-label"
                            >
                              Joining Date
                            </label>
                            <input
                              type="date"
                              className="form-control"
                              id="exampleFormControlInput2778"
                              name="joiningDate"
                              value={employeeData.joiningDate}
                              onChange={updateChange}
                            />
                          </div>
                        </div>
                        <div className="row g-3 mb-3">
                          <div className="col">
                            <label
                              htmlFor="exampleFormControlInput477"
                              className="form-label"
                            >
                              Email ID
                            </label>
                            <input
                              type="email"
                              className="form-control"
                              id="exampleFormControlInput477"
                              placeholder="User Name"
                              name="emailid"
                              value={employeeData.emailid}
                              onChange={updateChange}
                            />
                          </div>
                          <div className="col">
                            <label
                              htmlFor="exampleFormControlInput277"
                              className="form-label"
                            >
                              Password
                            </label>
                            <input
                              type="Password"
                              className="form-control"
                              id="exampleFormControlInput277"
                              placeholder="Password"
                              name="password"
                              value={employeeData.password}
                              onChange={updateChange}
                            />
                          </div>
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
                              placeholder="phone"
                              maxLength={14}
                              name="phone"
                              value={employeeData.phone}
                              onChange={updateChange}
                            />
                          </div>
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Address Details</label>
                          <div className="row g-3">
                            <div className="col-md-12">
                              <div className="input-group mb-3">
                                <span className="input-group-text"><i className="bi bi-house"></i></span>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Street Address"
                                  name="street"
                                  value={employeeData.street || ''}
                                  onChange={updateChange}
                                />
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="input-group mb-3">
                                <span className="input-group-text"><i className="bi bi-globe"></i></span>
                                <select
                                  className="form-select"
                                  value={selectedCountry}
                                  onChange={handleCountryChange}
                                >
                                  <option value="">Select Country</option>
                                  {countries.map(country => (
                                    <option key={country.iso2} value={country.iso2}>
                                      {country.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="input-group mb-3">
                                <span className="input-group-text"><i className="bi bi-geo"></i></span>
                                <select
                                  className="form-select"
                                  name="state"
                                  value={employeeData.state || ''}
                                  onChange={updateChange}
                                  disabled={!selectedCountry}
                                >
                                  <option value="">Select State</option>
                                  {states.map(state => (
                                    <option key={state.iso2} value={state.name}>
                                      {state.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="input-group mb-3">
                                <span className="input-group-text"><i className="bi bi-building"></i></span>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="City"
                                  name="city"
                                  value={employeeData.city || ''}
                                  onChange={updateChange}
                                />
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="input-group mb-3">
                                <span className="input-group-text"><i className="bi bi-mailbox"></i></span>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Postal Code"
                                  name="postalCode"
                                  value={employeeData.postalCode || ''}
                                  onChange={updateChange}
                                />
                              </div>
                            </div>
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
                                  placeholder="Bank Name"
                                  name="bankName"
                                  value={employeeData.bankName || ''}
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
                                  value={employeeData.accountHolderName || ''}
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
                                  placeholder="Account Number"
                                  name="accountNumber"
                                  value={employeeData.accountNumber || ''}
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
                                  placeholder="IFSC Code"
                                  name="ifscCode"
                                  value={employeeData.ifscCode || ''}
                                  onChange={updateChange}
                                />
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="input-group mb-3">
                                <span className="input-group-text"><i className="bi bi-wallet2"></i></span>
                                <select
                                  className="form-select"
                                  name="accountType"
                                  value={employeeData.accountType || ''}
                                  onChange={updateChange}
                                >
                                  <option value="">Select Account Type</option>
                                  <option value="Savings">Savings</option>
                                  <option value="Current">Current</option>
                                  <option value="Salary">Salary</option>
                                </select>
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
                                  value={employeeData.upiId || ''}
                                  onChange={updateChange}
                                />
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="input-group mb-3">
                                <span className="input-group-text"><i className="bi bi-qr-code"></i></span>
                                <input
                                  type="file"
                                  className="form-control"
                                  name="qrCode"
                                  onChange={updateChange}
                                  accept="image/*"
                                />
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="input-group mb-3">
                                <span className="input-group-text"><i className="bi bi-app"></i></span>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Payment App (e.g., PayTM, PhonePe)"
                                  name="paymentApp"
                                  value={employeeData.paymentApp || ''}
                                  onChange={updateChange}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </form>
                    </div>
                    <div className="mb-3">
                      <label
                        htmlFor="exampleFormControlTextarea78"
                        className="form-label"
                      >
                        Description (optional)
                      </label>
                      <textarea
                        className="form-control"
                        id="exampleFormControlTextarea78"
                        rows={3}
                        placeholder="Add any extra details about the request"
                        defaultValue={""}
                        name="description"
                        value={employeeData.description}
                        onChange={updateChange}
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      data-bs-dismiss="modal"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn close text-white"
                      style={{ backgroundColor: "#0a9400" }}
                      onClick={updateSubmit}
                    >
                      Update
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* Create Employee*/}
            <div
              className="modal fade"
              id="createemp"
              tabIndex={-1}
              aria-hidden="true"
            >
              <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5
                      className="modal-title  fw-bold"
                      id="createprojectlLabel"
                    >
                      {" "}
                      Add Associate
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
                      <label
                        htmlFor="exampleFormControlInput877"
                        className="form-label"
                      >
                        Associate Name<span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="exampleFormControlInput877"
                        placeholder="Associate Name"
                        name="employeeName"
                        value={formData.employeeName}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label
                        htmlFor="formFileMultipleoneone"
                        className="form-label"
                      >
                        Associate Image <span className="text-danger">*</span>
                      </label>
                      <input
                        className="form-control"
                        type="file"
                        id="formFileMultipleoneone"
                        name="employeeImage"
                        onChange={handleFileChange}
                      />
                    </div>
                    <div className="deadline-form">
                      <form>
                        <div className="row g-3 mb-3">
                          <div className="col-sm-6">
                            <label
                              htmlFor="exampleFormControlInput1778"
                              className="form-label"
                            >
                              Associate ID <span className="text-danger">*</span>
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="exampleFormControlInput1778"
                              placeholder="Associate ID"
                              name="employeeId"
                              value={formData.employeeId}
                              onChange={handleChange}
                            />
                          </div>
                          <div className="col-sm-6">
                            <label
                              htmlFor="exampleFormControlInput2778"
                              className="form-label"
                            >
                              Joining Date
                            </label>
                            <input
                              type="date"
                              className="form-control"
                              id="exampleFormControlInput2778"
                              name="joiningDate"
                              value={formData.joiningDate}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
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
                              name="emailid"
                              value={formData.emailid}
                              onChange={handleChange}
                            />
                          </div>
                          <div className="col">
                            <label
                              htmlFor="exampleFormControlInput277"
                              className="form-label"
                            >
                              Password <span className="text-danger">*</span>
                            </label>
                            <input
                              type="Password"
                              className="form-control"
                              id="exampleFormControlInput277"
                              placeholder="Password"
                              name="password"
                              value={formData.password}
                              onChange={handleChange}
                            />
                          </div>
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
                              placeholder="Phone"
                              maxLength={14}
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Address Details</label>
                          <div className="row g-3">
                            <div className="col-md-12">
                              <div className="input-group mb-3">
                                <span className="input-group-text"><i className="bi bi-house"></i></span>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Street Address"
                                  name="street"
                                  value={formData.street}
                                  onChange={handleChange}
                                />
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="input-group mb-3">
                                <span className="input-group-text"><i className="bi bi-globe"></i></span>
                                <select
                                  className="form-select"
                                  value={selectedCountry}
                                  onChange={handleCountryChange}
                                >
                                  <option value="">Select Country</option>
                                  {countries.map(country => (
                                    <option key={country.iso2} value={country.iso2}>
                                      {country.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="input-group mb-3">
                                <span className="input-group-text"><i className="bi bi-geo"></i></span>
                                <select
                                  className="form-select"
                                  name="state"
                                  value={formData.state}
                                  onChange={handleStateChange}
                                  disabled={!selectedCountry}
                                >
                                  <option value="">Select State</option>
                                  {states.map(state => (
                                    <option key={state.iso2} value={state.name}>
                                      {state.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="input-group mb-3">
                                <span className="input-group-text"><i className="bi bi-building"></i></span>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="City"
                                  name="city"
                                  value={formData.city}
                                  onChange={handleChange}
                                />
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="input-group mb-3">
                                <span className="input-group-text"><i className="bi bi-mailbox"></i></span>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Postal Code"
                                  name="postalCode"
                                  value={formData.postalCode}
                                  onChange={handleChange}
                                />
                              </div>
                            </div>
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
                                  placeholder="Bank Name"
                                  name="bankName"
                                  value={formData.bankName}
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
                                  value={formData.accountHolderName}
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
                                  placeholder="Account Number"
                                  name="accountNumber"
                                  value={formData.accountNumber}
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
                                  placeholder="IFSC Code"
                                  name="ifscCode"
                                  value={formData.ifscCode}
                                  onChange={handleChange}
                                />
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="input-group mb-3">
                                <span className="input-group-text"><i className="bi bi-wallet2"></i></span>
                                <select
                                  className="form-select"
                                  name="accountType"
                                  value={formData.accountType}
                                  onChange={handleChange}
                                >
                                  <option value="">Select Account Type</option>
                                  <option value="Savings">Savings</option>
                                  <option value="Current">Current</option>
                                  <option value="Salary">Salary</option>
                                </select>
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
                                  value={formData.upiId}
                                  onChange={handleChange}
                                />
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="input-group mb-3">
                                <span className="input-group-text"><i className="bi bi-qr-code"></i></span>
                                <input
                                  type="file"
                                  className="form-control"
                                  name="qrCode"
                                  onChange={handleFileChange}
                                  accept="image/*"
                                />
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="input-group mb-3">
                                <span className="input-group-text"><i className="bi bi-app"></i></span>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Payment App (e.g., PayTM, PhonePe)"
                                  name="paymentApp"
                                  value={formData.paymentApp}
                                  onChange={handleChange}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                      </form>
                    </div>
                    <div className="mb-3">
                      <label
                        htmlFor="exampleFormControlTextarea78"
                        className="form-label"
                      >
                        Description (optional)
                      </label>
                      <textarea
                        className="form-control"
                        id="exampleFormControlTextarea78"
                        rows={3}
                        placeholder="Add any extra details about the request"
                        defaultValue={""}
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      data-bs-dismiss="modal"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn close text-white"
                      style={{ backgroundColor: "#0a9400" }}
                      onClick={handleSubmit}
                    >
                      Create
                    </button>
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
                    <h5
                      className="modal-title  fw-bold"
                      id="deleteprojectLabel"
                    >
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
                    <button
                      type="button"
                      className="btn btn-danger color-fff"
                      onClick={handleDelete}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* PDF Viewer Modal */}
            {pdfUrl && (
              <div
                className="modal"
                style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
                onClick={handlePdfModalBackdropClick}
              >
                <div className="modal-dialog modal-dialog-centered modal-lg">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">{selectedImageDetails.name}</h5>
                      <button type="button" className="btn-close" onClick={closePdfViewer}></button>
                    </div>
                    <div className="modal-body">
                      <iframe src={pdfUrl} style={{ width: '100%', height: '500px' }} title="PDF Viewer"></iframe>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Image Viewer Modal */}
            {selectedImageDetails.url && !pdfUrl && (
              <div
                className="modal"
                style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999 }}
                onClick={handleImageModalBackdropClick}
              >
                <div className="modal-dialog modal-dialog-centered modal-lg">
                  <div className="modal-content" style={{ marginLeft: '5rem' }}>
                    <div className="modal-header">
                      <h5 className="modal-title">{selectedImageDetails.name}</h5>
                      <button type="button" className="btn-close" onClick={closeImageModal}></button>
                    </div>
                    <div className="modal-body">
                      <img src={selectedImageDetails.url} alt="Enlarged view" style={{ width: '100%', height: '500px', objectFit: 'contain' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

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
                      {selectedEmployee?.employeeName || 'Employee'}'s Bank Details
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
                              <span className="me-2">{selectedEmployee?.bankDetails?.bankName || 'Not provided'}</span>
                              {selectedEmployee?.bankDetails?.bankName && (
                                <i
                                  className="bi bi-clipboard cursor-pointer"
                                  onClick={() => {
                                    navigator.clipboard.writeText(selectedEmployee.bankDetails.bankName);
                                    toast.success('Bank Name copied!');
                                  }}
                                  title="Copy Bank Name"
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
                              <span className="me-2">{selectedEmployee?.bankDetails?.accountHolderName || 'Not provided'}</span>
                              {selectedEmployee?.bankDetails?.accountHolderName && (
                                <i
                                  className="bi bi-clipboard cursor-pointer"
                                  onClick={() => {
                                    navigator.clipboard.writeText(selectedEmployee.bankDetails.accountHolderName);
                                    toast.success('Account Holder Name copied!');
                                  }}
                                  title="Copy Account Holder Name"
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
                              <span className="me-2">{selectedEmployee?.bankDetails?.accountNumber || 'Not provided'}</span>
                              {selectedEmployee?.bankDetails?.accountNumber && (
                                <i
                                  className="bi bi-clipboard cursor-pointer"
                                  onClick={() => {
                                    navigator.clipboard.writeText(selectedEmployee.bankDetails.accountNumber);
                                    toast.success('Account Number copied!');
                                  }}
                                  title="Copy Account Number"
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
                              <span className="me-2">{selectedEmployee?.bankDetails?.ifscCode || 'Not provided'}</span>
                              {selectedEmployee?.bankDetails?.ifscCode && (
                                <i
                                  className="bi bi-clipboard cursor-pointer"
                                  onClick={() => {
                                    navigator.clipboard.writeText(selectedEmployee.bankDetails.ifscCode);
                                    toast.success('IFSC Code copied!');
                                  }}
                                  title="Copy IFSC Code"
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
                              <span className="me-2">{selectedEmployee?.bankDetails?.accountType || 'Not provided'}</span>
                              {selectedEmployee?.bankDetails?.accountType && (
                                <i
                                  className="bi bi-clipboard cursor-pointer"
                                  onClick={() => {
                                    navigator.clipboard.writeText(selectedEmployee.bankDetails.accountType);
                                    toast.success('Account Type copied!');
                                  }}
                                  title="Copy Account Type"
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
                              <span className="me-2">{selectedEmployee?.bankDetails?.upiId || 'Not provided'}</span>
                              {selectedEmployee?.bankDetails?.upiId && (
                                <i
                                  className="bi bi-clipboard cursor-pointer"
                                  onClick={() => {
                                    navigator.clipboard.writeText(selectedEmployee.bankDetails.upiId);
                                    toast.success('UPI ID copied!');
                                  }}
                                  title="Copy UPI ID"
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
                              <span className="me-2">{selectedEmployee?.bankDetails?.paymentApp || 'Not provided'}</span>
                              {selectedEmployee?.bankDetails?.paymentApp && (
                                <i
                                  className="bi bi-clipboard cursor-pointer"
                                  onClick={() => {
                                    navigator.clipboard.writeText(selectedEmployee.bankDetails.paymentApp);
                                    toast.success('Payment App copied!');
                                  }}
                                  title="Copy Payment App"
                                ></i>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {selectedEmployee?.bankDetails?.qrCode && (
                        <div className="col-md-6">
                          <div className="bank-info-item p-3 border rounded h-100">
                            <i className="bi bi-qr-code fs-4 text-dark me-2"></i>
                            <div>
                              <div className="fw-bold">QR Code</div>
                              <div className="d-flex align-items-center gap-2 mt-2">
                                <img
                                  src={`${import.meta.env.VITE_BASE_URL}${selectedEmployee.bankDetails.qrCode}`}
                                  alt="QR Code"
                                  style={{ width: '100px', height: '100px', objectFit: 'contain', cursor: 'pointer' }}
                                  onClick={(e) => handleFileClick(
                                    e,
                                    `${import.meta.env.VITE_BASE_URL}${selectedEmployee.bankDetails.qrCode}`,
                                    'image',
                                    `${selectedEmployee.employeeName} - QR Code`
                                  )}

                                />
                                <i
                                  className="bi bi-download fs-4 text-primary"
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => handleDownload(
                                    selectedEmployee.bankDetails.qrCode,
                                    `${selectedEmployee.employeeName}_qr_code${selectedEmployee.bankDetails.qrCode.substr(selectedEmployee.bankDetails.qrCode.lastIndexOf('.'))}`
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

            {/* Add this modal for Address Details */}
            <div className="modal fade" id="addressDetailsModal" tabIndex="-1" aria-hidden="true">
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title fw-bold">Address Details</h5>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div className="modal-body">
                    {selectedEmployee && (
                      <div className="address-details">
                        <div className="mb-3">
                          <div className="d-flex align-items-center mb-2">
                            <i className="bi bi-house-fill text-primary me-2"></i>
                            <strong>Street Address:</strong>
                          </div>
                          <p className="ms-4">{selectedEmployee.address?.street || 'Not provided'}</p>
                        </div>

                        <div className="mb-3">
                          <div className="d-flex align-items-center mb-2">
                            <i className="bi bi-building text-primary me-2"></i>
                            <strong>City:</strong>
                          </div>
                          <p className="ms-4">{selectedEmployee.address?.city || 'Not provided'}</p>
                        </div>

                        <div className="mb-3">
                          <div className="d-flex align-items-center mb-2">
                            <i className="bi bi-geo-alt-fill text-primary me-2"></i>
                            <strong>State:</strong>
                          </div>
                          <p className="ms-4">{selectedEmployee.address?.state || 'Not provided'}</p>
                        </div>

                        <div className="mb-3">
                          <div className="d-flex align-items-center mb-2">
                            <i className="bi bi-globe text-primary me-2"></i>
                            <strong>Country:</strong>
                          </div>
                          <p className="ms-4">{selectedEmployee.address?.country || 'Not provided'}</p>
                        </div>

                        <div className="mb-3">
                          <div className="d-flex align-items-center mb-2">
                            <i className="bi bi-mailbox text-primary me-2"></i>
                            <strong>Postal Code:</strong>
                          </div>
                          <p className="ms-4">{selectedEmployee.address?.postalCode || 'Not provided'}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        </div>
        <ToastContainer />
        <FloatingMenu userType="admin" isMobile={isMobile} />
      </div>
      <style>
        {`
          .arrow-link {
  display: inline-block;
  transition: transform 0.2s ease;
}

.arrow-link:hover {
  transform: translateX(5px);
}

.bank-info-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.bank-info-item:hover {
  background-color: #f8f9fa;
}
        `}
      </style>
    </>
  );
};

export default Member;