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

  useEffect(() => {
    const loadContract = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = await provider.getSigner();
          const taskContract = new ethers.Contract(contractAddress, contractABI, signer);
          setContract(taskContract);
        } catch (error) {
          console.error("Error loading contract:", error);
        }
      }
    };

    loadContract();
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask not detected!");
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
      if (contract) fetchTasks(); // Ensure contract exists before calling it
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  const fetchTasks = async () => {
    if (!contract || !account) return;

    try {
      const myTasks = await contract.getMyTask();
      setTasks(myTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const addTask = async () => {
    if (!contract) return;

    try {
      const tx = await contract.addTask(taskText, taskTitle, false);
      await tx.wait();
      fetchTasks();
      setTaskTitle("");
      setTaskText("");
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const deleteTask = async (taskId) => {
    if (!contract) return;

    try {
      const tx = await contract.deleteTask(taskId);
      await tx.wait();
      fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">Task Manager</h1>
      {!account ? (
        <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={connectWallet}>
          Connect Wallet
        </button>
      ) : (
        <div className="w-full max-w-md">
          <input
            type="text"
            placeholder="Task Title"
            className="border p-2 w-full mb-2"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
          />
          <input
            type="text"
            placeholder="Task Description"
            className="border p-2 w-full mb-2"
            value={taskText}
            onChange={(e) => setTaskText(e.target.value)}
          />
          <button className="w-full bg-green-500 text-white py-2" onClick={addTask}>
            Add Task
          </button>
          <div className="mt-4">
            {tasks.length === 0 ? (
              <p>No tasks found</p>
            ) : (
              tasks.map((task, index) => (
                <div key={index} className="border p-2 mb-2 flex justify-between">
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
  );
}
