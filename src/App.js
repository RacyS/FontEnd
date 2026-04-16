import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './Login';
import AdminDashboard from './AdminDashboard';
import UserChat from "./UserChat";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/UserChat/found-item" element={<UserChat />} />

                {/* 2. เพิ่ม Route สำหรับหน้า Admin ตามที่ระบุไว้ในคำสั่ง navigate */}
                <Route path="/AdminDashboard" element={<AdminDashboard />} />
            </Routes>
        </Router>
    );
}

export default App;