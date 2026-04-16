import { useState, useEffect, useRef } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client';
import './App.css'

function UserChat() {
    const [name, setName] = useState('')
    const [greetings, setGreetings] = useState([]) // เก็บ { role: 'user'|'ai', text: string }
    const [isConnected, setIsConnected] = useState(false)
    const stompClient = useRef(null)
    const scrollRef = useRef(null)

    // ฟังก์ชันเลื่อนจอลงล่างสุด
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [greetings])

    // --- Logic การเชื่อมต่อ (ปรับปรุงใหม่) ---
    const connect = () => {
        // ป้องกันการต่อซ้ำถ้าสถานะยัง Active อยู่
        if (stompClient.current?.active) return;

        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/dashboard/found-item'),      reconnectDelay: 5000, // ต่อใหม่อัตโนมัติถ้าหลุด
            onConnect: () => {
                setIsConnected(true)
                client.subscribe('/user/queue/found-item', (greeting) => {
                    const aiMessage = JSON.parse(greeting.body).content
                    setGreetings((prev) => [...prev, { role: 'ai', text: aiMessage }])
                }, )
            },
            onDisconnect: () => setIsConnected(false),
            onStompError: (frame) => console.error('STOMP Error:', frame),
        })

        client.activate()
        stompClient.current = client
    }

    const disconnect = () => {
        if (stompClient.current) {
            stompClient.current.deactivate()
        }
    }

    // ใช้ useEffect จัดการ Lifecycle เมื่อเปิด/ปิดหน้าเว็บ
    useEffect(() => {
        connect() // ต่อทันทีที่โหลดหน้าเว็บ
        return () => disconnect() // ตัดการเชื่อมต่อทันทีที่ปิดหน้าเว็บ (Cleanup)
    }, [])

    const sendName = (e) => {
        e.preventDefault()
        if (isConnected && name.trim()) {
            // เพิ่มข้อความฝั่ง User ลงใน List ทันที
            setGreetings(prev => [...prev, { role: 'user', text: name }])

            stompClient.current.publish({
                destination: "/app/findItem",
                body: JSON.stringify({ name })
            })
            setName('')
        }
    }

    return (
        <div className="chat-container">
            <header>
                <h2>Status: {isConnected ? '🟢 Online' : '🔴 Offline'}</h2>
                {!isConnected && <button onClick={connect}>Reconnect</button>}
            </header>

            <section className="chat-window">
                {greetings.map((msg, idx) => (
                    <div key={idx} className={`message-bubble ${msg.role}`}>
                        <span className="sender">{msg.role === 'user' ? 'คุณ' : 'เจ้าหน้าที่'}</span>
                        <p>{msg.text}</p>
                    </div>
                ))}
                <div ref={scrollRef} /> {/* ตัวช่วยเลื่อนหน้าจอ */}
            </section>

            <form className="input-area" onSubmit={sendName}>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={isConnected ? "พิมพ์รายละเอียดสิ่งของ..." : "รอการเชื่อมต่อ..."}
                    disabled={!isConnected}
                />
                <button type="submit" disabled={!isConnected || !name}>ส่ง</button>
            </form>
        </div>
    )
}

export default UserChat