import '..//Css/NavBarStyle.css';
import { Link } from 'react-router-dom';
const Navbar = () => {
    return (
        <nav className="top-navbar">
            <ul className="nav-list">
                <li className="nav-brand"><Link to="/HomePage">ของหายได้คืน</Link></li>
                <li className="nav-item"><Link to="/found">ของหายได้คืน</Link></li>
                <li className="nav-item"><Link to="/dashboard/found-item">ChatAI</Link></li>
            </ul>
        </nav>
    );
};

export default Navbar;