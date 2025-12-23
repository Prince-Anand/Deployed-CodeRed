import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ArrowUpRight, LogOut, User, Bell, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useSocket() || {}; // Handle null context gracefully initially
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef(null);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Close notifications when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNotificationClick = (notification) => {
        markAsRead(notification._id);
        setShowNotifications(false);
        if (notification.relatedLink) {
            navigate(notification.relatedLink);
        }
    };

    return (
        <nav className="bg-[var(--color-background)] sticky top-0 z-50 py-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link to="/" className="flex items-center gap-1 group">
                            <span className="text-3xl font-black tracking-tighter text-[var(--color-primary-dark)] group-hover:opacity-90 transition-opacity">
                                Agnt.
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Center Pill Navigation */}
                    <div className="hidden md:flex items-center justify-center flex-1 px-8">
                        <div className="bg-[var(--color-secondary)]/15 backdrop-blur-sm rounded-full px-8 py-2.5 flex items-center space-x-6 shadow-sm border border-[var(--color-secondary)]/10">

                            {user ? (
                                <>
                                    <Link to={user.role === 'agent' ? '/agent-dashboard' : '/dashboard'} className="text-sm font-semibold text-[var(--color-primary-dark)] hover:text-[var(--color-primary)] transition-colors">
                                        Dashboard
                                    </Link>
                                    <span className="text-[var(--color-secondary)]/40">•</span>

                                    {user.role === 'employer' && (
                                        <>
                                            <Link to="/agents" className="text-sm font-semibold text-[var(--color-primary-dark)] hover:text-[var(--color-primary)] transition-colors">
                                                Find Agents
                                            </Link>
                                            <span className="text-[var(--color-secondary)]/40">•</span>
                                        </>
                                    )}

                                    {user.role === 'agent' && (
                                        <>
                                            <Link to="/jobs" className="text-sm font-semibold text-[var(--color-primary-dark)] hover:text-[var(--color-primary)] transition-colors">
                                                Find Jobs
                                            </Link>
                                            <span className="text-[var(--color-secondary)]/40">•</span>
                                        </>
                                    )}
                                </>
                            ) : (
                                <>
                                    <Link to="/agents" className="text-sm font-semibold text-[var(--color-primary-dark)] hover:text-[var(--color-primary)] transition-colors">
                                        Find Agents
                                    </Link>
                                    <span className="text-[var(--color-secondary)]/40">•</span>
                                    <Link to="/jobs" className="text-sm font-semibold text-[var(--color-primary-dark)] hover:text-[var(--color-primary)] transition-colors">
                                        Find Jobs
                                    </Link>
                                    <span className="text-[var(--color-secondary)]/40">•</span>
                                </>
                            )}

                            <Link to="/#how-it-works" className="text-sm font-semibold text-[var(--color-primary-dark)] hover:text-[var(--color-primary)] transition-colors">
                                How it Works
                            </Link>
                            <span className="text-[var(--color-secondary)]/40">•</span>
                            <Link to="/support" className="text-sm font-semibold text-[var(--color-primary-dark)] hover:text-[var(--color-primary)] transition-colors">
                                Support
                            </Link>
                        </div>
                    </div>

                    {/* Desktop Right Actions */}
                    <div className="hidden md:flex items-center space-x-4">
                        {user ? (
                            <div className="flex items-center gap-4">
                                {/* Notifications */}
                                <div className="relative" ref={notificationRef}>
                                    <button
                                        onClick={() => setShowNotifications(!showNotifications)}
                                        className="relative p-2 rounded-full hover:bg-[var(--color-secondary)]/20 transition-colors text-[var(--color-primary-dark)]"
                                    >
                                        <Bell className="h-5 w-5" />
                                        {unreadCount > 0 && (
                                            <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold border-2 border-white">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </button>

                                    {showNotifications && (
                                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50">
                                            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                                                <h3 className="font-bold text-[var(--color-primary-dark)]">Notifications</h3>
                                                {unreadCount > 0 && (
                                                    <button onClick={markAllAsRead} className="text-xs text-[var(--color-primary)] hover:underline">
                                                        Mark all as read
                                                    </button>
                                                )}
                                            </div>
                                            <div className="max-h-96 overflow-y-auto">
                                                {!notifications || notifications.length === 0 ? (
                                                    <p className="p-4 text-sm text-slate-500 text-center">No notifications.</p>
                                                ) : (
                                                    notifications.map(notification => (
                                                        <div
                                                            key={notification._id}
                                                            className={`p-4 border-b border-slate-50 hover:bg-[var(--color-secondary)]/5 transition-colors group relative ${!notification.read ? 'bg-[var(--color-secondary)]/10' : ''}`}
                                                        >
                                                            <div
                                                                onClick={() => handleNotificationClick(notification)}
                                                                className="cursor-pointer pr-8"
                                                            >
                                                                <div className="flex justify-between items-start">
                                                                    <p className={`text-sm ${!notification.read ? 'font-semibold text-[var(--color-primary-dark)]' : 'text-slate-600'}`}>
                                                                        {notification.message}
                                                                    </p>
                                                                    {!notification.read && <div className="h-2 w-2 rounded-full bg-[var(--color-primary)] mt-1.5 flex-shrink-0"></div>}
                                                                </div>
                                                                <p className="text-xs text-slate-400 mt-1">
                                                                    {new Date(notification.createdAt).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                            {!notification.read && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        markAsRead(notification._id);
                                                                    }}
                                                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white shadow-sm border border-slate-200 text-slate-400 hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] opacity-0 group-hover:opacity-100 transition-all"
                                                                    title="Mark as read"
                                                                >
                                                                    <Check className="h-4 w-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <Link to="/profile" className="text-sm font-semibold text-[var(--color-primary-dark)] flex items-center gap-2 hover:text-[var(--color-primary)] transition-colors">
                                    <div className="bg-[var(--color-secondary)]/20 p-1 rounded-full">
                                        <User className="h-4 w-4 text-[var(--color-primary)]" />
                                    </div>
                                    {user.name}
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="text-sm font-bold text-[var(--color-primary-dark)] hover:text-red-600 transition-colors px-4 py-2 flex items-center gap-2"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Sign out
                                </button>
                            </div>
                        ) : (
                            <>
                                <Link to="/login" className="text-sm font-bold text-[var(--color-primary-dark)] hover:text-[var(--color-primary)] transition-colors px-4 py-2">
                                    Log in
                                </Link>
                                <Link to="/register" className="group bg-[var(--color-primary-dark)] text-white rounded-full px-6 py-2.5 flex items-center text-sm font-bold hover:bg-[var(--color-primary)] transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                                    Sign up
                                    <ArrowUpRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center md:hidden">
                        {user && (
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative p-2 rounded-full hover:bg-[var(--color-secondary)]/20 transition-colors text-[var(--color-primary-dark)] mr-2"
                            >
                                <Bell className="h-6 w-6" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold border-2 border-white">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>
                        )}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-[var(--color-primary)] hover:bg-[var(--color-secondary)]/10 focus:outline-none"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <div className="md:hidden bg-[var(--color-background)] border-t border-[var(--color-secondary)]/10 absolute w-full left-0 shadow-xl">
                    {/* Mobile Notifications Panel within Menu? Or separate? Let's keep separate overlay fetch logic but accessing via bell above is easiest. 
                     Or we can list notifications here if user is logged in. for now keeping bell accessible. */}
                    <div className="px-4 pt-2 pb-3 space-y-1">
                        <Link to="/agents" className="block px-3 py-2 rounded-md text-base font-medium text-[var(--color-primary-dark)] hover:bg-[var(--color-secondary)]/10">
                            Find Agents
                        </Link>
                        <Link to="/jobs" className="block px-3 py-2 rounded-md text-base font-medium text-[var(--color-primary-dark)] hover:bg-[var(--color-secondary)]/10">
                            Find Jobs
                        </Link>
                        <Link to="/#how-it-works" className="block px-3 py-2 rounded-md text-base font-medium text-[var(--color-primary-dark)] hover:bg-[var(--color-secondary)]/10">
                            How it Works
                        </Link>
                        <Link to="/support" className="block px-3 py-2 rounded-md text-base font-medium text-[var(--color-primary-dark)] hover:bg-[var(--color-secondary)]/10">
                            Support
                        </Link>
                    </div>
                    <div className="pt-4 pb-6 border-t border-[var(--color-secondary)]/10 px-4 space-y-3">
                        {user ? (
                            <>
                                <Link to="/profile" className="px-4 py-2 text-base font-bold text-[var(--color-primary-dark)] flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    {user.name}
                                </Link>
                                <button
                                    onClick={() => { handleLogout(); setIsOpen(false); }}
                                    className="block w-full text-center px-4 py-3 rounded-full text-base font-bold text-white bg-red-600 hover:bg-red-700 shadow-md transition-colors flex items-center justify-center gap-2"
                                >
                                    <LogOut className="h-5 w-5" />
                                    Sign out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="block w-full text-center px-4 py-3 rounded-full text-base font-bold text-[var(--color-primary-dark)] border-2 border-[var(--color-primary-dark)] hover:bg-[var(--color-primary-dark)] hover:text-white transition-colors">
                                    Log in
                                </Link>
                                <Link to="/register" className="block w-full text-center px-4 py-3 rounded-full text-base font-bold text-white bg-[var(--color-primary-dark)] hover:bg-[var(--color-primary)] shadow-md transition-colors">
                                    Sign up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
            {/* Mobile Notification Dropdown Overlay */}
            {showNotifications && (
                <div className="md:hidden absolute top-16 right-0 w-full bg-white shadow-xl border-t border-slate-100 z-40 max-h-[80vh] overflow-y-auto">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h3 className="font-bold text-[var(--color-primary-dark)]">Notifications</h3>
                        {unreadCount > 0 && (
                            <button onClick={markAllAsRead} className="text-xs text-[var(--color-primary)] hover:underline">
                                Mark all as read
                            </button>
                        )}
                    </div>
                    <div>
                        {!notifications || notifications.length === 0 ? (
                            <p className="p-4 text-sm text-slate-500 text-center">No notifications.</p>
                        ) : (
                            notifications.map(notification => (
                                <div
                                    key={notification._id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`p-4 border-b border-slate-50 cursor-pointer ${!notification.read ? 'bg-[var(--color-secondary)]/10' : ''}`}
                                >
                                    <p className={`text-sm ${!notification.read ? 'font-semibold text-[var(--color-primary-dark)]' : 'text-slate-600'}`}>
                                        {notification.message}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        {new Date(notification.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
