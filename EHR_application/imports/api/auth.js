import { FIREBASE_API_KEY } from "../../credentials/secrets";

export const loginWithEmail = async (email, password) => {
  const apiKey = FIREBASE_API_KEY;
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });

  const data = await response.json();
  console.log(data);
  if (data.error) {
    throw new Error(data.error.message);
  }
  return {data, success: true};
};


export const signUpWithEmail = async (email, password) => {
    const apiKey = FIREBASE_API_KEY;
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    });

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message);
    }
    return {data, success: true};
  };
