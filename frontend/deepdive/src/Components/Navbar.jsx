import {NavLink} from 'react-router-dom'
import styles from '../css/Navbar.module.css'

const Navbar = () => {
    return (
        <>
        <nav className={styles.navbar}>
            <div className={styles.logo}>Shop Name</div>
            <ul className={styles.navLinks}>
                <li className={styles.navItem}>
                    <NavLink 
                        to='/' 
                        className={({ isActive }) => isActive ? `${styles.link} ${styles.activeLink}` : styles.link}
                    >
                        Home
                    </NavLink>
                </li>
                <li className={styles.navItem}>
                    <NavLink 
                        to='/categories' 
                        className={({ isActive }) => isActive ? `${styles.link} ${styles.activeLink}` : styles.link}
                    >
                        Categories
                    </NavLink>
                </li>
                <li className={styles.navItem}>
                    <NavLink 
                        to='/products' 
                        className={({ isActive }) => isActive ? `${styles.link} ${styles.activeLink}` : styles.link}
                    >
                        Products
                    </NavLink>
                </li>
            </ul>
        </nav>
        </>
    );
};

export default Navbar;