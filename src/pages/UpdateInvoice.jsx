import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useLocation, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import axios from 'axios';
import FloatingMenu from '../Chats/FloatingMenu'

const UpdateInvoice = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const location = useLocation();
  const navigate = useNavigate();

  if (!location.state || !location.state.invoice) {
    return <div>No invoice data available. Please try again.</div>;
  }

  const { invoice } = location.state;

  const initialInvoice = {
    ...invoice,
    clientDetail: invoice.clientDetail || ''
  };

  const [updatedInvoice, setUpdatedInvoice] = useState(initialInvoice);
  const [error, setError] = useState('');

  const formatNumber = (number) => {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(number);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setUpdatedInvoice(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setUpdatedInvoice(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleDateChange = (date, field) => {
    setUpdatedInvoice(prev => ({
      ...prev,
      [field]: date
    }));
  };

  const handleTableChange = (e, index, field) => {
    const { value } = e.target;
    const numericValue = field === 'rate' || field === 'quantity' ? parseFloat(value) || 0 : value;

    const updatedTable = updatedInvoice.table.map((item, idx) => {
      if (idx === index) {
        const updatedItem = { ...item, [field]: numericValue };
        if (field === 'rate' || field === 'quantity') {
          updatedItem.total = (updatedItem.rate || 0) * (updatedItem.quantity || 0);
        }
        return updatedItem;
      }
      return item;
    });

    const totalAmount = updatedTable.reduce((sum, item) => sum + (item.total || 0), 0);

    setUpdatedInvoice(prev => ({
      ...prev,
      table: updatedTable,
      amount: totalAmount,
      total: totalAmount
    }));
  };

  const handleBankDetailsChange = (e, field) => {
    const { value } = e.target;
    setUpdatedInvoice(prev => ({
      ...prev,
      bankDetails: {
        ...prev.bankDetails,
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}api/invoices/${updatedInvoice._id}`,
        updatedInvoice
      );
      if (response.status === 200) {
        navigate('/all-invoice');
      } else {
        setError('Failed to update invoice');
      }
    } catch (err) {
      console.error("Update Invoice Error:", err);
      setError(err.response?.data?.message || 'Failed to update invoice');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="mytask-layout">
      <Sidebar />
      <div className="main px-lg-4 px-md-4">
        <Header />
        <div className="print_invoice" style={{ marginTop: "-4px" }}>
          <div className="" style={{ borderBottom: "1px solid #A9A9A9" }}>
            <h5 className="card-title mb-0 fw-bold text-center mb-2">INVOICE</h5>
          </div>
          <div className="d-flex justify-content-between mb-2" style={{ marginTop: "5px" }}>
            <div className="">
              <div className="d-flex">
                <span className="fw-bold text-muted">Invoice No # : </span>
                <input
                  className=""
                  name="invoiceNumber"
                  value={updatedInvoice.invoiceNumber}
                  onChange={handleChange}
                  style={{ marginLeft: "0.8rem", border: "none" }}
                />
              </div>
              <div className="d-flex">
                <span className="fw-bold text-muted"> Invoice Date : </span>
                <DatePicker
                  className="date1"
                  selected={new Date(updatedInvoice.invoiceDate)}
                  onChange={(date) => handleDateChange(date, 'invoiceDate')}
                  dateFormat="MMMM dd, yyyy"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  placeholderText="Select a date"
                  value={updatedInvoice.invoiceDate ? format(new Date(updatedInvoice.invoiceDate), 'MMMM dd, yyyy') : format(new Date(), 'MMMM dd, yyyy')}
                />
                <div style={{ marginLeft: "10px" }}>
                  {updatedInvoice.invoiceDate ? format(new Date(updatedInvoice.invoiceDate), 'MMMM dd, yyyy') : ''}
                </div>
              </div>
              <div className="d-flex">
                <span className="fw-bold text-muted">Due Date : </span>
                <DatePicker
                  className="date2"
                  selected={new Date(updatedInvoice.invoiceDueDate)}
                  onChange={(date) => handleDateChange(date, 'invoiceDueDate')}
                  dateFormat="MMMM dd, yyyy"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  placeholderText="Select a date"
                  value={updatedInvoice.invoiceDueDate ? format(new Date(updatedInvoice.invoiceDueDate), 'MMMM dd, yyyy') : format(new Date(), 'MMMM dd, yyyy')}
                />
                <div style={{ marginLeft: "32px" }}>
                  {updatedInvoice.invoiceDueDate ? format(new Date(updatedInvoice.invoiceDueDate), 'MMMM dd, yyyy') : ''}
                </div>
              </div>
            </div>
            <img src="Images/IndiaEducatesLogo.png" alt="Company Logo" style={{ width: "12rem", objectFit: "contain" }} />
          </div>

          <div className="d-flex justify-content-between">
            <div style={{ width: "49%" }}>
              <div className="p-3 rounded" style={{ backgroundColor: "#f3bca7" }}>
                <h2 className="h5  mb-2" style={{ backgroundColor: "#f3bca7", color: "#0a9400" }}>Billed By</h2>
                <textarea
                  className="fw-semibold"
                  name="billedBy"
                  style={{ backgroundColor: "#f3bca7", border: "none" }}
                  rows="9"
                  value={updatedInvoice.billedBy}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div style={{ width: "49%" }}>
              <div className="p-3 rounded" style={{ backgroundColor: "#f3bca7" }}>
                <h2 className="h5  mb-2" style={{ backgroundColor: "#f3bca7", color: "#0a9400" }}>Billed To</h2>
                <textarea
                  className="fw-semibold"
                  name="clientDetail"
                  style={{ backgroundColor: "#f3bca7", border: "none" }}
                  rows="9"
                  value={updatedInvoice.clientDetail}
                  onChange={handleChange}
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

                {updatedInvoice.table.map((item, index) => (
                  <tr key={index} className="item-row">
                    <td className="item-name border-secondary">
                      <textarea
                        style={{ border: "none" }}
                        value={item.item}
                        onChange={(e) => handleTableChange(e, index, 'item')}
                      />
                    </td>
                    <td className="description border-secondary">
                      <textarea
                        style={{ border: "none" }}
                        value={item.description}
                        onChange={(e) => handleTableChange(e, index, 'description')}
                      />
                    </td>
                    <td className="border-secondary">
                      <textarea
                        style={{ border: "none" }}
                        value={item.rate}
                        onChange={(e) => handleTableChange(e, index, 'rate')}
                      />
                    </td>
                    <td className="border-secondary">
                      <textarea
                        style={{ border: "none" }}
                        value={item.quantity}
                        onChange={(e) => handleTableChange(e, index, 'quantity')}
                      />
                    </td>
                    <td className="border-secondary">
                      <span>₹ {formatNumber(item.total)}</span>
                    </td>
                  </tr>
                ))}

                <tr>
                  <td colSpan={3} className="blank border-secondary"> </td>
                  <td className="total-line border-secondary fs-6 fw-bold text-center" style={{ color: "#fe6730" }}>Total</td>
                  <td className="total-value border-secondary fs-6 fw-bold" style={{ color: "#0A9400" }}>
                    <div id="grand-total" style={{ color: "#0A9400", width: "max-content" }}>₹ {formatNumber(updatedInvoice.total)}</div>
                  </td>
                </tr>
              </tbody>
            </table>

            <div style={{ width: "45%", marginTop: "20px", position: "relative", zIndex: 1 }}>
              <div className="p-2 rounded" style={{ backgroundColor: "#F3BCA7", border: "none" }}>
                <h2 className="h5" style={{ backgroundColor: "#F3BCA7", border: "none", color: '#0a9400' }}>Bank Details</h2>
                <table className="items" style={{ backgroundColor: "#F3BCA7", border: "none", marginTop: "-1px" }}>
                  <tbody>
                    <tr>
                      <td colSpan={2} className="fw-bold p-0" style={{ backgroundColor: "#F3BCA7", border: "none" }}>Account Name</td>
                      <td className="p-0" style={{ backgroundColor: "#F3BCA7", border: "none" }}>
                        <textarea
                          style={{ backgroundColor: "#F3BCA7", border: "none" }}
                          rows="1"
                          value={updatedInvoice.bankDetails.accountName}
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
                          value={updatedInvoice.bankDetails.accountNumber}
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
                          value={updatedInvoice.bankDetails.ifsc}
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
                          value={updatedInvoice.bankDetails.accountType}
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
                          value={updatedInvoice.bankDetails.bankName}
                          onChange={(e) => handleBankDetailsChange(e, 'bankName')}
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="footer-note mt-4">
              <h6 className="mb-1" style={{ color: "#0a9400", border: "none" }}>Terms and Conditions</h6>
              <textarea
                className=""
                rows="4"
                name="termsConditions"
                value={updatedInvoice.termsConditions}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="text-center d-flex justify-content-center gap-3 mb-3">
          <button type="button" className="btn btn-lg btn-primary" onClick={handlePrint}>
            <i className="fa fa-print me-2" />
            Print Invoice
          </button>
          <button type="button" className="btn btn-lg btn-success" onClick={handleSubmit}>
            <i className="fa fa-save me-2" />
            Save Invoice
          </button>
        </div>
      </div>
      <FloatingMenu userType="admin" isMobile={isMobile} />
    </div>
  );
};

export default UpdateInvoice;

