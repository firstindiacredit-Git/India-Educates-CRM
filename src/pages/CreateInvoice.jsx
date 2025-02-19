import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import DatePicker from "react-datepicker";
import { format } from 'date-fns';
import "react-datepicker/dist/react-datepicker.css";
import './custom-datepicker.css';
import axios from 'axios';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Loading.css"
import FloatingMenu from '../Chats/FloatingMenu'



const CreateInvoice = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const [invoices, setInvoices] = useState([]);
  // Create a Invoice
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    invoiceDate: new Date(),
    invoiceDueDate: new Date(),
    logo: null,
    billedBy: 'First India Credit \n\n88,Sant Nagar,Near India Post Office, \nEast of Kailash, New Delhi, Delhi, \nIndia - 110065  \n\nGSTIN: 06AATFG8894M1Z8 \nPAN: AATFG8894M \nEmail:fzal9000i@gmail.com',
    clientDetail: '',
    table: [{
      item: '',
      description: '',
      rate: '',
      quantity: '',
      total: 0
    }],
    amount: 0,
    total: 0,
    bankDetails: {
      accountName: 'First India Credit',
      accountNumber: '002105501589',
      ifsc: 'ICIC0000021',
      accountType: 'Current',
      bankName: 'ICICI bank'
    },
    termsConditions: '1. Please quote invoice number when remitting funds'
  });
  const [logo, setLogo] = useState('');

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      logo: file // Store the file in formData
    }));
    setLogo(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formDataToSend = new FormData();

      // Create a clean copy of formData without the File object
      const formDataWithoutLogo = { ...formData };
      
      if (formData.logo instanceof File) {
        // If it's a new file upload
        formDataToSend.append('logo', formData.logo);
        delete formDataWithoutLogo.logo; // Remove logo from JSON data
      }
      // If it's an existing logo path, keep it in the JSON data

      // Append the clean data as a single JSON string
      formDataToSend.append('data', JSON.stringify(formDataWithoutLogo));

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}api/invoices`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // console.log('Invoice created:', response.data);
      window.print();

      // Reset form with current dates
      const currentDate = new Date();
      setInvoiceDate(currentDate);
      setInvoiceDueDate(currentDate);

      setFormData({
        invoiceNumber: '',
        invoiceDate: currentDate,
        invoiceDueDate: currentDate,
        logo: null,
        billedBy: 'First India Credit \n\n88,Sant Nagar,Near India Post Office, \nEast of Kailash, New Delhi, Delhi \nIndia - 110065 \n\nGSTIN: 06AATFG8894M1Z8 \nPAN: AATFG8894M \nEmail:afzal9000i@gmail.com',
        clientDetail: '',
        table: [{
          item: '',
          description: '',
          rate: '',
          quantity: '',
          total: 0
        }],
        amount: 0,
        total: 0,
        bankDetails: {
          accountName: 'First India Credit',
          accountNumber: '002105501589',
          ifsc: 'ICIC0000021',
          accountType: 'Current',
          bankName: 'ICICI bank'
        },
        termsConditions: '1. Please quote invoice number when remitting funds'
      });

      // Toast
      toast.success("Invoice Added Successfully!", {
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
      console.error('Submission error:', error);
      if (error.response?.data) {
        console.error('Server error:', error.response.data);
      }
      if (error.request) {
        console.error('No Response Received:', error.request);
      } else {
        console.error('Request Setup Error:', error.message);
      }
    }
  };









  //Invoice Number
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const handleInvoiceNumberChange = (e) => {
    const value = e.target.value;
    setInvoiceNumber(value);
    setFormData(prevFormData => ({ ...prevFormData, invoiceNumber: value }));
  };


  //Invoice Dates
  const [invoiceDate, setInvoiceDate] = useState(new Date());
  const [invoiceDueDate, setInvoiceDueDate] = useState(new Date());
  const handleInvoiceDateChange = (date) => {
    const selectedDate = date || new Date(); // Use current date if no date selected
    setInvoiceDate(selectedDate);
    setFormData(prevFormData => ({
      ...prevFormData,
      invoiceDate: selectedDate
    }));
  };

  const handleInvoiceDueDateChange = (date) => {
    const selectedDate = date || new Date(); // Use current date if no date selected
    setInvoiceDueDate(selectedDate);
    setFormData(prevFormData => ({
      ...prevFormData,
      invoiceDueDate: selectedDate
    }));
  };


  //BilledBy
  const handleBilledByChange = (event) => {
    const billedByValue = event.target.value;
    setFormData(prevFormData => ({
      ...prevFormData,
      billedBy: billedByValue
    }));
    // console.log(formData);
  };





  const [rows, setRows] = useState([{ 
    item: '', 
    description: '', 
    rate: '', 
    quantity: '', 
    total: 0  // Changed from price, removed GST-related fields
  }]);

  const [total, setTotal] = useState({
    grandTotal: 0  // Simplified total object
  });

  const handleAddRow = () => {
    setRows([...rows, { item: '', description: '', rate: '', quantity: '', total: 0 }]);
  };
  const handleDeleteRow = (index) => {
    const newRows = rows.filter((row, i) => i !== index);
    setRows(newRows);
  };

  const handleInputChange = (e, index, field) => {
    const { value } = e.target;
    const newRows = rows.map((row, i) => {
      if (i === index) {
        const updatedRow = { ...row, [field]: value };
        if (field === 'rate' || field === 'quantity') {
          const rate = parseFloat(updatedRow.rate.replace(/,/g, '')) || 0;
          const quantity = parseInt(updatedRow.quantity, 10) || 0;
          updatedRow.total = rate * quantity;  // Calculate row total
        }
        return updatedRow;
      }
      return row;
    });
    setRows(newRows);
    updateTotal(newRows);
  };

  const handleBlur = (e, index, field) => {
    const { value } = e.target;
    const formattedValue = value.replace(/,/g, ',');
    const newRows = rows.map((row, i) => {
      if (i === index) {
        const updatedRow = { ...row, [field]: parseFloat(formattedValue).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) };
        return updatedRow;
      }
      return row;
    });
    setRows(newRows);
  };

  const formatNumber = (number) => {
    return number.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const updateTotal = (newRows) => {
    const grandTotal = newRows.reduce((acc, row) => acc + row.total, 0);
    setTotal({ grandTotal });

    setFormData(prevFormData => ({
      ...prevFormData,
      table: newRows,
      total: grandTotal
    }));
  };
  useEffect(() => {
    updateTotal(rows);
  }, [rows]);


  //Bank Details
  const handleBankDetailsChange = (e, field) => {
    const { value } = e.target;
    setFormData(prevFormData => ({
      ...prevFormData,
      bankDetails: {
        ...prevFormData.bankDetails,
        [field]: value
      }
    }));
    // console.log(formData);
  };

  //Term&condition
  const handleTermsConditionsChange = (e) => {
    const { value } = e.target;
    setFormData(prevFormData => ({
      ...prevFormData,
      termsConditions: value
    }));
    // console.log(formData);
  };

  const [clients, setClients] = useState([]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}api/clients`);
        setClients(response.data);
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    };

    fetchClients();
  }, []);

  // Add new state for stored logos
  const [storedLogos, setStoredLogos] = useState([]);

  // Add useEffect to fetch logos when component mounts
  useEffect(() => {
    const fetchLogos = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}api/invoice-logos`);
        // console.log('API Response:', response);
        // console.log('Base URL:', import.meta.env.VITE_BASE_URL);
        // console.log('Fetched logos:', response.data);
        setStoredLogos(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Error fetching logos:', error);
        setStoredLogos([]);
      }
    };
    fetchLogos();
  }, []);

  // Add function to handle logo selection from dropdown
  const handleStoredLogoSelect = (logoPath) => {
    if (logoPath) {
      try {
        // Make sure the path starts with 'uploads/'
        const fullLogoUrl = logoPath.startsWith('uploads/') 
          ? `${import.meta.env.VITE_BASE_URL}${logoPath}`
          : `${import.meta.env.VITE_BASE_URL}uploads/${logoPath}`;
        
        // console.log('Attempting to load logo from:', fullLogoUrl); // Debug log
        setLogo(fullLogoUrl);
        setFormData(prev => ({
          ...prev,
          logo: logoPath
        }));
      } catch (error) {
        console.error('Error setting logo:', error);
      }
    }
  };

  // Add this function to get a friendly name for the logo
  const getLogoDisplayName = (logoPath) => {
    const defaultLogoNames = {
      'uploads/a2zlogo.png': 'A2Z Logo',
      'uploads/ficlogo.png': 'FIC Logo',
      'uploads/pizeonflylogo.png': 'Pizeonfly Logo',
      'uploads/IndiaEducatesLogo.png': 'India Educates Logo'
    };

    // If it's a default logo, return its friendly name
    if (defaultLogoNames[logoPath]) {
      return defaultLogoNames[logoPath];
    }

    // For other logos, use the existing logic
    return decodeURIComponent(logoPath.split('-').pop().split('.')[0]);
  };














  return (
    <>
      <div id="mytask-layout">
        <Sidebar />
        {/* main body area */}
        <div className="main px-lg-4 px-md-4">
          {/* Body: Header */}
          <Header />

          {/*Body*/}

          <div className="body d-flex py-lg-3 py-md-2">
            {/* <form onSubmit={handleSubmit}> */}
            <div className="container-xxl">
              <div className="row align-items-center">
                <div className="border-0 mb-4">
                  <div className="card-header py-3 no-bg bg-transparent d-flex align-items-center px-0 justify-content-between border-bottom flex-wrap">
                    <h3 className="fw-bold mb-0">Create Invoice</h3>
                    <div className="text-center">
                      <button type="submit" className="btn btn-lg btn-primary" onClick={handleSubmit}>
                        <i className="fa fa-print me-2" />
                        Print Invoice
                      </button>
                    </div>
                  </div>

                </div>

              </div>

              {/* <!-- Row end  --> */}
              <div className="print_invoice" style={{ marginTop: "-4px" }}>
                <div className="" style={{ borderBottom: "1px solid #A9A9A9" }}>
                  <h5 className="card-title mb-0 fw-bold text-center mb-2">INVOICE</h5>
                </div>
                <div className=" d-flex justify-content-between mb-2" style={{ marginTop: "5px" }}>
                  <div className="">
                    <div className="d-flex">
                      <span className="fw-bold text-muted">Invoice No # : </span>
                      <input
                        className=""
                        style={{ marginLeft: "0.8rem", border: "none" }}
                        name="invoiceNumber"
                        value={invoiceNumber}
                        onChange={handleInvoiceNumberChange}
                        required
                      />
                    </div>
                    <div className="d-flex">
                      <span className="fw-bold text-muted"> Invoice Date : </span>
                      <DatePicker
                        className="date1"
                        selected={invoiceDate}
                        onChange={handleInvoiceDateChange}
                        dateFormat="MMMM dd, yyyy"
                        showMonthDropdown
                        showYearDropdown
                        dropdownMode="select"
                        placeholderText="Select a date"
                        value={invoiceDate ? format(invoiceDate, 'MMMM dd, yyyy') : format(new Date(), 'MMMM dd, yyyy')}
                      />
                      <div style={{ marginLeft: "10px" }}>
                        {invoiceDate ? format(invoiceDate, 'MMMM dd, yyyy') : ''}
                      </div>
                    </div>
                    <div className="d-flex">
                      <span className="fw-bold text-muted">Due Date : </span>
                      <DatePicker
                        className="date2"
                        selected={invoiceDueDate}
                        onChange={handleInvoiceDueDateChange}
                        dateFormat="MMMM dd, yyyy"
                        showMonthDropdown
                        showYearDropdown
                        dropdownMode="select"
                        placeholderText="Select a date"
                        value={invoiceDueDate ? format(invoiceDueDate, 'MMMM dd, yyyy') : format(new Date(), 'MMMM dd, yyyy')}
                      />
                      <div style={{ marginLeft: "32px" }}>
                        {invoiceDueDate ? format(invoiceDueDate, 'MMMM dd, yyyy') : ''}
                      </div>
                    </div>
                  </div>
                
                  <img src="Images/IndiaEducatesLogo.png" alt="Company Logo" style={{ width: "12rem", objectFit: "contain" }} />
                </div>


                <div className="d-flex  justify-content-between">
                  <div style={{ width: "49%" }}>
                    <div className="p-3 rounded" style={{ backgroundColor: "#F3BCA7", height: "16.3rem" }}>
                      <h2 className="h5 mb-2" style={{ backgroundColor: "#F3BCA7", color:'#0a9400' }}>Billed By</h2>
                      <textarea className="fw-semibold" style={{ backgroundColor: "#F3BCA7", border: "none" }} rows="9" onChange={handleBilledByChange} defaultValue={"First India Credit \n\n88,Sant Nagar,Near India Post Office, \nEast of Kailash, New Delhi, Delhi \nIndia - 110065 \n\nGSTIN: 06AATFG8894M1Z8 \nPAN: AATFG8894M \nEmail:afzal9000i@gmail.com"} />
                    </div>
                  </div>

                  <div style={{ width: "49%" }}>
                    {/* Client Selection Dropdown */}
                    <select
                      className="form-select mb-2 no-print"
                      onChange={(e) => {
                        const selectedClient = clients.find(client => client._id === e.target.value);
                        if (selectedClient) {
                          setFormData(prev => ({
                            ...prev,
                            clientId: selectedClient._id,
                            clientDetail: `${selectedClient.businessName}\n\n${selectedClient.clientAddress}\n\nGSTIN: ${selectedClient.clientGst}\nPhone: ${selectedClient.clientPhone}\nEmail: ${selectedClient.clientEmail}`
                          }));
                        }
                      }}
                    >
                      <option value="">Select Team Member</option>
                      {clients.map(client => (
                        <option key={client._id} value={client._id}>
                          {client.clientName}
                        </option>
                      ))}
                    </select>
                    <div className="p-3 rounded" style={{ backgroundColor: "#F3BCA7", height: "16.3rem" }}>
                      <h2 className="h5 mb-2" style={{ backgroundColor: "#F3BCA7", color:'#0a9400'}}>Billed To</h2>



                      {/* Display Selected Client Details */}
                      <textarea
                        className="fw-semibold"
                        style={{
                          backgroundColor: "#F3BCA7",
                          border: "none",
                          width: "100%",
                          height: "75%"
                        }}
                        rows="7"
                        value={formData.clientDetail}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          clientDetail: e.target.value
                        }))}

                      />
                    </div>
                  </div>

                </div>
                <div className="a4-height" style={{ marginTop: "-20px" }}>
                  <table className="items border-light">
                    <tbody>
                      <tr>
                        <th style={{ background: "#fe6730", color: "white" }} className="border-secondary">Item</th>
                        <th style={{ background: "#fe6730", color: "white" }} className="border-secondary">Description</th>
                        <th style={{ width: 100, background: "#fe6730", color: "white" }} className="border-secondary">Rate</th>
                        <th style={{ width: 70, background: "#fe6730", color: "white" }} className="border-secondary">Quantity</th>
                        <th style={{ width: 100, background: "#fe6730", color: "white" }} className="border-secondary">Total</th>
                      </tr>
                      {rows.map((row, index) => (
                        <tr key={index} className="item-row">
                          <td className="item-name border-secondary">
                            <div className="delete-wpr">
                              <textarea style={{ border: "none" }} value={row.item} onChange={(e) => handleInputChange(e, index, 'item')} />
                              <a className="delete" href="javascript:;" onClick={() => handleDeleteRow(index)} title="Remove row">X</a>
                            </div>
                          </td>
                          <td className="description border-secondary">
                            <textarea style={{ border: "none" }} value={row.description} onChange={(e) => handleInputChange(e, index, 'description')} />
                          </td>
                          <td className="border-secondary">
                            <textarea
                              style={{ border: "none" }}
                              className="rate"
                              value={row.rate}
                              onChange={(e) => handleInputChange(e, index, 'rate')}
                              onBlur={(e) => handleBlur(e, index, 'rate')}
                            />
                          </td>
                          <td className="border-secondary">
                            <textarea style={{ border: "none" }} className="quantity" value={row.quantity} onChange={(e) => handleInputChange(e, index, 'quantity')} />
                          </td>
                          <td className="border-secondary">
                            <span>₹ {formatNumber(row.total)}</span>
                          </td>
                        </tr>
                      ))}
                      <tr id="hiderow">
                        <td colSpan={5} className="border-secondary">
                          <a id="addrow" href="javascript:;" onClick={handleAddRow} title="Add a row">Add a row</a>
                        </td>
                      </tr>
                      <tr>
                          <td colSpan={3} className="blank border-secondary"> </td>
                          <td colSpan={1} className="total-line border-secondary fs-6 fw-bold text-center" style={{ color: "#fe6730" }}>Total</td>
                          <td className="total-value border-secondary fs-6 fw-bold" style={{ color: "#0A9400" }}><div id="grand-total" style={{ color: "#0A9400", width: "max-content" }}>₹ {formatNumber(total.grandTotal)}</div></td>
                        </tr>
                    </tbody>
                  </table>
                  <div style={{ width: "45%" }}>
                    <div className="p-2 rounded" style={{ backgroundColor: "#F3BCA7", border: "none" }}>
                      <h2 className="h5" style={{ backgroundColor: "#F3BCA7", border: "none",color:'#0a9400' }}>Bank Details</h2>
                      <table className="items " style={{ backgroundColor: "#F3BCA7", border: "none", marginTop: "-1px" }}>
                        <tbody>
                          <tr>
                            <td colSpan={2} className="fw-bold p-0" style={{ backgroundColor: "#F3BCA7", border: "none" }}>Account Name</td>
                            <td className="p-0" style={{ backgroundColor: "#F3BCA7", border: "none" }}>
                              <textarea
                                style={{ backgroundColor: "#F3BCA7", border: "none" }}
                                rows="1"
                                defaultValue={"First India Credit"}
                                onChange={(e) => handleBankDetailsChange(e, 'accountName')}
                              />
                            </td>
                          </tr>
                          <tr>
                            <td colSpan={2} className="fw-bold p-0" style={{ backgroundColor: "#F3BCA7", border: "none" }}>Account Number</td>
                            <td className="p-0" style={{ backgroundColor: "#F3BCA7", border: "none" }}>
                              <textarea
                                style={{ backgroundColor: "#F3BCA7", border: "none" }}
                                rows="1"
                                defaultValue={"002105501589"}
                                onChange={(e) => handleBankDetailsChange(e, 'accountNumber')}
                              />
                            </td>
                          </tr>
                          <tr>
                            <td colSpan={2} className="fw-bold p-0" style={{ backgroundColor: "#F3BCA7", border: "none" }}>IFSC</td>
                            <td className="p-0" style={{ backgroundColor: "#F3BCA7", border: "none" }}>
                              <textarea
                                style={{ backgroundColor: "#F3BCA7", border: "none" }}
                                rows="1"
                                defaultValue={"ICIC0000021"}
                                onChange={(e) => handleBankDetailsChange(e, 'ifsc')}
                              />
                            </td>
                          </tr>
                          <tr>
                            <td colSpan={2} className="fw-bold p-0" style={{ backgroundColor: "#F3BCA7", border: "none" }}>Account Type</td>
                            <td className="p-0" style={{ backgroundColor: "#F3BCA7", border: "none" }}>
                              <textarea
                                style={{ backgroundColor: "#F3BCA7", border: "none" }}
                                rows="1"
                                defaultValue={"Current"}
                                onChange={(e) => handleBankDetailsChange(e, 'accountType')}
                              />
                            </td>
                          </tr>
                          <tr>
                            <td colSpan={2} className="fw-bold p-0" style={{ backgroundColor: "#F3BCA7", border: "none" }}>Bank</td>
                            <td className="p-0" style={{ backgroundColor: "#F3BCA7", border: "none" }}>
                              <textarea
                                style={{ backgroundColor: "#F3BCA7", border: "none" }}
                                rows="1"
                                defaultValue={"KOTAK MAHINDRA BANK"}
                                onChange={(e) => handleBankDetailsChange(e, 'bankName')}
                              />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div style={{ clear: "both" }} />
                  <div className="footer-note mt-4">
                    <h6 className="mb-1" style={{color: "#0a9400", border: "none" }}>Terms and Conditions</h6>
                    <textarea
                      className=""
                      rows="4"
                      defaultValue={"1. Please quote invoice number when remitting funds"}
                      onChange={handleTermsConditionsChange}
                    />
                  </div>
                </div>
                <div className="d-flex justify-content-center" style={{ borderTop: "1px solid #A9A9A9", color: "grey", marginTop: "8rem" }}>This invoice is system generated. No signature is required.</div>
              </div>
            </div>
            {/* </form> */}
          </div>
        </div>
        <FloatingMenu userType="admin" isMobile={isMobile} />
      </div>
    </>
  );
};

export default CreateInvoice;