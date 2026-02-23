import styles from '../css/AdminDashboard.module.css'
import Sidebar from './Sidebar'
import {Routes, Route} from 'react-router-dom'
import AdminCategories from './AdminCategories'
import AdminProducts from './AdminProducts'
import Orders from './Orders'
import Settings from './Settings'
import DashboardHome from './DashboardHome'

const AdminDashboard = () => {
    return (
        <div className={styles.dashboardContainer}>
            <div className={styles.contentWrapper}>
                <Sidebar />
                <main className={styles.mainContent}>
                    <Routes>
                        <Route path="/" element={<DashboardHome />} />
                        <Route path="/categories" element={<AdminCategories />} />
                        <Route path="/products" element={<AdminProducts />} />
                        <Route path="/orders" element={<Orders />} />
                        <Route path="/settings" element={<Settings />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;