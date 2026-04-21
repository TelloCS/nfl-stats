import { Loader } from 'lucide-react';

export default function CustomLoader({ color, size }) {
  return (
    <div role="custom-loader" className="flex justify-center items-center">
      <Loader
        className={color}
        size={size}
      />
    </div>
  )
}