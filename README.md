## UniResult

A **full-stack web application** for managing student academic records with an **admin dashboard, authentication system, and result upload & management features**.

### Features

**Student Side**

*   View student Leaderboard
    
*   Search students by registration number
    
*   Clean and responsive UI
    

**Admin Panel**

*   Secure Admin Login (JWT + Cookies)
    
*   Upload student results
    
*   View all students in a dashboard
    
*   Delete student records
    
*   Analytics (Total students, Average CGPA)
    
*   Protected routes (Admin-only access)
    

### **Tech Stack**

**Frontend**

*   React.js
    
*   React Router DOM
    
*   Tailwind CSS
    
*   Axios
    
*   React Toastify
    
*   Lucide Icons
    
*   Vite
    

**Backend**

*   Node.js
    
*   Express.js
    
*   MongoDB & Mongoose
    
*   JWT Authentication
    
*   CORS & Cookie-based auth
    

### Installation & Setup

**1\. Clone the Repo**

```javascript
git clone https://github.com/CoderAk0021/uniResults.git
cd uniResults
```

**2\. Setup Backend**

```javascript
cd server
npm install
```

**_Create a .env file in server/:_**

```javascript
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
```

**Run backend**

```javascript
npm run dev
```

**3\. Setup Frontend**

```javascript
cd client
npm install
```

**_Create a .env file in client /_**

```javascript
VITE_API_URL=http://localhost:5000
```

**Run frontend**

```javascript
npm run dev
```

### Contributing

**Contributions and suggestions are welcome!**

**Feel free to fork this repository and submit a pull request.**
