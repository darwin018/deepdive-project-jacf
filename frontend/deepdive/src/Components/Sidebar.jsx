import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../css/Sidebar.module.css';

const Sidebar = () => {
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
                <Link to="/admin" className={styles.logoutBtn}>Log out</Link>
            </div>
        </aside>
    );
};

export default Sidebar;
