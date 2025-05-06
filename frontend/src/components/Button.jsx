import './Button.css';

export default function Button({ children, onClick, isActive, variant }) {
  const className = `
    button${variant === 'profile' ? '_profile' : ''}${isActive ? '_active' : ''}
  `.trim();

  return (
    <button className={className} onClick={onClick}>
      {children}
    </button>
  );
}
