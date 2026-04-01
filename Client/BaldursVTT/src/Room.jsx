import { useParams } from "react-router-dom";
import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { Stage, Layer, Image, Circle, Text, Group } from 'react-konva';
import useImage from 'use-image';
import TokenPanel from './Components/TokenPanel';
import './Room.css';
import './index.css';


function Room(){
    const { roomCode } = useParams();
    const [userList, setUserList] = useState([]);
    const [mapUrl, setMapUrl] = useState(null);
    const [mapImage] = useImage(mapUrl);
    const [tokenArray, setTokenArray] = useState([]);
    const socketRef = useRef(null);
    
    useEffect(() => {
        socketRef.current = io(import.meta.env.VITE_SERVER_URL);
        socketRef.current.emit('join-room', (roomCode))
        socketRef.current.on('user-joined', (data) =>{
            setUserList(prev => [...prev, data]);
        })
        socketRef.current.on('user-left', (data) =>{
            setUserList(prev => prev.filter(id => id !== data));
        })
        socketRef.current.on('user-list', (userList) => {
            setUserList(userList);
        })
        socketRef.current.on('map-changed', (url) =>{
            setMapUrl(url);
        })
        socketRef.current.on('room-state', (data) => {
            console.log('room-state received:', data);
            setTokenArray(data.tokens || []);
            if( data.mapUrl) setMapUrl(data.mapUrl);
        })
        socketRef.current.on('token-moved', (data) => {
            setTokenArray(prev => prev.map(token => 
                token._id === data.id ? {...token, x: data.x, y: data.y } : token
            ));
        })
        socketRef.current.on('token-added', (data) => {
            setTokenArray(prev => [...prev, data]);
        })
        socketRef.current.on('token-removed', (data) => {
            setTokenArray(prev => prev.filter(token => token._id !== data))
        })
        return () => {
            socketRef.current.disconnect();
        } 
        }, []);

    const mapUpload = async (e) => {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('map', file);
        await fetch(`${import.meta.env.VITE_SERVER_URL}/api/map/${roomCode}`, {
            method: 'POST',
            body: formData
        });
    }

    const onTokenMove = (e, item) => {
        const x = e.target.x() / window.innerWidth;
        const y = e.target.y() / window.innerHeight;
        socketRef.current.emit('token-moved', { id: item._id, x, y });
        setTokenArray(prev => prev.map(token => 
            token._id === item._id ? {...token, x, y} : token
        ));
    }
        
    console.log('tokenArray at render:', JSON.stringify(tokenArray));
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
                        <Layer>
                            {tokenArray.map((item, index) => (
                                <Group 
                                    key={item._id}
                                    x={Number(item.x) * window.innerWidth}
                                    y={Number(item.y) * window.innerHeight}
                                    draggable
                                    onDragEnd={(e) => onTokenMove(e, item)}
                                >
                                    <Circle
                                        radius={20}
                                        fill={item.color}
                                    />
                                    <Text
                                        x={-20}
                                        y={25}
                                        text={item.name}
                                        fill="white"
                                    />
                                </Group>
                            ))}
                        </Layer>
                    </Stage>
                </div>
                <TokenPanel socketRef={socketRef} roomCode={roomCode} tokenArray={tokenArray} />
            </div>
            <div>
                <input className="upload"type="file" accept="image/*" onChange={mapUpload} />
            </div>
        </div>
    )
}
export default Room;