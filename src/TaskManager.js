import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';

const API_BASE_URL = 'http://127.0.0.1:8000';

const Container = styled.div`
  max-width: 600px;
  margin: auto;
  padding: 20px;
`;

const Title = styled.h1`
  color: #333;
  text-align: center;
`;

const TaskForm = styled.div`
  display: flex;
  margin-bottom: 20px;

  input {
    flex: 1;
    padding: 8px;
    margin-right: 10px;
  }

  button {
    padding: 8px 16px;
    background-color: #4caf50;
    color: white;
    border: none;
    cursor: pointer;
  }
`;

const TaskList = styled.ul`
  list-style: none;
  padding: 0;

  li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: 1px solid #ddd;
    padding: 10px;
    margin-bottom: 10px;

    button {
      background-color: #f44336;
      color: white;
      border: none;
      cursor: pointer;
    }
  }
`;

const TaskManager = () => {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [tasks, setTasks] = useState([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

const authenticate = async (username, password) => {
  try {
    console.log(username, password);
    const response = await axios.post(
      `${API_BASE_URL}/users/login/`,
      { username, password },
      { headers: { 'Content-Type': 'application/json' } }
    );

    console.log('Status Code:', response.status);

    if (response.status === 200) {
      // Process the response data
      const { token } = response.data; // Access 'token' directly from response.data
      setToken(token);
      localStorage.setItem('token', token);
      console.log('token:', token);
      axios.defaults.headers.common['Authorization'] = `Token ${token}`;
      console.log('Authorization:', axios.defaults.headers.common['Authorization']);
    } else {
      console.error('Unexpected Status Code:', response.status);
    }
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error('Response error:', error.response.data);
      console.error('Status code:', error.response.status);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Request error:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('General error:', error.message);
    }
  }
};

  const createTask = async (taskData) => {
    try {
      await axios.post(`${API_BASE_URL}/tasks/`,
   { owner_id : 1, header : taskData.text, description : taskData.text},
  { headers: { 'Content-Type': 'application/json', Authorization: `Token ${token}` },});
      await getTasks();
    } catch (error) {
      console.error('Create task error:', error);
    }
  };

  const getTasks = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tasks/`, {
        headers: { 'Content-Type': 'application/json', Authorization: `Token ${token}` },
      });
      setTasks(response.data);
    } catch (error) {
      console.error('Get tasks error:', error);
    }
  };

  const getTaskById = async (taskId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tasks/${taskId}/`, {
        headers: { 'Content-Type': 'application/json', Authorization: `Token ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error('Get task by ID error:', error);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`${API_BASE_URL}/tasks/${taskId}/`, {
        headers: { 'Content-Type': 'application/json', Authorization: `Token ${token}` },
      });
      await getTasks();
    } catch (error) {
      console.error('Delete task error:', error);
    }
  };

  const handleCreateTask = async () => {
    await createTask({ text: newTaskText });
    setNewTaskText('');
  };

  const handleAuthenticate = async () => {
    const username = prompt('Enter your username:');
    const password = prompt('Enter your password:');

    if (username && password) {
      await authenticate(username, password);
    } else {
      console.error('Invalid username or password');
    }
  };

  const handleDownload = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/reports`, {
        responseType: 'blob', // Указываем, что ожидаем бинарные данные
        headers: { 'Content-Type': 'application/json', Authorization: `Token ${token}` },
      });

      // Создаем ссылку для скачивания
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'report.xlsx'); // Указываем имя файла

      // Добавляем ссылку в документ и эмулируем клик
      document.body.appendChild(link);
      link.click();

      // Освобождаем ресурсы
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download error:', error);
    }
  };


  useEffect(() => {
    getTasks()
  }, [token]);

  return (
      <Container>
        <Title>Task Manager</Title>

        <button onClick={handleAuthenticate}>Authenticate</button>
        <button onClick={handleDownload}>
          Download PDF
        </button>
        <TaskForm>
          <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder="Enter task text"
          />
          <button onClick={handleCreateTask}>Create Task</button>
        </TaskForm>

        <TaskList>
          {tasks.map((task) => (
              <li key={task.id}>
                <span>{task.description}</span>
                <button onClick={() => deleteTask(task.id)}>Delete</button>
              </li>
          ))}
        </TaskList>
      </Container>
  );
};

export default TaskManager;
