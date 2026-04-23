import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './Login';
import AdminDashboard from './Admin/AdminDashboard';
import HomePage from "./HomePage";
import UserChat from './User/UserChat'
import AddItem from './Admin/AddItem'
import DisplayItem from './DisplayItem'

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/HomePage" element={<HomePage />} />

                <Route path="/dashboard/found-item" element={<UserChat />}/>
                <Route path="/AdminDashboard" element={<AdminDashboard />} />

                <Route path="/add-item" element={<AddItem />} />
                <Route path="/test-item" element={<DisplayItem />} />
            </Routes>
        </Router>
    );
}

export default App;