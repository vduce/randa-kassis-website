# Admin Panel - Authentication Setup

## Overview
This directory contains the admin panel authentication system for the Randa Kassis website content management system.

## Components

### AuthContext (`src/context/AuthContext.js`)
- Manages authentication state across the application
- Provides login, logout, and session validation functions
- Stores session data in localStorage with 12-hour expiry
- Validates credentials against environment variables

### LoginPage (`LoginPage.js`)
- Login form with email and password fields
- Client-side validation
- Error handling and display
- Redirects to intended destination after successful login

### AdminDashboard (`AdminDashboard.js`)
- Main dashboard view after successful authentication
- Responsive layout with collapsible sidebar
- Header with user info and logout button
- Main content area for category management
- Mobile-friendly with hamburger menu
- Welcome screen with quick info cards

### CategorySelector (`CategorySelector.js`)
- Displays all content categories in sidebar
- Shows category icons and labels
- File count badges for each category (placeholder)
- Active category highlighting
- Supports 9 content categories:
  - Articles
  - Encounters & Dialogue
  - Interviews (Politicians, Painters, Critics)
  - My Story
  - Paintings
  - Exhibitions
  - Through My Eyes

### ProtectedRoute (`ProtectedRoute.js`)
- Route guard component
- Redirects unauthenticated users to login page
- Preserves intended destination for post-login redirect
- Shows loading state during authentication check

## Routes

- `/admin` - Redirects to `/admin/dashboard`
- `/admin/login` - Login page (public)
- `/admin/dashboard` - Admin dashboard (protected)

## Environment Variables

Required variables in `.env`:

```
REACT_APP_ADMIN_EMAIL=randakassisadmin@gmail.com
REACT_APP_ADMIN_PASSWORD=Admin@kassis1234
```

## Usage

### Accessing the Admin Panel

1. Navigate to `http://localhost:3036/admin`
2. You'll be redirected to the login page
3. Enter credentials:
   - Email: `randakassisadmin@gmail.com`
   - Password: `Admin@kassis1234`
4. Upon successful login, you'll be redirected to the dashboard

### Session Management

- Sessions expire after 12 hours
- Session data is stored in localStorage
- Logout clears all session data
- Expired sessions automatically redirect to login

## Security Notes

⚠️ **This is a temporary MVP authentication solution**

- Credentials are validated client-side only
- Suitable for single-user development environment
- Should be replaced with proper server-side authentication before production
- Credentials should be rotated regularly
- Not suitable for multi-user scenarios

## Layout Features

### Responsive Design
- Desktop: Full sidebar with category navigation
- Tablet: Collapsible sidebar with toggle button
- Mobile: Overlay sidebar with hamburger menu
- Optimized touch interactions

### Navigation
- Sidebar toggle button in header
- Category selection with visual feedback
- Active category highlighting
- Smooth transitions and animations

### User Interface
- Clean, modern design with gradient header
- Card-based layout for content
- Icon-based category navigation
- Consistent color scheme (purple gradient)

## Future Enhancements

The following features will be added in subsequent tasks:
- File System Access API integration
- File management interface (list, create, edit, delete)
- Markdown editor with live preview
- File upload functionality
- Real file counts per category
- Search and filter capabilities
