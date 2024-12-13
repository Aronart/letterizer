import React from 'react'

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline'
  size?: 'default' | 'sm' | 'lg'
}> = ({ children, variant = 'default', size = 'default', className = '', ...props }) => {
  const baseStyle = 'rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
  const variantStyles = {
    default: 'bg-blue-500 text-white hover:bg-blue-600',
    outline: 'border border-blue-500 text-blue-500 hover:bg-blue-50'
  }
  const sizeStyles = {
    default: 'px-4 py-2',
    sm: 'px-2 py-1 text-sm',
    lg: 'px-6 py-3 text-lg'
  }
  return (
    <button 
      {...props} 
      className={`${baseStyle} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </button>
  )
}

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, ...props }) => (
  <div {...props} className={`bg-white rounded-lg shadow ${props.className || ''}`}>
    {children}
  </div>
)

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, ...props }) => (
  <div {...props} className={`p-4 border-b ${props.className || ''}`}>
    {children}
  </div>
)

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ children, ...props }) => (
  <h3 {...props} className={`text-lg font-semibold ${props.className || ''}`}>
    {children}
  </h3>
)

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, ...props }) => (
  <div {...props} className={`p-4 ${props.className || ''}`}>
    {children}
  </div>
)

export const Progress: React.FC<React.HTMLAttributes<HTMLDivElement> & { value: number }> = ({ value, ...props }) => (
  <div {...props} className={`w-full bg-gray-200 rounded ${props.className || ''}`}>
    <div className="bg-blue-500 rounded h-2" style={{ width: `${value}%` }}></div>
  </div>
)

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className = '', ...props }) => (
  <input
    {...props}
    className={`block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
  />
)

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({ className = '', ...props }) => (
  <select
    {...props}
    className={`block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
  />
)

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ className = '', ...props }) => (
  <p {...props} className={`text-sm text-gray-500 ${className}`} />
)

