import { memo } from "react"

const ScheduleHeader = ({ data }) => {
  return (
    <>
      <div>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight leading-tight text-center sm:text-left">
          NFL {isAugust() ? 'Preseason ' : ''}Week {data?.week?.number} Schedule
        </h1>
      </div>
    </>
  )
}

function isAugust() {
  return new Date().getMonth() === 7;
}

export default memo(ScheduleHeader);