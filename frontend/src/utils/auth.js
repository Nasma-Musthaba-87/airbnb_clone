export function saveAuth(data) {
  const token = data?.token || data?.accessToken;
  const user = data?.user || data?.data?.user;
  if (token) localStorage.setItem("token", token);
  if (user?._id || user?.id || user?.userId) {
    localStorage.setItem("userId", user._id || user.id || user.userId);
  }
  if (user?.role) localStorage.setItem("role", user.role);
  if (user?.name) localStorage.setItem("userName", user.name);
  if (user?.email) localStorage.setItem("userEmail", user.email);
  return Boolean(token);
}

export function clearAuth() {
  ["token", "role", "userId", "userName", "userEmail"].forEach((key) =>
    localStorage.removeItem(key)
  );
}

export function isLoggedIn() {
  return Boolean(localStorage.getItem("token"));
}

export function requireLogin(navigate, message = "Please log in to continue.") {
  if (!isLoggedIn()) {
    navigate("/login", { state: { message } });
    return false;
  }
  return true;
}
