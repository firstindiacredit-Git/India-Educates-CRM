import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';  // Import axios
import './Sidebar.css';
import CustomColorPicker, { isLightColor } from '../pages/colorpicker/CustomColorPicker';
import Header from './Header';
import { useTheme } from '../context/ThemeContext';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";



const Sidebar = () => {
  const [role, setRole] = useState('');
  const [isHolidayTomorrow, setIsHolidayTomorrow] = useState(false); // State to check if tomorrow is a holiday
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [sidebarColor, setSidebarColor] = useState('#0a9400');
  const { isDarkMode, toggleTheme } = useTheme();
  const [username, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [dropdownPosition, setDropdownPosition] = useState({});
  const dropdownRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setRole(user.role);
    }

    // Check if tomorrow is a holiday
    const checkHolidayTomorrow = async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1); // Set to tomorrow's date
      const isoTomorrow = tomorrow.toISOString().split('T')[0]; // Format YYYY-MM-DD

      try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}api/holidays`);

        const holidays = response.data.response.holidays;
        const holidayTomorrow = holidays.find(h => h.date.iso === isoTomorrow);
        setIsHolidayTomorrow(!!holidayTomorrow); // Set to true if tomorrow is a holiday
      } catch (error) {
        console.error("Error fetching holidays:", error);
      }
    };

    checkHolidayTomorrow(); // Fetch holiday data on component mount
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = JSON.parse(localStorage.getItem("user"));

    if (token) {
      setUserName(userData.username);
      setEmail(userData.email);
      setUser(userData);
    }
  }, []);

  const handleColorChange = (color) => {
    setSidebarColor(color);
    localStorage.setItem('sidebarColor', color);
  };

  // Determine text color based on sidebar background color
  const textColorClass = isLightColor(sidebarColor) ? 'text-dark' : 'text-light';
  // const textColorClass = 'text-light';

  const handleDropdownToggle = (e) => {
    e.preventDefault();
    const rect = e.target.getBoundingClientRect();
    const isRightAligned = window.innerWidth - rect.right < rect.left;

    setDropdownPosition({
      position: 'fixed',
      bottom: `${window.innerHeight - rect.top}px`,
      [isRightAligned ? 'right' : 'left']: isRightAligned
        ? `${window.innerWidth - rect.right}px`
        : `${rect.left}px`,
    });

    if (dropdownRef.current) {
      dropdownRef.current.classList.toggle('show');
    }
  };

  // Add the getImageUrl function from Header
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "Images/superadminimg.jpg";
    const cleanPath = imagePath.replace(/\\/g, '/');
    const pathWithoutUploads = cleanPath.replace('uploads/', '');
    return `${import.meta.env.VITE_BASE_URL}${pathWithoutUploads}`;
  };

  // Inside the Sidebar component, add these handlers from Header
  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigation("/");
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}api/change-password`,
        {
          email,
          oldPassword,
          newPassword
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      setOldPassword("");
      setNewPassword("");
      const modalElement = document.getElementById("passwordModal");
      const modal = window.bootstrap.Modal.getInstance(modalElement);
      modal.hide();

      toast.success("Password change Successfully!", {
        style: {
          backgroundColor: "#0d6efd",
          color: "white",
        },
      });

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigation("/");
    } catch (error) {
      alert("Incorrect Old Password");
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('username', username);
      if (selectedImage) {
        formData.append('profileImage', selectedImage);
      }

      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}api/update-profile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'multipart/form-data',
          }
        }
      );

      const updatedUser = { ...JSON.parse(localStorage.getItem("user")), ...response.data.user };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      const modalElement = document.getElementById("profileModal");
      const modal = window.bootstrap.Modal.getInstance(modalElement);
      modal.hide();

      toast.success("Profile updated successfully!", {
        style: {
          backgroundColor: "#0d6efd",
          color: "white",
        },
      });
      setSelectedImage(null);

      setTimeout(() => {
        window.location.reload();
      }, 5000);

    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  // Function to check if we're on a chat route
  const isChatRoute = () => {
    return ['/admin-chat', '/employee-chat', '/client-chat', '/chat'].includes(location.pathname);
  };

  return (
    <div className={`sidebar px-3 py-3 me-0 ${textColorClass}`} style={{ background: sidebarColor }}>
      <div className="d-flex flex-column h-100 ">


        <div className="mb-0 brand-icon mt-3">
          {/* <span className="logo-icon">
            <img src='../Images/picon.png' style={{ height: "4rem" }} alt="Pizeonfly Logo" />
          </span>
          <div className=''>
            <span className="logo-text fs-3" style={{ color: "#4989fd" }}>pizeon</span>
            <span className="logo-text fs-3" style={{ marginLeft: "-0.9rem", color: "#0c117b" }}>fly</span>
          </div> */}
          <img src='../Images/IndiaEducatesLogo1.png' style={{ height: "4.5rem", marginLeft:"-1.2rem" }} alt="Pizeonfly Logo" />
        </div>

        {/* Menu: main ul */}
        {/* {role === 'superadmin' && (
          )} */}
        <ul className="menu-list flex-grow-1 mt-3">
          <li>
            <Link className={`ms-link ${textColorClass}`} to="/project-dashboard">
              <i className={`icofont-home fs-5 ${textColorClass}`} /> <span className={`fs-6 ${textColorClass}`}>Admin Dashboard</span>
            </Link>
          </li>
          <li className="collapsed">
            <a
              className={`m-link ${textColorClass}`}
              data-bs-toggle="collapse"
              data-bs-target="#project-Components"
              href="#"
            >
              <i className={`icofont-briefcase ${textColorClass}`} />
              <span>Projects</span>{" "}
              <span className={`arrow icofont-dotted-down ms-auto text-end fs-5 ${textColorClass}`} />
            </a>
            {/* Menu: Sub menu ul */}
            <ul className="sub-menu collapse" id="project-Components">
              <li>
                <Link className="ms-link" to="/projects">
                  <span>Projects</span>
                </Link>
              </li>
              <li>
                <Link className="ms-link" to="/tasks">
                  <span>Tasks</span>
                </Link>
              </li>
            </ul>
          </li>

          <>
            <li className="collapsed">
              <a
                className={`m-link ${textColorClass}`}
                data-bs-toggle="collapse"
                data-bs-target="#client-Components"
                href="#"
              >
                <i className={`icofont-user-male ${textColorClass}`} /> <span>Our Associates</span>{" "}
                <span className={`arrow icofont-dotted-down ms-auto text-end fs-5 ${textColorClass}`} />
              </a>
              <ul className="sub-menu collapse" id="client-Components">
                <li>
                  <Link className="ms-link" to="/clients">
                    <span>Associates</span>
                  </Link>
                </li>
              </ul>
            </li>
            <li className="collapsed">
              <a
                className={`m-link ${textColorClass}`}
                data-bs-toggle="collapse"
                data-bs-target="#emp-Components"
                href="#"
              >
                <i className={`icofont-users-alt-5 ${textColorClass}`} /> <span>Our Agents</span>{" "}
                <span className={`arrow icofont-dotted-down ms-auto text-end fs-5 ${textColorClass}`} />
              </a>
              <ul className="sub-menu collapse" id="emp-Components">
                <li>
                  <Link className="ms-link" to="/members">
                    <span>Members</span>
                  </Link>
                </li>
                <li>

                </li>
              </ul>
            </li>

            <li className="collapsed">
              <a
                className={`m-link ${textColorClass}`}
                data-bs-toggle="collapse"
                data-bs-target="#tools-Components"
                href="#"
              >
                <i className={`icofont-tools-alt-2 ${textColorClass}`} /> <span>Tools</span>{" "}
                <span className={`arrow icofont-dotted-down ms-auto text-end fs-5 ${textColorClass}`} />
              </a>
              <ul className="sub-menu collapse" id="tools-Components">
                <li>
                  <Link className="ms-link"
                    // to="https://pizeonflyurl.vercel.app/"
                    to="/urlShortner"
                  >
                    <span>URL Shortner</span>
                  </Link>
                </li>
                <li>
                  <Link className="ms-link" to="/qrCodeGenerate">
                    <span>QR Code Generator</span>
                  </Link>
                </li>
                <li>
                  <Link className="ms-link" to="/saasManager">
                    <span>Saas Manager</span>
                  </Link>
                </li>

                {/* <li>
                    <Link className="ms-link" to="/htmlTemplateGenerator">
                      <span>HTML Template Generator</span>
                    </Link>
                  </li>
                  <li>
                    <Link className="ms-link" to="/cardValidator">
                      <span>Card Validator</span>
                    </Link>
                  </li>
                  <li>
                    <Link className="ms-link" to="/cardGenerator">
                      <span>Card Generator</span>
                    </Link>
                  </li> */}
                <li>
                  <Link className="ms-link" to="/miscellaneous">
                    <span>Miscellaneous</span>
                  </Link>
                </li>
                {/* <li>
                    <Link className="ms-link" to="/miscellaneous1">
                      <span>Miscellaneous1</span>
                    </Link>
                  </li> */}
              </ul>
            </li>
            <li className="collapsed">
              <a
                className={`m-link ${textColorClass}`}
                data-bs-toggle="collapse"
                data-bs-target="#accounts-Components"
                href="#"
              >
                <i className={`icofont-document-folder ${textColorClass}`} /> <span>Accounts & Billing</span>{" "}
                <span className={`arrow icofont-dotted-down ms-auto text-end fs-5 ${textColorClass}`} />
              </a>
              <ul className="sub-menu collapse" id="accounts-Components">
                <li>
                  <Link className="ms-link" to="/create-invoice">
                    <span>Create Invoice</span>
                  </Link>
                </li>
                <li>
                  <Link className="ms-link" to="/all-invoice">
                    <span>All Invoice</span>
                  </Link>
                </li>
              </ul>
            </li>

            <li className="collapsed">
              <a
                className={`m-link ${textColorClass}`}
                data-bs-toggle="collapse"
                data-bs-target="#meetings-Components"
                href="#"
              >
                <i className={`icofont-meeting-add ${textColorClass}`} /> <span>Meetings Scheduler</span>{" "}
                <span className={`arrow icofont-dotted-down ms-auto text-end fs-5 ${textColorClass}`} />
              </a>
              <ul className="sub-menu collapse" id="meetings-Components">
                <li>
                  <Link className="ms-link" to="/create-meeting">
                    <span>Create Meeting</span>
                  </Link>
                </li>
                <li>
                  <Link className="ms-link" to="/all-meetings">
                    <span>All Meetings</span>
                  </Link>
                </li>
              </ul>
            </li>

            {/* <li className="collapsed">
                <a
                  className="m-link"
                  data-bs-toggle="collapse"
                  data-bs-target="#more-Components"
                  href="#"
                >
                  <i className="icofont-listine-dots" /> <span>More</span>{" "}
                  {isHolidayTomorrow && (
                    <div style={{ marginTop: "-0.5rem", marginLeft: "-0.8rem" }}>
                      <span className="bi bi-dot text-danger fs-1" />
                    </div>
                  )}
                  <span className="arrow icofont-dotted-down ms-auto text-end fs-5" />
                </a>
                <ul className="sub-menu collapse" id="more-Components">
                  <li>
                    <Link className="ms-link" to="/calander">
                      <span>Calendar</span>
                      {isHolidayTomorrow && (
                        <div style={{ marginTop: "-0.8rem", marginLeft: "-0.6rem" }}>
                          <span className="bi bi-dot text-danger fs-1" />
                        </div>
                      )}
                    </Link>
                  </li>
                  <li>
                    <Link className="ms-link" to="#">
                      <span>Chat</span>
                    </Link>
                  </li>
                </ul>
              </li> */}
          </>
        </ul>

        {/* <button
          type="button"
          className="btn btn-link sidebar-mini-btn text-light"
        >
          <span className="ms-2">
            <i className="icofont-bubble-right" />
          </span>
        </button> */}
        {/* Profile section - Only show on chat routes */}
        <div className='d-flex justify-content-between'>
          {isChatRoute() ? null : <div></div>}
          {isChatRoute() && (
            <div className="dropdown user-profile ml-2 ml-sm-3 d-flex align-items-center zindex-popover mt-auto mb-3">

              <a
                className="nav-link dropdown-toggle pulse p-0 me-2"
                href="#"
                role="button"
                onClick={handleDropdownToggle}
              >
                <img
                  className="avatar md rounded-circle border border-1"
                  src={getImageUrl(user?.profileImage)}
                  alt="profile"
                />
              </a>
              <div className="u-info">
                <p className="mb-0 text-end line-height-sm">
                  <span className={`font-weight-bold ${textColorClass}`}>{username}</span>
                </p>
                <small className={textColorClass}>Admin Profile</small>
              </div>
              <div
                ref={dropdownRef}
                className="dropdown-menu rounded-lg shadow border-0 dropdown-animation p-0 m-0"
                style={dropdownPosition}
              >
                <div className="card border-0 w280">
                  <div className="card-body pb-0">
                    <div className="d-flex py-1">
                      <img
                        className="avatar rounded-circle"
                        src={getImageUrl(user?.profileImage)}
                        alt="profile"
                      />
                      <div className="flex-fill ms-3">
                        <p className="mb-0"><span className="font-weight-bold">{username}</span></p>
                        <small className="">{email}</small>
                      </div>
                    </div>
                    <div><hr className="dropdown-divider border-dark" /></div>
                  </div>
                  <div className="list-group m-2 ">
                    <button
                      className="list-group-item list-group-item-action border-0"
                      data-bs-toggle="modal"
                      data-bs-target="#profileModal"
                    >
                      <i className="bi bi-person fs-6 me-3" />
                      Edit Profile
                    </button>
                    <button
                      className="list-group-item list-group-item-action border-0 "
                      data-bs-toggle="modal"
                      data-bs-target="#passwordModal"
                    >
                      <i className="bi bi-gear fs-6 me-3" />
                      Change Password
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="list-group-item list-group-item-action border-0 "
                    >
                      <i className="icofont-logout fs-6 me-3" />
                      Signout
                    </button>
                    <div><hr className="dropdown-divider border-dark" /></div>
                  </div>
                </div>
              </div>
            </div>

          )}
          {/* Color picker button */}
          <div className="d-flex justify-content-end mb-2">
            <button
              // className={`btn btn-sm btn-outline-${isLightColor(sidebarColor) ? 'dark' : 'light'}`}
              className='border-0 bg-transparent'
              onClick={() => setShowColorPicker(!showColorPicker)}
              title="Customize Sidebar Color"
            >
              <i className={`bi bi-palette-fill ${textColorClass}`}></i>
            </button>
            {showColorPicker && (
              <div className='position-absolute' style={{ top: '25rem', right: '67rem' }}>
                <CustomColorPicker
                  color={sidebarColor}
                  onChange={handleColorChange}
                  onClose={() => setShowColorPicker(false)}
                />
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Password Change Modal */}
      <div
        className="modal fade"
        id="passwordModal"
        tabIndex={-1}
        aria-labelledby="passwordLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-body">
              <div className="members_list">
                <form onSubmit={handleChangePassword}>
                  <div className="container">
                    <div className="row">
                      <div className="col-12">
                        <label htmlFor="currentStatus" className="fw-bold fs-5">
                          Change Password
                        </label>
                        <div className="mb-3 mt-3">
                          <label className="form-label fw-bold">Email</label>
                          <input
                            type="email"
                            className="form-control"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                        <div className="mb-3 mt-3">
                          <label className="form-label fw-bold">Old Password</label>
                          <input
                            type="password"
                            className="form-control"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            required
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-bold">New Password</label>
                          <input
                            type="password"
                            className="form-control"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <div className="row mt-3">
                      <div className="col-12 d-flex justify-content-end">
                        <button type="submit" className="btn btn-dark">
                          Submit
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Profile Edit Modal */}
      <div
        className="modal fade"
        id="profileModal"
        tabIndex={-1}
        aria-labelledby="profileLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body">
              <form onSubmit={handleProfileUpdate}>
                <div className="container">
                  <div className="row">
                    <div className="col-12">
                      <label className="fw-bold fs-5">Edit Profile</label>
                      <div className="mb-3 mt-3 text-center">
                        <img
                          src={selectedImage
                            ? URL.createObjectURL(selectedImage)
                            : getImageUrl(user?.profileImage)}
                          alt="Profile"
                          className="rounded-circle"
                          style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                        />
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="d-none"
                          accept="image/*"
                          onChange={(e) => setSelectedImage(e.target.files[0])}
                        />
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-dark mt-2"
                          onClick={() => fileInputRef.current.click()}
                        >
                          Change Photo
                        </button>
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-bold">Username</label>
                        <input
                          type="text"
                          className="form-control"
                          value={username}
                          onChange={(e) => setUserName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row mt-3">
                    <div className="col-12 d-flex justify-content-end">
                      <button type="submit" className="btn btn-dark">
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Sidebar;