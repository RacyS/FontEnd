import React, { useState } from 'react';
import './Login.css';
import {loginUser} from '../src/controller/authController';
import { useNavigate } from 'react-router-dom';

function Login() {
    const[credentials, setCredentials] = useState({email:"",password:""});
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials({ ...credentials, [name]: value });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();//กันหน้าreload
        try{
            const data = await loginUser(credentials);
            console.log("Response จาก Backend คือ:", data);

            if (data && data.role === "STAFF") {
                localStorage.setItem("userRole", data.role);
                localStorage.setItem("userEmail", credentials.email);
                localStorage.setItem("userId", data.userId);
                navigate('/AdminDashboard');
            }
            else if (data && data.role === "STUDENT") {
                localStorage.setItem("student_id", data.student_id);
                localStorage.setItem("userId", data.userId);
                localStorage.setItem("userRole", data.role);
                localStorage.setItem("userEmail", credentials.email);
                navigate('/HomePage');
            }

        }catch (error) {
            console.log(error.message);
        }
    }

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleSubmit}>
                <h2>ยินดีต้อนรับ</h2>
                <p>กรุณาเข้าสู่ระบบเพื่อใช้งาน</p>

                <div className="input-group">
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="email"
                        name="email"
                        placeholder="Enter Email"
                        value={credentials.email}//ผูกกับstate
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        placeholder="Enter Password"
                        value={credentials.password}
                        onChange={handleChange}
                        required
                    />
                </div>

                <button type="submit" className="login-button">Login</button>

                <div className="form-footer">
                    <a href="#">ลืมรหัสผ่าน?</a>
                </div>
            </form>
        </div>
    );
}

export default Login;