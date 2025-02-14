// Path: components/Button.tsx
import { cva } from "class-variance-authority";
 
type ButtonProps = React.HTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "tertiary" | "fourthiary" |"success" | "failure";
  size?: "sm" | "md" | "lg" | "xl";
  type?: "button" | "submit" | "reset";
  className?: string;
  onSubmit?: (event: React.FormEvent<HTMLButtonElement>) => void; // Added onSubmit event type
};
 
const buttonVariants = cva("flex text-center items-center", {
  variants: {
    variant: {
      primary:
        "bg-primary hover:bg-primary_hover active:bg-primary_active disabled:bg-primary_disabled rounded-md gap-2 border border-gray-500 text-white",
      secondary:
        "bg-secondary hover:bg-secondary_hover active:bg-secondary_active disabled:bg-secondary_disabled rounded-md gap-2 border border-outlineButton text-outlineButton",
      tertiary:
        "bg-tertiary hover:bg-tertiary_hover active:bg-tertiary_active disabled:bg-tertiary_disabled rounded-md gap-2 border border-outlineButton text-outlineButton",
      fourthiary:
        "bg-fourthiary_main hover:bg-fourthiary_hover active:bg-fourthiary_active disabled:bg-fourthiary_disabled rounded-md gap-2 border border-gray-500 text-white",
      success:
        "bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:bg-green-400 rounded-md gap-2 border border-green-700 text-white",
      failure:
        "bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:bg-red-400 rounded-md gap-2 border border-red-700 text-white",
    },
    size: {
      sm: "px-[0.625rem] py-2 rounded-[8px]",
      md: "px-[0.625rem] py-3 rounded-lg",
      lg: "px-4 py-3 rounded-lg ",
      xl: "px-4 py-3 rounded-lg",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});
 
export default function Button({
  variant = "primary",
  size = "md",
  className = "p-4",
  type = "button",
  onSubmit, // Added onSubmit prop
  ...props
}: ButtonProps) {
  const combinedClassName = `${buttonVariants({ variant, size })} ${className}`;
 
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (type === "submit" && onSubmit) {
      onSubmit(event as any); // Cast to `any` to simulate `onSubmit` behavior
    }
 
    if (props.onClick) {
      props.onClick(event);
    }
  };
 
  return (
<button
      type={type}
      {...props}
      className={combinedClassName}
      onClick={handleClick} // Use handleClick to trigger onSubmit if type is "submit"
    />
  );
}