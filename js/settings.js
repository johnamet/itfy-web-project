<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Settings | IT For Youth Ghana</title>
    <link rel="shortcut icon" href="../../images/Asset-1.png" type="image/png">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://kit.fontawesome.com/9083b7c357.js" crossorigin="anonymous"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: '#1E3A8A',
                        secondary: '#10B981',
                        luxury: '#1F2937',
                        gold: '#D4AF37',
                        platinum: '#E5E7EB',
                        accent: '#F9FAFB',
                    },
                    fontFamily: { inter: ['Inter', 'sans-serif'] },
                    boxShadow: {
                        'premium': '0 6px 20px rgba(0, 0, 0, 0.15)',
                        'modal': '0 15px 40px rgba(0, 0, 0, 0.25)',
                    },
                    backgroundImage: {
                        'gradient-premium': 'linear-gradient(135deg, #1E3A8A 0%, #10B981 100%)',
                    },
                    animation: {
                        'slide-in': 'slideIn 0.5s ease-out',
                        'fade-in': 'fadeIn 0.3s ease-out',
                        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                    },
                    keyframes: {
                        slideIn: {
                            'from': { opacity: '0', transform: 'translateY(20px)' },
                            'to': { opacity: '1', transform: 'translateY(0)' },
                        },
                        fadeIn: {
                            'from': { opacity: '0', transform: 'scale(0.95)' },
                            'to': { opacity: '1', transform: 'scale(1)' },
                        },
                    },
                },
            },
        }
    </script>
    <style>
        .sidebar {
            background: linear-gradient(180deg, #1F2937, #1E3A8A);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
        }
        .nav-item {
            display: flex;
            align-items: center;
            padding: 0.75rem 1rem;
            color: #F9FAFB;
            border-radius: 0.5rem;
            transition: all 0.3s ease;
        }
        .nav-item:hover {
            background-color: #10B981;
            color: #1F2937;
            transform: scale(1.02);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }
        .nav-item.active {
            background-color: #1E3A8A;
            border-left: 4px solid #D4AF37;
            color: #F9FAFB;
        }
        .btn {
            transition: all 0.3s ease;
        }
        .btn:hover {
            transform: scale(1.05);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
        .input-label {
            position: relative;
        }
        .input-label input,
        .input-label select,
        .input-label textarea {
            transition: all 0.2s ease;
        }
        .input-label input:focus + .label-text,
        .input-label select:focus + .label-text,
        .input-label textarea:focus + .label-text,
        .input-label input:not(:placeholder-shown) + .label-text,
        .input-label select:not(:placeholder-shown) + .label-text,
        .input-label textarea:not(:placeholder-shown) + .label-text {
            transform: translateY(-1.5rem);
            font-size: 0.75rem;
            color: #10B981;
        }
        .label-text {
            position: absolute;
            top: 0.75rem;
            left: 1rem;
            color: #6B7280;
            transition: all 0.2s ease;
            pointer-events: none;
        }
        .tab-content {
            display: none;
        }
        .tab-content.active {
            display: block;
        }
        .tab-btn.active {
            border-bottom: 4px solid #10B981;
        }
        .table-responsive {
            width: 100%;
            max-width: 100%;
        }
    </style>
</head>
<body class="bg-platinum font-inter">
<div class="flex min-h-screen">
    <!-- Sidebar -->
    <nav class="sidebar flex-shrink-0 w-60 text-white shadow-xl transition-all duration-300">
        <div class="logo flex items-center p-6 border-b border-gray-700/50">
            <a href="../../index.html" class="flex items-center">
                <img src="../../images/Asset-1.png" alt="IT For Youth Ghana Logo" class="w-10 h-10 mr-3">
                <h2 class="text-xl font-bold tracking-tight">IT For Youth Ghana</h2>
            </a>
        </div>
        <ul class="nav-links p-4 space-y-2">
            <li><a href="../dashboard.html" class="nav-item"><i class="fas fa-home mr-2 text-lg"></i> Dashboard</a></li>
            <li><a href="voting.html" class="nav-item"><i class="fas fa-vote-yea mr-2 text-lg"></i> Voting</a></li>
            <li><a href="manage-candidates.html" class="nav-item"><i class="fas fa-users mr-2 text-lg"></i> Candidates</a></li>
            <li><a href="results.html" class="nav-item"><i class="fas fa-chart-bar mr-2 text-lg"></i> Results</a></li>
            <li><a href="balance-board.html" class="nav-item"><i class="fas fa-wallet mr-2 text-lg"></i> Balance Board</a></li>
            <li><a href="settings.html" class="nav-item active"><i class="fas fa-cog mr-2 text-lg"></i> Settings</a></li>
            Canghange es</a></li>
            <li><a href="manage-category.html" class="nav-item"><i class="fas fa-list mr-2 text-lg"></i> Categories</a></li>
            <li><a href="manage-nominations.html" class="nav-item"><i class="fas fa-award mr-2 text-lg"></i> Nominations</a></li>
            <li><a href="manage-users.html" class="nav-item"><i class="fas fa-user mr-2 text-lg"></i> Users</a></li>
        </ul>
    </nav>

    <!-- Main Content -->
    <main class="flex-1 p-8 max-w-7xl mx-auto">
        <header class="flex justify-between items-center mb-8 border-b border-gray-200 pb-4">
            <h1 class="text-3xl font-bold text-luxury">Settings</h1>
        </header>

        <!-- Notification -->
        <div id="notification" class="fixed top-6 right-6 hidden z-50 bg-luxury/90 text-white p-4 rounded-full shadow-premium flex items-center space-x-4">
            <span id="notificationMessage" class="font-medium"></span>
            <button id="closeNotification" class="text-white hover:text-gold"><i class="fas fa-times"></i></button>
        </div>

        <!-- Tab Navigation -->
        <nav class="flex space-x-4 border-b border-gray-200 mb-6">
            <button class="tab-btn px-4 py-2 text-luxury font-semibold border-b-2 border-transparent hover:border-secondary active" data-tab="slides">Slides</button>
            <button class="tab-btn px-4 py-2 text-luxury font-semibold border-b-2 border-transparent hover:border-secondary" data-tab="roles">Roles</button>
            <button class="tab-btn px-4 py-2 text-luxury font-semibold border-b-2 border-transparent hover:border-secondary" data-tab="theme">Theme</button>
            <button class="tab-btn px-4 py-2 text-luxury font-semibold border-b-2 border-transparent hover:border-secondary" data-tab="general">General</button>
            <button class="tab-btn px-4 py-2 text-luxury font-semibold border-b-2 border-transparent hover:border-secondary" data-tab="notifications">Notifications</button>
            <button class="tab-btn px-4 py-2 text-luxury font-semibold border-b-2 border-transparent hover:border-secondary" data-tab="backup">Backup</button>
        </nav>

        <!-- Slides Section -->
        <section id="slides" class="tab-content bg-white/90 p-6 rounded-lg shadow-premium animate-slide-in backdrop-blur-md active">
            <h2 class="text-2xl font-semibold text-primary mb-4">Manage Slides</h2>
            <button id="addSlideBtn" class="btn bg-gradient-premium text-white font-semibold py-2 px-6 rounded-full shadow-premium mb-4">Add New Slide</button>
            <div id="slidesList" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"></div>
            <div id="slides-pagination" class="mt-6 flex justify-center space-x-2"></div>
        </section>

        <!-- Roles Section -->
        <section id="roles" class="tab-content bg-white/90 p-6 rounded-lg shadow-premium animate-slide-in backdrop-blur-md hidden">
            <h2 class="text-2xl font-semibold text-primary mb-4">Manage Roles</h2>
            <button id="addRoleBtn" class="btn bg-gradient-premium text-white font-semibold py-2 px-6 rounded-full shadow-premium mb-4">Add New Role</button>
            <div class="table-responsive">
                <table class="w-full divide-y divide-gray-200">
                    <thead class="bg-platinum">
                    <tr>
                        <th class="px-6 py-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Role Name</th>
                        <th class="px-6 py-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Description</th>
                        <th class="px-6 py-4 text-right text-sm font-medium text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                    </thead>
                    <tbody id="rolesTable" class="divide-y divide-gray-200"></tbody>
                </table>
            </div>
            <div id="roles-pagination" class="mt-6 flex justify-center space-x-2"></div>
        </section>

        <!-- Theme Section -->
        <section id="theme" class="tab-content bg-white/90 p-6 rounded-lg shadow-premium animate-slide-in backdrop-blur-md hidden">
            <h2 class="text-2xl font-semibold text-primary mb-4">Theme Settings</h2>
            <div class="space-y-6">
                <div class="input-label">
                    <select id="themeMode" class="w-full p-3 rounded-lg bg-platinum focus:ring-0 focus:shadow-sm" placeholder=" ">
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                    </select>
                    <span class="label-text">Theme Mode</span>
                </div>
                <div class="input-label">
                    <input type="color" id="primaryColor" class="w-24 h-10 p-1 rounded-lg bg-platinum focus:ring-0 focus:shadow-sm">
                    <span class="label-text">Primary Color</span>
                </div>
                <button id="saveThemeBtn" class="btn bg-gradient-premium text-white font-semibold py-2 px-6 rounded-full shadow-premium">Save Theme</button>
            </div>
        </section>

        <!-- General Section -->
        <section id="general" class="tab-content bg-white/90 p-6 rounded-lg shadow-premium animate-slide-in backdrop-blur-md hidden">
            <h2 class="text-2xl font-semibold text-primary mb-4">General Settings</h2>
            <div class="space-y-6">
                <div class="input-label">
                    <input type="text" id="siteName" class="w-full p-3 rounded-lg bg-platinum focus:ring-0 focus:shadow-sm" placeholder=" " value="IT For Youth Ghana">
                    <span class="label-text">Site Name</span>
                </div>
                <div class="input-label">
                    <input type="file" id="siteLogo" accept="image/*" class="w-full p-3 rounded-lg bg-platinum focus:ring-0 focus:shadow-sm">
                    <span class="label-text">Site Logo</span>
                    <img id="logoPreview" class="mt-2 w-24 h-24 object-cover rounded-full hidden" alt="Logo Preview">
                </div>
                <button id="saveGeneralBtn" class="btn bg-gradient-premium text-white font-semibold py-2 px-6 rounded-full shadow-premium">Save General Settings</button>
            </div>
        </section>

        <!-- Notifications Section -->
        <section id="notifications" class="tab-content bg-white/90 p-6 rounded-lg shadow-premium animate-slide-in backdrop-blur-md hidden">
            <h2 class="text-2xl font-semibold text-primary mb-4">Notification Settings</h2>
            <div class="space-y-4">
                <label class="flex items-center">
                    <input type="checkbox" id="emailNotifications" class="mr-2 rounded focus:ring-secondary">
                    <span class="text-luxury font-medium">Enable Email Notifications</span>
                </label>
                <button id="saveNotificationBtn" class="btn bg-gradient-premium text-white font-semibold py-2 px-6 rounded-full shadow-premium">Save Notification Settings</button>
            </div>
        </section>

        <!-- Backup Section -->
        <section id="backup" class="tab-content bg-white/90 p-6 rounded-lg shadow-premium animate-slide-in backdrop-blur-md hidden">
            <h2 class="text-2xl font-semibold text-primary mb-4">Backup & Restore</h2>
            <div class="space-y-4">
                <button id="backupBtn" class="btn bg-gradient-premium text-white font-semibold py-2 px-6 rounded-full shadow-premium">Create Backup</button>
                <div>
                    <div class="input-label">
                        <input type="file" id="restoreFile" class="w-full p-3 rounded-lg bg-platinum focus:ring-0 focus:shadow-sm">
                        <span class="label-text">Restore from Backup</span>
                    </div>
                    <button id="restoreBtn" class="mt-2 btn bg-gradient-premium text-white font-semibold py-2 px-6 rounded-full shadow-premium">Restore</button>
                </div>
            </div>
        </section>

        <!-- Slide Form Modal -->
        <div id="slideForm" class="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center hidden animate-fade-in z-50">
            <div class="bg-white/90 p-8 rounded-lg shadow-modal w-full max-w-md backdrop-blur-md">
                <h3 id="slideFormTitle" class="text-xl font-semibold text-primary mb-6">Add New Slide</h3>
                <form id="slideFormElement">
                    <div class="space-y-6">
                        <div class="input-label">
                            <input type="file" id="slideImage" name="slideImage" accept="image/*" class="w-full p-3 rounded-lg bg-platinum focus:ring-0 focus:shadow-sm" required>
                            <span class="label-text">Slide Image</span>
                            <img crossorigin="anonymous" id="slidePreview" class="mt-2 w-full h-32 object-cover rounded-lg hidden" alt="Slide Preview">
                        </div>
                        <div class="input-label">
                            <input type="text" id="slideTitle" name="slideTitle" class="w-full p-3 rounded-lg bg-platinum focus:ring-0 focus:shadow-sm" placeholder=" " required>
                            <span class="label-text">Title</span>
                        </div>
                        <div class="input-label">
                            <input type="text" id="slideCaption" name="slideCaption" class="w-full p-3 rounded-lg bg-platinum focus:ring-0 focus:shadow-sm" placeholder=" ">
                            <span class="label-text">Caption</span>
                        </div>
                        <div class="input-label">
                            <input type="url" id="slideUrl" name="slideUrl" class="w-full p-3 rounded-lg bg-platinum focus:ring-0 focus:shadow-sm" placeholder=" ">
                            <span class="label-text">Slide URL</span>
                        </div>
                        <div class="input-label">
                            <input type="text" id="buttonLabel" name="buttonLabel" class="w-full p-3 rounded-lg bg-platinum focus:ring-0 focus:shadow-sm" placeholder=" ">
                            <span class="label-text">Button Label</span>
                        </div>
                    </div>
                    <div class="mt-8 flex justify-end space-x-4">
                        <button type="button" id="cancelSlideBtn" class="btn bg-platinum text-luxury font-semibold py-2 px-4 rounded-full shadow-sm hover:bg-gray-200">Cancel</button>
                        <button type="submit" class="btn bg-gradient-premium text-white font-semibold py-2 px-6 rounded-full shadow-premium">Save Slide</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Role Form Modal -->
        <div id="roleForm" class="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center hidden animate-fade-in z-50">
            <div class="bg-white/90 p-8 rounded-lg shadow-modal w-full max-w-md backdrop-blur-md">
                <h3 id="roleFormTitle" class="text-xl font-semibold text-primary mb-6">Add Role</h3>
                <form id="roleFormElement">
                    <div class="space-y-6">
                        <div class="input-label">
                            <input type="text" id="roleName" name="roleName" class="w-full p-3 rounded-lg bg-platinum focus:ring-0 focus:shadow-sm" placeholder=" " required>
                            <span class="label-text">Role Name</span>
                        </div>
                        <div class="input-label">
                            <textarea id="roleDesc" name="roleDesc" class="w-full p-3 rounded-lg bg-platinum focus:ring-0 focus:shadow-sm h-24" placeholder=" "></textarea>
                            <span class="label-text">Description</span>
                        </div>
                        <div>
                            <label class="block text-luxury font-medium mb-2">Permissions</label>
                            <div class="space-y-2">
                                <label class="flex items-center">
                                    <input type="checkbox" name="permissions" value="read" class="mr-2 rounded focus:ring-secondary">
                                    <span class="text-luxury">Read</span>
                                </label>
                                <label class="flex items-center">
                                    <input type="checkbox" name="permissions" value="create" class="mr-2 rounded focus:ring-secondary">
                                    <span class="text-luxury">Create</span>
                                </label>
                                <label class="flex items-center">
                                    <input type="checkbox" name="permissions" value="write" class="mr-2 rounded focus:ring-secondary">
                                    <span class="text-luxury">Write</span>
                                </label>
                                <label class="flex items-center">
                                    <input type="checkbox" name="permissions" value="update" class="mr-2 rounded focus:ring-secondary">
                                    <span class="text-luxury">Update</span>
                                </label>
                                <label class="flex items-center">
                                    <input type="checkbox" name="permissions" value="delete" class="mr-2 rounded focus:ring-secondary">
                                    <span class="text-luxury">Delete</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    <div class="mt-8 flex justify-end space-x-4">
                        <button type="button" id="cancelRoleBtn" class="btn bg-platinum text-luxury font-semibold py-2 px-4 rounded-full shadow-sm hover:bg-gray-200">Cancel</button>
                        <button type="submit" class="btn bg-gradient-premium text-white font-semibold py-2 px-6 rounded-full shadow-premium">Save Role</button>
                    </div>
                </form>
            </div>
        </div>
    </main>
</div>
<script src="https://cdn.socket.io/4.0.0/socket.io.min.js"></script>
<script src="../../js/settings.js" type="module"></script>
</body>
</html>