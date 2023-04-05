import clsx from 'clsx';
import { ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  buttonType?: string;
  rounded?: boolean;
  loadingLabel?: string;
  isLoading?: boolean;
  isDisabled?: boolean;
}

const Button = (props: ButtonProps) => {
  const {
    label,
    buttonType = 'primary',
    className,
    rounded = true,
    loadingLabel = 'LOADING...',
    isLoading,
    isDisabled,
    ...rest
  } = props;
  const containerCLassnames = clsx(
    'h-11',
    rounded ? 'rounded-lg' : 'rounded-none',
    buttonType === 'dark' && 'bg-dark text-white',
    buttonType === 'light' && 'bg-white text-black',
    buttonType === 'primary' && !isDisabled && 'bg-action text-white',
    isDisabled && 'opacity-70 bg-zinc-600',
    className
  );
  return (
    <button
      disabled={isDisabled || isLoading}
      value={label}
      className={containerCLassnames}
      {...rest}
    >
      {isLoading ? loadingLabel : label}
    </button>
  );
};

export default Button;
