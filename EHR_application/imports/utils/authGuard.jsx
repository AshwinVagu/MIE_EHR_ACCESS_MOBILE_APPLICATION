export const isAuthenticated = () => {
    try {
      const profile = localStorage.getItem("user_profile");
      const userId = localStorage.getItem("user_id");
      const tokenString = localStorage.getItem("auth_id_token");
  
      if (!profile || !userId || !tokenString) return false;
  
      // Decode JWT payload
      const [, payloadBase64] = tokenString.split(".");
      const payloadJson = atob(payloadBase64);
      const payload = JSON.parse(payloadJson);
  
      // Check expiration
      const exp = payload.exp;
      const now = Math.floor(Date.now() / 1000);
  
      return exp && now < exp;
    } catch (err) {
      console.error("AuthGuard Error:", err);
      return false;
    }
  };
  