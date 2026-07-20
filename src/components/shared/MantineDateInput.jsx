import { DatePickerInput } from "@mantine/dates";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { formatDateInput } from "../../utils/formattedDate";

const MantineDateInput = ({
  name,
  value,
  onChange,
  className = "",
  error,
  todayOnly = false,
  highlightCurrentDay = false,
  renderDay,
  ...props
}) => {
  const today = formatDateInput(new Date());

  const handleChange = (dateValue) => {
    const nextValue = formatDateInput(dateValue);
    onChange?.({
      target: {
        name,
        value: nextValue,
      },
    });
  };

  const handleRenderDay = (date) => {
    if (renderDay) return renderDay(date);

    const isToday = formatDateInput(date) === today;
    const dayClassName =
      isToday && (todayOnly || highlightCurrentDay) ? "text-blue-600" : "";

    return <span className={dayClassName}>{dayjs(date).date()}</span>;
  };

  return (
    <DatePickerInput
      name={name}
      value={formatDateInput(value) || null}
      onChange={handleChange}
      valueFormat="DD MMMM YYYY"
      locale="id"
      placeholder="Masukan tanggal"
      clearable
      minDate={todayOnly ? today : undefined}
      maxDate={todayOnly ? today : undefined}
      defaultDate={todayOnly ? today : undefined}
      renderDay={handleRenderDay}
      error={Boolean(error)}
      className={className}
      classNames={{
        input:
          "w-full bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-2.5 font-semibold outline-none focus:ring-2 focus:ring-[#10B981]",
      }}
      popoverProps={{ withinPortal: true, zIndex: 200 }}
      {...props}
    />
  );
};

export default MantineDateInput;
