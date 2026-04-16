export const loginUser = async (credentials) => {
    const LoginRequest = await fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers:{
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
    });
    if(!LoginRequest.ok){
        throw new Error('Login failed.');
    }
    return LoginRequest.json();
}