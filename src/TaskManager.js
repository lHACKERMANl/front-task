import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://API_BASE_URL'; 

const TaskManager = () => {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [tasks, setTasks] = useState([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  // Функция для выполнения аутентификации
  const authenticate = async (username, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/authentication`, {
        username,
        password,
      });
      const { token } = response.data;
      setToken(token);
      localStorage.setItem('token', token);
    } catch (error) {
      console.error('Authentication error:', error);
    }
  };

  // Функция для обновления токена
  const refreshAuthentication = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/authentication/refresh`, {
        token,
      });
      const newToken = response.data.token;
      setToken(newToken);
      localStorage.setItem('token', newToken);
    } catch (error) {
      console.error('Refresh authentication error:', error);
    }
  };

  // Функция для получения информации о текущем пользователе
  const getCurrentUser = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCurrentUser(response.data);
    } catch (error) {
      console.error('Get current user error:', error);
    }
  };

  // Функция для создания задачи
  const createTask = async (taskData) => {
    try {
      await axios.post(`${API_BASE_URL}/tasks`, taskData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Обновление списка задач после создания
      console.log('all ok');
      await getTasks();
    } catch (error) {
      console.error('Create task error:', error);
    }
  };

  // Функция для получения списка задач
  const getTasks = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tasks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTasks(response.data);
    } catch (error) {
      console.error('Get tasks error:', error);
    }
  };

  // Функция для получения задачи по ID
  const getTaskById = async (taskId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tasks/${taskId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Get task by ID error:', error);
    }
  };

  // Функция для удаления задачи
  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`${API_BASE_URL}/tasks/${taskId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Обновление списка задач после удаления
      await getTasks();
    } catch (error) {
      console.error('Delete task error:', error);
    }
  };

  const handleCreateTask = async () => {
    // Функция для создания новой задачи
    await createTask({ text: newTaskText });
    setNewTaskText(''); // Очищаем поле ввода после создания задачи
  };

  // useEffect для получения списка задач и информации о текущем пользователе после монтирования компонента
  useEffect(() => {
    getTasks();
    getCurrentUser();
  }, [token]);

  return (
    <div>
      <h1>Task Manager</h1>

      {/* Форма для создания новой задачи */}
      <div>
        <input
          type="text"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          placeholder="Введите текст задачи"
        />
        <button onClick={handleCreateTask}>Создать задачу</button>
      </div>

      {/* Визуализация списка задач */}
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            <span>{task.text}</span>
            <button onClick={() => deleteTask(task.id)}>Удалить</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskManager;
