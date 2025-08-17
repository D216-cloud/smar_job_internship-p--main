import React from "react";

interface RegisterFormProps {
  userType: string;
  onSwitch: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ userType, onSwitch }) => {
  // Add your registration form logic here
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">
        {userType === "company" ? "Company Registration" : "Student Registration"}
      </h2>
      {/* Registration form fields go here */}
      {/* ... */}
      <p className="text-center text-sm text-gray-400 mt-4">
        Already have an account?{" "}
        <button type="button" onClick={onSwitch} className="text-blue-500 underline">
          Login here
        </button>
      </p>
    </div>
  );
};

export default RegisterForm;
