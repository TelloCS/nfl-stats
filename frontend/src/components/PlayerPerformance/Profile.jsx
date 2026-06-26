import { memo } from "react";
import { Dot } from 'lucide-react';

const Profile = ({ data }) => {
  const isFreeAgent = !data?.team || data?.team === "FA" || data?.team?.full_name === "Free Agent";

  return (
    <div className="font-mono">
      <div className="font-semibold text-lg sm:text-xl flex text-foreground items-center">
        {data?.fullName}
      </div>
      <div className="text-xs sm:text-sm font-normal flex items-center gap-1">
        {isFreeAgent ? (
          <div>
            <span>{data?.position}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            {data?.team?.full_name} <Dot /> {data?.position} <Dot />  #{data?.jersey}
          </div>
        )}
      </div>
    </div>
  )
}

export default memo(Profile);