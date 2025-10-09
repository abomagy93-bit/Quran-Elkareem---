import React from 'react';

interface ErrorMessageProps {
    message: string | null;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
    if (!message) return null;
    
    return (
        <div className="container mx-auto p-4 my-4 bg-red-900/50 border border-red-700 rounded-lg text-center">
            <p className="text-red-300 font-semibold">{message}</p>
        </div>
    );
};

export default ErrorMessage;
