import '../Css/NavBarStyle.css';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
    const location = useLocation();
    const userRole = localStorage.getItem('userRole');
    const navItems = [
        { to: '/test-item',               label: 'รายการของหาย',  icon: 'inventory_2' ,staffOnly: false, },
        { to: '/dashboard/found-item', label: 'Chat AI',       icon: 'smart_toy' ,studentOnly: true },
        { to: '/add-item',             label: 'เพิ่มสิ่งของ',   icon: 'add_box' ,staffOnly: true  },
        { to: '/AdminDashboard',             label: 'ข้อความ',   icon: 'chat' ,staffOnly: true  },
    ];

    return (
        <nav className="top-navbar">
            <div className="nav-inner">

                {/* Brand */}
                <Link to="/HomePage" className="nav-brand">
                    <span className="brand-icon material-symbols-outlined">find_in_page</span>
                    <span className="brand-text">ของหายได้คืน</span>
                </Link>

                {/* Nav Links */}
                <ul className="nav-list">
                    {navItems
                        .filter(item => !item.staffOnly || userRole === 'STAFF')
                        .map((item) => {
                        const isActive = location.pathname === item.to;
                        return (
                            <li key={item.to} className={`nav-item ${isActive ? 'nav-item--active' : ''}`}>
                                <Link to={item.to} className="nav-link">
                                    <span className="material-symbols-outlined nav-icon">{item.icon}</span>
                                    <span>{item.label}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>

            </div>
        </nav>
    );
};

export default Navbar;