import { DateInput } from "@mantine/dates";
import "dayjs/locale/id";
import { formatDateInput } from "../../utils/formattedDate";

const MantineDateInput = ({
  name,
  value,
  onChange,
  className = "",
  error,
  ...props
}) => {
  const handleChange = (dateValue) => {
    const nextValue = formatDateInput(dateValue);
    onChange?.({
      target: {
        name,
        value: nextValue,
      },
    });
  };

  return (
    <DateInput
      name={name}
      value={formatDateInput(value) || null}
      onChange={handleChange}
      valueFormat="DD MMMM YYYY"
      locale="id"
      clearable
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
