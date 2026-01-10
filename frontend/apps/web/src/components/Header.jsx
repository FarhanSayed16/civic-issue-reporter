// src/components/Header.jsx
import React, { useRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import LogoutButton from "./LogoutButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faXmark,
  faChevronDown,
  faUser,
  faTachometerAlt,
  faSignOutAlt,
  faSearch, // New search icon
  faBriefcase, // Icon for Gigs
  faComments, // Icon for Chats
  faBox, // Icon for Orders
  faSignInAlt, // Icon for Login
  faUserPlus, // Icon for Signup
  faUserShield, // Icon for admin items
} from "@fortawesome/free-solid-svg-icons";

// --- new imports for search/suggestions ---
import { useDebounce } from "@/hooks/debounce";
import { useSearchIssuesQuery } from "@/features/api/issues.api";

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const navigate = useNavigate();

  const debounced = useDebounce(searchTerm, 300);
  const { data: searchResults } = useSearchIssuesQuery(debounced, { skip: !debounced });
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const role = user?.role;

  // Get user's first letter
  const getUserInitial = () => {
    if (user?.full_name) {
      return user.full_name.charAt(0).toUpperCase();
    }
    return user?.phone_number ? user.phone_number.charAt(0).toUpperCase() : "U";
  };

  // Header no longer shows nav items; only logo, global search, and avatar
  const navItems = [];

  const visibleItems = navItems.filter((item) => {
    const okAuth =
      item.auth === "both" ||
      (isAuthenticated && item.auth === "auth") ||
      (!isAuthenticated && item.auth === "unauth");
    return item.adminOnly ? okAuth && role === "admin" : okAuth;
  });

  // Navigate to /issues?keyword=… and hide suggestions
  const doSearch = (keyword) => {
    setShowSuggestions(false);
    navigate(`/issues?search=${encodeURIComponent(keyword)}`);
    setMobileOpen(false);
  };

  const handleSearchKey = (e) => {
    if (e.key === "Enter" && searchTerm.trim()) {
      doSearch(searchTerm.trim());
    }
  };

  const handleSuggestionClick = (tag) => {
    setSearchTerm(tag);
    doSearch(tag);
  };

  const searchRef = useRef(null);
  const userDropdownRef = useRef(null);

  // click outside => hide suggestions and user dropdown
  useEffect(() => {
    const onClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, []);

  const handleUserDropdownClick = () => {
    setShowUserDropdown(!showUserDropdown);
  };

  const handleDropdownItemClick = (action) => {
    setShowUserDropdown(false);
    if (action === "profile") {
      navigate("/profile");
    } else if (action === "dashboard") {
      navigate("/home");
    }
  };

  return (
<header className="bg-primary text-white shadow-lg sticky top-0 z-[1000]">
      <div className="container mx-auto px-4 sm:px-8 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/home" className="text-2xl font-display font-bold text-white tracking-tight">
          SwachhCity
        </Link>

        {/* SEARCH (desktop) */}
        <div ref={searchRef} className="hidden md:block flex-1 max-w-xl mx-8 relative">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={handleSearchKey}
              placeholder="Search for issues..."
              className="w-full pl-10 pr-4 py-2 rounded-full text-gray-800 focus:ring-2 focus:ring-accent-light focus:outline-none transition-all duration-300"
            />
            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          {/* suggestions dropdown */}
          {showSuggestions && (
            <div className="mt-2 absolute top-full left-0 right-0 bg-white text-gray-900 rounded-lg shadow-xl z-20 overflow-hidden border border-gray-200">
              {searchResults?.length > 0 ? (
                searchResults.slice(0, 6).map((issue) => (
                  <Link
                    key={issue.id}
                    to={`/issueDetailsPanel/${issue.id}`}
                    className="px-4 py-3 flex items-center gap-3 hover:bg-gray-100 transition-colors"
                    onMouseDown={() => setShowSuggestions(false)}
                  >
                    <FontAwesomeIcon icon={faBriefcase} className="text-gray-400" />
                    <span className="truncate">#{issue.id} · {issue.category} · {issue.description}</span>
                  </Link>
                ))
              ) : (
                debounced?.length > 0 && (
                  <div className="px-4 py-3 text-gray-500">No results</div>
                )
              )}
            </div>
          )}
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-6">

          {/* User Dropdown for authenticated users */}
          {isAuthenticated ? (
            <div ref={userDropdownRef} className="relative">
              <button
                onClick={handleUserDropdownClick}
                className="flex items-center space-x-2 hover:bg-white/10 rounded-full px-3 py-2 transition-colors duration-200"
              >
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {getUserInitial()}
                </div>
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className={`text-sm transition-transform duration-200 ${
                    showUserDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* User Dropdown Menu */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-3 w-48 bg-white text-gray-800 rounded-lg shadow-xl z-30 border border-gray-200 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{user?.full_name || "User"}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.phone_number}</p>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => handleDropdownItemClick("profile")}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <FontAwesomeIcon icon={faUser} className="mr-3 text-gray-400" />
                      Profile
                    </button>

                    <button
                      onClick={() => handleDropdownItemClick("dashboard")}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <FontAwesomeIcon icon={faTachometerAlt} className="mr-3 text-gray-400" />
                      Dashboard
                    </button>

                    <div className="border-t border-gray-200 my-1"></div>

                    <div className="px-4 py-2">
                      <LogoutButton
                        className="flex items-center w-full text-sm text-red-600 hover:text-red-800"
                        icon={<FontAwesomeIcon icon={faSignOutAlt} className="mr-3" />}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 focus:outline-none"
          onClick={() => setMobileOpen((o) => !o)}
        >
          <FontAwesomeIcon icon={mobileOpen ? faXmark : faBars} size="lg" />
        </button>
      </div>

      {/* Mobile Nav + Search */}
      {mobileOpen && (
        <nav className="md:hidden bg-primary px-4 pb-4 transition-all duration-300 ease-in-out">
          <div ref={searchRef} className="relative mt-2">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={handleSearchKey}
                placeholder="Search issues…"
                className="w-full pl-10 pr-4 py-2 rounded-full text-gray-800 focus:ring-2 focus:ring-accent-light focus:outline-none transition-all duration-300"
              />
              <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 bg-white text-gray-900 rounded-b shadow-lg z-20 border border-gray-200 overflow-hidden">
                {searchResults?.length > 0 ? (
                  searchResults.slice(0, 6).map((issue) => (
                    <Link
                      key={issue.id}
                      to={`/issueDetailsPanel/${issue.id}`}
                      className="px-4 py-3 flex items-center gap-3 hover:bg-gray-100 transition-colors"
                      onMouseDown={() => setShowSuggestions(false)}
                    >
                      <FontAwesomeIcon icon={faBriefcase} className="text-gray-400" />
                      <span className="truncate">#{issue.id} · {issue.category} · {issue.description}</span>
                    </Link>
                  ))
                ) : (
                  debounced?.length > 0 && (
                    <div className="px-4 py-3 text-gray-500">No results</div>
                  )
                )}
              </div>
            )}
          </div>

          <ul className="flex flex-col space-y-2 mt-4">
            {visibleItems.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.to}
                  className="flex items-center gap-3 py-2 px-4 rounded-lg hover:bg-white/10 transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  <FontAwesomeIcon icon={item.icon} className="text-lg w-5" />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              </li>
            ))}

            {/* Mobile User Menu */}
            {isAuthenticated && (
              <>
                <li className="border-t border-white/20 pt-2 mt-4">
                  <div className="flex items-center space-x-3 py-2 px-4">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {getUserInitial()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{user?.full_name || "User"}</p>
                      <p className="text-xs text-white/70 truncate">{user?.phone_number}</p>
                    </div>
                  </div>
                </li>
                <li>
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 py-2 px-4 rounded-lg hover:bg-white/10 transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    <FontAwesomeIcon icon={faUser} className="text-lg w-5" />
                    <span className="text-sm font-medium">Profile</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to={"/home"}
                    className="flex items-center gap-3 py-2 px-4 rounded-lg hover:bg-white/10 transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    <FontAwesomeIcon icon={faTachometerAlt} className="text-lg w-5" />
                    <span className="text-sm font-medium">Dashboard</span>
                  </Link>
                </li>
                <li>
                  <LogoutButton
                    className="flex items-center w-full py-2 px-4 rounded-lg text-red-300 hover:bg-red-900/50 transition-colors"
                    icon={<FontAwesomeIcon icon={faSignOutAlt} className="text-lg mr-3" />}
                  />
                </li>
              </>
            )}
          </ul>
        </nav>
      )}
    </header>
  );
};

export default Header;