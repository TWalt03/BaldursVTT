import { useNavigate } from "react-router-dom";
import './Join.css';

export default function Join() {
  const navigate = useNavigate();
  async function handleSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    const formJson = Object.fromEntries(formData.entries());
    console.log(formJson);

    const code = formJson.roomCode;
    if (!code || code.trim() === "") {
      console.log("Please enter a room code");
      return;
    }
    try {
      const response = await fetch(`/api/rooms/${code}`);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
      navigate(`/room/${code}`);
    } catch (error) {
      console.error(error.message);
    } 
  }
  return (
    <form onSubmit={handleSubmit}>
      <div className="join">
          <input className="join-input" name="roomCode" placeholder="Enter Room Code"/>
          <button type="submit" className="join-button" >
            Join
          </button>
      </div>
    </form>
  );
}
