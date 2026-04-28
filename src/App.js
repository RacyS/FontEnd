import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './Login';
import AdminDashboard from './Admin/AdminDashboard';
import HomePage from "./HomePage";
import UserChat from './User/UserChat'
import AddItem from './Admin/AddItem'
import ClaimHistory from './Admin/ClaimHistory'
import ReadytopickupsList from './Admin/ReadytopickupsList';
import UploadEvidence from './Admin/UploadEvidence';
import EditItem from './Admin/EditItem'

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/HomePage" element={<HomePage />} />

                <Route path="/dashboard/found-item" element={<UserChat />}/>
                <Route path="/AdminDashboard" element={<AdminDashboard />} />

                <Route path="/CaimHistory" element={<ClaimHistory />} />
                <Route path="/add-item" element={<AddItem />} />
                <Route path="/manage-items" element={<EditItem />} />
                <Route path="/ready-to-pick" element={<ReadytopickupsList />} />
                <Route path="/claim/:itemId" element={<UploadEvidence />} />

            </Routes>
        </Router>
    );
}

export default App;