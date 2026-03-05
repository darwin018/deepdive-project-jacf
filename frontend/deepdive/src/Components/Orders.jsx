import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../css/Orders.module.css';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const statusOptions = ["Pending", "Order Taken", "Dispatched", "Delivered", "Cancelled"];
    const paymentOptions = ["Pending", "Paid"];

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get('https://testapp-50039367885.development.catalystappsail.in/orders/');
                setOrders(response.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching orders:", err);
                setError("Failed to fetch orders.");
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const handleViewDetails = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedOrder(null);
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await axios.put(`https://testapp-50039367885.development.catalystappsail.in/orders/${orderId}/status`, { status: newStatus });
            setOrders(orders.map(order => 
                order.id === orderId ? { ...order, status: newStatus } : order
            ));
        } catch (err) {
            console.error("Error updating status:", err);
            alert("Failed to update status.");
        }
    };

    const handlePaymentStatusChange = async (orderId, newStatus) => {
        try {
            await axios.put(`https://testapp-50039367885.development.catalystappsail.in/orders/${orderId}/payment-status/`, { payment_status: newStatus });
            setOrders(orders.map(order => 
                order.id === orderId ? { ...order, payment_status: newStatus } : order
            ));
        } catch (err) {
            console.error("Error updating payment status:", err);
            alert("Failed to update payment status.");
        }
    };

    if (loading) return <div className={styles.loading}>Loading orders...</div>;
    if (error) return <div className={styles.error}>{error}</div>;

    return (
        <div className={styles.ordersContainer}>
            <h1 className={styles.title}>Orders</h1>
            {orders.length === 0 ? (
                <p className={styles.noOrders}>No orders found.</p>
            ) : (
                <div className={styles.tableWrapper}>
                    <table className={styles.ordersTable}>
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer Name</th>
                                <th>Email</th>
                                <th>Number</th>
                                <th>View Details</th>
                                <th>Order Status</th>
                                <th>Payment Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.id}>
                                    <td>#{order.id}</td>
                                    <td>{order.name}</td>
                                    <td>{order.customer_email}</td>
                                    <td>{order.whatsapp_number}</td>
                                    <td>
                                        <button 
                                            className={styles.viewBtn} 
                                            onClick={() => handleViewDetails(order)}
                                        >
                                            View
                                        </button>
                                    </td>
                                    <td>
                                        <select 
                                            className={`${styles.statusSelect} ${styles[order.status?.toLowerCase().replace(' ', '') || 'pending']}`}
                                            value={order.status || 'Pending'}
                                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                        >
                                            {statusOptions.map(option => (
                                                <option key={option} value={option}>
                                                    {option}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td>
                                        <select 
                                            className={`${styles.statusSelect} ${styles.payment} ${styles[order.payment_status?.toLowerCase().replace(' ', '') || 'pending']}`}
                                            value={order.payment_status || 'Pending'}
                                            onChange={(e) => handlePaymentStatusChange(order.id, e.target.value)}
                                        >
                                            {paymentOptions.map(option => (
                                                <option key={option} value={option}>
                                                    {option}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {isModalOpen && selectedOrder && (
                <div className={styles.modalOverlay} onClick={closeModal}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Order Details #{selectedOrder.id}</h2>
                            <button className={styles.closeBtn} onClick={closeModal}>&times;</button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.customerInfo}>
                                <h3>Customer Details</h3>
                                <p><strong>Name:</strong> {selectedOrder.name}</p>
                                <p><strong>Email:</strong> {selectedOrder.customer_email}</p>
                                <p><strong>WhatsApp:</strong> {selectedOrder.whatsapp_number}</p>
                                <p><strong>Shipping Address:</strong> {selectedOrder.shipping_address}</p>
                                <p><strong>Permanent Address:</strong> {selectedOrder.permanent_address}</p>
                            </div>
                            
                            <div className={styles.orderProducts}>
                                <h3>Products</h3>
                                <div className={styles.tableWrapper}>
                                    <table className={styles.ordersTable}>
                                        <thead>
                                            <tr>
                                                <th>Product Name</th>
                                                <th>Quantity</th>
                                                <th>Price</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedOrder.items.map(item => (
                                                <tr key={item.id}>
                                                    <td>{item.product?.name || `Product #${item.product_id}`}</td>
                                                    <td>{item.quantity}</td>
                                                    <td>₹{item.price.toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className={styles.orderTotals}>
                                    <p>Total Savings: <span className={styles.savings}>₹{selectedOrder.total_savings.toFixed(2)}</span></p>
                                    <p>Grand Total: <span className={styles.savings}>₹{selectedOrder.grand_total.toFixed(2)}</span></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Orders;