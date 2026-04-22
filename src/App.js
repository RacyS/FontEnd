import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './Login';
import AdminDashboard from './AdminDashboard';
import UserChat from "./UserChat";
// 1. Import หน้า DisplayItem เข้ามา
import DisplayItem from './DisplayItem';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/UserChat/found-item" element={<UserChat />} />
                <Route path="/AdminDashboard" element={<AdminDashboard />} />

                {/* 2. เพิ่ม Route สำหรับหน้าทดสอบแสดงไอเทม */}
                {/* ลองเข้าผ่าน http://localhost:3000/test-item */}
                <Route path="/test-item" element={<DisplayItem />} />
            </Routes>
        </Router>
    );
}

export default App;