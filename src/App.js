import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './Login';
import AdminDashboard from './AdminDashboard';
import UserChat from "./UserChat";
import DisplayItem from './DisplayItem';
import AddItem from './AddItem'; // 1. Import หน้า AddItem เข้ามา
import EditItem from './EditItem'; // หรือ './components/EditItem' ตามโครงสร้างโฟลเดอร์ของคุณ
import ReadytopickupsList from './ReadytopickupsList';
import UploadEvidence from './UploadEvidence';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
    return (
        <Router>
            <Routes>
                {/* หน้า Login หลัก */}
                <Route path="/" element={<Login />} />

                {/* หน้าสำหรับ User */}
                <Route path="/UserChat/found-item" element={<UserChat />} />

                {/* หน้าสำหรับ Admin/Staff */}
                <Route path="/AdminDashboard" element={<AdminDashboard />} />

                {/* 2. เพิ่ม Route สำหรับหน้าเพิ่มของ (Staff Only) */}
                {/* ลองเข้าผ่าน http://localhost:3000/add-item */}
                <Route path="/add-item" element={<AddItem />} />

                {/* หน้าแสดงรายการไอเทม (Gallery) */}
                <Route path="/test-item" element={<DisplayItem />} />

                {/* หน้าแสดงหน้าจัดการไอเทม*/}
                <Route path="/manage-items" element={<EditItem />} />

                <Route path="/ready-to-pick" element={<ReadytopickupsList />} />

                <Route path="/claim/:itemId" element={<UploadEvidence />} />

            </Routes>
        </Router>
    );
}

export default App;