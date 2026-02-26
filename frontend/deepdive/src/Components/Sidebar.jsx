import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from '../css/Sidebar.module.css';

const Sidebar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('isAdminLoggedIn');
        localStorage.removeItem('adminUsername');
        navigate('/admin');
    };

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logo}>Admin Panel</div>
            <ul className={styles.menu}>
                <li><Link to="/dashboard">Dashboard</Link></li>
                <li><Link to="/dashboard/categories">Categories</Link></li>
                <li><Link to="/dashboard/products">Products</Link></li>
                <li><Link to="/dashboard/orders">Orders</Link></li>
            </ul>
            <div className={styles.logoutSection}>
                <button onClick={handleLogout} className={styles.logoutBtn}>Log out</button>
            </div>
        </aside>
    );
};

export default Sidebar;
