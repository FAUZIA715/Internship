import "./RegisterForm.css";
import { useState } from "react";
function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  return (

  <div className="register-container">
    <h2>Create Account</h2>

    <form>
      <div className="form-group">
        <label>Full Name</label>
        <input type="text" placeholder="Enter your name" />
      </div>

      <div className="form-group">
        <label>Email</label>
        <input type="email" placeholder="Enter your email" />
      </div>

      <label>Role</label>
<select>
  <option>Student</option>
  <option>Faculty</option>
  <option>Admin</option>
</select>

      <div className="form-group">
        <label>Password</label>
        <input
  type={showPassword ? "text" : "password"}
  placeholder="Enter password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
/>

<button
  type="button"
  onClick={() => setShowPassword(!showPassword)}
>
  {showPassword ? "Hide" : "Show"}
</button>
      </div>

      <div className="form-group">
        <label>Confirm Password</label>
<input
  type={showPassword ? "text" : "password"}
  placeholder="Confirm password"
  value={confirmPassword}
  onChange={(e) => setConfirmPassword(e.target.value)}
/>
{
  confirmPassword &&
  password !== confirmPassword && (
    <p style={{ color: "red" }}>
      Passwords do not match
    </p>
  )
}
      </div>
      <div className="checkbox-group">
  <input type="checkbox" />
  <label>I agree to the Terms and Conditions</label>
</div>
      <button className="register-btn" type="submit">
        Register
      </button>
      <p className="login-link">
  Already have an account?
  <a href="#"> Login</a>
</p>
    </form>
  </div>
);
}


export default RegisterForm;