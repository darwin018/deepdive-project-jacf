import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../css/DashboardHome.module.css';

const DashboardHome = () => {
    const [stats, setStats] = useState({
        totalOrders: 0,
        amountReceived: 0,
        amountPending: 0,
        pendingOrders: 0,
        cancelledOrders: 0,
        deliveredOrders: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get('https://testapp-50039367885.development.catalystappsail.in/orders/');
                const orders = response.data;
                
                let totalOrders = orders.length;
                let amountReceived = 0;
                let amountPending = 0;
                let pendingOrders = 0;
                let cancelledOrders = 0;
                let deliveredOrders = 0;

                orders.forEach(order => {
                    // Payment stats
                    if (order.payment_status === 'Paid') {
                        amountReceived += order.grand_total || 0;
                    } else if (order.payment_status === 'Pending') {
                        amountPending += order.grand_total || 0;
                    }

                    // Order status stats
                    if (order.status === 'Pending') {
                        pendingOrders += 1;
                    } else if (order.status === 'Cancelled') {
                        cancelledOrders += 1;
                    } else if (order.status === 'Delivered') {
                        deliveredOrders += 1;
                    }
                });

                setStats({
                    totalOrders,
                    amountReceived,
                    amountPending,
                    pendingOrders,
                    cancelledOrders,
                    deliveredOrders
                });
                setLoading(false);
            } catch (err) {
                console.error("Error fetching orders for dashboard:", err);
                setError("Failed to load dashboard statistics.");
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    if (loading) return <div className={styles.loading}>Loading dashboard...</div>;
    if (error) return <div className={styles.error}>{error}</div>;

    return (
        <div className={styles.dashboardHomeContainer}>
            <h1 className={styles.pageTitle}>Dashboard Overview</h1>
            
            <div className={styles.statsGrid}>
                <div className={`${styles.statCard} ${styles.blueCard}`}>
                    <div className={styles.statIcon}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                    </div>
                    <div className={styles.statInfo}>
                        <h3>Total Orders</h3>
                        <p className={styles.statValue}>{stats.totalOrders}</p>
                    </div>
                </div>

                <div className={`${styles.statCard} ${styles.greenCard}`}>
                    <div className={styles.statIcon}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                        </svg>
                    </div>
                    <div className={styles.statInfo}>
                        <h3>Amount Received</h3>
                        <p className={styles.statValue}>₹{stats.amountReceived.toFixed(2)}</p>
                    </div>
                </div>

                <div className={`${styles.statCard} ${styles.yellowCard}`}>
                    <div className={styles.statIcon}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className={styles.statInfo}>
                        <h3>Amount Pending</h3>
                        <p className={styles.statValue}>₹{stats.amountPending.toFixed(2)}</p>
                    </div>
                </div>

                <div className={`${styles.statCard} ${styles.orangeCard}`}>
                    <div className={styles.statIcon}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                        </svg>
                    </div>
                    <div className={styles.statInfo}>
                        <h3>Pending Orders</h3>
                        <p className={styles.statValue}>{stats.pendingOrders}</p>
                    </div>
                </div>

                <div className={`${styles.statCard} ${styles.redCard}`}>
                    <div className={styles.statIcon}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className={styles.statInfo}>
                        <h3>Cancelled Orders</h3>
                        <p className={styles.statValue}>{stats.cancelledOrders}</p>
                    </div>
                </div>

                <div className={`${styles.statCard} ${styles.purpleCard}`}>
                    <div className={styles.statIcon}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className={styles.statInfo}>
                        <h3>Delivered Orders</h3>
                        <p className={styles.statValue}>{stats.deliveredOrders}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
