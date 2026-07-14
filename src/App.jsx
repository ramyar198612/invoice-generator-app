import "./App.css";
import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
function App() {

const [invoiceNumber, setInvoiceNumber] = useState("");
const [invoiceDate,setInvoiceDate]=useState("");
const [clientName,setClientName]=useState("");
const [clientAddress,setClientAddress]=useState("");
const [invoiceItems,setInvoiceItems]=useState([
{
id:1,
description:"",
quantity:1,
price:0,
category: "general",
autoDetected: false,
}
]);
const [subtotal, setSubtotal] = useState(0);
const [totalGST, setTotalGST] = useState(0);
const taxRates = {
  general: 0.18,
  materials: 0.28,
  services: 0.12,
};
const handleItemChange = (id, field, value) => {
  setInvoiceItems(
    invoiceItems.map((item) =>
      item.id === id
        ? { ...item, [field]: value }
        : item
    )
  );
};
{/*Task-22*/}
const addNewItem=()=>{
setInvoiceItems([
...invoiceItems,
{
id:Date.now(),
description:"",
quantity:1,
price:0,
category: "general",
autoDetected: false,
}
]);
};
const calculateItemTotal=(qty,price)=>{
return qty*price;
};
 // task-26 -28 useEffect
  useEffect(() => {
  let subtotalValue = 0;
  let gstValue = 0;

  invoiceItems.forEach((item) => {
    const itemTotal = item.quantity * item.price;
    subtotalValue += itemTotal;

    gstValue += itemTotal * taxRates[item.category];
  });

  setSubtotal(subtotalValue);
  setTotalGST(gstValue);
}, [invoiceItems]);
  
// Task-24
const handleCategoryChange = (id, category) => {
  setInvoiceItems(
    invoiceItems.map((item) =>
      item.id === id
        ? { ...item, category, autoDetected: false }
        : item
    )
  );
};
 const grandTotal = subtotal + totalGST;
 // Task- [31-33]
 const autoDetectCategory = (description) => {
  const text = description.toLowerCase();

  if (text.includes("cement") || text.includes("steel")) {
    return "materials";
  } else if (text.includes("consulting")) {
    return "services";
  }
  return "general";
};

const handleDescriptionChange = (id, value) => {
  const category = autoDetectCategory(value);

  setInvoiceItems(
    invoiceItems.map((item) =>
      item.id === id
        ? {
            ...item,
            description: value,
            category,
            autoDetected: true,
          }
        : item
    )
  );
};
const removeItem = (id) => {
  setInvoiceItems(
    invoiceItems.filter((item) => item.id !== id)
  );
};
const generatePDF = () => {
  const doc = new jsPDF();

  doc.text("Invoice Generator", 20, 20);
  doc.text(`Invoice No: ${invoiceNumber}`, 20, 30);
  doc.text(`Date: ${invoiceDate}`, 20, 40);
    doc.text(`Client: ${clientName}`, 20, 50);
  doc.text(`Address: ${clientAddress}`, 20, 60);
    const tableData = invoiceItems.map((item) => [
    item.description,
    item.quantity,
    item.price,
    item.category,
    calculateItemTotal(item.quantity, item.price).toFixed(2),
  ]);
    autoTable(doc, {
    head: [["Description", "Qty", "Price", "Category", "Total"]],
    body: tableData,
    startY: 70,
  });
    const finalY = doc.lastAutoTable.finalY + 10;

  doc.text(`Subtotal : ₹${subtotal.toFixed(2)}`, 20, finalY);
  doc.text(`GST : ₹${totalGST.toFixed(2)}`, 20, finalY + 10);
  doc.text(`Grand Total : ₹${grandTotal.toFixed(2)}`, 20, finalY + 20);
    doc.save("invoice.pdf");
};
  return (
    <div className="invoice-container">
      <h1>Invoice Generator</h1>
      <div className="invoice-header">
        <input
          type="text"
          placeholder="Invoice Number"
          value={invoiceNumber}
          onChange={(e)=>setInvoiceNumber(e.target.value)}
        />
        <input
         type="date"
          value={invoiceDate}
         onChange={(e)=>setInvoiceDate(e.target.value)}
        />
        </div>
      <div className="client-info">

<input
type="text"
placeholder="Client Name"
value={clientName}
onChange={(e)=>setClientName(e.target.value)}
/>

<input
type="text"
placeholder="Client Address"
value={clientAddress}
onChange={(e)=>setClientAddress(e.target.value)}
/>
<table border="1">
<thead>
<tr>
<th>Description</th>
<th>Quantity</th>
<th>Price</th>
<th>Category</th>
<th>Total</th>
<th>Action</th>
</tr>
</thead>
<tbody>
{invoiceItems.map((item)=>(
<tr key={item.id}>
<td>
<input
  type="text"
  value={item.description}
  onChange={(e) =>
    handleDescriptionChange(item.id, e.target.value)
  }
/>
</td>
<td>
<input
  type="number"
  value={item.quantity}
  onChange={(e) =>
    handleItemChange(item.id, "quantity", Number(e.target.value))
  }
/>
</td>
<td>
<input
  type="number"
  value={item.price}
  onChange={(e) =>
    handleItemChange(item.id, "price", Number(e.target.value))
  }
/>
</td>
<td>
  <select
    value={item.category}
    onChange={(e) =>
      handleCategoryChange(item.id, e.target.value)
    }
  >
    {Object.keys(taxRates).map((category) => (
      <option key={category} value={category}>
        {category}
      </option>
    ))}
  </select>

  {item.autoDetected && (
    <small style={{ marginLeft: "5px", color: "green" }}>
      Auto-detected
    </small>
  )}
</td>
<td>
{calculateItemTotal(item.quantity,item.price)}
</td>
<td>
  <button onClick={() => removeItem(item.id)}>
    Remove
  </button>
</td>
</tr>
))}
</tbody>
</table>
<div className="totals-summary">
  <h3>Invoice Summary</h3>
  <p>Subtotal : ₹{subtotal.toFixed(2)}</p>
  <p>Total GST : ₹{totalGST.toFixed(2)}</p>
  <p>
    <strong>
      Grand Total : ₹{grandTotal.toFixed(2)}
    </strong>
  </p>
</div>
<div className="invoice-summary">
  <h2>Invoice Summary</h2>
  <p><strong>Invoice Number:</strong> {invoiceNumber}</p>
<p><strong>Date:</strong> {invoiceDate}</p>
<p><strong>Client:</strong> {clientName}</p>
<p><strong>Address:</strong> {clientAddress}</p>
<p>Subtotal : ₹{subtotal.toFixed(2)}</p>
<p>GST : ₹{totalGST.toFixed(2)}</p>
<p><strong>Grand Total : ₹{grandTotal.toFixed(2)}</strong></p>
</div>
<button onClick={addNewItem}>
    Add New Item
  </button>
  <button onClick={generatePDF}>
  Export as PDF
</button>
</div>
      </div>
  );
}
export default App;