import React, {useState} from 'react';

export default function TokenPanel({ socketRef, roomCode, tokenArray }) {
    const [ tokenName, setTokenName ] = useState('');
    const [ tokenColor, setTokenColor ] = useState('#ff0000');

    const onHandleSubmitToken = () => {
        socketRef.current.emit('add-token', { name: tokenName, color: tokenColor, roomCode});
    }

    const onHandleDeleteToken = (token) => {
        socketRef.current.emit('remove-token', { id: token._id, roomCode});
    }

    return(
       <div>
            <div className='tokenList'> 
                {tokenArray.map(item => (
                    <div key={item._id}>
                        <p>{item.name}</p>
                        <button type='submit' onClick={() => onHandleDeleteToken(item)}>Delete</button>
                    </div>
            ))}
                
            </div>
            <div className='tokenUploads'>
                <input type="text" className='tokenName' onChange={(e) => setTokenName(e.target.value)} />
                <input type="color" className='tokenColor' onChange={(e) => setTokenColor(e.target.value)} />
                <button type='submit' className='tokenSubmit' onClick={onHandleSubmitToken}> Add Token </button>
            </div>
       </div>
    )
}