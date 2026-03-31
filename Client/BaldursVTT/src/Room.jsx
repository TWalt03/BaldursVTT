import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { Stage, Layer, Image } from 'react-konva';
import useImage from 'use-image';
import './Room.css'
import './index.css'


function Room(){
    const { roomCode } = useParams();
    const [userList, setUserList] = useState([]);
    const [mapUrl, setMapUrl] = useState(null);
    const mapImage = useImage(mapUrl);
    
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
        socket.on('map-changed', (url) =>{
            setMapUrl(url);
        })
        return () => {
            socket.disconnect();
        } 
        }, []);

    const mapUpload = async (e) => {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('map', file);
        await fetch(`http://localhost:5000/api/map/${roomCode}`, {
            method: 'POST',
            body: formData
        });
    }
        

    return(
        <div>
            <h1 className="title">Room:{roomCode}</h1>
            <div className="overlay">
                <div className="userList">
                    <h2 className="userListTitle">User List</h2>
                    {userList.map(item => <p key={item} className="users">{item}</p>)}
                </div>
                <div className="canvas">
                    <Stage width={window.innerWidth} height={window.innerHeight-70} draggable>
                        <Layer>
                            <Image image={mapImage} x={0} y={0} width={window.innerWidth} height={window.innerHeight-70}>   
                            </Image>
                        </Layer>
                    </Stage>
                </div>
                <div>
                <input type="file" accept="image/*" onChange={mapUpload} />
                </div>
            </div>
        </div>
    )
}
export default Room;