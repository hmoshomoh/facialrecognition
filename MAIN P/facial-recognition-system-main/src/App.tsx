
import { Route, Routes } from "react-router-dom";
import Home from "./components/Home/home";
import ExeatSignOut from "./components/Verification/VerificationForm";

function App() {
  return (
  
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/exeat" element={<ExeatSignOut />} />
      </Routes>
    </div>
  )
}


export default App;
