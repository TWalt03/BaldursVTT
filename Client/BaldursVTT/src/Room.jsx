import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import './Room.css'


function Room(){
    const { roomCode } = useParams();
    const [userList, setUserList] = useState([]);
    
    useEffect(() => {
        const socket = io('http://localhost:5000');
        socket.emit('join-room', (roomCode))
        socket.on('user-joined', (data) =>{
            setUserList(prev => [...prev, data]);
        })
        socket.on('user-left', (data) =>{
            setUserList(prev => prev.filter(id => id !== data));
        })
        socket.on('user-list', (userList) => {
            setUserList(userList);
        })
        return () => {
            socket.disconnect();
        } 
        }, []);
        

    return(
        <div>
            <h1>`Room:${roomCode}`</h1>
            <div className="userList">
                <h2>User List</h2>
                {userList.map(item => <p key={item} className="users">{item}</p>)}
            </div>
        </div>
    )
}
export default Room;