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
        shippingAddress: '',
        permanentAddress: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const generatePDF = (orderData, orderId) => {
        const doc = new jsPDF();
        
        // Header
        doc.setFontSize(20);
        doc.text("Order Receipt", 14, 22);
        
        doc.setFontSize(12);
        doc.text(`Order ID: #${orderId}`, 14, 32);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 38);
        
        // Customer Info
        doc.setFontSize(14);
        doc.text("Customer Details", 14, 50);
        doc.setFontSize(11);
        doc.text(`Name: ${orderData.name}`, 14, 58);
        doc.text(`WhatsApp: ${orderData.whatsapp_number}`, 14, 64);
        doc.text(`Shipping Address: ${orderData.shipping_address}`, 14, 70);
        
        // Products Table
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
            startY: 85,
            head: [tableColumn],
            body: tableRows,
            theme: 'striped',
            headStyles: { fillColor: [37, 99, 235] }
        });
        
        // Totals
        const finalY = doc.lastAutoTable.finalY || 85;
        doc.setFontSize(12);
        doc.text(`Total Savings: Rs. ${orderData.total_savings.toFixed(2)}`, 14, finalY + 10);
        doc.setFontSize(14);
        doc.text(`Grand Total: Rs. ${orderData.grand_total.toFixed(2)}`, 14, finalY + 18);
        
        doc.save(`receipt_${orderId}.pdf`);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Construct order items
        const orderItems = Object.entries(cart).map(([productId, quantity]) => {
            const product = products.find(p => p.id === parseInt(productId));
            return {
                product_id: parseInt(productId),
                quantity: quantity,
                price: product ? product.offer_price : 0
            };
        });

        const orderData = {
            name: formData.name,
            whatsapp_number: formData.whatsapp,
            shipping_address: formData.shippingAddress,
            permanent_address: formData.permanentAddress,
            total_savings: totalSavings,
            grand_total: grandTotal,
            items: orderItems
        };

        try {
            const response = await fetch('http://localhost:8000/orders/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Order created:', data);
                
                // Generate and download PDF
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
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="name">Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="whatsapp">WhatsApp Number</label>
                        <input
                            type="tel"
                            id="whatsapp"
                            name="whatsapp"
                            value={formData.whatsapp}
                            onChange={handleChange}
                            required
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="shippingAddress">Shipping Address</label>
                        <textarea
                            id="shippingAddress"
                            name="shippingAddress"
                            value={formData.shippingAddress}
                            onChange={handleChange}
                            required
                            className={styles.textarea}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="permanentAddress">Permanent Address</label>
                        <textarea
                            id="permanentAddress"
                            name="permanentAddress"
                            value={formData.permanentAddress}
                            onChange={handleChange}
                            required
                            className={styles.textarea}
                        />
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
