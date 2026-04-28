import '../Css/NavBarStyle.css';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
    const location = useLocation();
    const userRole = localStorage.getItem('userRole');
    const navItems = [
        { to: '/ready-to-pick',        label: 'บันทึกหลักฐาน',  icon: 'description', staffOnly: true },
        { to: '/dashboard/found-item', label: 'Chat AI',       icon: 'smart_toy',   studentOnly: true },
        { to: '/add-item',             label: 'เพิ่มสิ่งของ',   icon: 'add_box',     staffOnly: true },
        { to: '/manage-items',         label: 'แก้ไขสิ่งของ',   icon: 'edit_square', staffOnly: true },
        { to: '/AdminDashboard',       label: 'ข้อความ',        icon: 'chat',        staffOnly: true },
        { to: '/CaimHistory',          label: "ประวัติรับของหาย",       icon: 'history',     staffOnly: true },
    ];

    return (
        <nav className="custom-top-navbar">
            <div className="custom-nav-inner">

                {/* Brand */}
                <Link to="/HomePage" className="custom-nav-brand">
                    <span className="custom-brand-icon material-symbols-outlined">find_in_page</span>
                    <span className="custom-brand-text">ของหายได้คืน</span>
                </Link>

                {/* Nav Links */}
                <ul className="custom-nav-list"> {/* แก้ไขตรงนี้จาก nav-list */}
                    {navItems
                        .filter(item => {
                            // 1. ถ้าเป็นเมนูสำหรับ Staff: ต้องมี role เป็น STAFF
                            if (item.staffOnly && userRole !== 'STAFF') return false;

                            // 2. ถ้าเป็นเมนูสำหรับ Student: ต้องมี role เป็น STUDENT
                            if (item.studentOnly && userRole !== 'STUDENT') return false;

                            // 3. ถ้าไม่มีเงื่อนไขพิเศษ (หรือผ่านเงื่อนไขด้านบน) ให้แสดงผล
                            return true;
                        })
                        .map((item) => {
                            const isActive = location.pathname === item.to;
                            return (
                            <li key={item.to} className={`custom-nav-item ${isActive ? 'custom-nav-item--active' : ''}`}>
                                <Link to={item.to} className="custom-nav-link">
                                    <span className="material-symbols-outlined custom-nav-icon">{item.icon}</span>
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