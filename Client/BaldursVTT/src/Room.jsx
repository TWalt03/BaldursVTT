import { useParams } from "react-router-dom";

function Room(){
    const { roomCode } = useParams();
    
    return(
        <h1>`Rooms:${roomCode}`</h1>
    )
}
export default Room;