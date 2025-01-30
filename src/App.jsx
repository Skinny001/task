import { useState, useEffect } from "react";
import { ethers } from "ethers";
import contractABI from "./abi.json"; // Import ABI

const contractAddress = "0x9341C730ceeB5Ead8b44939d56275eC4a7654Cf2";

export default function TaskApp() {
  const [tasks, setTasks] = useState([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskText, setTaskText] = useState("");
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [isDeleted, setIsDeleted] = useState(false);
  const [message, setMessage] = useState("");
  async function requestAccount (){
    await window.ethereum.request({ method: "eth_requestAccounts" }); 
  }


  async function connectWallet() {
 
    if (typeof window.ethereum !== "undefined"){
      await requestAccount();
    }

    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);

      // Ensure contract is loaded after connecting wallet
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = provider.getSigner();
      const taskContract = new ethers.Contract(contractAddress, contractABI, signer);
      setContract(taskContract);

      fetchTasks(taskContract, accounts[0]); // Fetch tasks after connecting
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  const fetchTasks = async (taskContract, userAccount) => {
    if (!taskContract) return;

    try {
      const myTasks = await taskContract.getMyTask();
      setTasks(myTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  async function addTask() {
    if (typeof window.ethereum !== "undefined"){
      await requestAccount();
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress,contractABI,signer)

    try {
      const transation = await contract.addTask(taskText, taskTitle, isDeleted);
      const receipe = await transation.wait();
      setMessage("Tasks Added Successful")
    } catch (error) {
      setMessage("Error adding task:" + error);
    }
  };

  const deleteTask = async (taskId) => {
    if (!contract) {
      alert("Contract not loaded yet. Try again.");
      return;
    }

    try {
      const tx = await contract.deleteTask(taskId);
      await tx.wait();
      fetchTasks(contract, account);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-4">Task Manager</h1>
        {!account ? (
          <button className="w-full py-2 bg-blue-500 text-white rounded-lg" onClick={connectWallet}>
            Connect Wallet
          </button>
        ) : (
          <div>
            <input
              type="text"
              placeholder="Task Title"
              className="border p-2 w-full rounded-lg mb-2"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
            />
            <input
              type="text"
              placeholder="Task Description"
              className="border p-2 w-full rounded-lg mb-2"
              value={taskText}
              onChange={(e) => setTaskText(e.target.value)}
            />
            <select className="border p-2 w-full rounded-lg mb-2" onChange={(e) => setIsDeleted(e.target.value)}>
              <option value={false}>Not Deleted</option>
              <option value={true}>Deleted</option>
            </select>
            <button className="w-full bg-green-500 text-white py-2 rounded-lg" onClick={addTask}>
              Add Task
            </button>
            <p className="text-green-600 text-center mt-2">{message}</p>
            <div className="mt-4">
              {tasks.length === 0 ? (
                <p className="text-center text-gray-500">No tasks found</p>
              ) : (
                tasks.map((task, index) => (
                  <div key={index} className="border p-3 mb-2 flex justify-between rounded-lg shadow-sm">
                    <span>{task.taskTitle}: {task.taskText}</span>
                    <button className="text-red-500" onClick={() => deleteTask(task.id)}>
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
