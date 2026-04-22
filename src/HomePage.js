import React from 'react';
import { useState, useEffect } from 'react';
import './Css/HomePageStyle.css';
import {ItemData} from '../src/controller/ItemController';
import Navbar from './/components/NavBar';
const HomePage = () => {
    const [items, setItems] = useState([]);
    useEffect(() => {
        const fetchItems = async () => {
            const data = await ItemData() // ✅ ใส่ ()
            setItems(data);
            console.log("items:", data) // เพิ่มตรงนี้
            console.log("itemPicture:", data[0]?.itemPicture)
        };
        fetchItems();
    }, []);
    return (
        <div className="container">
            <header>
                <Navbar />
                <div>
                    <h1>ค้นหาของหาย</h1>
                    <input type={"search"}/>
                </div>
            </header>
            <main>
                <div className="features">
                    {items.map((item) =>(
                        <div key={item.itemId}>
                            <h3>{item.itemId}</h3>
                            <img
                                src={item.itemPicture}
                                alt={item.itemName}
                                style={{ width: '200px', height: '200px', objectFit: 'cover' }}
                                onError={(e) => e.target.src = '/placeholder.png'} // ← ถ้าโหลดไม่ได้
                            />
                            <p>{item.itemName}</p>
                            <p>{item.itemStatus}</p>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default HomePage;