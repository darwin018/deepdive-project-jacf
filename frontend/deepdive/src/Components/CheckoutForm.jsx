import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import styles from '../css/CheckoutForm.module.css';

const CheckoutForm = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { cart, products, totalSavings, grandTotal } = location.state || { cart: {}, products: [], totalSavings: 0, grandTotal: 0 };

    const [formData, setFormData] = useState({
        name: '',
        whatsapp: '',
        email: '',
        shippingAddress: '',
        state: '',
        city: '',
        pincode: '',
        permanentAddress: ''
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        // Clear error for this field when user types
        if (errors[e.target.name]) {
            setErrors(prev => {
                const updated = { ...prev };
                delete updated[e.target.name];
                return updated;
            });
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        }

        const phone = formData.whatsapp.trim();
        if (!phone) {
            newErrors.whatsapp = 'WhatsApp number is required';
        } else if (!/^\d{10}$/.test(phone)) {
            newErrors.whatsapp = 'Enter a valid 10-digit mobile number';
        }

        if (!formData.shippingAddress.trim()) {
            newErrors.shippingAddress = 'Shipping address is required';
        }

        if (!formData.state.trim()) {
            newErrors.state = 'State is required';
        }

        if (!formData.city.trim()) {
            newErrors.city = 'City is required';
        }

        if (!formData.pincode.trim()) {
            newErrors.pincode = 'Pincode is required';
        } else if (!/^\d{6}$/.test(formData.pincode.trim())) {
            newErrors.pincode = 'Enter a valid 6-digit pincode';
        }

        if (!formData.permanentAddress.trim()) {
            newErrors.permanentAddress = 'Permanent address is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const generatePDF = (orderData, orderId) => {
        const doc = new jsPDF();
        
        // Page width for centering/right-aligning
        const pageWidth = doc.internal.pageSize.getWidth();
        
        // Header
        doc.setFontSize(20);
        const title = "Order Receipt";
        const titleWidth = doc.getTextWidth(title);
        doc.text(title, (pageWidth - titleWidth) / 2, 22);
        
        // Format Date to dd/mm/yyyy
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const yyyy = today.getFullYear();
        const formattedDate = `${dd}/${mm}/${yyyy}`;
        
        const startY = 40;
        
        doc.setFontSize(14);
        doc.text("Customer Details", 14, startY);
        doc.setFontSize(11);
        doc.text(`Name: ${orderData.name}`, 14, startY + 8);
        doc.text(`Email: ${orderData.customer_email}`, 14, startY + 14);
        doc.text(`WhatsApp: ${orderData.whatsapp_number}`, 14, startY + 20);
        doc.text(`Shipping Address: ${orderData.shipping_address}`, 14, startY + 26);
        doc.text(`City: ${orderData.city}, State: ${orderData.state}, Pincode: ${orderData.pincode}`, 14, startY + 32);

        doc.setFontSize(12);
        const orderIdText = `Order ID: #${orderId}`;
        const dateText = `Date: ${formattedDate}`;
        doc.text(orderIdText, pageWidth - 14 - doc.getTextWidth(orderIdText), startY + 8);
        doc.text(dateText, pageWidth - 14 - doc.getTextWidth(dateText), startY + 14);
        
        const tableColumn = ["Product", "Quantity", "Actual Price", "Offer Price", "Total"];
        const tableRows = [];
        
        orderData.items.forEach(item => {
            const product = products.find(p => p.id === item.product_id);
            const productName = product ? product.name : `Product #${item.product_id}`;
            const actualPrice = product ? product.actual_price : 0;
            const offerPrice = item.price;
            const itemTotal = item.quantity * offerPrice;
            
            tableRows.push([
                productName,
                item.quantity,
                `Rs. ${actualPrice.toFixed(2)}`,
                `Rs. ${offerPrice.toFixed(2)}`,
                `Rs. ${itemTotal.toFixed(2)}`
            ]);
        });
        
        autoTable(doc, {
            startY: 90,
            head: [tableColumn],
            body: tableRows,
            theme: 'striped',
            headStyles: { fillColor: [37, 99, 235] }
        });
        
        const finalY = doc.lastAutoTable.finalY || 85;
        const actualPriceTotal = orderData.grand_total + orderData.total_savings;
        
        doc.setFontSize(12);
        const actualTotalText = `Actual Price Total: Rs. ${actualPriceTotal.toFixed(2)}`;
        doc.text(actualTotalText, pageWidth - 14 - doc.getTextWidth(actualTotalText), finalY + 10);
        
        const offerTotalText = `Total Amount Saved: Rs. ${orderData.total_savings.toFixed(2)}`;
        doc.text(offerTotalText, pageWidth - 14 - doc.getTextWidth(offerTotalText), finalY + 18);
        
        doc.setLineWidth(0.5);
        doc.line(pageWidth - 70, finalY + 22, pageWidth - 14, finalY + 22);

        doc.setFontSize(14);
        const grandTotalText = `Grand Total: Rs. ${orderData.grand_total.toFixed(2)}`;
        doc.text(grandTotalText, pageWidth - 14 - doc.getTextWidth(grandTotalText), finalY + 30);
        
        doc.save(`receipt_${orderId}.pdf`);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validate()) return;

        const orderItems = Object.entries(cart).map(([productId, quantity]) => {
            const product = products.find(p => p.id === parseInt(productId));
            return {
                product_id: parseInt(productId),
                quantity: quantity,
                price: product ? product.offer_price : 0
            };
        });

        const orderData = {
            name: formData.name.trim(),
            customer_email: formData.email.trim(),
            whatsapp_number: formData.whatsapp.trim(),
            shipping_address: formData.shippingAddress.trim(),
            state: formData.state.trim(),
            city: formData.city.trim(),
            pincode: formData.pincode.trim(),
            permanent_address: formData.permanentAddress.trim(),
            total_savings: totalSavings,
            grand_total: grandTotal,
            items: orderItems
        };

        try {
            const response = await fetch('https://demoapp-50039367885.development.catalystappsail.in/orders/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Order created:', data);
                
                generatePDF(orderData, data.id);
                
                alert('Order Placed Successfully! Your receipt has been downloaded.');
                navigate('/'); 
            } else {
                console.error('Failed to place order');
                alert('Failed to place order. Please try again.');
            }
        } catch (error) {
            console.error('Error placing order:', error);
            alert('An error occurred. Please try again.');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.formWrapper}>
                <h2 className={styles.title}>Checkout Details</h2>
                <form onSubmit={handleSubmit} className={styles.form} noValidate>
                    <div className={styles.formGroup}>
                        <label htmlFor="name">Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                        />
                        {errors.name && <span className={styles.errorText}>{errors.name}</span>}
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                        />
                        {errors.email && <span className={styles.errorText}>{errors.email}</span>}
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="whatsapp">WhatsApp Number</label>
                        <input
                            type="tel"
                            id="whatsapp"
                            name="whatsapp"
                            value={formData.whatsapp}
                            onChange={handleChange}
                            maxLength={10}
                            placeholder="10-digit mobile number"
                            className={`${styles.input} ${errors.whatsapp ? styles.inputError : ''}`}
                        />
                        {errors.whatsapp && <span className={styles.errorText}>{errors.whatsapp}</span>}
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="shippingAddress">Shipping Address</label>
                        <textarea
                            id="shippingAddress"
                            name="shippingAddress"
                            value={formData.shippingAddress}
                            onChange={handleChange}
                            className={`${styles.textarea} ${errors.shippingAddress ? styles.inputError : ''}`}
                        />
                        {errors.shippingAddress && <span className={styles.errorText}>{errors.shippingAddress}</span>}
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="city">City</label>
                        <input
                            type="text"
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            className={`${styles.input} ${errors.city ? styles.inputError : ''}`}
                        />
                        {errors.city && <span className={styles.errorText}>{errors.city}</span>}
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="state">State</label>
                        <input
                            type="text"
                            id="state"
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            className={`${styles.input} ${errors.state ? styles.inputError : ''}`}
                        />
                        {errors.state && <span className={styles.errorText}>{errors.state}</span>}
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="pincode">Pincode</label>
                        <input
                            type="text"
                            id="pincode"
                            name="pincode"
                            value={formData.pincode}
                            onChange={handleChange}
                            maxLength={6}
                            className={`${styles.input} ${errors.pincode ? styles.inputError : ''}`}
                        />
                        {errors.pincode && <span className={styles.errorText}>{errors.pincode}</span>}
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="permanentAddress">Permanent Address</label>
                        <textarea
                            id="permanentAddress"
                            name="permanentAddress"
                            value={formData.permanentAddress}
                            onChange={handleChange}
                            className={`${styles.textarea} ${errors.permanentAddress ? styles.inputError : ''}`}
                        />
                        {errors.permanentAddress && <span className={styles.errorText}>{errors.permanentAddress}</span>}
                    </div>
                    
                    <div className={styles.summary}>
                        <p>Total Savings: <span className={styles.savings}>-₹{totalSavings.toFixed(2)}</span></p>
                        <p>Grand Total: <span className={styles.total}>₹{grandTotal.toFixed(2)}</span></p>
                    </div>

                    <button type="submit" className={styles.submitButton}>Place Order</button>
                </form>
            </div>
        </div>
    );
};

export default CheckoutForm;
